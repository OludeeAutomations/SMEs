import React, { useState } from 'react';
import { Alert, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { shareInvoicePdf } from '@/services/invoicePdf';
import { createInvoicePaymentLink, verifyInvoicePayment, type PaymentProvider } from '@/services/onlinePayments';
import { formatDate, formatMoney } from '@/utils/format';

export default function InvoiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workspace = useWorkspace();
  const invoice = workspace.invoices.find((item) => item.id === id);
  const updateStatus = useBusinessStore((state) => state.updateInvoiceStatus);
  const business = useAuthStore((state) => state.business);
  const user = useAuthStore((state) => state.user);
  const currency = business?.currency ?? 'NGN';
  const [isSharing, setIsSharing] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

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

  const share = async () => {
    if (!business) {
      Alert.alert('Business profile needed', 'Complete your business profile before sharing an invoice.');
      return;
    }
    setIsSharing(true);
    try {
      await shareInvoicePdf({ invoice, business, user, customer });
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
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5">
      <ScreenHeader title={`Invoice ${invoice.id.slice(-6).toUpperCase()}`} subtitle={`${invoice.customerName} - due ${formatDate(invoice.dueDate)}`} showBack />
      <MetricCard label="Total" value={formatMoney(invoice.total, currency)} color={colors.blue} />
      <MetricCard label="Status" value={invoice.status} color={invoice.status === 'PAID' ? colors.green : colors.amber} />
      <SurfaceCard className="py-0">
        {invoice.items.map((item, index) => <React.Fragment key={`${item.productId}-${index}`}>
          <DataRow title={item.productName} subtitle={`${item.quantity} x ${formatMoney(item.price, currency)}`} value={formatMoney(item.price * item.quantity, currency)} />
          {index < invoice.items.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard>
      {invoice.status !== 'PAID' ? <>
        <Button title={isCreatingPayment ? 'Creating secure link...' : 'Create payment link'} onPress={createPaymentLink} isLoading={isCreatingPayment} />
        <Button title={isCheckingPayment ? 'Checking payment...' : 'Check online payment'} variant="secondary" onPress={checkPayment} isLoading={isCheckingPayment} />
        <Button title="Record cash or transfer payment" variant="secondary" onPress={recordPayment} />
      </> : null}
      <Button title={isSharing ? 'Preparing PDF...' : 'Share invoice PDF'} variant="secondary" onPress={share} isLoading={isSharing} />
    </ScrollView>
  </SafeAreaView>;
}
