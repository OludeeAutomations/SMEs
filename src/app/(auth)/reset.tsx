import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AuthBackButton from '@/components/AuthBackButton';
import BrandLogo from '@/components/BrandLogo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PASSWORD_RESET_URL } from '@/constants/auth';
import { supabase } from '@/services/supabase';

export default function RekodaResetScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      Alert.alert('Check email', 'Enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo: PASSWORD_RESET_URL });
      if (error) throw error;
      router.replace({ pathname: '/(auth)/check-email', params: { email: cleanEmail, mode: 'recovery' } } as never);
    } catch (error) {
      Alert.alert('Could not send reset email', error instanceof Error ? error.message : 'Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      <ScrollView contentContainerClassName="px-5 pb-40" keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
        <AuthBackButton fallback="/(auth)/login" />
        <View className="mb-5 self-start"><BrandLogo width={170} /></View>
        <Text className="text-[28px] font-bold leading-[34px] text-[#0F172A]">Reset your password.</Text>
        <Text className="mt-3 text-[15px] leading-[22px] text-[#475569]">Enter your account email and we will send a secure link for choosing a new password.</Text>
        <View className="mt-6">
          <Input label="Email address" placeholder="name@company.ng" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        </View>
        <Button title="Send reset link" onPress={send} isLoading={loading} className="mt-4 h-14" />
      </ScrollView>
    </SafeAreaView>
  );
}
