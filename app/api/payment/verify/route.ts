import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PaystackVerificationResponse } from '@/lib/types';

/**
 * Verify Paystack payment after user is redirected back
 * Updates purchase status and redirects to appropriate page
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get('reference');
  const origin = request.nextUrl.origin;

  if (!reference) {
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

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return NextResponse.redirect(
        new URL('/dashboard?error=payment_failed', origin)
      );
    }

    // Update purchase status in database
    const supabase = await createClient();
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
