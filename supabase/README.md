# Supabase setup

The mobile app uses Supabase Auth and stores each user's complete business workspace in
`public.business_workspaces`. Local AsyncStorage is retained as an offline cache. The relational
data migration mirrors this workspace into `business_profiles`, `products`, `customers`, `sales`,
`sale_items`, `invoices`, `invoice_items`, `expenses`, and `suppliers` so records are visible and
queryable as normal Supabase rows.

## Apply the database migration

Either:

1. Open the Supabase dashboard for this project.
2. Go to **SQL Editor**.
3. Paste and run the migration files in timestamp order, finishing with
   `migrations/20260818010000_extended_business_data.sql`.

The extended migration also mirrors profiles, businesses, branches, members, categories,
inventory levels and movements, payments, projects, automation rules, AI history, and supplier
balances. Older incompatible tables are retained with a `_legacy_20260818_ext` suffix.

Or, with the Supabase CLI authenticated and the project linked, run:

```sh
supabase db push
```

The migration enables row-level security. Authenticated users can only read and write the
row whose `user_id` matches their own Supabase Auth ID. The anonymous key cannot inspect or
change another user's data.

After applying it, restart Expo and sign in. Normal cloud saving is intentionally silent; the app
only displays a plain-language notice if it has to keep changes on the device temporarily.

## Configure Google mobile redirects

In **Authentication → URL Configuration → Redirect URLs**, add:

- `smes://auth/callback` for development and production builds.
- The exact `exp://.../--/auth/callback` URL printed by Expo when using Expo Go. A development
  wildcard such as `exp://**/--/auth/callback` can be used while the LAN/tunnel address changes.

Keep the Google Cloud OAuth callback set to Supabase's callback URL:
`https://<project-ref>.supabase.co/auth/v1/callback`.

Optionally set `EXPO_PUBLIC_AUTH_REDIRECT_URL` when a fixed redirect URL should override Expo's
generated development URL.
