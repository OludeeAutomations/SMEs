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
    <SafeAreaView className="flex-1 justify-between bg-[#0B1F5E] py-12">
      <View />

      <View className="items-center px-6 gap-y-4">
        <BrandLogo tone="white" width={236} />

        <Text className="max-w-[280px] text-center font-inter text-base leading-relaxed text-[#DCE7FF]">
          The AI business operating system for SMEs across Africa.
        </Text>

        <View className="mt-2 h-2 w-[180px] overflow-hidden rounded-full bg-white/20">
          <View className="h-full w-[96px] rounded-full bg-white" />
        </View>
      </View>

      <View className="items-center px-6">
        <Text className="font-inter text-xs font-medium uppercase tracking-wider text-[#AFC3EE]">
          Sales • Invoicing • Inventory • AI insights
        </Text>
      </View>
    </SafeAreaView>
  );
}
