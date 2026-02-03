import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { PaystackSubscriptionEvent } from '@/lib/types';

/**
 * Webhook endpoint to handle Paystack subscription events.
 * Creates/updates subscription rows when Paystack signals changes.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error('Missing PAYSTACK_SECRET_KEY for subscription webhook');
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      );
    }

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Subscription webhook signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body) as PaystackSubscriptionEvent;
    console.log('Subscription webhook event:', event.event);

    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // We rely on metadata.user_id when available; otherwise we fall back to email lookups.
    const userIdFromMetadata = event.data.metadata?.user_id;
    let userId = userIdFromMetadata as string | undefined;

    if (!userId) {
      const email = event.data.customer?.email;
      if (!email) {
        console.error('Subscription webhook missing user identifier');
        return NextResponse.json({ received: true });
      }

      const { data: authUser, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (userError || !authUser) {
        console.error('Could not resolve user from subscription webhook:', {
          email,
          userError,
        });
        return NextResponse.json({ received: true });
      }

      userId = authUser.id;
    }

    const status =
      event.data.status === 'canceled'
        ? 'canceled'
        : event.data.status === 'active'
        ? 'active'
        : 'past_due';

    const planCode = event.data.plan?.plan_code;

    const currentPeriodStart =
      event.data.createdAt || new Date().toISOString();
    const currentPeriodEnd = event.data.next_payment_date || null;

    // Upsert subscription row for this user + plan
    const { error: upsertError } = await supabase.from('subscriptions').upsert(
      {
        user_id: userId,
        status,
        paystack_customer_id: event.data.customer?.customer_code,
        paystack_subscription_code: event.data.subscription_code,
        plan_code: planCode,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
      },
      {
        onConflict: 'user_id,plan_code',
      }
    );

    if (upsertError) {
      console.error('Error upserting subscription from webhook:', upsertError);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Subscription webhook error:', error);
    return NextResponse.json(
      { error: 'Subscription webhook processing failed' },
      { status: 500 }
    );
  }
}


