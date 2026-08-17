import React, { useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import DatePickerField from '@/components/DatePickerField';
import { Input } from '@/components/Input';
import { ChoiceChips, EmptyState, ScreenHeader } from '@/components/business-ui';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { parseAmount, todayKey } from '@/utils/format';

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const workspace = useWorkspace();
  const addInvoice = useBusinessStore((state) => state.addInvoice);
  const [customerId, setCustomerId] = useState('');
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(todayKey());
  const [notes, setNotes] = useState('');

  const save = () => {
    const customer = workspace.customers.find((candidate) => candidate.id === customerId);
    const total = parseAmount(amount);
    if (!customer || !item.trim() || total <= 0) {
      Alert.alert('Check invoice', 'Select a customer and enter an item and valid amount.');
      return;
    }
    const invoice = addInvoice({
      customerId: customer.id,
      customerName: customer.fullName,
      items: [{ productId: 'custom', productName: item.trim(), quantity: 1, price: total }],
      total,
      status: 'UNPAID',
      dueDate,
      terms: notes.trim() || undefined,
    });
    router.replace(`/(app)/invoices/${invoice.id}` as never);
  };

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Create invoice" subtitle="The amount will appear in the selected customer's outstanding balance." />
      {workspace.customers.length ? <>
        <Text className="text-xs font-bold text-[#475569]">CUSTOMER</Text>
        <ChoiceChips
          options={workspace.customers.map((customer) => customer.fullName)}
          value={workspace.customers.find((customer) => customer.id === customerId)?.fullName ?? ''}
          onChange={(name) => setCustomerId(workspace.customers.find((customer) => customer.fullName === name)?.id ?? '')}
        />
        <Input label="Item or service" placeholder="What are you billing for?" value={item} onChangeText={setItem} />
        <Input label="Amount" placeholder="0" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <DatePickerField label="Due date" value={dueDate} onChange={setDueDate} minimumDate={new Date()} />
        <Input label="Notes" placeholder="Optional payment terms" value={notes} onChangeText={setNotes} />
        <Button title="Create invoice" onPress={save} className="h-14 rounded-[5px]" />
      </> : <EmptyState title="Add a customer first" message="Every invoice must belong to a customer." actionLabel="Add customer" onAction={() => router.push('/(app)/customers/add')} />}
    </ScrollView>
  </SafeAreaView>;
}
