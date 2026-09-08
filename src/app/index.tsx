import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BrandLogo from '@/components/BrandLogo';
import { useAuthStore } from '@/store/authStore';

export default function RekodaSplashScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!hasHydrated || isLoading) return;
    const timer = setTimeout(() => {
      router.replace(user ? '/(auth)/login' : '/(auth)/onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  }, [hasHydrated, isLoading, router, user]);

  return (
    <SafeAreaView className="flex-1 justify-between bg-[#F7F8F4] py-12">
      <View />

      <View className="items-center px-6 gap-y-4">
        <BrandLogo width={236} />

        <Text className="max-w-[280px] text-center font-inter text-base leading-relaxed text-text-secondary-light">
          The AI business operating system for SMEs across Africa.
        </Text>

        <View className="w-[180px] h-2 bg-surface-2-light dark:bg-surface-2-dark rounded-full overflow-hidden mt-2">
          <View className="w-[96px] h-full bg-accent-blue rounded-full" />
        </View>
      </View>

      <View className="items-center px-6">
        <Text className="font-inter text-xs font-medium uppercase tracking-wider text-text-muted-light">
          Sales • Invoicing • Inventory • AI insights
        </Text>
      </View>
    </SafeAreaView>
  );
}
