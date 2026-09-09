import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { MailCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BrandLogo from '@/components/BrandLogo';
import { Button } from '@/components/Button';
import { EMAIL_CONFIRMATION_URL, PASSWORD_RESET_URL } from '@/constants/auth';
import { supabase } from '@/services/supabase';

const firstParam = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

export default function CheckEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string | string[]; mode?: string | string[] }>();
  const email = firstParam(params.email) ?? '';
  const isRecovery = firstParam(params.mode) === 'recovery';
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resend = async () => {
    if (!email || cooldown > 0) return;
    try {
      setResending(true);
      const { error } = isRecovery
        ? await supabase.auth.resetPasswordForEmail(email, { redirectTo: PASSWORD_RESET_URL })
        : await supabase.auth.resend({
            type: 'signup',
            email,
            options: { emailRedirectTo: EMAIL_CONFIRMATION_URL },
          });
      if (error) throw error;
      setCooldown(60);
      Alert.alert('Email sent', isRecovery ? 'A new password reset email is on its way.' : 'A new confirmation email is on its way.');
    } catch (error) {
      Alert.alert('Could not resend email', error instanceof Error ? error.message : 'Please try again shortly.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="flex-grow items-center justify-center px-5 py-10" showsVerticalScrollIndicator={false}>
        <View className="w-full max-w-[520px] items-center rounded-[12px] border border-[#DCE3EE] bg-white px-6 py-10">
          <BrandLogo width={180} />
          <View className="mt-7 h-14 w-14 items-center justify-center rounded-full bg-[#EAF2FF]">
            <MailCheck size={28} color="#2563EB" />
          </View>
          <Text className="mt-5 text-center text-[26px] font-bold text-[#0B1F5E]">Check your email</Text>
          <Text className="mt-3 text-center text-sm leading-6 text-[#475569]">
            {isRecovery
              ? `We sent a password reset link to${email ? ` ${email}` : ' your email address'}. Open it to choose a new password.`
              : `We sent a confirmation link to${email ? ` ${email}` : ' your email address'}. Open it to activate your Rekoda account before signing in.`}
          </Text>
          <Button title={isRecovery ? 'Back to sign in' : "I've confirmed my email"} onPress={() => router.replace('/(auth)/login')} className="mt-7 w-full" />
          <Button
            title={cooldown > 0 ? `Resend email in ${cooldown}s` : isRecovery ? 'Resend reset email' : 'Resend confirmation email'}
            variant="outline"
            disabled={!email || cooldown > 0}
            isLoading={resending}
            onPress={resend}
            className="mt-3 w-full"
          />
          <Pressable onPress={() => router.replace(isRecovery ? '/(auth)/reset' : '/(auth)/signup')} className="mt-5 p-2">
            <Text className="text-sm font-semibold text-[#2563EB]">Use a different email</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
