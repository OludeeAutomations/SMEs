import React from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useWorkspace } from '@/store/businessStore';
import { formatDate, formatMoney } from '@/utils/format';

export default function LatestSaleSummary({ title }: { title: string }) {
  const { saleId } = useLocalSearchParams<{ saleId?: string }>();
  const router = useRouter();
  const workspace = useWorkspace();
  const sale = workspace.sales.find((item) => item.id === saleId) ?? workspace.sales[0];
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}><ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5">
    <ScreenHeader title={title} subtitle="Completed sale summary" showBack />
    {sale ? <>
      <MetricCard label="Amount paid" value={formatMoney(sale.total, currency)} color={colors.green} />
      <SurfaceCard className="py-0">{sale.items.map((item, index) => <React.Fragment key={`${item.productId}-${index}`}><DataRow title={item.productName} subtitle={`${item.quantity} × ${formatMoney(item.price, currency)}`} value={formatMoney(item.quantity * item.price, currency)} />{index < sale.items.length - 1 ? <Divider /> : null}</React.Fragment>)}</SurfaceCard>
      <DataRow title="Payment method" subtitle={formatDate(sale.createdAt)} value={sale.paymentMethod} />
      <Button title="Open and share receipt" onPress={() => router.replace(`/(app)/sales/${sale.id}` as never)} />
    </> : <EmptyState title="No completed sale" message="Complete a sale to generate a confirmation and receipt." actionLabel="Record sale" onAction={() => router.replace('/(app)/sales/record')} />}
  </ScrollView></SafeAreaView>;
}
