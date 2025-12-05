import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { PaystackVerificationResponse } from '@/lib/types';

/**
 * Verify Paystack payment after user is redirected back
 * Updates purchase status and redirects to appropriate page
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get('reference');
  const origin = request.nextUrl.origin;

  console.log('Payment verification initiated for reference:', reference);

  if (!reference) {
    console.error('No reference provided in payment verification');
    return NextResponse.redirect(
      new URL('/dashboard?error=invalid_reference', origin)
    );
  }

  try {
    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData: PaystackVerificationResponse =
      await paystackResponse.json();

    console.log('Paystack verification response:', {
      status: paystackData.status,
      paymentStatus: paystackData.data?.status,
      reference: reference
    });

    if (!paystackData.status || paystackData.data.status !== 'success') {
      console.error('Payment verification failed:', paystackData);
      return NextResponse.redirect(
        new URL('/dashboard?error=payment_failed', origin)
      );
    }

    // Update purchase status in database using service role to bypass RLS
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error: updateError } = await supabase
      .from('purchases')
      .update({ payment_status: 'success' })
      .eq('paystack_reference', reference);

    if (updateError) {
      console.error('Error updating purchase:', updateError);
      return NextResponse.redirect(
        new URL('/dashboard?error=database_error', origin)
      );
    }

    console.log('Purchase status updated successfully for reference:', reference);

    // Redirect to video page
    const videoId = paystackData.data.metadata?.video_id;
    if (videoId) {
      return NextResponse.redirect(
        new URL(`/videos/${videoId}?payment=success`, origin)
      );
    }

    return NextResponse.redirect(
      new URL('/dashboard?payment=success', origin)
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=verification_failed', origin)
    );
  }
}
