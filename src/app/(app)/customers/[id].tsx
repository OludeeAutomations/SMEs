import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { formatDate, formatMoney } from '@/utils/format';

export default function CustomerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const workspace = useWorkspace();
  const customer = workspace.customers.find((item) => item.id === id);
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const updateCustomer = useBusinessStore((state) => state.updateCustomer);
  const deleteCustomer = useBusinessStore((state) => state.deleteCustomer);
  const [name, setName] = useState(customer?.fullName ?? '');
  const [phone, setPhone] = useState(customer?.phoneNumber ?? '');
  const [email, setEmail] = useState(customer?.emailAddress ?? '');

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
  const save = () => {
    if (name.trim().length < 2 || phone.trim().length < 7) return Alert.alert('Check details', 'Enter a valid name and phone number.');
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return Alert.alert('Check email', 'Enter a valid email address.');
    updateCustomer(customer.id, { fullName: name.trim(), phoneNumber: phone.trim(), emailAddress: email.trim() || undefined });
    Alert.alert('Customer updated');
  };
  const remove = () => Alert.alert('Delete customer?', 'Existing sales and invoices will remain in history.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { deleteCustomer(customer.id); router.replace('/(app)/customers'); } }]);

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5">
      <ScreenHeader title={customer.fullName} subtitle={`${customer.phoneNumber}${customer.emailAddress ? ` • ${customer.emailAddress}` : ''}`} showBack />
      <MetricCard label="Outstanding" value={formatMoney(customer.amountOwed, currency)} color={colors.amber} />
      <MetricCard label="Lifetime purchases" value={formatMoney(customer.totalBought, currency)} color={colors.green} />
      <SurfaceCard className="gap-3">
        <Input label="Full name" value={name} onChangeText={setName} />
        <Input label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Button title="Save customer" onPress={save} />
      </SurfaceCard>
      {activity.length ? <SurfaceCard className="py-0">
        {activity.map((item, index) => <React.Fragment key={item.id}>
          <DataRow title={item.title} subtitle={item.subtitle} value={formatMoney(item.value, currency)} />
          {index < activity.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : <EmptyState title="No activity" message="Sales and invoices for this customer will appear here." />}
      <Button title="Delete customer" variant="secondary" onPress={remove} />
    </ScrollView>
  </SafeAreaView>;
}
