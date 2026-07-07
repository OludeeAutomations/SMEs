import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/Input';
import Button from '@/components/Button';

const formSchema = z.object({
  fullname: z.string().min(2, 'Full name is required'),
  businessemail: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Must be at least 6 characters'),
  companysize: z.string().min(1, 'Company size is required')
});

type FormData = z.infer<typeof formSchema>;

export default function EaseSignUpScreen() {
  const router = useRouter();
  const hasForm = true;

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: '',
      businessemail: '',
      password: '',
      companysize: ''
    }
  });

  const onSubmit = (data: FormData) => {
    console.log('Submitted signup:', data);
    router.push('/(auth)/business-profile');
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-light dark:bg-bg-dark">
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[28px] font-bold text-text-primary-light dark:text-text-primary-dark leading-[36px] mb-3">
          Set up your business account.
        </Text>

        <Text className="text-[15px] leading-[22px] text-text-secondary-light dark:text-text-secondary-dark mb-6">
          Create your Ease workspace, invite your team, and track everything from day one.
        </Text>

        <View className="gap-y-4 mb-6">
          <Controller
            control={control}
            name="fullname"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                label="Full name"
                placeholder="Amina Yusuf"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
                isPassword={false}
              />
            )}
          />

          <Controller
            control={control}
            name="businessemail"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                label="Business email"
                placeholder="hello@studio.ng"
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
                placeholder="Create a strong password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
                isPassword={true}
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="companysize"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                label="Company size"
                placeholder="1-10 employees"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
                isPassword={false}
              />
            )}
          />
        </View>

        <Button
          title="Create account"
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          className="h-[56px] justify-center"
        />

        <Text className="text-xs text-text-muted-light dark:text-text-muted-dark text-center mt-6">
          By continuing, you agree to the Terms and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
