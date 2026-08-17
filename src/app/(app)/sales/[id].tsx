import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useWorkspace } from '@/store/businessStore';
import { shareReceiptPdf } from '@/services/receiptPdf';
import { formatDate, formatMoney } from '@/utils/format';

export default function SaleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workspace = useWorkspace();
  const sale = workspace.sales.find((item) => item.id === id);
  const business = useAuthStore((state) => state.business);
  const user = useAuthStore((state) => state.user);
  const currency = business?.currency ?? 'NGN';
  const [isSharing, setIsSharing] = useState(false);

  if (!sale) {
    return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-5 pt-5">
        <ScreenHeader title="Sale" showBack />
        <EmptyState title="Sale not found" message="This transaction may no longer exist." />
      </ScrollView>
    </SafeAreaView>;
  }

  const share = async () => {
    if (!business) {
      Alert.alert('Business profile needed', 'Complete your business profile before sharing a receipt.');
      return;
    }

    setIsSharing(true);
    try {
      await shareReceiptPdf({
        sale,
        business,
        user,
        customer: workspace.customers.find((item) => item.id === sale.customerId),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      Alert.alert("Couldn't share receipt", message);
    } finally {
      setIsSharing(false);
    }
  };

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
      <Button title={isSharing ? 'Preparing PDF...' : 'Share receipt PDF'} onPress={share} isLoading={isSharing} />
    </ScrollView>
  </SafeAreaView>;
}
