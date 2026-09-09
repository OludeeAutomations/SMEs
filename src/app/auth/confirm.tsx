import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { CheckCircle2, CircleAlert, MailCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BrandLogo from '@/components/BrandLogo';
import { Button } from '@/components/Button';
import { supabase } from '@/services/supabase';

type ConfirmationState = 'ready' | 'confirming' | 'confirmed' | 'error';

const firstParam = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token_hash?: string | string[]; type?: string | string[] }>();
  const tokenHash = firstParam(params.token_hash);
  const requestedType = firstParam(params.type);
  const [state, setState] = useState<ConfirmationState>('ready');
  const [message, setMessage] = useState('Press the button below to securely activate your Rekọda account.');

  const confirmEmail = async () => {
    if (!tokenHash) {
      setState('error');
      setMessage('This confirmation link is incomplete. Request a new email from Rekọda and try again.');
      return;
    }
    setState('confirming');
    setMessage('We are securely confirming your email address.');
    const confirmationType: 'signup' | 'email' = requestedType === 'email' ? 'email' : 'signup';
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: confirmationType });
    if (error) {
      setState('error');
      setMessage('This link may have expired or already been used. If you already confirmed your account, return to Rekọda and sign in. Otherwise, request a new email from the app.');
      return;
    }
    setState('confirmed');
    setMessage('Your email has been confirmed. You can now return to Rekọda and sign in.');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 48, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[520px] items-center rounded-[12px] border border-[#DCE3EE] bg-white px-6 py-10">
          <BrandLogo width={190} />
          <View className={`mt-8 h-14 w-14 items-center justify-center rounded-full ${state === 'confirmed' ? 'bg-[#E8FBF4]' : state === 'error' ? 'bg-[#FEF2F2]' : 'bg-[#EAF2FF]'}`}>
            {state === 'confirmed' ? <CheckCircle2 size={28} color="#047857" /> : state === 'error' ? <CircleAlert size={28} color="#DC2626" /> : <MailCheck size={28} color="#2563EB" />}
          </View>
          <Text className="mt-5 text-center text-2xl font-bold text-[#0B1F5E]">
            {state === 'confirming' ? 'Confirming your email' : state === 'confirmed' ? 'Email confirmed' : state === 'error' ? 'Check your confirmation link' : 'Confirm your email'}
          </Text>
          <Text className="mt-3 max-w-[390px] text-center text-sm leading-6 text-[#475569]">{message}</Text>
          {state === 'ready' ? <Button title="Confirm my email" onPress={confirmEmail} className="mt-7 min-w-52" /> : null}
          {state === 'confirming' ? <Button title="Confirming…" isLoading disabled className="mt-7 min-w-52" /> : null}
          {state === 'confirmed' ? <Button title="Continue to sign in" onPress={() => router.replace('/(auth)/login')} className="mt-7 min-w-52" /> : null}
          {state === 'error' && tokenHash ? <Button title="Try confirmation again" variant="outline" onPress={confirmEmail} className="mt-7 min-w-52" /> : null}
          <Text className="mt-7 text-center text-xs text-[#94A3B8]">Run your business with clarity.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
