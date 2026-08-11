import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BarChart, colors, ListRow, SurfaceCard } from '@/components/dashboard-ui';

export default function EaseSalesDashboardScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-[#0F172A]">Sales</Text>
        <Text className="-mt-2 text-[13px] text-[#475569]">Track transactions, payments, and today’s performance.</Text>
        <SurfaceCard className="gap-2">
          <Text className="text-[11px] text-[#475569]">Today</Text><Text className="font-mono text-lg font-bold text-[#2563EB]">₦286k</Text>
          <Text className="text-[11px] text-[#475569]">Orders</Text><Text className="font-mono text-lg font-bold text-[#10B981]">84</Text>
          <BarChart heights={[22, 14, 31, 25, 48, 31, 42]} compact />
        </SurfaceCard>
        <View className="flex-row gap-2">
          {['All', 'Cash', 'Transfer'].map((item) => <Pressable key={item} onPress={() => setFilter(item)} className={`rounded-full px-4 py-2 ${filter === item ? 'bg-[#2563EB]' : 'border border-[#DCE3EE] bg-white'}`}><Text className={`text-xs font-semibold ${filter === item ? 'text-white' : 'text-[#0F172A]'}`}>{item}</Text></Pressable>)}
        </View>
        <SurfaceCard className="py-0">
          <ListRow title="POS-2041" subtitle="Laptop bag and charger" value="₦82k" onPress={() => router.push('/(app)/sales/demo-sale')} />
          <View className="h-px bg-[#DCE3EE]" /><ListRow title="POS-2040" subtitle="Wholesale rice order" value="₦140k" onPress={() => router.push('/(app)/sales/demo-sale')} tint="#E8FBF4" />
          <View className="h-px bg-[#DCE3EE]" /><ListRow title="POS-2039" subtitle="Card payment confirmed" value="₦64k" onPress={() => router.push('/(app)/sales/demo-sale')} />
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
}
