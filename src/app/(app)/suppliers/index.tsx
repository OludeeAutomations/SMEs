import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { SurfaceCard } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { formatMoney, parseAmount } from '@/utils/format';

export default function SuppliersScreen() {
  const router = useRouter();
  const workspace = useWorkspace();
  const addSupplier = useBusinessStore((state) => state.addSupplier);
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');

  const save = () => {
    const cleanEmail = email.trim();
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Missing details', 'Supplier name and phone number are required.');
      return;
    }
    if (cleanEmail && !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      Alert.alert('Check email', 'Enter a valid supplier email address or leave it blank.');
      return;
    }
    addSupplier({
      name: name.trim(),
      phoneNumber: phone.trim(),
      emailAddress: cleanEmail || undefined,
      address: address.trim() || undefined,
      outstandingBalance: parseAmount(balance),
    });
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setBalance('');
    setAdding(false);
  };

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Suppliers" actionLabel="Supplier" onAction={() => setAdding((value) => !value)} />
      {adding ? <SurfaceCard className="gap-3">
        <Input label="Supplier name" placeholder="Business name" value={name} onChangeText={setName} />
        <Input label="Phone number" placeholder="+234..." value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input label="Email address" placeholder="Optional" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Address" placeholder="Optional" value={address} onChangeText={setAddress} />
        <Input label="Opening balance" placeholder="0" value={balance} onChangeText={setBalance} keyboardType="numeric" />
        <Button title="Save supplier" onPress={save} />
      </SurfaceCard> : null}
      {workspace.suppliers.length ? <SurfaceCard className="py-0">
        {workspace.suppliers.map((supplier, index) => <React.Fragment key={supplier.id}>
          <DataRow
            title={supplier.name}
            subtitle={[supplier.phoneNumber, supplier.emailAddress].filter(Boolean).join(' • ')}
            value={formatMoney(supplier.outstandingBalance, currency)}
            onPress={() => router.push(`/(app)/suppliers/${supplier.id}` as never)}
          />
          {index < workspace.suppliers.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : <EmptyState title="No suppliers yet" message="Add a supplier to track contact details and outstanding balances." actionLabel="Add supplier" onAction={() => setAdding(true)} />}
    </ScrollView>
  </SafeAreaView>;
}
