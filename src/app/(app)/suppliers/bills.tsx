import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, RotateCcw, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ChoiceChips, DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { formatDate, formatMoney, parseAmount, todayKey } from '@/utils/format';

export default function SupplierBillsScreen() {
  const workspace = useWorkspace();
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const addBill = useBusinessStore((state) => state.addSupplierBill);
  const updateStatus = useBusinessStore((state) => state.updateSupplierBillStatus);
  const deleteBill = useBusinessStore((state) => state.deleteSupplierBill);
  const [supplierId, setSupplierId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(todayKey());
  const outstanding = workspace.supplierBills.filter((bill) => bill.status === 'UNPAID').reduce((sum, bill) => sum + bill.amount, 0);

  const save = () => {
    const supplier = workspace.suppliers.find((item) => item.id === supplierId);
    if (!supplier) return Alert.alert('Select a supplier');
    if (!description.trim() || parseAmount(amount) <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return Alert.alert('Check bill', 'Add a description, positive amount, and date in YYYY-MM-DD format.');
    addBill({ supplierId, supplierName: supplier.name, description: description.trim(), amount: parseAmount(amount), dueDate });
    setDescription(''); setAmount(''); setDueDate(todayKey());
  };
  const remove = (id: string) => Alert.alert('Delete bill?', 'The supplier balance will also be corrected.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteBill(id) }]);

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-40 pt-5" keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Supplier bills" subtitle="Track what you owe and what has been paid." showBack />
      <View className="flex-row gap-3"><MetricCard label="Outstanding" value={formatMoney(outstanding, currency)} color={colors.amber} /><MetricCard label="Bills" value={String(workspace.supplierBills.length)} color={colors.blue} /></View>
      {workspace.suppliers.length ? <SurfaceCard className="gap-3">
        <ChoiceChips options={workspace.suppliers.map((supplier) => supplier.name)} value={workspace.suppliers.find((supplier) => supplier.id === supplierId)?.name ?? ''} onChange={(name) => setSupplierId(workspace.suppliers.find((supplier) => supplier.name === name)?.id ?? '')} />
        <Input label="Description" placeholder="Stock purchase" value={description} onChangeText={setDescription} />
        <Input label="Amount" placeholder="0" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <Input label="Due date" placeholder="YYYY-MM-DD" value={dueDate} onChangeText={setDueDate} />
        <Button title="Add bill" onPress={save} />
      </SurfaceCard> : <EmptyState title="Add a supplier first" message="A bill must be attached to a supplier." />}
      {workspace.supplierBills.length ? <SurfaceCard className="py-0">
        {workspace.supplierBills.map((bill, index) => <React.Fragment key={bill.id}>
          <DataRow title={bill.description} subtitle={`${bill.supplierName} · ${bill.status} · due ${formatDate(bill.dueDate)}`} value={formatMoney(bill.amount, currency)} actions={[{ label: bill.status === 'PAID' ? 'Mark unpaid' : 'Mark paid', icon: bill.status === 'PAID' ? RotateCcw : CheckCircle2, onPress: () => updateStatus(bill.id, bill.status === 'PAID' ? 'UNPAID' : 'PAID') }, { label: 'Delete bill', icon: Trash2, onPress: () => remove(bill.id), destructive: true }]} />
          {index < workspace.supplierBills.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : null}
    </ScrollView>
  </SafeAreaView>;
}
