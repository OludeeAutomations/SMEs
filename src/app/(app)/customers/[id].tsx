import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Pencil, Trash2, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ChoiceChips, DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { formatDate, formatMoney, parseAmount } from '@/utils/format';

export default function CustomerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const workspace = useWorkspace();
  const customer = workspace.customers.find((item) => item.id === id);
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const updateCustomer = useBusinessStore((state) => state.updateCustomer);
  const deleteCustomer = useBusinessStore((state) => state.deleteCustomer);
  const addBalanceAdjustment = useBusinessStore((state) => state.addCustomerBalanceAdjustment);
  const [name, setName] = useState(customer?.fullName ?? '');
  const [phone, setPhone] = useState(customer?.phoneNumber ?? '');
  const [email, setEmail] = useState(customer?.emailAddress ?? '');
  const [editing, setEditing] = useState(false);
  const [adjustingBalance, setAdjustingBalance] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'INCREASE' | 'DECREASE'>('INCREASE');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

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
  const balanceAdjustments = workspace.customerBalanceAdjustments.filter((adjustment) => adjustment.customerId === customer.id);
  const activity = [
    ...sales.map((sale) => ({ id: sale.id, title: 'Sale', subtitle: formatDate(sale.createdAt), value: sale.total })),
    ...invoices.map((invoice) => ({ id: invoice.id, title: `Invoice • ${invoice.status}`, subtitle: formatDate(invoice.createdAt), value: invoice.total })),
  ];
  const save = () => {
    if (name.trim().length < 2 || phone.trim().length < 7) return Alert.alert('Check details', 'Enter a valid name and phone number.');
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return Alert.alert('Check email', 'Enter a valid email address.');
    updateCustomer(customer.id, { fullName: name.trim(), phoneNumber: phone.trim(), emailAddress: email.trim() || undefined });
    setEditing(false);
    Alert.alert('Customer updated');
  };
  const remove = () => Alert.alert('Delete customer?', 'Existing sales and invoices will remain in history.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { deleteCustomer(customer.id); router.replace('/(app)/customers'); } }]);
  const saveBalanceAdjustment = () => {
    const amount = parseAmount(adjustmentAmount);
    if (amount <= 0) return Alert.alert('Check amount', 'Enter an amount greater than zero.');
    if (!adjustmentReason.trim()) return Alert.alert('Reason required', 'Add a reason so this balance change can be traced later.');
    if (adjustmentType === 'DECREASE' && amount > customer.amountOwed) return Alert.alert('Amount is too high', `You can reduce this balance by up to ${formatMoney(customer.amountOwed, currency)}.`);
    const saved = addBalanceAdjustment(customer.id, adjustmentType, amount, adjustmentReason);
    if (!saved) return Alert.alert('Could not adjust balance', 'Please review the amount and try again.');
    setAdjustmentAmount('');
    setAdjustmentReason('');
    setAdjustingBalance(false);
    Alert.alert('Balance updated', `${adjustmentType === 'INCREASE' ? 'Added' : 'Removed'} ${formatMoney(amount, currency)}.`);
  };

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-40 pt-5" keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
      <ScreenHeader title={customer.fullName} subtitle={`${customer.phoneNumber}${customer.emailAddress ? ` • ${customer.emailAddress}` : ''}`} showBack actions={[{ label: editing ? 'Cancel editing' : 'Edit customer', icon: editing ? X : Pencil, onPress: () => setEditing((value) => !value) }, { label: 'Delete customer', icon: Trash2, onPress: remove, destructive: true }]} />
      <MetricCard label="Outstanding" value={formatMoney(customer.amountOwed, currency)} color={colors.amber} />
      <MetricCard label="Lifetime purchases" value={formatMoney(customer.totalBought, currency)} color={colors.green} />
      <Button title={adjustingBalance ? 'Cancel balance adjustment' : 'Adjust outstanding balance'} variant="outline" onPress={() => setAdjustingBalance((value) => !value)} />
      {adjustingBalance ? <SurfaceCard className="gap-3">
        <View>
          <Text className="text-base font-bold text-[#0F172A]">Balance adjustment</Text>
          <Text className="mt-1 text-xs leading-5 text-[#475569]">Increase a debt or reduce it after a payment, credit, or correction. The reason will remain in the history.</Text>
        </View>
        <ChoiceChips options={['Increase', 'Reduce']} value={adjustmentType === 'INCREASE' ? 'Increase' : 'Reduce'} onChange={(value) => setAdjustmentType(value === 'Increase' ? 'INCREASE' : 'DECREASE')} />
        <Input label="Amount" placeholder="0" value={adjustmentAmount} onChangeText={setAdjustmentAmount} keyboardType="decimal-pad" />
        <Input label="Reason" placeholder="Payment received, opening balance, correction..." value={adjustmentReason} onChangeText={setAdjustmentReason} />
        <Button title="Save adjustment" onPress={saveBalanceAdjustment} />
      </SurfaceCard> : null}
      {editing ? <SurfaceCard className="gap-3">
        <Input label="Full name" value={name} onChangeText={setName} />
        <Input label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Button title="Save customer" onPress={save} />
      </SurfaceCard> : null}
      {activity.length ? <SurfaceCard className="py-0">
        {activity.map((item, index) => <React.Fragment key={item.id}>
          <DataRow title={item.title} subtitle={item.subtitle} value={formatMoney(item.value, currency)} />
          {index < activity.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : <EmptyState title="No activity" message="Sales and invoices for this customer will appear here." />}
      {balanceAdjustments.length ? <SurfaceCard className="py-0">
        <View className="py-4"><Text className="text-sm font-bold text-[#0F172A]">Balance adjustment history</Text></View>
        <Divider />
        {balanceAdjustments.map((adjustment, index) => <React.Fragment key={adjustment.id}>
          <DataRow title={adjustment.type === 'INCREASE' ? 'Balance increased' : 'Balance reduced'} subtitle={`${adjustment.reason} • ${formatDate(adjustment.createdAt)}`} value={`${adjustment.type === 'INCREASE' ? '+' : '-'}${formatMoney(adjustment.amount, currency)}`} />
          {index < balanceAdjustments.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : null}
    </ScrollView>
  </SafeAreaView>;
}
