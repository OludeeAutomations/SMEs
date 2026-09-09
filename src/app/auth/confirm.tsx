import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { CheckCircle2, CircleAlert } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BrandLogo from '@/components/BrandLogo';
import { supabase } from '@/services/supabase';

type ConfirmationState = 'confirming' | 'confirmed' | 'error';

const firstParam = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token_hash?: string | string[]; type?: string | string[] }>();
  const tokenHash = firstParam(params.token_hash);
  const requestedType = firstParam(params.type);
  const [state, setState] = useState<ConfirmationState>('confirming');
  const [message, setMessage] = useState('We are securely confirming your email address.');
  const attemptedToken = useRef<string | null>(null);

  useEffect(() => {
    if (!tokenHash) {
      setState('error');
      setMessage('This confirmation link is incomplete. Request a new email from Rekọda and try again.');
      return;
    }
    if (attemptedToken.current === tokenHash) return;
    attemptedToken.current = tokenHash;

    const confirmationType: 'signup' | 'email' = requestedType === 'email' ? 'email' : 'signup';
    void supabase.auth.verifyOtp({ token_hash: tokenHash, type: confirmationType }).then(({ error }) => {
      if (error) {
        setState('error');
        setMessage(error.message.toLowerCase().includes('expired')
          ? 'This confirmation link has expired or has already been used. Request a new email and try again.'
          : 'We could not confirm this email. Request a new confirmation email and try again.');
        return;
      }
      setState('confirmed');
      setMessage('Your email has been confirmed. You can now return to Rekọda and sign in.');
    });
  }, [requestedType, tokenHash]);

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-[#F5F7FB] px-5" edges={['top', 'bottom']}>
      <View className="w-full max-w-[520px] items-center rounded-[12px] border border-[#DCE3EE] bg-white px-6 py-10">
        <BrandLogo width={190} />
        <View className={`mt-8 h-14 w-14 items-center justify-center rounded-full ${state === 'confirmed' ? 'bg-[#E8FBF4]' : state === 'error' ? 'bg-[#FEF2F2]' : 'bg-[#EAF2FF]'}`}>
          {state === 'confirming' ? <ActivityIndicator color="#2563EB" /> : state === 'confirmed' ? <CheckCircle2 size={28} color="#047857" /> : <CircleAlert size={28} color="#DC2626" />}
        </View>
        <Text className="mt-5 text-center text-2xl font-bold text-[#0B1F5E]">
          {state === 'confirming' ? 'Confirming your email' : state === 'confirmed' ? 'Email confirmed' : 'Confirmation unsuccessful'}
        </Text>
        <Text className="mt-3 max-w-[390px] text-center text-sm leading-6 text-[#475569]">{message}</Text>
        {state !== 'confirming' ? <Pressable accessibilityRole="button" onPress={() => router.replace(state === 'confirmed' ? '/(auth)/login' : '/')} className="mt-7 min-h-12 items-center justify-center rounded-[6px] bg-[#0B1F5E] px-6">
          <Text className="text-sm font-bold text-white">{state === 'confirmed' ? 'Continue to Rekọda' : 'Go to Rekọda'}</Text>
        </Pressable> : null}
        <Text className="mt-7 text-center text-xs text-[#94A3B8]">Run your business with clarity.</Text>
      </View>
    </SafeAreaView>
  );
}
