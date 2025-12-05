# Quick Testing Guide

## Prerequisites
Ensure you have the following environment variables set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing Steps

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Payment Flow

#### Step 1: Browse Videos
- Navigate to `http://localhost:3000`
- View available videos

#### Step 2: Initiate Purchase
- Click on a video
- Click "Purchase Now" button
- Verify you're redirected to Paystack payment page
- Check server logs for: `Initializing payment for user:...`

#### Step 3: Complete Payment (Test Mode)
Use Paystack test card:
- **Card Number**: 4084 0840 8408 4081
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: 408
- **PIN**: 0000
- **OTP**: 123456

#### Step 4: Verify Redirect
After payment:
- Check server logs for: `Payment verification initiated...`
- Check logs for: `Paystack verification response...`
- Check logs for: `Purchase status updated successfully...`
- Verify you're redirected to `/videos/{id}?payment=success`
- Verify video player loads and you can watch the video

#### Step 5: Check Dashboard
- Navigate to `/dashboard`
- Verify purchased video appears in "My Purchased Videos" section
- Click "My Videos" in sidebar
- Verify you're taken to `/dashboard/my-videos`
- Verify purchased video appears there too

### 3. Test Edge Cases

#### Already Purchased Video
- Try to purchase the same video again
- Should see error: "You have already purchased this video"

#### Failed Payment
- Initiate payment but cancel on Paystack page
- Verify redirect to dashboard with error parameter
- Check that purchase remains at 'pending' status in database

#### Invalid Reference
- Manually navigate to `/api/payment/verify?reference=INVALID`
- Should redirect to dashboard with error

### 4. Check Database

Connect to your Supabase database and run:

```sql
-- Check purchase records
SELECT 
  id,
  user_id,
  video_id,
  payment_status,
  paystack_reference,
  created_at
FROM purchases
ORDER BY created_at DESC
LIMIT 10;

-- Verify successful purchases
SELECT 
  p.paystack_reference,
  p.payment_status,
  v.title,
  p.created_at
FROM purchases p
JOIN videos v ON p.video_id = v.id
WHERE p.payment_status = 'success'
ORDER BY p.created_at DESC;
```

### 5. Check Server Logs

Look for these log messages:

**Payment Initialization:**
```
Initializing payment for user: {user_id} video: {video_id} reference: {reference}
Purchase record created successfully with reference: {reference}
```

**Payment Verification:**
```
Payment verification initiated for reference: {reference}
Paystack verification response: { status: true, paymentStatus: 'success', reference: '{reference}' }
Purchase status updated successfully for reference: {reference}
```

**Webhook (if configured):**
```
Webhook received, signature present: true
Webhook event received: charge.success reference: {reference}
Webhook: Purchase updated successfully for reference: {reference}
```

## Common Issues and Solutions

### Issue: Build fails with environment variable error
**Solution**: Make sure all required environment variables are set in `.env.local`

### Issue: Payment verification fails with "purchase_not_found"
**Solution**: Check that the purchase was created during initialization. Look for "Purchase record created successfully" in logs.

### Issue: Payment status stays "pending"
**Solution**: 
1. Check that SUPABASE_SERVICE_ROLE_KEY is set correctly
2. Check logs for any database errors
3. Verify webhook is configured correctly (if using production Paystack)

### Issue: Can't see purchased videos on dashboard
**Solution**: 
1. Check database to verify payment_status = 'success'
2. If status is still 'pending', manually verify the payment using the reference
3. Check that the video_id in the purchase matches the video_id in videos table

### Issue: 404 on payment verification
**Solution**: This should now be fixed. If still occurring:
1. Check the callback URL in initialize route (should NOT have ?reference= parameter)
2. Check server logs for the actual URL being called
3. Verify Paystack is calling your callback URL correctly

## Success Criteria

✅ User can browse videos
✅ User can initiate payment
✅ Payment redirects to Paystack
✅ After successful payment, user redirects back
✅ Purchase status updates to 'success' in database
✅ Video appears in dashboard
✅ Video appears in "My Videos" page
✅ User can watch the purchased video
✅ No errors in server logs
✅ Attempting to purchase again shows error

## Need Help?

Check `PAYMENT_FIXES_SUMMARY.md` for:
- Detailed explanation of fixes
- Architecture overview
- Recommendations for improvements
- Monitoring and debugging tips
