import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import crypto from 'crypto';

/**
 * Webhook endpoint to handle Paystack payment notifications
 * Verifies webhook signature and updates purchase status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    console.log('Webhook received, signature present:', !!signature);

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Webhook signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('Webhook event received:', event.event, 'reference:', event.data?.reference);

    // Handle successful charge
    if (event.event === 'charge.success') {
      const { reference, status } = event.data;

      if (status === 'success') {
        // Use service role client to bypass RLS
        const supabase = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Update purchase status
        const { error: updateError } = await supabase
          .from('purchases')
          .update({ payment_status: 'success' })
          .eq('paystack_reference', reference);

        if (updateError) {
          console.error('Error updating purchase:', updateError);
          return NextResponse.json(
            { error: 'Failed to update purchase' },
            { status: 500 }
          );
        }

        console.log('Webhook: Purchase updated successfully for reference:', reference);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
