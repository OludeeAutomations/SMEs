import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { CheckCircle2, CircleAlert, KeyRound } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BrandLogo from '@/components/BrandLogo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { supabase } from '@/services/supabase';

type ResetState = 'ready' | 'saving' | 'success' | 'error';

const firstParam = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token_hash?: string | string[] }>();
  const tokenHash = firstParam(params.token_hash);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [state, setState] = useState<ResetState>('ready');
  const [message, setMessage] = useState('Create a new password for your Rekoda account.');
  const [sessionVerified, setSessionVerified] = useState(false);

  const updatePassword = async () => {
    if (!tokenHash) {
      setState('error');
      setMessage('This password reset link is incomplete. Request a new link from the Rekoda app.');
      return;
    }
    if (password.length < 8) {
      setState('error');
      setMessage('Your new password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmation) {
      setState('error');
      setMessage('The two passwords do not match.');
      return;
    }

    setState('saving');
    setMessage('We are securely updating your password.');

    if (!sessionVerified) {
      const { error: verificationError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery',
      });
      if (verificationError) {
        setState('error');
        setMessage('This reset link may have expired or already been used. Request a new password reset email from the Rekoda app.');
        return;
      }
      setSessionVerified(true);
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setState('error');
      setMessage(updateError.message || 'We could not update your password. Please try again.');
      return;
    }

    await supabase.auth.signOut({ scope: 'local' });
    setState('success');
    setMessage('Your password has been changed. Return to Rekoda and sign in with your new password.');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 48, paddingBottom: 48 }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[520px] items-center rounded-[12px] border border-[#DCE3EE] bg-white px-6 py-10">
          <BrandLogo width={190} />
          <View className={`mt-8 h-14 w-14 items-center justify-center rounded-full ${state === 'success' ? 'bg-[#E8FBF4]' : state === 'error' ? 'bg-[#FEF2F2]' : 'bg-[#EAF2FF]'}`}>
            {state === 'success' ? <CheckCircle2 size={28} color="#047857" /> : state === 'error' ? <CircleAlert size={28} color="#DC2626" /> : <KeyRound size={28} color="#2563EB" />}
          </View>
          <Text className="mt-5 text-center text-2xl font-bold text-[#0B1F5E]">
            {state === 'success' ? 'Password changed' : 'Choose a new password'}
          </Text>
          <Text className={`mt-3 max-w-[390px] text-center text-sm leading-6 ${state === 'error' ? 'text-[#B91C1C]' : 'text-[#475569]'}`}>{message}</Text>

          {state !== 'success' ? (
            <View className="mt-7 w-full gap-4">
              <Input
                label="New password"
                placeholder="At least 8 characters"
                value={password}
                onChangeText={setPassword}
                isPassword
                autoCapitalize="none"
                autoComplete="new-password"
              />
              <Input
                label="Confirm new password"
                placeholder="Enter the password again"
                value={confirmation}
                onChangeText={setConfirmation}
                isPassword
                autoCapitalize="none"
                autoComplete="new-password"
              />
              <Button title="Change password" onPress={updatePassword} isLoading={state === 'saving'} disabled={state === 'saving'} className="mt-1 w-full" />
            </View>
          ) : (
            <Button title="Continue to sign in" onPress={() => router.replace('/(auth)/login')} className="mt-7 min-w-52" />
          )}
          <Text className="mt-7 text-center text-xs text-[#94A3B8]">Run your business with clarity.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
