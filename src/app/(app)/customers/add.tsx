import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ScreenHeader } from '@/components/business-ui';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { parseAmount } from '@/utils/format';

export default function AddCustomerScreen() {
  const router = useRouter();
  const workspace = useWorkspace();
  const addCustomer = useBusinessStore((state) => state.addCustomer);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const save = () => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2 || cleanPhone.replace(/\D/g, '').length < 7) return Alert.alert('Check details', 'Enter a valid customer name and phone number.');
    if (cleanEmail && !/^\S+@\S+\.\S+$/.test(cleanEmail)) return Alert.alert('Check email', 'Enter a valid email address or leave it blank.');
    if (workspace.customers.some((customer) => customer.phoneNumber === cleanPhone || (cleanEmail && customer.emailAddress?.toLowerCase() === cleanEmail))) return Alert.alert('Customer already exists', 'A customer with this phone number or email is already saved.');
    addCustomer({ fullName: cleanName, phoneNumber: cleanPhone, emailAddress: cleanEmail || undefined, address: address.trim() || undefined, amountOwed: parseAmount(balance), notes: undefined });
    Alert.alert('Customer added', cleanName, [{ text: 'Done', onPress: () => router.replace('/(app)/customers') }]);
  };
  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}><ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" keyboardShouldPersistTaps="handled">
    <ScreenHeader title="Add customer" subtitle="Customer balances and purchase history update from real transactions." />
    <Input label="Full name" placeholder="Customer or business name" value={name} onChangeText={setName} />
    <Input label="Phone number" placeholder="+234..." value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
    <Input label="Email address" placeholder="Optional" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
    <Input label="Address" placeholder="Optional" value={address} onChangeText={setAddress} />
    <Input label="Opening balance" placeholder="0" value={balance} onChangeText={setBalance} keyboardType="numeric" />
    <Button title="Save customer" onPress={save} className="h-14 rounded-[5px]" />
  </ScrollView></SafeAreaView>;
}
