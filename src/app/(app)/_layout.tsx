import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Bottom Tabs Container */}
      <Stack.Screen name="(tabs)" />
      
      {/* Sub-Feature Stack Routes */}
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
  );
}
