import React, { useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ScreenHeader } from '@/components/business-ui';
import { SurfaceCard } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';

export default function DocumentTemplateSettings({ kind }: { kind: 'receipt' | 'invoice' }) {
  const business = useAuthStore((state) => state.business);
  const workspace = useWorkspace();
  const setPreference = useBusinessStore((state) => state.setPreference);
  const prefixKey = `${kind}Prefix`;
  const noteKey = `${kind}Footer`;
  const [prefix, setPrefix] = useState(String(workspace.preferences[prefixKey] ?? (kind === 'receipt' ? 'RCT' : 'INV')));
  const [footer, setFooter] = useState(String(workspace.preferences[noteKey] ?? (kind === 'receipt' ? 'Thank you for your business.' : 'Payment is due by the date shown above.')));
  const label = kind === 'receipt' ? 'Receipt' : 'Invoice';

  const save = () => {
    const cleanPrefix = prefix.trim().replace(/[^a-z0-9-]/gi, '').toUpperCase();
    if (!cleanPrefix) return Alert.alert('Check prefix', 'Enter at least one letter or number.');
    setPreference(prefixKey, cleanPrefix.slice(0, 8));
    setPreference(noteKey, footer.trim());
    Alert.alert('Saved', `${label} settings were updated.`);
  };

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-40 pt-5" keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
      <ScreenHeader title={`${label} settings`} subtitle={`Customize the details shown on every ${kind}.`} showBack />
      <SurfaceCard className="gap-3">
        <Input label="Document prefix" placeholder={kind === 'receipt' ? 'RCT' : 'INV'} value={prefix} onChangeText={setPrefix} autoCapitalize="characters" />
        <Input label="Footer message" placeholder="Message shown at the bottom" value={footer} onChangeText={setFooter} multiline />
        <Button title="Save settings" onPress={save} />
      </SurfaceCard>
      <SurfaceCard className="gap-2">
        <Text className="text-xs font-bold text-[#475569]">PREVIEW</Text>
        <Text className="text-lg font-bold text-[#0F172A]">{business?.name || 'Your business'}</Text>
        <Text className="text-xs text-[#475569]">{prefix.trim().toUpperCase() || 'DOC'}-000001</Text>
        <Text className="mt-4 text-xs leading-5 text-[#475569]">{footer.trim() || 'No footer message'}</Text>
      </SurfaceCard>
    </ScrollView>
  </SafeAreaView>;
}
