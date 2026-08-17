import React from 'react';
import { ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import Button from '@/components/Button';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useWorkspace } from '@/store/businessStore';
import { formatDate, formatMoney } from '@/utils/format';

export default function SaleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workspace = useWorkspace();
  const sale = workspace.sales.find((item) => item.id === id);
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const business = useAuthStore((state) => state.business);

  if (!sale) {
    return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-5 pt-5">
        <ScreenHeader title="Sale" showBack />
        <EmptyState title="Sale not found" message="This transaction may no longer exist." />
      </ScrollView>
    </SafeAreaView>;
  }

  const share = () => Share.share({ message: `${business?.name ?? 'Receipt'}\nReceipt ${sale.id.slice(-6).toUpperCase()}\n${sale.items.map((item) => `${item.productName} x${item.quantity}: ${formatMoney(item.price * item.quantity, currency)}`).join('\n')}\nTotal: ${formatMoney(sale.total, currency)}\nPaid by ${sale.paymentMethod}\n${formatDate(sale.createdAt)}` });

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5">
      <ScreenHeader title={`Sale ${sale.id.slice(-6).toUpperCase()}`} subtitle={`${sale.customerName || 'Walk-in customer'} • ${formatDate(sale.createdAt)}`} showBack />
      <MetricCard label="Total" value={formatMoney(sale.total, currency)} color={colors.blue} />
      <MetricCard label="Payment" value={sale.paymentMethod} color={colors.green} />
      <SurfaceCard className="py-0">
        {sale.items.map((item, index) => <React.Fragment key={`${item.productId}-${index}`}>
          <DataRow title={item.productName} subtitle={`${item.quantity} × ${formatMoney(item.price, currency)}`} value={formatMoney(item.price * item.quantity, currency)} />
          {index < sale.items.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard>
      <Button title="Share receipt" onPress={share} />
    </ScrollView>
  </SafeAreaView>;
}
