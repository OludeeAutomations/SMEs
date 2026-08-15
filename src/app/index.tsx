import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function EaseSplashScreen() {
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
    <SafeAreaView className="flex-1 bg-bg-light dark:bg-bg-dark justify-between py-12">
      <View />

      <View className="items-center px-6 gap-y-4">
        <View 
          className="w-[110px] h-[110px] bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[34px] relative"
          style={{
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 26,
            elevation: 8,
          }}
        >
          <View className="w-[66px] h-[66px] rounded-full bg-accent-blue opacity-[0.95] absolute top-[22px] left-[22px]" />
          
          <View className="w-[50px] h-[50px] rounded-full bg-accent-emerald opacity-[0.92] absolute top-[30px] left-[36px]" />
        </View>

        <Text className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark font-inter mt-2">
          Ease
        </Text>

        <Text className="text-base text-text-secondary-light dark:text-text-secondary-dark text-center leading-relaxed max-w-[260px] font-inter">
          The AI business operating system for SMEs across Africa.
        </Text>

        <View className="w-[180px] h-2 bg-surface-2-light dark:bg-surface-2-dark rounded-full overflow-hidden mt-2">
          <View className="w-[96px] h-full bg-accent-blue rounded-full" />
        </View>
      </View>

      <View className="items-center px-6">
        <Text className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark tracking-wider uppercase font-inter">
          Sales • Invoicing • Inventory • AI insights
        </Text>
      </View>
    </SafeAreaView>
  );
}
