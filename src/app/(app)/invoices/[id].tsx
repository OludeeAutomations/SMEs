import React, { useState } from 'react';
import { Alert, ScrollView, Share, View } from 'react-native';
import { Pencil, Trash2, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import DatePickerField from '@/components/DatePickerField';
import { Input } from '@/components/Input';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { shareInvoicePdf } from '@/services/invoicePdf';
import { createInvoicePaymentLink, verifyInvoicePayment, type PaymentProvider } from '@/services/onlinePayments';
import { formatDate, formatMoney } from '@/utils/format';
import { effectiveInvoiceStatus } from '@/utils/businessMetrics';
import { displayReference } from '@/utils/references';

export default function InvoiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const workspace = useWorkspace();
  const invoice = workspace.invoices.find((item) => item.id === id);
  const updateStatus = useBusinessStore((state) => state.updateInvoiceStatus);
  const updateInvoice = useBusinessStore((state) => state.updateInvoice);
  const deleteInvoice = useBusinessStore((state) => state.deleteInvoice);
  const business = useAuthStore((state) => state.business);
  const user = useAuthStore((state) => state.user);
  const currency = business?.currency ?? 'NGN';
  const [isSharing, setIsSharing] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [dueDate, setDueDate] = useState(invoice?.dueDate ?? '');
  const [terms, setTerms] = useState(invoice?.terms ?? '');
  const [editing, setEditing] = useState(false);

  if (!invoice) {
    return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-5 pt-5">
        <ScreenHeader title="Invoice" showBack />
        <EmptyState title="Invoice not found" message="This invoice may no longer exist." />
      </ScrollView>
    </SafeAreaView>;
  }

  const customer = workspace.customers.find((item) => item.id === invoice.customerId);
  const provider = (workspace.preferences?.paymentProvider as PaymentProvider | undefined) ?? 'Paystack';
  const displayedStatus = effectiveInvoiceStatus(invoice);
  const invoiceReference = displayReference('INV', invoice);

  const share = async () => {
    if (!business) {
      Alert.alert('Business profile needed', 'Complete your business profile before sharing an invoice.');
      return;
    }
    setIsSharing(true);
    try {
      await shareInvoicePdf({ invoice, business, user, customer, preferences: workspace.preferences });
    } catch (error) {
      Alert.alert("Couldn't share invoice", error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const recordPayment = () => Alert.alert('Record payment', `Mark ${formatMoney(invoice.total, currency)} as paid?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Mark paid', onPress: () => updateStatus(invoice.id, 'PAID') },
  ]);
  const saveDetails = () => {
    updateInvoice(invoice.id, { dueDate, terms: terms.trim() || undefined });
    setEditing(false);
    Alert.alert('Invoice updated');
  };
  const remove = () => Alert.alert('Delete invoice?', 'The customer balance will be corrected.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { deleteInvoice(invoice.id); router.replace('/(app)/invoices'); } }]);

  const createPaymentLink = async () => {
    if (!customer?.emailAddress) {
      Alert.alert('Customer email needed', 'Add an email address to this customer before creating a payment link.');
      return;
    }
    setIsCreatingPayment(true);
    try {
      const { checkoutUrl } = await createInvoicePaymentLink(invoice.id, provider);
      await Share.share({
        title: `Pay invoice ${invoice.id.slice(-6).toUpperCase()}`,
        message: `Hello ${customer.fullName}, please pay ${formatMoney(invoice.total, currency)} for invoice ${invoice.id.slice(-6).toUpperCase()} using this secure link:\n${checkoutUrl}`,
        url: checkoutUrl,
      });
    } catch (error) {
      Alert.alert("Couldn't create payment link", error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const checkPayment = async () => {
    setIsCheckingPayment(true);
    try {
      const paid = await verifyInvoicePayment(invoice.id);
      if (paid) {
        updateStatus(invoice.id, 'PAID');
        Alert.alert('Payment confirmed', 'This invoice is now marked as paid.');
      } else {
        Alert.alert('Payment not confirmed', 'The provider has not confirmed payment for this invoice yet.');
      }
    } catch (error) {
      Alert.alert("Couldn't check payment", error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-40 pt-5" keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
      <ScreenHeader title={invoiceReference} subtitle={`${invoice.customerName} - due ${formatDate(invoice.dueDate)}`} showBack actions={[{ label: editing ? 'Cancel editing' : 'Edit invoice', icon: editing ? X : Pencil, onPress: () => setEditing((value) => !value) }, { label: 'Delete invoice', icon: Trash2, onPress: remove, destructive: true }]} />
      <MetricCard label="Total" value={formatMoney(invoice.total, currency)} color={colors.blue} />
      <MetricCard label="Status" value={displayedStatus} color={displayedStatus === 'PAID' ? colors.green : colors.amber} />
      <SurfaceCard className="py-0">
        <DataRow title="Invoice reference" value={invoiceReference} />
        <Divider />
        <DataRow title="Customer" value={invoice.customerName} />
        <Divider />
        <DataRow title="Issued" value={new Date(invoice.createdAt).toLocaleString('en-NG')} />
        <Divider />
        <DataRow title="Due date" value={formatDate(invoice.dueDate)} />
      </SurfaceCard>
      <SurfaceCard className="py-0">
        {invoice.items.map((item, index) => <React.Fragment key={`${item.productId}-${index}`}>
          <DataRow title={item.productName} subtitle={`${item.quantity} x ${formatMoney(item.price, currency)}`} value={formatMoney(item.price * item.quantity, currency)} />
          {index < invoice.items.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard>
      {editing ? <SurfaceCard className="gap-3">
        <DatePickerField label="Due date" value={dueDate} onChange={setDueDate} minimumDate={new Date()} />
        <Input label="Terms" value={terms} onChangeText={setTerms} multiline />
        <Button title="Save invoice details" variant="secondary" onPress={saveDetails} />
      </SurfaceCard> : null}
      {invoice.status !== 'PAID' ? <>
        <View className="flex-row gap-3">
          <Button title={isCreatingPayment ? 'Creating...' : 'Payment link'} onPress={createPaymentLink} isLoading={isCreatingPayment} className="flex-1" />
          <Button title={isCheckingPayment ? 'Checking...' : 'Check payment'} variant="secondary" onPress={checkPayment} isLoading={isCheckingPayment} className="flex-1" />
        </View>
        <Button title="Record cash or transfer payment" variant="secondary" onPress={recordPayment} />
      </> : null}
      <Button title={isSharing ? 'Preparing PDF...' : 'Share invoice PDF'} variant="secondary" onPress={share} isLoading={isSharing} />
    </ScrollView>
  </SafeAreaView>;
}
