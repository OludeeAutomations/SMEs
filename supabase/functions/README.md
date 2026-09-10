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
2. Deploy the authenticated function:

   `supabase functions deploy team-invitations`

3. In Authentication > URL Configuration, add:

   `https://www.rekodaapp.com/auth/team-invite`

4. Deploy the website. The production build generates a lightweight invitation
   page at `/auth/team-invite` and the email logo at `/rekoda-email-logo-v2.png`.
5. In Authentication > Email Templates > Invite user, paste the contents of
   `supabase/email-templates/team-invitation.html` and save it.
6. Send a new invitation after changing the template. The template excludes its
   one-time links from Mailtrap tracking with `data-mt-no-track` so scanners and
   tracking redirects cannot break them.
