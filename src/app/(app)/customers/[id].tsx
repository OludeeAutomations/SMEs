import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useWorkspace } from '@/store/businessStore';
import { formatDate, formatMoney } from '@/utils/format';

export default function CustomerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workspace = useWorkspace();
  const customer = workspace.customers.find((item) => item.id === id);
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');

  if (!customer) {
    return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-5 pt-5">
        <ScreenHeader title="Customer" showBack />
        <EmptyState title="Customer not found" message="This customer may no longer exist." />
      </ScrollView>
    </SafeAreaView>;
  }

  const invoices = workspace.invoices.filter((invoice) => invoice.customerId === customer.id);
  const sales = workspace.sales.filter((sale) => sale.customerId === customer.id);
  const activity = [
    ...sales.map((sale) => ({ id: sale.id, title: 'Sale', subtitle: formatDate(sale.createdAt), value: sale.total })),
    ...invoices.map((invoice) => ({ id: invoice.id, title: `Invoice • ${invoice.status}`, subtitle: formatDate(invoice.createdAt), value: invoice.total })),
  ];

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5">
      <ScreenHeader title={customer.fullName} subtitle={`${customer.phoneNumber}${customer.emailAddress ? ` • ${customer.emailAddress}` : ''}`} showBack />
      <MetricCard label="Outstanding" value={formatMoney(customer.amountOwed, currency)} color={colors.amber} />
      <MetricCard label="Lifetime purchases" value={formatMoney(customer.totalBought, currency)} color={colors.green} />
      {activity.length ? <SurfaceCard className="py-0">
        {activity.map((item, index) => <React.Fragment key={item.id}>
          <DataRow title={item.title} subtitle={item.subtitle} value={formatMoney(item.value, currency)} />
          {index < activity.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : <EmptyState title="No activity" message="Sales and invoices for this customer will appear here." />}
    </ScrollView>
  </SafeAreaView>;
}
