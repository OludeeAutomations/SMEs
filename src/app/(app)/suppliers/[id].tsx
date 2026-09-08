import React, { useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { Pencil, Trash2, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { DataRow, EmptyState, ScreenHeader } from '@/components/business-ui';
import { MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { formatMoney } from '@/utils/format';

export default function SupplierDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const workspace = useWorkspace();
  const supplier = workspace.suppliers.find((item) => item.id === id);
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const updateSupplier = useBusinessStore((state) => state.updateSupplier);
  const deleteSupplier = useBusinessStore((state) => state.deleteSupplier);
  const [name, setName] = useState(supplier?.name ?? '');
  const [phone, setPhone] = useState(supplier?.phoneNumber ?? '');
  const [email, setEmail] = useState(supplier?.emailAddress ?? '');
  const [address, setAddress] = useState(supplier?.address ?? '');
  const [editing, setEditing] = useState(false);

  if (!supplier) {
    return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-5 pt-5">
        <ScreenHeader title="Supplier" showBack />
        <EmptyState title="Supplier not found" message="This supplier may no longer exist." />
      </ScrollView>
    </SafeAreaView>;
  }

  const save = () => {
    if (name.trim().length < 2 || phone.trim().length < 7) return Alert.alert('Check details', 'Enter a valid supplier name and phone number.');
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return Alert.alert('Check email', 'Enter a valid email address.');
    updateSupplier(supplier.id, { name: name.trim(), phoneNumber: phone.trim(), emailAddress: email.trim() || undefined, address: address.trim() || undefined });
    setEditing(false);
    Alert.alert('Supplier updated');
  };
  const remove = () => Alert.alert('Delete supplier?', 'Bills attached to this supplier will also be deleted.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { deleteSupplier(supplier.id); router.replace('/(app)/suppliers'); } }]);

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-40 pt-5" keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
      <ScreenHeader title={supplier.name} subtitle={supplier.phoneNumber} showBack actions={[{ label: editing ? 'Cancel editing' : 'Edit supplier', icon: editing ? X : Pencil, onPress: () => setEditing((value) => !value) }, { label: 'Delete supplier', icon: Trash2, onPress: remove, destructive: true }]} />
      <MetricCard label="Outstanding balance" value={formatMoney(supplier.outstandingBalance, currency)} color={colors.amber} />
      <SurfaceCard>
        <Text className="text-sm font-bold text-[#0F172A]">Contact</Text>
        <Text className="mt-1 text-[13px] leading-[18px] text-[#475569]">{supplier.phoneNumber}</Text>
        {supplier.emailAddress ? <Text className="mt-1 text-[13px] leading-[18px] text-[#475569]">{supplier.emailAddress}</Text> : null}
        {supplier.address ? <Text className="mt-1 text-[13px] leading-[18px] text-[#475569]">{supplier.address}</Text> : null}
      </SurfaceCard>
      <SurfaceCard className="py-0"><DataRow title="Supplier bills" subtitle="View amounts due and paid" onPress={() => router.push('/(app)/suppliers/bills')} /></SurfaceCard>
      {editing ? <SurfaceCard className="gap-3">
        <Input label="Supplier name" value={name} onChangeText={setName} />
        <Input label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Address" value={address} onChangeText={setAddress} />
        <Button title="Save supplier" onPress={save} />
      </SurfaceCard> : null}
    </ScrollView>
  </SafeAreaView>;
}
