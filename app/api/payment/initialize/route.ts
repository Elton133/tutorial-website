import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PaystackPaymentResponse } from '@/lib/types';

/**
 * Initialize Paystack payment for a single video purchase.
 * NOTE: This flow is kept for backwards compatibility, but
 * the recommended approach is to use subscriptions instead.
 */
export async function POST(request: NextRequest) {
  try {
    const { video_id, email } = await request.json();

    // Validate input (amount is derived from DB, not trusted from client)
    if (!video_id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look up video and derive price on the server
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, price')
      .eq('id', video_id)
      .single();

    if (videoError || !video) {
      console.error('Video lookup failed during payment init:', videoError);
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const amount = video.price;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid video price configured' },
        { status: 400 }
      );
    }

    // Check if user has already purchased this video
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('video_id', video_id)
      .eq('payment_status', 'success')
      .single();

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'You have already purchased this video' },
        { status: 400 }
      );
    }

    // Generate unique reference
    const reference = `TXN_${Date.now()}_${user.id.slice(0, 8)}`;

    console.log(
      'Initializing payment for user:',
      user.id,
      'video:',
      video_id,
      'reference:',
      reference
    );

    // Create pending purchase record
    const { error: purchaseError } = await supabase.from('purchases').insert({
      user_id: user.id,
      video_id,
      amount_paid: amount,
      paystack_reference: reference,
      payment_status: 'pending',
    });

    if (purchaseError) {
      console.error('Error creating purchase:', purchaseError);
      // Check if it's a duplicate key error
      if ((purchaseError as { code?: string }).code === '23505') {
        return NextResponse.json(
          { error: 'You have already purchased this video' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create purchase record' },
        { status: 500 }
      );
    }

    console.log(
      'Purchase record created successfully with reference:',
      reference
    );

    // Initialize Paystack payment
    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount, // Amount in kobo
          reference,
          metadata: {
            video_id,
            user_id: user.id,
          },
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/verify`,
        }),
      }
    );

    const paystackData: PaystackPaymentResponse = await paystackResponse.json();

    if (!paystackData.status) {
      return NextResponse.json(
        { error: paystackData.message || 'Payment initialization failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
