import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AuthBackButton from '@/components/AuthBackButton';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';

export default function GoogleBusinessProfileScreen() {
  const router = useRouter();
  const { user, setSession } = useAuthStore();
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');
  const [branchName, setBranchName] = useState('');

  const finish = async () => {
    if (![businessName, category, country, currency, branchName].every((value) => value.trim())) {
      Alert.alert('Complete your business profile', 'All business details are required.');
      return;
    }

    let currentUser = user;
    if (!currentUser) {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { Alert.alert('Sign in required', 'Reconnect your Google account and try again.'); return; }
      currentUser = { id: data.user.id, fullName: data.user.user_metadata?.full_name || 'Ease User', email: data.user.email || '' };
    }
    setSession(currentUser, {
      id: `business_${currentUser.id}`,
      name: businessName.trim(),
      category: category.trim(),
      country: country.trim(),
      currency: currency.trim(),
      branchName: branchName.trim(),
    });
    router.replace('/(app)/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      <ScrollView contentContainerClassName="px-5 pb-6" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AuthBackButton fallback="/(auth)/signup" />
        <Text className="mt-1 text-[28px] font-bold leading-[31px] text-[#0F172A]">Set up your business.</Text>
        <Text className="mt-3 text-[15px] leading-[22px] text-[#475569]">
          Your Google account is connected. Add your business details to finish setting up Ease.
        </Text>
        <View className="mt-4 gap-4">
          <Input label="Business name" placeholder="Ease Retail Limited" value={businessName} onChangeText={setBusinessName} />
          <Input label="Category" placeholder="Retail / Wholesale" value={category} onChangeText={setCategory} />
          <Input label="Country" placeholder="Nigeria" value={country} onChangeText={setCountry} />
          <Input label="Currency" placeholder="NGN - Nigerian Naira" value={currency} onChangeText={setCurrency} />
          <Input label="Branch name" placeholder="Head office" value={branchName} onChangeText={setBranchName} />
        </View>
        <Button title="Finish setup" onPress={finish} className="mt-4 h-14 rounded-[5px]" />
      </ScrollView>
    </SafeAreaView>
  );
}
