import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import Input from '@/components/Input';
import BusinessLogoPicker from '@/components/BusinessLogoPicker';
import { ScreenHeader } from '@/components/business-ui';
import { useAuthStore } from '@/store/authStore';

export default function BusinessConfig() {
  const user = useAuthStore((state) => state.user);
  const business = useAuthStore((state) => state.business);
  const updateBusiness = useAuthStore((state) => state.updateBusiness);
  const [name, setName] = useState(business?.name ?? '');
  const [category, setCategory] = useState(business?.category ?? '');
  const [country, setCountry] = useState(business?.country ?? '');
  const [currency, setCurrency] = useState(business?.currency ?? 'NGN');
  const [branch, setBranch] = useState(business?.branchName ?? '');
  const [logoUrl, setLogoUrl] = useState(business?.logoUrl ?? '');

  const save = () => {
    if (![name, category, country, currency, branch].every((value) => value.trim())) {
      Alert.alert('Complete all fields', 'Business name, category, country, currency, and branch are required.');
      return;
    }
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in again before saving your business profile.');
      return;
    }
    updateBusiness({
      id: business?.id ?? `business_${user.id}`,
      name: name.trim(), category: category.trim(), country: country.trim(),
      currency: currency.trim(), branchName: branch.trim(), logoUrl: logoUrl || undefined,
    });
    Alert.alert('Saved', 'Your business profile has been updated.');
  };

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Business profile" />
      <BusinessLogoPicker value={logoUrl} onChange={setLogoUrl} />
      <Input label="Business name" value={name} onChangeText={setName} />
      <Input label="Category" value={category} onChangeText={setCategory} />
      <Input label="Country" value={country} onChangeText={setCountry} />
      <Input label="Currency code" value={currency} onChangeText={setCurrency} />
      <Input label="Primary branch" value={branch} onChangeText={setBranch} />
      <Button title="Save changes" onPress={save} />
    </ScrollView>
  </SafeAreaView>;
}
