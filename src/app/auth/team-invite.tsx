import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { CheckCircle2, CircleAlert, UserPlus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BrandLogo from '@/components/BrandLogo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { acceptTeamInvitation } from '@/services/teamInvitations';
import { supabase } from '@/services/supabase';

type InviteState = 'ready' | 'saving' | 'success' | 'error';

const firstParam = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

export default function TeamInviteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token_hash?: string | string[] }>();
  const tokenHash = firstParam(params.token_hash);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [state, setState] = useState<InviteState>('ready');
  const [message, setMessage] = useState('Create a password to accept your Rekoda team invitation.');
  const [sessionVerified, setSessionVerified] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const joinTeam = async () => {
    if (!tokenHash) {
      setState('error');
      setMessage('This invitation link is incomplete. Ask the business owner to send another invitation.');
      return;
    }
    if (password.length < 8) {
      setState('error');
      setMessage('Your password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmation) {
      setState('error');
      setMessage('The two passwords do not match.');
      return;
    }

    setState('saving');
    setMessage('We are securely setting up your team access.');

    if (!sessionVerified) {
      const { error: verificationError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'invite' });
      if (verificationError) {
        setState('error');
        setMessage('This invitation link may have expired or already been used. Ask the business owner to send another invitation.');
        return;
      }
      setSessionVerified(true);
    }

    if (!passwordUpdated) {
      const { error: passwordError } = await supabase.auth.updateUser({ password });
      if (passwordError) {
        setState('error');
        setMessage(passwordError.message || 'We could not create your password. Please try again.');
        return;
      }
      setPasswordUpdated(true);
    }

    try {
      const result = await acceptTeamInvitation();
      await supabase.auth.signOut({ scope: 'local' });
      setState('success');
      setMessage(`You have joined ${result.businessName}${result.role ? ` as ${result.role}` : ''}. Return to Rekoda and sign in with your new password.`);
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'We could not finish accepting this invitation. Please try again.');
    }
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
            {state === 'success' ? <CheckCircle2 size={28} color="#047857" /> : state === 'error' ? <CircleAlert size={28} color="#DC2626" /> : <UserPlus size={28} color="#2563EB" />}
          </View>
          <Text className="mt-5 text-center text-2xl font-bold text-[#0B1F5E]">
            {state === 'success' ? 'Welcome to the team' : 'Join the team'}
          </Text>
          <Text className={`mt-3 max-w-[390px] text-center text-sm leading-6 ${state === 'error' ? 'text-[#B91C1C]' : 'text-[#475569]'}`}>{message}</Text>

          {state !== 'success' ? (
            <View className="mt-7 w-full gap-4">
              <Input label="Create password" placeholder="At least 8 characters" value={password} onChangeText={setPassword} isPassword autoCapitalize="none" autoComplete="new-password" />
              <Input label="Confirm password" placeholder="Enter the password again" value={confirmation} onChangeText={setConfirmation} isPassword autoCapitalize="none" autoComplete="new-password" />
              <Button title="Join team" onPress={joinTeam} isLoading={state === 'saving'} disabled={state === 'saving'} className="mt-1 w-full" />
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
