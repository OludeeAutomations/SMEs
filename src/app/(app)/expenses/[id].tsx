import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import DatePickerField from '@/components/DatePickerField';
import { Input } from '@/components/Input';
import { EmptyState, ScreenHeader } from '@/components/business-ui';
import { SurfaceCard } from '@/components/dashboard-ui';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { parseAmount } from '@/utils/format';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const expense = useWorkspace().expenses.find((item) => item.id === id);
  const updateExpense = useBusinessStore((state) => state.updateExpense);
  const deleteExpense = useBusinessStore((state) => state.deleteExpense);
  const [description, setDescription] = useState(expense?.description ?? '');
  const [category, setCategory] = useState(expense?.category ?? '');
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [merchant, setMerchant] = useState(expense?.merchant ?? '');
  const [date, setDate] = useState(expense?.date ?? '');

  if (!expense) return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}><ScrollView contentContainerClassName="gap-4 px-5 pt-5"><ScreenHeader title="Expense" showBack /><EmptyState title="Expense not found" message="This expense may no longer exist." /></ScrollView></SafeAreaView>;
  const save = () => {
    if (!description.trim() || !category.trim() || parseAmount(amount) <= 0) return Alert.alert('Check expense', 'Description, category, and a positive amount are required.');
    updateExpense(expense.id, { description: description.trim(), category: category.trim(), amount: parseAmount(amount), merchant: merchant.trim() || undefined, date });
    Alert.alert('Expense updated');
  };
  const remove = () => Alert.alert('Delete expense?', 'This cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { deleteExpense(expense.id); router.replace('/(app)/expenses'); } }]);

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}><ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" keyboardShouldPersistTaps="handled">
    <ScreenHeader title="Edit expense" showBack />
    <SurfaceCard className="gap-3">
      <Input label="Description" value={description} onChangeText={setDescription} />
      <Input label="Category" value={category} onChangeText={setCategory} />
      <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Input label="Vendor" value={merchant} onChangeText={setMerchant} />
      <DatePickerField label="Date" value={date} onChange={setDate} maximumDate={new Date()} />
      <Button title="Save expense" onPress={save} />
    </SurfaceCard>
    <Button title="Delete expense" variant="secondary" onPress={remove} />
  </ScrollView></SafeAreaView>;
}
