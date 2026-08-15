import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import '../global.css';
import { useBusinessSync } from '../hooks/useBusinessSync';
import '../services/polyfill';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import { useBusinessStore } from '../store/businessStore';

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
  const { user, setSession, setLoading, hasHydrated } = useAuthStore();
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
