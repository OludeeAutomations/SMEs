import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AuthBackButton from '@/components/AuthBackButton';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useAuthStore } from '@/store/authStore';

export default function EaseBusinessProfileScreen() {
  const router = useRouter();
  const { user, setSession } = useAuthStore();
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');
  const [branchName, setBranchName] = useState('');
  const finish = () => {
    if (![businessName, category, country, currency, branchName].every((value) => value.trim())) {
      Alert.alert('Complete your business profile', 'All business details are required.'); return;
    }
    setSession(user ?? { id: 'new-user', fullName: 'Ease User', email: '' }, { id: 'primary-business', name: businessName.trim(), category: category.trim(), country: country.trim(), currency: currency.trim(), branchName: branchName.trim() });
    router.replace('/(app)/(tabs)/home');
  };
  return <SafeAreaView className="flex-1 bg-[#FAFAFA]"><ScrollView contentContainerClassName="px-5 pb-6" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <AuthBackButton fallback="/(auth)/signup" />
    <Text className="mt-1 text-[28px] font-bold leading-[31px] text-[#0F172A]">Create your business profile.</Text>
    <Text className="mt-3 text-[15px] leading-[22px] text-[#475569]">Tell Ease about your company so reports, invoices, and reminders are set up correctly.</Text>
    <View className="mt-4 gap-4"><Input label="Business name" placeholder="Ease Retail Limited" value={businessName} onChangeText={setBusinessName}/><Input label="Category" placeholder="Retail / Wholesale" value={category} onChangeText={setCategory}/><Input label="Country" placeholder="Nigeria" value={country} onChangeText={setCountry}/><Input label="Currency" placeholder="NGN - Nigerian Naira" value={currency} onChangeText={setCurrency}/><Input label="Branch name" placeholder="Head office" value={branchName} onChangeText={setBranchName}/></View>
    <Button title="Finish setup" onPress={finish} className="mt-4 h-14 rounded-[18px]" />
  </ScrollView></SafeAreaView>;
}
