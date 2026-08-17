import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, ScreenHeader } from '@/components/business-ui';
import { BarChart, MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useWorkspace } from '@/store/businessStore';
import { formatMoney, todayKey } from '@/utils/format';

export default function ExpenseAnalyticsScreen() {
  const workspace = useWorkspace();
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const month = todayKey().slice(0, 7);
  const monthlyExpenses = workspace.expenses.filter((expense) => expense.date.startsWith(month));
  const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categories = Array.from(new Set(monthlyExpenses.map((expense) => expense.category)))
    .map((category) => ({
      category,
      total: monthlyExpenses.filter((expense) => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0),
    }))
    .sort((a, b) => b.total - a.total);
  const topCategories = categories.slice(0, 6);
  const largest = categories[0];

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Expense analytics" subtitle="Calculated from expenses recorded this month." showBack />
      <View className="flex-row gap-3">
        <MetricCard label="This month" value={formatMoney(total, currency)} color={colors.blue} />
        <MetricCard label="Categories" value={String(categories.length)} color={colors.amber} />
      </View>

      {topCategories.length ? <>
        <SurfaceCard className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold text-[#475569]">SPEND BY CATEGORY</Text>
            <Text className="text-[10px] text-[#94A3B8]">Current month</Text>
          </View>
          <BarChart values={topCategories.map((item) => item.total)} labels={topCategories.map((item) => item.category.length > 8 ? `${item.category.slice(0, 7)}…` : item.category)} valueLabel="Amount spent" color={colors.amber} />
        </SurfaceCard>
        <SurfaceCard className="gap-3">
          <Text className="text-xs font-bold text-[#475569]">CATEGORY BREAKDOWN</Text>
          {categories.map((item) => {
            const percentage = total > 0 ? (item.total / total) * 100 : 0;
            return <View key={item.category} className="gap-2 py-1">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1"><Text className="text-[13px] font-semibold text-[#0F172A]">{item.category}</Text><Text className="mt-0.5 text-[10px] text-[#64748B]">{percentage.toFixed(0)}% of monthly expenses</Text></View>
                <Text className="font-mono text-xs font-bold text-[#0F172A]">{formatMoney(item.total, currency)}</Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-[#F2F5FA]"><View className="h-full rounded-full bg-[#F59E0B]" style={{ width: `${Math.max(2, percentage)}%` }} /></View>
            </View>;
          })}
        </SurfaceCard>
        {largest ? <SurfaceCard className="gap-1 bg-[#FFF7ED]">
          <Text className="text-[10px] font-bold text-[#B45309]">LARGEST COST</Text>
          <Text className="text-sm font-bold text-[#0F172A]">{largest.category}</Text>
          <Text className="text-xs leading-[18px] text-[#475569]">{formatMoney(largest.total, currency)} recorded this month.</Text>
        </SurfaceCard> : null}
      </> : <EmptyState title="No expense activity" message="Add an expense this month to generate category analytics." />}
    </ScrollView>
  </SafeAreaView>;
}
