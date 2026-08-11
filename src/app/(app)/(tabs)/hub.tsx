import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BarChart3, Bell, Bot, ChevronRight, FileText, Package, ReceiptText, Search, Settings, Sparkles, Truck, Users } from 'lucide-react-native';
import { colors, GradientCard, MoreTile, SurfaceCard } from '@/components/dashboard-ui';

const primary = [
  ['Sales', 'History, details, receipts', ReceiptText, colors.blue, '#EAF2FF', '/(app)/sales/history'],
  ['Customers', 'Profiles, balances, history', Users, colors.green, '#E8FBF4', '/(app)/customers'],
  ['Inventory', 'Products, movement, alerts', Package, colors.amber, '#FFF7ED', '/(app)/inventory'],
  ['Invoices', 'Create, send, share, track', FileText, colors.blue, '#EEF2FF', '/(app)/invoices'],
] as const;
const platform = [
  ['Reports', 'Revenue, profit, cash flow', BarChart3, colors.green, '#E8FBF4', '/(app)/(tabs)/reports'],
  ['AI Assistant', 'Ask questions, get predictions', Bot, colors.purple, '#F0EBFF', '/(app)/(tabs)/ai'],
  ['Automation', 'Reminders, workflows, reports', Sparkles, colors.green, '#E8FBF4', '/(app)/automation'],
  ['Settings', 'Profile, branches, security', Settings, colors.blue, '#EEF2FF', '/(app)/settings'],
] as const;

export default function EaseMoreHubScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between"><View><Text className="text-2xl font-bold text-[#0F172A]">More</Text><Text className="mt-1 text-[13px] text-[#475569]">Everything else in one organized launcher</Text></View><Search size={24} color={colors.text} /></View>
        <GradientCard className="gap-2.5"><Text className="text-[11px] font-bold text-white">QUICK ACCESS</Text><Text className="text-lg font-bold text-white">Jump straight into your main tools.</Text><Text className="text-[13px] leading-[18px] text-white">Sales, inventory, reports, and settings are grouped for fast one-handed access.</Text></GradientCard>
        <View className="flex-row justify-between"><Text className="text-xs font-bold text-[#475569]">PRIMARY</Text><Text className="text-[11px] text-[#94A3B8]">Core daily work</Text></View>
        <View className="flex-row flex-wrap justify-between gap-y-3">{primary.map(([title, subtitle, Icon, color, tint, route]) => <MoreTile key={title} title={title} subtitle={subtitle} icon={Icon} color={color} tint={tint} onPress={() => router.push(route)} />)}</View>
        <View className="flex-row justify-between"><Text className="text-xs font-bold text-[#475569]">PLATFORM</Text><Text className="text-[11px] text-[#94A3B8]">Insights and control</Text></View>
        <View className="flex-row flex-wrap justify-between gap-y-3">{platform.map(([title, subtitle, Icon, color, tint, route]) => <MoreTile key={title} title={title} subtitle={subtitle} icon={Icon} color={color} tint={tint} onPress={() => router.push(route)} />)}</View>
        <SurfaceCard>
          <Text className="text-xs font-bold text-[#475569]">WORKSPACE</Text><Text className="mt-1 text-base font-bold text-[#0F172A]">Team and business tools</Text><Text className="mt-1 text-[13px] leading-[18px] text-[#475569]">Manage suppliers, employees, notifications, and account settings from one place.</Text>
          {[["Suppliers", "Bills, purchase history, profiles", Truck, '/(app)/suppliers'], ["Notifications", "Sales, payments, inventory, AI", Bell, '/(app)/settings/notifications'], ["Settings", "Profile, branches, security", Settings, '/(app)/settings']].map(([title, subtitle, Icon, route]) => <Pressable key={title as string} onPress={() => router.push(route as never)} className="flex-row items-center justify-between py-3"><View className="flex-row items-center gap-3"><View className="h-9 w-9 items-center justify-center rounded-[14px] bg-[#EEF2FF]"><Icon size={18} color={colors.blue} /></View><View><Text className="text-[13px] font-semibold text-[#0F172A]">{title as string}</Text><Text className="text-[11px] text-[#475569]">{subtitle as string}</Text></View></View><ChevronRight size={18} color={colors.muted} /></Pressable>)}
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
}
