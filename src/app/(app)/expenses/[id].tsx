import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Pencil, Trash2, X } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import DatePickerField from '@/components/DatePickerField';
import { Input } from '@/components/Input';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { SurfaceCard } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { formatMoney, parseAmount } from '@/utils/format';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const expense = useWorkspace().expenses.find((item) => item.id === id);
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const updateExpense = useBusinessStore((state) => state.updateExpense);
  const deleteExpense = useBusinessStore((state) => state.deleteExpense);
  const [description, setDescription] = useState(expense?.description ?? '');
  const [category, setCategory] = useState(expense?.category ?? '');
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [merchant, setMerchant] = useState(expense?.merchant ?? '');
  const [date, setDate] = useState(expense?.date ?? '');
  const [editing, setEditing] = useState(false);

  if (!expense) return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}><ScrollView contentContainerClassName="gap-4 px-5 pt-5"><ScreenHeader title="Expense" showBack /><EmptyState title="Expense not found" message="This expense may no longer exist." /></ScrollView></SafeAreaView>;
  const save = () => {
    if (!description.trim() || !category.trim() || parseAmount(amount) <= 0) return Alert.alert('Check expense', 'Description, category, and a positive amount are required.');
    updateExpense(expense.id, { description: description.trim(), category: category.trim(), amount: parseAmount(amount), merchant: merchant.trim() || undefined, date });
    setEditing(false);
    Alert.alert('Expense updated');
  };
  const remove = () => Alert.alert('Delete expense?', 'This cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { deleteExpense(expense.id); router.replace('/(app)/expenses'); } }]);

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}><ScrollView contentContainerClassName="gap-4 px-5 pb-40 pt-5" keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
    <ScreenHeader title={expense.description} subtitle={expense.category} showBack actions={[{ label: editing ? 'Cancel editing' : 'Edit expense', icon: editing ? X : Pencil, onPress: () => setEditing((value) => !value) }, { label: 'Delete expense', icon: Trash2, onPress: remove, destructive: true }]} />
    <SurfaceCard className="py-0"><DataRow title="Amount" value={formatMoney(expense.amount, currency)} /><Divider /><DataRow title="Date" value={expense.date} />{expense.merchant ? <><Divider /><DataRow title="Vendor" value={expense.merchant} /></> : null}</SurfaceCard>
    {editing ? <SurfaceCard className="gap-3">
      <Input label="Description" value={description} onChangeText={setDescription} />
      <Input label="Category" value={category} onChangeText={setCategory} />
      <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Input label="Vendor" value={merchant} onChangeText={setMerchant} />
      <DatePickerField label="Date" value={date} onChange={setDate} maximumDate={new Date()} />
      <Button title="Save expense" onPress={save} />
    </SurfaceCard> : null}
  </ScrollView></SafeAreaView>;
}
