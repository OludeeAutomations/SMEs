import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChoiceChips, DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { BarChart, MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useWorkspace } from '@/store/businessStore';
import { recentDayBuckets, sumByBuckets } from '@/utils/analytics';
import { formatMoney, todayKey } from '@/utils/format';

export default function SalesScreen() {
  const router = useRouter();
  const workspace = useWorkspace();
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const [filter, setFilter] = useState('All');
  const sales = workspace.sales.filter((sale) => filter === 'All' || sale.paymentMethod === filter.toUpperCase());
  const today = sales.filter((sale) => sale.createdAt.startsWith(todayKey()));
  const dayBuckets = recentDayBuckets();
  const dailyRevenue = sumByBuckets(sales, dayBuckets, (sale) => sale.createdAt, (sale) => sale.total);
  const recentTotal = dailyRevenue.reduce((total, value) => total + value, 0);

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Sales" subtitle="Transactions update from completed sales." actionLabel="New sale" onAction={() => router.push('/(app)/sales/record')} />
      <View className="flex-row gap-3">
        <MetricCard label="Today" value={formatMoney(today.reduce((total, sale) => total + sale.total, 0), currency)} color={colors.blue} />
        <MetricCard label="Orders" value={String(today.length)} color={colors.green} />
      </View>
      <ChoiceChips options={['All', 'Cash', 'Transfer', 'Card']} value={filter} onChange={setFilter} />

      {recentTotal > 0 ? <SurfaceCard className="gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-bold text-[#475569]">LAST 7 DAYS</Text>
          <Text className="font-mono text-[11px] font-bold text-[#2563EB]">{formatMoney(recentTotal, currency)}</Text>
        </View>
        <BarChart values={dailyRevenue} labels={dayBuckets.map((bucket) => bucket.label)} valueLabel={`${filter === 'All' ? '' : `${filter} `}Revenue`.trim()} color={colors.blue} />
      </SurfaceCard> : null}

      {sales.length ? <SurfaceCard className="py-0">
        {sales.map((sale, index) => <React.Fragment key={sale.id}>
          <DataRow title={sale.customerName || 'Walk-in customer'} subtitle={`${sale.items.map((item) => item.productName).join(', ')} · ${sale.paymentMethod}`} value={formatMoney(sale.total, currency)} onPress={() => router.push(`/(app)/sales/${sale.id}` as never)} />
          {index < sales.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : <EmptyState title="No sales yet" message={filter === 'All' ? 'Record your first transaction to populate sales and reports.' : 'No sales match this payment method.'} actionLabel="Record sale" onAction={() => router.push('/(app)/sales/record')} />}
    </ScrollView>
  </SafeAreaView>;
}
