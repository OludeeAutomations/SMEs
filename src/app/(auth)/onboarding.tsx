import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChartNoAxesCombined,
  Package,
  Sparkles,
  Store,
  TrendingUp,
} from 'lucide-react-native';

const salesBars = [
  { height: 32, color: '#BFDBFE' },
  { height: 48, color: '#93C5FD' },
  { height: 40, color: '#60A5FA' },
  { height: 64, color: '#2563EB' },
  { height: 52, color: '#34D399' },
  { height: 74, color: '#10B981' },
  { height: 62, color: '#34D399' },
];

const previewMetrics = [
  { label: 'Cash in', value: '₦186K', color: '#2563EB' },
  { label: 'Invoices', value: '12 due', color: '#F59E0B' },
  { label: 'Stock health', value: '94%', color: '#10B981' },
];

const features = [
  { label: 'Sales', icon: Store },
  { label: 'Inventory', icon: Package },
  { label: 'AI insights', icon: Sparkles },
];

export default function EaseOnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      <ScrollView
        contentContainerClassName="gap-6 px-5 pb-6 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center gap-2.5">
          <View className="flex-row items-center gap-2">
            <View className="h-7 w-7 items-center justify-center rounded-[5px] bg-[#2563EB]">
              <ChartNoAxesCombined size={17} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <Text className="text-lg font-bold text-[#0F172A]">Ease</Text>
          </View>

          <Text className="w-full text-center text-[30px] font-bold leading-8 text-[#0F172A]">
            Your business, under control.
          </Text>
          <Text className="w-full text-center text-[15px] leading-[22px] text-[#475569]">
            Track sales, stock, invoices, and cash flow from one clear workspace.
          </Text>
        </View>

        <View
          className="h-[250px] w-full gap-3 rounded-[5px] border border-[#DCE3EE] bg-white p-4"
          style={{
            shadowColor: '#0F172A',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.04,
            shadowRadius: 18,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="gap-[3px]">
              <Text className="text-[10px] font-bold text-[#94A3B8]">TODAY&apos;S SALES</Text>
              <Text className="font-mono text-[26px] font-bold text-[#0F172A]">₦248,600</Text>
            </View>
            <View className="flex-row items-center gap-1 rounded-[5px] bg-[#E8FBF4] px-2 py-1.5">
              <TrendingUp size={14} color="#10B981" strokeWidth={2.4} />
              <Text className="text-[11px] font-bold text-[#10B981]">+12.4%</Text>
            </View>
          </View>

          <View className="h-[82px] w-full flex-row items-end gap-2 pt-1">
            {salesBars.map((bar, index) => (
              <View
                key={`${bar.height}-${index}`}
                className="flex-1 rounded-t-[4px]"
                style={{ height: bar.height, backgroundColor: bar.color }}
              />
            ))}
          </View>

          <View className="w-full flex-row gap-2.5">
            {previewMetrics.map((metric) => (
              <View key={metric.label} className="flex-1 gap-[3px] rounded-[5px] bg-[#F2F5FA] p-2.5">
                <Text className="text-[10px] text-[#94A3B8]">{metric.label}</Text>
                <Text className="text-sm font-bold" style={{ color: metric.color }}>
                  {metric.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="w-full flex-row justify-between">
          {features.map(({ label, icon: Icon }) => (
            <View key={label} className="w-24 items-center gap-1.5">
              <Icon size={22} color="#2563EB" strokeWidth={2} />
              <Text className="text-xs font-semibold text-[#475569]">{label}</Text>
            </View>
          ))}
        </View>

        <View className="w-full items-center gap-3">
          <Pressable
            onPress={() => router.push('/(auth)/signup')}
            className="h-14 w-full items-center justify-center rounded-[5px] bg-[#0B1F5E] active:bg-[#071845]"
            style={{
              shadowColor: '#0B1F5E',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.14,
              shadowRadius: 20,
              elevation: 4,
            }}
          >
            <Text className="text-base font-bold text-white">Create account</Text>
          </Pressable>

          <View className="flex-row items-center gap-1">
            <Text className="text-[13px] text-[#475569]">Already have an account?</Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text className="text-[13px] font-bold text-[#2563EB]">Sign in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
