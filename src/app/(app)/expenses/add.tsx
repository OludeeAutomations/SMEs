import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import DatePickerField from '@/components/DatePickerField';
import { Input } from '@/components/Input';
import { ChoiceChips, ScreenHeader } from '@/components/business-ui';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { parseAmount, todayKey } from '@/utils/format';

export default function AddExpenseScreen() {
  const router = useRouter();
  const workspace = useWorkspace();
  const addExpense = useBusinessStore((state) => state.addExpense);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(todayKey());

  const save = () => {
    const value = parseAmount(amount);
    if (!category.trim() || !description.trim() || value <= 0) {
      Alert.alert('Check expense', 'Category, description, and a valid amount are required.');
      return;
    }
    addExpense({
      category: category.trim(),
      amount: value,
      description: description.trim(),
      merchant: merchant.trim() || undefined,
      date,
      isRecurring: false,
    });
    Alert.alert('Expense saved', description.trim(), [{ text: 'Done', onPress: () => router.replace('/(app)/expenses') }]);
  };

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Add expense" />
      <Input label="Category" placeholder="e.g. Fuel" value={category} onChangeText={setCategory} />
      {workspace.expenseCategories.length ? <ChoiceChips options={workspace.expenseCategories} value={category} onChange={setCategory} /> : null}
      <Input label="Amount" placeholder="0" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Input label="Description" placeholder="What was this for?" value={description} onChangeText={setDescription} />
      <Input label="Vendor" placeholder="Optional" value={merchant} onChangeText={setMerchant} />
      <DatePickerField label="Date" value={date} onChange={setDate} maximumDate={new Date()} />
      <Button title="Save expense" onPress={save} className="h-14 rounded-[5px]" />
    </ScrollView>
  </SafeAreaView>;
}
