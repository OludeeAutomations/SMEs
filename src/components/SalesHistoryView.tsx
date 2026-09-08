import React from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useWorkspace } from '@/store/businessStore';
import { formatDate, formatMoney } from '@/utils/format';
import type { Sale } from '@/types';
import { displayReference } from '@/utils/references';

export default function SalesHistoryView({ paymentMethod }: { paymentMethod?: Sale['paymentMethod'] }) {
  const router = useRouter();
  const workspace = useWorkspace();
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const sales = paymentMethod ? workspace.sales.filter((sale) => sale.paymentMethod === paymentMethod) : workspace.sales;
  const total = sales.reduce((sum, sale) => sum + sale.total, 0);

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5">
      <ScreenHeader title={paymentMethod ? `${paymentMethod[0]}${paymentMethod.slice(1).toLowerCase()} sales` : 'Sales history'} subtitle="Completed transactions, newest first." showBack />
      <View className="flex-row gap-3">
        <MetricCard label="Transactions" value={String(sales.length)} color={colors.blue} />
        <MetricCard label="Total value" value={formatMoney(total, currency)} color={colors.green} />
      </View>
      {sales.length ? <SurfaceCard className="py-0">
        {sales.map((sale, index) => <React.Fragment key={sale.id}>
          <DataRow title={displayReference('SALE', sale)} subtitle={`${sale.customerName || 'Walk-in customer'} · ${formatDate(sale.createdAt)} · ${sale.paymentMethod}`} value={formatMoney(sale.total, currency)} onPress={() => router.push(`/(app)/sales/${sale.id}` as never)} />
          {index < sales.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : <EmptyState title="No matching sales" message="Completed transactions for this view will appear here." actionLabel="Record sale" onAction={() => router.push('/(app)/sales/record')} />}
    </ScrollView>
  </SafeAreaView>;
}
