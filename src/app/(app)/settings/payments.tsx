import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { ChoiceChips, ScreenHeader } from '@/components/business-ui';
import { SurfaceCard } from '@/components/dashboard-ui';
import { checkPaymentProvider, type PaymentProvider } from '@/services/onlinePayments';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';

export default function PaymentsScreen() {
  const workspace = useWorkspace();
  const setPreference = useBusinessStore((state) => state.setPreference);
  const [provider, setProvider] = useState<PaymentProvider>((workspace.preferences?.paymentProvider as PaymentProvider) || 'Paystack');
  const [checking, setChecking] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  const saveAndCheck = async () => {
    setPreference('paymentProvider', provider);
    setChecking(true);
    try {
      const isConnected = await checkPaymentProvider(provider);
      setConnected(isConnected);
      Alert.alert(
        isConnected ? `${provider} connected` : `${provider} needs server setup`,
        isConnected
          ? 'You can now create secure payment links from unpaid invoices.'
          : `Add the ${provider.toUpperCase()}_SECRET_KEY to your Supabase Edge Function secrets, then deploy the payment functions.`,
      );
    } catch (error) {
      setConnected(false);
      Alert.alert('Payment service unavailable', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Customer payments" subtitle="Let customers pay a specific invoice through a secure checkout link." showBack />

      <SurfaceCard className="gap-3 border-[#BFDBFE] bg-[#EFF6FF]">
        <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#0B1F5E]"><CreditCard size={20} color="#BFDBFE" /></View>
        <Text className="text-base font-bold text-[#0F172A]">What customers pay for</Text>
        <Text className="text-[13px] leading-5 text-[#475569]">Each link is tied to one unpaid invoice and uses that invoice’s customer, amount, currency, and reference number.</Text>
      </SurfaceCard>

      <View className="gap-2">
        <Text className="text-xs font-bold text-[#475569]">PAYMENT PROVIDER</Text>
        <ChoiceChips options={['Paystack', 'Flutterwave']} value={provider} onChange={(value) => { setProvider(value as PaymentProvider); setConnected(null); }} />
      </View>

      <SurfaceCard className="gap-3">
        <View className="flex-row items-center gap-3">
          <ShieldCheck size={21} color="#10B981" />
          <View className="flex-1"><Text className="text-sm font-bold text-[#0F172A]">Secure server connection</Text><Text className="mt-1 text-[11px] leading-4 text-[#475569]">Secret keys stay in Supabase Edge Function secrets and are never stored on the phone.</Text></View>
        </View>
        {connected !== null ? <View className={`flex-row items-center gap-2 rounded-[5px] p-3 ${connected ? 'bg-[#ECFDF5]' : 'bg-[#FFF7ED]'}`}>
          {connected ? <CheckCircle2 size={17} color="#059669" /> : <View className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />}
          <Text className={`text-xs font-semibold ${connected ? 'text-[#047857]' : 'text-[#92400E]'}`}>{connected ? `${provider} is ready` : 'Server key or function is not configured yet'}</Text>
        </View> : null}
      </SurfaceCard>

      <Button title={checking ? 'Checking connection...' : 'Save and check connection'} onPress={saveAndCheck} isLoading={checking} />
      <Text className="text-center text-[10px] leading-4 text-[#64748B]">After connection, open an unpaid invoice and tap “Create payment link”.</Text>
    </ScrollView>
  </SafeAreaView>;
}
