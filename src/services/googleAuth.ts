import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  const redirectTo = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL?.trim() || Linking.createURL('auth/callback');
  console.info('Google OAuth redirect URL:', redirectTo);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('Google did not return a sign-in URL.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return false;

  if (result.url.startsWith('http://localhost') || result.url.startsWith('https://localhost')) {
    throw new Error(`Google sign-in returned to localhost. Add ${redirectTo} to Supabase Authentication > URL Configuration > Redirect URLs.`);
  }

  const parsed = Linking.parse(result.url);
  const code = typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;
  if (!code) throw new Error('Google sign-in returned without an authorization code.');

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) throw exchangeError;
  return true;
}
