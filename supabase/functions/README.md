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

## Team invitations

Team invitations use Supabase Auth and the SMTP provider already configured for authentication email.
The service-role key stays inside Supabase and is never added to the mobile app.

1. Apply `20260909010000_team_invitations.sql` in the Supabase SQL editor.
2. Add the Mailtrap API secrets used by the function:

   `supabase secrets set MAILTRAP_API_TOKEN=your-token MAILTRAP_FROM_EMAIL=info@rekodaapp.com MAILTRAP_FROM_NAME=Rekoda`

3. Deploy the authenticated function:

   `supabase functions deploy team-invitations`

4. In Authentication > URL Configuration, add:

   `https://www.rekodaapp.com/auth/team-invite`

5. Deploy the website. The production build generates a lightweight invitation
   page at `/auth/team-invite` and the email logo at `/rekoda-email-logo-v2.png`.
6. Team invitations are sent directly through Mailtrap API with an inline CID
   logo. Supabase's Invite user template is retained only as a fallback and is
   not used by the deployed function.
