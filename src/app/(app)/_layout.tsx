import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import AppBottomNav from '@/components/AppBottomNav';

export default function AppLayout() {
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
