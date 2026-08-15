import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import AuthBackButton from '@/components/AuthBackButton';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { signInWithGoogle } from '@/services/googleAuth';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';

function GoogleMark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-1.99 3.02v2.54h3.23c1.89-1.74 2.98-4.3 2.98-7.41Z" />
      <Path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.36l-3.23-2.54c-.9.6-2.04.95-3.39.95-2.61 0-4.82-1.76-5.61-4.13H3.05v2.62A10 10 0 0 0 12 22Z" />
      <Path fill="#FBBC05" d="M6.39 13.92A6.02 6.02 0 0 1 6.07 12c0-.67.12-1.31.32-1.92V7.46H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.54l3.34-2.62Z" />
      <Path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.95 5.46l3.34 2.62C7.18 7.71 9.39 5.95 12 5.95Z" />
    </Svg>
  );
}

export default function EaseSignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const authenticateLaunch = useAuthStore((state) => state.authenticateLaunch);

  const continueWithEmail = async () => {
    if (!fullName.trim() || !email.includes('@') || password.length < 6 || !companySize.trim()) {
      Alert.alert('Complete your details', 'Enter your name, business email, password, and company size.');
      return;
    }
    try {
      setEmailLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim(), company_size: companySize.trim() } },
      });
      if (error) throw error;
      if (!data.user) throw new Error('Your account could not be created.');
      if (!data.session) {
        Alert.alert('Check your email', 'Confirm your email address, then sign in to finish creating your business.', [
          { text: 'Go to sign in', onPress: () => router.replace('/(auth)/login') },
        ]);
        return;
      }
      setSession({ id: data.user.id, fullName: fullName.trim(), email: email.trim() }, null);
      authenticateLaunch();
      router.push('/(auth)/business-profile');
    } catch (error) {
      Alert.alert('Account creation failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const continueWithGoogle = async () => {
    try {
      setGoogleLoading(true);
      const completed = await signInWithGoogle();
      if (completed) {
        const { data } = await supabase.auth.getUser();
        if (!data.user) throw new Error('Google did not return a user account.');
        setSession({
          id: data.user.id,
          fullName: data.user.user_metadata?.full_name || fullName.trim() || 'Ease User',
          email: data.user.email || email.trim(),
        });
        authenticateLaunch();
        router.replace('/(auth)/google-business-profile');
      }
    } catch (error) {
      Alert.alert('Google sign-in failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      <ScrollView contentContainerClassName="px-5 pb-6" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AuthBackButton fallback="/(auth)/onboarding" />
        <Text className="mt-1 text-[28px] font-bold leading-[31px] text-[#0F172A]">Set up your business account.</Text>
        <Text className="mt-3 text-[15px] leading-[22px] text-[#475569]">
          Create your Ease workspace with Google or email, then complete your business profile.
        </Text>

        <View className="mt-4 gap-4">
          <Input label="Full name" placeholder="Amina Yusuf" value={fullName} onChangeText={setFullName} />
          <Input label="Business email" placeholder="hello@studio.ng" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" placeholder="Create a strong password" value={password} onChangeText={setPassword} isPassword />
          <Input label="Company size" placeholder="1-10 employees" value={companySize} onChangeText={setCompanySize} />
        </View>

        <Button title="Create account" onPress={continueWithEmail} isLoading={emailLoading} className="mt-4 h-14 rounded-[5px]" />

        <View className="my-3 flex-row items-center justify-center gap-3">
          <View className="h-px w-24 bg-[#DCE3EE]" />
          <Text className="text-xs text-[#94A3B8]">or</Text>
          <View className="h-px w-24 bg-[#DCE3EE]" />
        </View>

        <Button
          title="Continue with Google"
          variant="secondary"
          icon={<GoogleMark />}
          isLoading={googleLoading}
          onPress={continueWithGoogle}
          className="h-14 rounded-[5px] border border-[#DCE3EE] bg-white"
        />
        <Text className="mt-4 text-center text-xs leading-[17px] text-[#94A3B8]">
          By continuing, you agree to the Terms and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
