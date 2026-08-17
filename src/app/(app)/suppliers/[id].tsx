import React from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { EmptyState, ScreenHeader } from '@/components/business-ui';
import { MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useWorkspace } from '@/store/businessStore';
import { formatMoney } from '@/utils/format';

export default function SupplierDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workspace = useWorkspace();
  const supplier = workspace.suppliers.find((item) => item.id === id);
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');

  if (!supplier) {
    return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-5 pt-5">
        <ScreenHeader title="Supplier" showBack />
        <EmptyState title="Supplier not found" message="This supplier may no longer exist." />
      </ScrollView>
    </SafeAreaView>;
  }

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5">
      <ScreenHeader title={supplier.name} subtitle={supplier.phoneNumber} showBack />
      <MetricCard label="Outstanding balance" value={formatMoney(supplier.outstandingBalance, currency)} color={colors.amber} />
      <SurfaceCard>
        <Text className="text-sm font-bold text-[#0F172A]">Contact</Text>
        <Text className="mt-1 text-[13px] leading-[18px] text-[#475569]">{supplier.phoneNumber}</Text>
        {supplier.emailAddress ? <Text className="mt-1 text-[13px] leading-[18px] text-[#475569]">{supplier.emailAddress}</Text> : null}
        {supplier.address ? <Text className="mt-1 text-[13px] leading-[18px] text-[#475569]">{supplier.address}</Text> : null}
      </SurfaceCard>
    </ScrollView>
  </SafeAreaView>;
}
