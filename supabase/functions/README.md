# Online payment functions

The app creates checkout links on the server so provider secret keys never enter the mobile app.

1. Apply `20260818020000_online_payments.sql` in the Supabase SQL editor.
2. Add the provider secrets:

   `supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxx`

   or

   `supabase secrets set FLUTTERWAVE_SECRET_KEY=FLWSECK_xxx FLUTTERWAVE_WEBHOOK_HASH=your-random-webhook-hash`

3. Deploy the functions:

   `supabase functions deploy payments`

   `supabase functions deploy payments-webhook --no-verify-jwt`

   `supabase functions deploy payment-complete --no-verify-jwt`

4. Set the provider webhook URL to:

   `https://YOUR_PROJECT_REF.supabase.co/functions/v1/payments-webhook`

Use test keys first. Replace them with live keys only after the complete test-payment flow succeeds.
