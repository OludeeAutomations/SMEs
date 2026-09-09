import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Building2, Check, CreditCard, Landmark, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ScreenHeader } from '@/components/business-ui';
import { SurfaceCard } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';

const customerSteps = [
  'Customer opens the secure link attached to an invoice.',
  'Customer pays by card, bank transfer, or another Paystack option.',
  'Rekoda confirms the payment and marks the invoice as paid.',
];

export default function PaymentsScreen() {
  const business = useAuthStore((state) => state.business);
  const user = useAuthStore((state) => state.user);
  const [businessName, setBusinessName] = useState(business?.name ?? '');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-32 pt-5" keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Customer payments" subtitle="Prepare how your business will receive invoice payments." showBack />

      <SurfaceCard className="gap-3 border-[#BFDBFE] bg-[#EFF6FF]">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#0B1F5E]"><CreditCard size={20} color="#BFDBFE" /></View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-[#0F172A]">Secure payments with Paystack</Text>
            <Text className="mt-1 text-[12px] leading-[18px] text-[#475569]">Connect a verified payout account to receive payments from customer invoices.</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard className="gap-4">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#EAF2FF]"><Landmark size={20} color="#2563EB" /></View>
          <View className="flex-1">
            <Text className="text-base font-bold text-[#0F172A]">Business payout account</Text>
            <Text className="mt-1 text-[12px] leading-[18px] text-[#475569]">This is the bank account where Paystack will settle customer payments.</Text>
          </View>
        </View>

        <Input label="Registered business name" value={businessName} onChangeText={setBusinessName} placeholder="Business name" />
        <Input label="Business email" value={user?.email ?? ''} editable={false} />
        <Input label="Settlement bank" value={bankName} onChangeText={setBankName} placeholder="Select your bank" />
        <Input
          label="Account number"
          value={accountNumber}
          onChangeText={(value) => setAccountNumber(value.replace(/\D/g, '').slice(0, 10))}
          placeholder="10-digit account number"
          keyboardType="number-pad"
          maxLength={10}
        />
        <Input label="Verified account name" value="Shown after Paystack verification" editable={false} />

        <View className="rounded-[8px] bg-[#F8FAFC] p-3">
          <Text className="text-[12px] leading-[18px] text-[#64748B]">Bank details are verified securely through Paystack. Rekoda does not store banking passwords or customer card information.</Text>
        </View>
        <Button title="Verify and connect payout account" disabled />
      </SurfaceCard>

      <SurfaceCard className="gap-3">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#E8FBF4]"><Building2 size={20} color="#047857" /></View>
          <View className="flex-1">
            <Text className="text-base font-bold text-[#0F172A]">How settlement will work</Text>
            <Text className="mt-1 text-[12px] leading-[18px] text-[#475569]">Each business will receive payments through its own verified Paystack subaccount.</Text>
          </View>
        </View>
        <View className="gap-2">
          {['Paystack verifies the business bank account.', 'Invoice payments are assigned to that business.', 'Paystack settles funds into the verified bank account.'].map((item) => <View key={item} className="flex-row items-start gap-2">
            <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-[#D1FAE5]"><Check size={12} color="#047857" /></View>
            <Text className="flex-1 text-[12px] leading-5 text-[#475569]">{item}</Text>
          </View>)}
        </View>
      </SurfaceCard>

      <SurfaceCard className="gap-3 border-[#BFDBFE] bg-[#EFF6FF]">
        <View className="flex-row items-center gap-3">
          <CreditCard size={21} color="#2563EB" />
          <Text className="flex-1 text-base font-bold text-[#0F172A]">What the customer will see</Text>
        </View>
        {customerSteps.map((step, index) => <View key={step} className="flex-row items-start gap-3">
          <View className="h-6 w-6 items-center justify-center rounded-full bg-[#0B1F5E]"><Text className="text-[11px] font-bold text-white">{index + 1}</Text></View>
          <Text className="flex-1 text-[12px] leading-5 text-[#475569]">{step}</Text>
        </View>)}
        <View className="mt-1 flex-row items-center gap-2 border-t border-[#BFDBFE] pt-3">
          <ShieldCheck size={17} color="#047857" />
          <Text className="flex-1 text-[11px] leading-4 text-[#475569]">Customers do not need a Rekoda account, and Rekoda will never store their card details.</Text>
        </View>
      </SurfaceCard>
    </ScrollView>
  </SafeAreaView>;
}
