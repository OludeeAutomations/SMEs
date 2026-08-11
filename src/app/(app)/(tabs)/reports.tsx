import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, colors, MetricCard, SurfaceCard } from '@/components/dashboard-ui';

export default function EaseReportsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-[#0F172A]">Reports</Text>
        <View className="flex-row gap-3"><MetricCard label="Revenue" value="₦4.2M" color={colors.blue} /><MetricCard label="Profit" value="₦1.08M" color={colors.green} /></View>
        <SurfaceCard className="gap-5">
          <Text className="text-xs font-bold text-[#475569]">MONTHLY PERFORMANCE</Text>
          <BarChart heights={[38, 72, 46, 88, 60, 110]} />
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
}
