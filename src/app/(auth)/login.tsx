import React from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Svg, { Path } from 'react-native-svg';
import AuthBackButton from '@/components/AuthBackButton';
import { signInWithGoogle } from '@/services/googleAuth';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';

const GoogleIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.69c-.29 1.5-.14 3.09-1 4.14l3.1 2.4c1.8-1.7 2.95-4.1 2.95-6.37z"
    />
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.1-2.4c-.86.58-1.97.92-3.23.92-2.48 0-4.58-1.68-5.33-3.95H5.1v2.5A12 12 0 0 0 12 24z"
    />
    <Path
      fill="#FBBC05"
      d="M6.67 15.66A7.18 7.18 0 0 1 6.24 12c0-1.27.21-2.5.62-3.66V5.83H5.1A12 12 0 0 0 5.1 18.17l1.57-2.51z"
    />
    <Path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A12 12 0 0 0 5.1 5.83l3.24 2.51c.75-2.27 2.85-3.95 5.33-3.95z"
    />
  </Svg>
);

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Must be at least 6 characters')
});

type FormData = z.infer<typeof formSchema>;

export default function EaseLoginScreen() {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const setSession = useAuthStore((state) => state.setSession);

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSigningIn(true);
      const { data: sessionData, error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;
      if (!sessionData.user) throw new Error('No user session was returned.');
      setSession({
        id: sessionData.user.id,
        fullName: sessionData.user.user_metadata?.full_name || 'Ease User',
        email: sessionData.user.email || data.email,
      });
      router.replace('/(app)/(tabs)/home');
    } catch (error) {
      Alert.alert('Sign in failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const continueWithGoogle = async () => {
    try {
      setGoogleLoading(true);
      const completed = await signInWithGoogle();
      if (completed) router.replace('/(app)/(tabs)/home');
    } catch (error) {
      Alert.alert('Google sign-in failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-light dark:bg-bg-dark">
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <AuthBackButton fallback="/(auth)/onboarding" />

        <Text className="text-xs font-bold tracking-widest text-accent-blue uppercase mb-2">
          SECURE SIGN IN
        </Text>

        <Text className="text-[28px] font-bold text-text-primary-light dark:text-text-primary-dark leading-[36px] mb-3">
          Welcome back.
        </Text>

        <Text className="text-[15px] leading-[22px] text-text-secondary-light dark:text-text-secondary-dark mb-6">
          Continue managing your business with live sales, cash flow, and automated reminders.
        </Text>

        <View className="gap-y-4 mb-3">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                label="Email"
                placeholder="daniel@company.ng"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
                isPassword={false}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                label="Password"
                placeholder="••••••••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
                isPassword={true}
                autoCapitalize="none"
              />
            )}
          />
        </View>

        <TouchableOpacity 
          onPress={() => router.push('/(auth)/reset')}
          activeOpacity={0.7}
          className="self-start mb-6"
        >
          <Text className="text-sm font-semibold text-accent-blue">
            Forgot password?
          </Text>
        </TouchableOpacity>

        <View className="gap-y-4">
          <Button
            title="Sign in"
            variant="primary"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSigningIn}
            className="h-[56px] justify-center"
          />

          <View className="flex-row items-center justify-center my-2">
            <View className="flex-1 h-[1px] bg-border-light dark:bg-border-dark" />
            <Text className="text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest px-4">
              or
            </Text>
            <View className="flex-1 h-[1px] bg-border-light dark:bg-border-dark" />
          </View>

          <Button
            title="Continue with Google"
            variant="secondary"
            icon={<GoogleIcon />}
            onPress={continueWithGoogle}
            isLoading={googleLoading}
            className="h-[56px] justify-center border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark"
            textClassName="text-text-primary-light dark:text-text-primary-dark"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
