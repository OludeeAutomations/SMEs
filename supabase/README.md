# Supabase setup

The mobile app uses Supabase Auth and stores each user's complete business workspace in
`public.business_workspaces`. Local AsyncStorage is retained as an offline cache.

## Apply the database migration

Either:

1. Open the Supabase dashboard for this project.
2. Go to **SQL Editor**.
3. Paste and run `migrations/20260814000000_business_workspaces.sql`.

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
