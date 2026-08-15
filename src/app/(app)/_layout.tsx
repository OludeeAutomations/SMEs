import React from 'react';
import { View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import AppBottomNav from '@/components/AppBottomNav';
import { useAuthStore } from '@/store/authStore';

export default function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const isLaunchAuthenticated = useAuthStore((state) => state.isLaunchAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (!hasHydrated || isLoading) return null;
  if (!user) return <Redirect href="/(auth)/onboarding" />;
  if (!isLaunchAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <View className="flex-1 bg-[#F5F7FB]">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sales" />
        <Stack.Screen name="inventory" />
        <Stack.Screen name="customers" />
        <Stack.Screen name="invoices" />
        <Stack.Screen name="expenses" />
        <Stack.Screen name="suppliers" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="automation" />
        <Stack.Screen name="projects" />
      </Stack>
      <AppBottomNav />
    </View>
  );
}
