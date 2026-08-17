import React from 'react';
import { Alert, Pressable, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/business-ui';
import { SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';

const items = [
  ['Business profile', '/(app)/settings/business-config'],
  ['Team and roles', '/(app)/settings/roles'],
  ['Notifications', '/(app)/settings/notifications'],
  ['Customer payments', '/(app)/settings/payments'],
  ['Automation', '/(app)/automation'],
] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const business = useAuthStore((state) => state.business);
  const logout = useAuthStore((state) => state.logout);

  const signOut = () => Alert.alert('Sign out', 'Sign out of this device?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out', onPress: async () => { await logout(); router.replace('/(auth)/onboarding'); } },
  ]);

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5">
      <ScreenHeader title="Settings" subtitle={`${business?.name ?? 'Business'} • ${user?.email ?? ''}`} />
      <SurfaceCard className="py-1">
        {items.map(([title, route]) => <Pressable key={title} onPress={() => router.push(route)} className="flex-row items-center justify-between py-3">
          <Text className="text-[13px] font-semibold text-[#0F172A]">{title}</Text><ChevronRight size={17} color={colors.muted} />
        </Pressable>)}
      </SurfaceCard>
      <Button title="Sign out" variant="secondary" onPress={signOut} />
    </ScrollView>
  </SafeAreaView>;
}
