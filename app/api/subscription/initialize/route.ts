import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PaystackPaymentResponse } from '@/lib/types';

/**
 * Initialize Paystack payment for a monthly subscription.
 * Uses a Paystack plan code so subsequent renewals are handled by Paystack.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      !process.env.PAYSTACK_SECRET_KEY ||
      !process.env.NEXT_PUBLIC_APP_URL ||
      !process.env.PAYSTACK_SUBSCRIPTION_PLAN_CODE
    ) {
      console.error('Missing Paystack subscription environment variables');
      return NextResponse.json(
        { error: 'Subscription configuration error' },
        { status: 500 }
      );
    }

    const { email: bodyEmail } = await request.json().catch(() => ({}));
    const email = bodyEmail || user.email;

    if (!email) {
      return NextResponse.json(
        { error: 'No email available for subscription' },
        { status: 400 }
      );
    }

    // Check for existing active subscription for this plan
    const nowIso = new Date().toISOString();
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('current_period_end', nowIso)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'You already have an active subscription' },
        { status: 400 }
      );
    }

    // Create Paystack subscription
    // First, we need to create a customer if they don't exist, then create a subscription
    // For simplicity, we'll use transaction/initialize with plan code
    // Paystack will handle the subscription creation automatically
    
    const planCode = process.env.PAYSTACK_SUBSCRIPTION_PLAN_CODE?.trim();
    
    if (!planCode) {
      console.error('PAYSTACK_SUBSCRIPTION_PLAN_CODE is not set');
      return NextResponse.json(
        { error: 'Subscription plan not configured' },
        { status: 500 }
      );
    }

    // Validate plan code format (should start with PLN_)
    if (!planCode.startsWith('PLN_')) {
      console.error('Invalid plan code format:', planCode);
      return NextResponse.json(
        { error: 'Invalid subscription plan configuration' },
        { status: 500 }
      );
    }

    console.log('Initializing subscription with plan:', planCode, 'for email:', email);

    // Verify the plan exists in Paystack before proceeding
    try {
      const planVerifyResponse = await fetch(
        `https://api.paystack.co/plan/${planCode}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const planData = await planVerifyResponse.json();
      
      console.log('Plan verification response:', {
        status: planData.status,
        message: planData.message,
        planCode: planCode,
        apiKeyPrefix: process.env.PAYSTACK_SECRET_KEY?.substring(0, 7) + '...',
      });
      
      if (!planData.status) {
        console.error('Plan verification failed:', planData);
        const apiKeyMode = process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_test_')
          ? 'TEST'
          : process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_live_')
          ? 'LIVE'
          : 'UNKNOWN';
        
        return NextResponse.json(
          {
            error: `Plan "${planCode}" not found. Please verify:
1. The plan exists in your Paystack dashboard
2. You're using the correct API key (test vs live mode must match)
   Current API key mode: ${apiKeyMode}
3. The plan is active
4. Visit /api/subscription/verify-plan to see all available plans`,
          },
          { status: 400 }
        );
      }

      console.log('Plan verified:', {
        planCode: planData.data?.plan_code,
        name: planData.data?.name,
        amount: planData.data?.amount,
        interval: planData.data?.interval,
      });
    } catch (verifyError) {
      console.error('Error verifying plan:', verifyError);
      // Continue anyway - the initialize call will fail if plan is invalid
    }

    // Initialize transaction with subscription plan
    // Note: Paystack requires amount even when using a plan code
    // Amount should be in pesewas (smallest currency unit for GHS)
    // 100 cedis = 10,000 pesewas
    // You can override this with PAYSTACK_SUBSCRIPTION_AMOUNT env var (in pesewas)
    const amountInPesewas = process.env.PAYSTACK_SUBSCRIPTION_AMOUNT 
      ? parseInt(process.env.PAYSTACK_SUBSCRIPTION_AMOUNT, 10)
      : 10000; // Default: 100 cedis
    
    if (isNaN(amountInPesewas) || amountInPesewas <= 0) {
      console.error('Invalid subscription amount:', amountInPesewas);
      return NextResponse.json(
        { error: 'Invalid subscription amount configured' },
        { status: 500 }
      );
    }
    
    const requestBody = {
      email,
      amount: amountInPesewas,
      plan: planCode,
      metadata: {
        user_id: user.id,
        subscription: true,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=subscription_success`,
    };

    console.log('Paystack request body:', { ...requestBody, email: email.substring(0, 3) + '***' });

    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    const paystackData: PaystackPaymentResponse = await paystackResponse.json();

    console.log('Paystack subscription initialize response:', {
      status: paystackData.status,
      message: paystackData.message,
      planCode: planCode,
    });

    if (!paystackData.status) {
      console.error('Paystack subscription error:', paystackData);
      
      // Provide more helpful error messages
      let errorMessage = paystackData.message || 'Subscription initialization failed';
      
      if (errorMessage.includes('Plan not found') || errorMessage.includes('plan')) {
        errorMessage = `Plan not found. Please verify:
1. The plan code "${planCode}" exists in your Paystack dashboard
2. You're using the correct API key (test vs live mode)
3. The plan is active and not deleted`;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference,
    });
  } catch (error) {
    console.error('Subscription initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


