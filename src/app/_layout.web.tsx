import React from 'react';
import { Stack } from 'expo-router';
import '../global.css';

export default function WebRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/confirm" />
      <Stack.Screen name="auth/reset-password" />
    </Stack>
  );
}
