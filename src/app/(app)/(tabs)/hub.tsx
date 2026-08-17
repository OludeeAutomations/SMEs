import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BarChart3,
  Bell,
  Bot,
  ChevronRight,
  FileText,
  Package,
  ReceiptText,
  Search,
  Settings,
  Sparkles,
  Truck,
  Users,
  X,
} from 'lucide-react-native';
import { colors, MoreTile, SurfaceCard } from '@/components/dashboard-ui';

const primary = [
  ['Sales', 'History, details, receipts', ReceiptText, colors.blue, '#EAF2FF', '/(app)/(tabs)/sales'],
  ['Customers', 'Profiles, balances, history', Users, colors.green, '#E8FBF4', '/(app)/customers'],
  ['Inventory', 'Products, movement, alerts', Package, colors.amber, '#FFF7ED', '/(app)/inventory'],
  ['Invoices', 'Create, send, share, track', FileText, colors.blue, '#EEF2FF', '/(app)/invoices'],
] as const;

const platform = [
  ['Reports', 'Revenue, profit, cash flow', BarChart3, '/(app)/(tabs)/reports'],
  ['AI Assistant', 'Ask questions, get predictions', Bot, '/(app)/(tabs)/ai'],
  ['Automation', 'Reminders, workflows, reports', Sparkles, '/(app)/automation'],
  ['Settings', 'Profile, branches, security', Settings, '/(app)/settings'],
] as const;

const workspaceTools = [
  ['Suppliers', 'Bills, purchase history, profiles', Truck, '#EAF2FF', '/(app)/suppliers'],
  ['Notifications', 'Sales, payments, inventory, AI', Bell, '#EEF2FF', '/(app)/settings/notifications'],
  ['Settings', 'Profile, branches, security', Settings, '#EEF2FF', '/(app)/settings'],
] as const;

export default function EaseMoreHubScreen() {
  const router = useRouter();
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const matches = (title: string, subtitle: string) => !normalizedQuery || `${title} ${subtitle}`.toLowerCase().includes(normalizedQuery);
  const filteredPrimary = primary.filter(([title, subtitle]) => matches(title, subtitle));
  const filteredPlatform = platform.filter(([title, subtitle]) => matches(title, subtitle));
  const filteredWorkspace = workspaceTools.filter(([title, subtitle]) => matches(title, subtitle));
  const hasResults = filteredPrimary.length + filteredPlatform.length + filteredWorkspace.length > 0;
  const openFromMore = (route: string) => router.push(`${route}?from=more` as never);

  const closeSearch = () => {
    setQuery('');
    setSearching(false);
  };

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-2xl font-bold text-[#0F172A]">More</Text>
          <Text className="mt-1 text-[13px] text-[#475569]">Everything else in one organized launcher</Text>
        </View>
        <Pressable accessibilityLabel={searching ? 'Close search' : 'Search tools'} onPress={() => searching ? closeSearch() : setSearching(true)} className="h-10 w-10 items-center justify-center rounded-full active:bg-[#E8EDF5]">
          {searching ? <X size={22} color="#0F172A" /> : <Search size={22} color="#0F172A" />}
        </Pressable>
      </View>

      {searching ? <View className="h-12 flex-row items-center gap-2 rounded-[5px] border border-[#DCE3EE] bg-white px-3.5">
        <Search size={18} color="#94A3B8" />
        <TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Search tools" placeholderTextColor="#94A3B8" className="flex-1 text-sm text-[#0F172A]" />
      </View> : null}

      {!normalizedQuery ? <View className="gap-2.5 rounded-[5px] bg-[#0B1F5E] p-4">
        <Text className="text-[11px] font-bold text-white">QUICK ACCESS</Text>
        <Text className="text-lg font-bold text-white">Jump straight into your main tools.</Text>
        <Text className="text-[13px] leading-[18px] text-white">Sales, inventory, reports, and settings are grouped for fast one-handed access.</Text>
      </View> : null}

      {filteredPrimary.length ? <>
        <View className="flex-row justify-between">
          <Text className="text-xs font-bold text-[#475569]">PRIMARY</Text>
          <Text className="text-[11px] text-[#94A3B8]">Core daily work</Text>
        </View>
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {filteredPrimary.map(([title, subtitle, Icon, color, tint, route]) => <MoreTile key={title} title={title} subtitle={subtitle} icon={Icon} color={color} tint={tint} onPress={() => openFromMore(route)} />)}
        </View>
      </> : null}

      {filteredPlatform.length ? <>
        <View className="flex-row justify-between">
          <Text className="text-xs font-bold text-[#475569]">PLATFORM</Text>
          <Text className="text-[11px] text-[#94A3B8]">Insights and control</Text>
        </View>
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {filteredPlatform.map(([title, subtitle, Icon, route]) => <MoreTile key={title} title={title} subtitle={subtitle} icon={Icon} color="#BFDBFE" tint="#0B1F5E" dark onPress={() => openFromMore(route)} />)}
        </View>
      </> : null}

      {filteredWorkspace.length ? <SurfaceCard>
        <Text className="text-xs font-bold text-[#475569]">WORKSPACE</Text>
        <Text className="mt-1 text-base font-bold text-[#0F172A]">Team and business tools</Text>
        <Text className="mt-1 text-[13px] leading-[18px] text-[#475569]">Manage suppliers, employees, notifications, and account settings from one place.</Text>
        <View className="mt-2">
          {filteredWorkspace.map(([title, subtitle, Icon, tint, route]) => <Pressable key={title} onPress={() => openFromMore(route)} className="flex-row items-center justify-between py-3 active:opacity-70">
            <View className="flex-1 flex-row items-center gap-3 pr-2">
              <View className="h-9 w-9 items-center justify-center rounded-[14px]" style={{ backgroundColor: tint }}><Icon size={18} color={colors.blue} /></View>
              <View className="flex-1"><Text className="text-[13px] font-semibold text-[#0F172A]">{title}</Text><Text className="mt-0.5 text-[11px] text-[#475569]">{subtitle}</Text></View>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </Pressable>)}
        </View>
      </SurfaceCard> : null}

      {!hasResults ? <SurfaceCard className="items-center gap-1 py-8">
        <Search size={22} color="#94A3B8" />
        <Text className="mt-2 text-sm font-bold text-[#0F172A]">No tools found</Text>
        <Text className="text-xs text-[#475569]">Try another search term.</Text>
      </SurfaceCard> : null}
    </ScrollView>
  </SafeAreaView>;
}
