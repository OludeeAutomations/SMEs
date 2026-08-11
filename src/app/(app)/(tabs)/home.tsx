import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, Bot, FileText, Package, ReceiptText, ShoppingCart, Sparkles, Users, WalletCards } from 'lucide-react-native';
import { BarChart, colors, GradientCard, ListRow, MetricCard, QuickAction, SurfaceCard } from '@/components/dashboard-ui';

export default function EaseHomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5 rounded-[18px] border border-[#DCE3EE] bg-white px-3.5 py-2.5">
            <View className="h-8 w-8 items-center justify-center rounded-xl bg-[#E8FBF4]"><Text className="text-[13px] font-bold text-[#10B981]">ER</Text></View>
            <View><Text className="text-xs font-bold text-[#0F172A]">Ease Retail</Text><Text className="text-[10px] text-[#475569]">Lagos HQ • Active</Text></View>
          </View>
          <Pressable onPress={() => router.push('/(app)/settings/notifications')}><Bell size={24} color={colors.text} /></Pressable>
        </View>

        <SurfaceCard className="min-h-44 gap-2">
          <Text className="text-[11px] font-bold text-[#2563EB]">BUSINESS OVERVIEW</Text>
          <Text className="text-2xl font-bold text-[#0F172A]">₦4.2M</Text>
          <Text className="text-[13px] text-[#475569]">Monthly revenue across all branches</Text>
          <BarChart heights={[18, 36, 24, 44, 30, 50, 38, 46]} compact />
        </SurfaceCard>

        <View className="flex-row gap-3"><MetricCard label="Today" value="₦286k" color={colors.blue} /><MetricCard label="Profit" value="₦1.08M" color={colors.green} /></View>
        <View className="flex-row gap-3"><MetricCard label="Due" value="₦820k" color={colors.amber} className="min-h-[110px]" /><MetricCard label="Stock" value="₦3.6M" className="min-h-[110px]" /></View>

        <GradientCard className="gap-2.5">
          <Text className="text-[11px] font-bold text-white">AI BUSINESS HEALTH</Text><Text className="font-mono text-[22px] font-bold text-white">94</Text>
          <Text className="w-full text-[13px] leading-5 text-white">Cash flow is stable. You can stock up on rice and beverages before the weekend spike.</Text>
          <View className="w-full flex-row items-center gap-2 rounded-2xl bg-white/15 px-3 py-2.5"><Sparkles size={18} color="white" /><Text className="flex-1 text-xs font-semibold leading-[18px] text-white">Reorder 18 fast-moving items today.</Text></View>
        </GradientCard>

        <Text className="text-xs font-bold text-[#475569]">QUICK ACTIONS</Text>
        <View className="flex-row flex-wrap justify-between gap-y-2.5">
          <QuickAction label="New Sale" icon={ShoppingCart} onPress={() => router.push('/(app)/sales/record')} />
          <QuickAction label="Invoice" icon={FileText} onPress={() => router.push('/(app)/invoices/create')} />
          <QuickAction label="Add Stock" icon={Package} onPress={() => router.push('/(app)/inventory/add')} />
          <QuickAction label="Customers" icon={Users} onPress={() => router.push('/(app)/customers')} />
          <QuickAction label="Expense" icon={WalletCards} onPress={() => router.push('/(app)/expenses/add')} />
          <QuickAction label="Ask AI" icon={Bot} onPress={() => router.push('/(app)/(tabs)/ai')} />
        </View>

        <Text className="text-xs font-bold text-[#475569]">RECENT ACTIVITY</Text>
        <SurfaceCard className="py-0">
          <ListRow title="Sale recorded" subtitle="Market stall - Ikeja" value="₦48k" icon={ReceiptText} tint="#E8FBF4" />
          <View className="h-px bg-[#DCE3EE]" /><ListRow title="Invoice paid" subtitle="Blue Nile Foods" value="₦120k" icon={FileText} />
          <View className="h-px bg-[#DCE3EE]" /><ListRow title="Low stock alert" subtitle="Tomatoes and cooking oil" value="18 left" icon={Package} tint="#FFF7ED" />
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
}
