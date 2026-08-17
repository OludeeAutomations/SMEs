import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { BarChart, MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useWorkspace } from '@/store/businessStore';
import { recentMonthBuckets, sumByBuckets } from '@/utils/analytics';
import { formatDate, formatMoney } from '@/utils/format';

export default function InvoicesScreen() {
  const router = useRouter();
  const workspace = useWorkspace();
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const outstanding = workspace.invoices.filter((invoice) => invoice.status !== 'PAID').reduce((total, invoice) => total + invoice.total, 0);
  const monthBuckets = recentMonthBuckets();
  const paidValues = sumByBuckets(workspace.invoices.filter((invoice) => invoice.status === 'PAID'), monthBuckets, (invoice) => invoice.createdAt, (invoice) => invoice.total);
  const outstandingValues = sumByBuckets(workspace.invoices.filter((invoice) => invoice.status !== 'PAID'), monthBuckets, (invoice) => invoice.createdAt, (invoice) => invoice.total);
  const hasTrend = paidValues.some(Boolean) || outstandingValues.some(Boolean);

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Invoices" actionLabel="Invoice" onAction={() => router.push('/(app)/invoices/create')} />
      <View className="flex-row gap-3">
        <MetricCard label="Outstanding" value={formatMoney(outstanding, currency)} color={colors.amber} />
        <MetricCard label="Invoices" value={String(workspace.invoices.length)} color={colors.blue} />
      </View>

      {hasTrend ? <SurfaceCard className="gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-bold text-[#475569]">SIX-MONTH TREND</Text>
          <Text className="text-[10px] text-[#94A3B8]">Invoice value</Text>
        </View>
        <BarChart values={paidValues} comparison={outstandingValues} labels={monthBuckets.map((bucket) => bucket.label)} valueLabel="Paid" comparisonLabel="Outstanding" color={colors.green} comparisonColor={colors.amber} />
      </SurfaceCard> : null}

      {workspace.invoices.length ? <SurfaceCard className="py-0">
        {workspace.invoices.map((invoice, index) => <React.Fragment key={invoice.id}>
          <DataRow title={invoice.customerName} subtitle={`${invoice.status} · due ${formatDate(invoice.dueDate)}`} value={formatMoney(invoice.total, currency)} onPress={() => router.push(`/(app)/invoices/${invoice.id}` as never)} />
          {index < workspace.invoices.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : <EmptyState title="No invoices yet" message="Create an invoice after adding a customer." actionLabel="Create invoice" onAction={() => router.push('/(app)/invoices/create')} />}
    </ScrollView>
  </SafeAreaView>;
}
