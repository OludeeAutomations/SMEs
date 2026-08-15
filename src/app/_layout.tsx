import '../services/polyfill';
import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useBusinessStore } from '../store/businessStore';
import { useBusinessSync } from '../hooks/useBusinessSync';
import { supabase } from '../services/supabase';
import '../global.css';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  useBusinessSync();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { user, business, setSession, isLoading, setLoading, hasHydrated } = useAuthStore();
  const setActiveUser = useBusinessStore((state) => state.setActiveUser);

  useEffect(() => { setActiveUser(user?.id ?? null); }, [user?.id, setActiveUser]);

  // Listen to Supabase auth events
  useEffect(() => {
    setLoading(true);
    
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setSession(
            {
              id: session.user.id,
              fullName: session.user.user_metadata?.full_name || 'Ease User',
              email: session.user.email || '',
            },
            undefined
          );
        } else if (hasHydrated && !useAuthStore.getState().user) {
          setSession(null, null);
        }
      })
      .catch((err) => {
        console.warn("Supabase session initialization failed (using offline state):", err);
      })
      .finally(() => {
        setLoading(false);
        SplashScreen.hideAsync();
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSession(
            {
              id: session.user.id,
              fullName: session.user.user_metadata?.full_name || 'Ease User',
              email: session.user.email || '',
            },
            undefined
          );
        } else if (event === 'SIGNED_OUT') {
          setSession(null, null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [hasHydrated, setLoading, setSession]);

  // Handle router redirects based on authentication
  useEffect(() => {
    if (!navigationState?.key || isLoading || !hasHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (!user && inAppGroup && !__DEV__) {
      // Redirect to onboarding if not signed in and not in auth group
      router.replace('/(auth)/onboarding');
    } else if (user && business && (inAuthGroup || (segments[0] as string) === 'index' || segments[0] === undefined)) {
      // Redirect to home if signed in and in auth group or splash
      router.replace('/(app)/(tabs)/home');
    }
  }, [user, business, segments, isLoading, hasHydrated, navigationState?.key, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
          <Stack.Screen name="(app)" options={{ gestureEnabled: false }} />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
