import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { BarChart, MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useWorkspace } from '@/store/businessStore';
import { recentDayBuckets, sumByBuckets } from '@/utils/analytics';
import { formatDate, formatMoney, todayKey } from '@/utils/format';

export default function ExpensesScreen() {
  const router = useRouter();
  const workspace = useWorkspace();
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const month = todayKey().slice(0, 7);
  const monthly = workspace.expenses.filter((expense) => expense.date.startsWith(month));
  const total = monthly.reduce((sum, expense) => sum + expense.amount, 0);
  const dayBuckets = recentDayBuckets();
  const dailySpend = sumByBuckets(workspace.expenses, dayBuckets, (expense) => expense.date, (expense) => expense.amount);
  const recentTotal = dailySpend.reduce((sum, value) => sum + value, 0);

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Expenses" subtitle="Every saved cost flows into net profit." actionLabel="Expense" onAction={() => router.push('/(app)/expenses/add')} />
      <View className="flex-row gap-3">
        <MetricCard label="This month" value={formatMoney(total, currency)} color={colors.blue} />
        <MetricCard label="Entries" value={String(monthly.length)} />
      </View>

      {recentTotal > 0 ? <SurfaceCard className="gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-bold text-[#475569]">LAST 7 DAYS</Text>
          <Text className="font-mono text-[11px] font-bold text-[#F59E0B]">{formatMoney(recentTotal, currency)}</Text>
        </View>
        <BarChart values={dailySpend} labels={dayBuckets.map((bucket) => bucket.label)} valueLabel="Expenses" color={colors.amber} />
        <Pressable onPress={() => router.push('/(app)/expenses/analytics')} className="flex-row items-center justify-end gap-1.5">
          <Text className="text-xs font-bold text-[#2563EB]">View category analytics</Text><ArrowRight size={14} color="#2563EB" />
        </Pressable>
      </SurfaceCard> : null}

      {workspace.expenses.length ? <SurfaceCard className="py-0">
        {workspace.expenses.map((expense, index) => <React.Fragment key={expense.id}>
          <DataRow title={expense.description} subtitle={`${expense.category} · ${formatDate(expense.date)}`} value={formatMoney(expense.amount, currency)} />
          {index < workspace.expenses.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : <EmptyState title="No expenses yet" message="Add operating costs to calculate a meaningful net profit." actionLabel="Add first expense" onAction={() => router.push('/(app)/expenses/add')} />}
    </ScrollView>
  </SafeAreaView>;
}
