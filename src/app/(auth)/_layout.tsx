import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
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
