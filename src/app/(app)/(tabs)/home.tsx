import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight, Bell, Bot, FileText, Package, ReceiptText, ShoppingCart, Users, WalletCards } from 'lucide-react-native';
import { colors, ListRow, MetricCard, QuickAction, SurfaceCard } from '@/components/dashboard-ui';
import { EmptyState, SyncStatusPill } from '@/components/business-ui';
import { useAuthStore } from '@/store/authStore';
import { useWorkspace } from '@/store/businessStore';
import { formatMoney, todayKey } from '@/utils/format';

export default function EaseHomeScreen() {
  const router = useRouter();
  const business = useAuthStore((state) => state.business);
  const workspace = useWorkspace();
  const currency = business?.currency ?? 'NGN';
  const today = todayKey();
  const month = today.slice(0, 7);
  const todaySales = workspace.sales.filter((sale) => sale.createdAt.startsWith(today));
  const monthlySales = workspace.sales.filter((sale) => sale.createdAt.startsWith(month));
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + sale.total, 0);
  const expenses = workspace.expenses.filter((expense) => expense.date.startsWith(month)).reduce((sum, expense) => sum + expense.amount, 0);
  const due = workspace.invoices.filter((invoice) => invoice.status !== 'PAID').reduce((sum, invoice) => sum + invoice.total, 0);
  const stockValue = workspace.products.reduce((sum, product) => sum + product.costPrice * product.stockQuantity, 0);
  const activity = [
    ...workspace.sales.map((sale) => ({ id: sale.id, at: sale.createdAt, title: 'Sale recorded', subtitle: sale.customerName || 'Walk-in customer', value: formatMoney(sale.total, currency), route: `/(app)/sales/${sale.id}` })),
    ...workspace.invoices.map((invoice) => ({ id: invoice.id, at: invoice.createdAt, title: 'Invoice created', subtitle: invoice.customerName, value: formatMoney(invoice.total, currency), route: `/(app)/invoices/${invoice.id}` })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 3);

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center justify-between">
        <Pressable onPress={() => router.push('/(app)/settings/business-config')} className="min-h-[52px] flex-row items-center gap-2.5 rounded-[5px] border border-[#DCE3EE] bg-white px-3.5 py-2">
          <View className="h-9 w-9 overflow-hidden items-center justify-center rounded-[5px] bg-[#E8FBF4]">
            {business?.logoUrl ? <Image source={{ uri: business.logoUrl }} style={{ width: 36, height: 36 }} contentFit="cover" /> : <Text className="text-[13px] font-bold text-[#10B981]">{(business?.name || 'E').slice(0, 2).toUpperCase()}</Text>}
          </View>
          <View><Text className="text-xs font-bold text-[#0F172A]">{business?.name || 'Your business'}</Text><Text className="text-[10px] text-[#475569]">{business?.branchName || 'Primary branch'} • Active</Text></View>
        </Pressable>
        <Pressable accessibilityLabel="Notifications" hitSlop={8} onPress={() => router.push('/(app)/settings/notifications')} className="h-11 w-11 items-center justify-center"><Bell size={24} color={colors.text} /></Pressable>
      </View>

      <SyncStatusPill />

      <View className="h-[156px] overflow-hidden rounded-[5px] border border-[#1E3A8A] bg-[#0B1F5E] p-4">
        <Image source={require('../../../../assets/business-overview-illustration.png')} style={{ position: 'absolute', width: 190, height: 190, right: -12, bottom: -28 }} contentFit="contain" />
        <View className="w-[62%] flex-1 gap-1.5">
          <Text className="text-[11px] font-bold text-[#93C5FD]">BUSINESS OVERVIEW</Text>
          <Text className="text-2xl font-bold text-white">{formatMoney(monthlyRevenue, currency)}</Text>
          <Text className="text-xs leading-4 text-[#BFDBFE]">{monthlySales.length} completed {monthlySales.length === 1 ? 'sale' : 'sales'} this month</Text>
          <Pressable onPress={() => router.push('/(app)/(tabs)/reports')} className="mt-auto h-[38px] w-32 flex-row items-center justify-center gap-1.5 rounded-[5px] bg-white"><Text className="text-xs font-bold text-[#0B1F5E]">View report</Text><ArrowRight size={16} color="#2563EB" /></Pressable>
        </View>
      </View>

      <View className="flex-row gap-3"><MetricCard label="Today" value={formatMoney(todayRevenue, currency)} color={colors.blue} /><MetricCard label="Net" value={formatMoney(monthlyRevenue - expenses, currency)} color={colors.green} /></View>
      <View className="flex-row gap-3"><MetricCard label="Invoice due" value={formatMoney(due, currency)} color={colors.amber} /><MetricCard label="Stock value" value={formatMoney(stockValue, currency)} /></View>
      <Text className="text-xs font-bold text-[#475569]">QUICK ACTIONS</Text>
      <View className="flex-row flex-wrap justify-between gap-y-2.5"><QuickAction label="New Sale" icon={ShoppingCart} onPress={() => router.push('/(app)/sales/record')} /><QuickAction label="Invoice" icon={FileText} onPress={() => router.push('/(app)/invoices/create')} /><QuickAction label="Add Stock" icon={Package} onPress={() => router.push('/(app)/inventory/add')} /><QuickAction label="Customers" icon={Users} onPress={() => router.push('/(app)/customers')} /><QuickAction label="Expense" icon={WalletCards} onPress={() => router.push('/(app)/expenses/add')} /><QuickAction label="Ask AI" icon={Bot} onPress={() => router.push('/(app)/(tabs)/ai')} /></View>
      <Text className="text-xs font-bold text-[#475569]">RECENT ACTIVITY</Text>
      {activity.length ? <SurfaceCard className="py-0">{activity.map((item, index) => <React.Fragment key={item.id}><ListRow title={item.title} subtitle={item.subtitle} value={item.value} icon={ReceiptText} onPress={() => router.push(item.route as never)} />{index < activity.length - 1 ? <View className="h-px bg-[#DCE3EE]" /> : null}</React.Fragment>)}</SurfaceCard> : <EmptyState title="Your workspace is ready" message="Record a sale, add stock, or create your first customer. Your dashboard will update automatically." actionLabel="Record first sale" onAction={() => router.push('/(app)/sales/record')} />}
    </ScrollView>
  </SafeAreaView>;
}
