import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import Button from './Button';
import Input from './Input';
import { colors, MetricCard, SurfaceCard } from './dashboard-ui';

export interface FeatureMetric { label: string; value: string; color?: string }
export interface FeatureRow { title: string; subtitle?: string; value?: string; route?: string; tint?: string }
export interface FeatureField { label: string; placeholder: string; keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'; secure?: boolean }
export interface FeatureConfig {
  title: string;
  subtitle?: string;
  metrics?: FeatureMetric[];
  banner?: { label: string; text: string; tone?: 'blue' | 'amber' | 'green' };
  rows?: FeatureRow[];
  fields?: FeatureField[];
  primaryAction?: string;
  primaryRoute?: string;
  secondaryAction?: string;
  secondaryRoute?: string;
}

export default function FeaturePage({ config }: { config: FeatureConfig }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const submit = () => {
    if (config.fields?.some((field) => !values[field.label]?.trim())) {
      Alert.alert('Complete the form', 'Please fill in all required details.'); return;
    }
    if (config.primaryRoute) router.push(config.primaryRoute as never);
    else Alert.alert('Saved', `${config.title} has been updated.`);
  };
  const bannerTone = config.banner?.tone === 'amber' ? ['#FFF7ED', '#FED7AA', '#B45309'] : config.banner?.tone === 'green' ? ['#ECFDF5', '#A7F3D0', '#047857'] : ['#EFF6FF', '#BFDBFE', '#2563EB'];
  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View><Text className="text-2xl font-bold text-[#0F172A]">{config.title}</Text>{config.subtitle ? <Text className="mt-1 text-[13px] leading-[18px] text-[#475569]">{config.subtitle}</Text> : null}</View>
        {config.metrics?.length ? <View className="flex-row flex-wrap gap-3">{config.metrics.map((metric) => <MetricCard key={metric.label} label={metric.label} value={metric.value} color={metric.color} className="min-w-[46%]" />)}</View> : null}
        {config.banner ? <View className="rounded-3xl border p-4" style={{ backgroundColor: bannerTone[0], borderColor: bannerTone[1] }}><Text className="text-[10px] font-bold" style={{ color: bannerTone[2] }}>{config.banner.label}</Text><Text className="mt-2 text-[13px] leading-[18px] text-[#0F172A]">{config.banner.text}</Text></View> : null}
        {config.fields?.length ? <View className="gap-4">{config.fields.map((field) => <Input key={field.label} label={field.label} placeholder={field.placeholder} value={values[field.label] ?? ''} onChangeText={(value) => setValues((current) => ({ ...current, [field.label]: value }))} keyboardType={field.keyboardType} isPassword={field.secure} />)}</View> : null}
        {config.rows?.length ? <SurfaceCard className="py-1">{config.rows.map((row, index) => <React.Fragment key={`${row.title}-${index}`}><Pressable disabled={!row.route} onPress={() => row.route && router.push(row.route as never)} className="flex-row items-center justify-between py-3"><View className="flex-row items-center gap-3"><View className="h-9 w-9 rounded-[14px]" style={{ backgroundColor: row.tint ?? '#EAF2FF' }} /><View className="max-w-[220px]"><Text className="text-[13px] font-semibold text-[#0F172A]">{row.title}</Text>{row.subtitle ? <Text className="mt-0.5 text-[11px] leading-[15px] text-[#475569]">{row.subtitle}</Text> : null}</View></View><View className="flex-row items-center gap-2">{row.value ? <Text className="font-mono text-xs font-bold text-[#0F172A]">{row.value}</Text> : null}{row.route ? <ChevronRight size={17} color={colors.muted} /> : null}</View></Pressable>{index < (config.rows?.length ?? 0) - 1 ? <View className="h-px bg-[#DCE3EE]" /> : null}</React.Fragment>)}</SurfaceCard> : null}
        {config.primaryAction ? <Button title={config.primaryAction} onPress={submit} className="h-14 rounded-[18px]" /> : null}
        {config.secondaryAction ? <Button title={config.secondaryAction} variant="secondary" onPress={() => config.secondaryRoute && router.push(config.secondaryRoute as never)} className="h-14 rounded-[18px]" /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
