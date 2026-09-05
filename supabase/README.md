# Supabase setup

The app uses Supabase Auth and treats `public.business_workspaces` as the source of truth for each
user's complete business workspace. Every in-app mutation starts a cloud save immediately. Local
AsyncStorage is used only as a temporary outbox after a cloud write fails, and that queued snapshot
is retried automatically. The relational data migration mirrors each cloud save into
`business_profiles`, `products`, `customers`, `sales`, `sale_items`, `invoices`, `invoice_items`,
`expenses`, and `suppliers` so records are visible and queryable as normal Supabase rows.

## Apply the database migration

Either:

1. Open the Supabase dashboard for this project.
2. Go to **SQL Editor**.
3. Paste and run the migration files in timestamp order, finishing with
   `migrations/20260905000000_subscriptions.sql`.

The extended migration also mirrors profiles, businesses, branches, members, categories,
inventory levels and movements, payments, projects, automation rules, AI history, and supplier
balances. Older incompatible tables are retained with a `_legacy_20260818_ext` suffix.
The subscription migration adds the Rekọda Pro entitlement and a database-controlled 30-day trial.

Or, with the Supabase CLI authenticated and the project linked, run:

```sh
supabase db push
```

The migration enables row-level security. Authenticated users can only read and write the
row whose `user_id` matches their own Supabase Auth ID. The anonymous key cannot inspect or
change another user's data.

After applying it, restart Expo and sign in. Any workspace left in the previous local store is
migrated to Supabase once, then removed from that store. Normal cloud saving is intentionally
silent; the app only displays a plain-language notice if a failed write has been queued locally.

## Configure Google mobile redirects

In **Authentication → URL Configuration → Redirect URLs**, add:

- `smes://auth/callback` for development and production builds.
- The exact `exp://.../--/auth/callback` URL printed by Expo when using Expo Go. A development
  wildcard such as `exp://**/--/auth/callback` can be used while the LAN/tunnel address changes.

Keep the Google Cloud OAuth callback set to Supabase's callback URL:
`https://<project-ref>.supabase.co/auth/v1/callback`.

Optionally set `EXPO_PUBLIC_AUTH_REDIRECT_URL` when a fixed redirect URL should override Expo's
generated development URL.
