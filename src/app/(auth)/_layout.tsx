import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function AuthLayout() {
  const user = useAuthStore((state) => state.user);
  const business = useAuthStore((state) => state.business);
  const isLaunchAuthenticated = useAuthStore((state) => state.isLaunchAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (!hasHydrated || isLoading) return null;
  if (user && business && isLaunchAuthenticated) return <Redirect href="/(app)/(tabs)/home" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="reset" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="business-profile" />
      <Stack.Screen name="google-business-profile" />
    </Stack>
  );
}
