import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, ScreenHeader } from '@/components/business-ui';
import { BarChart, MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useWorkspace } from '@/store/businessStore';
import { formatMoney } from '@/utils/format';

const bucketForDate = (value: string) => {
  const day = Number(value.slice(8, 10));
  return Number.isFinite(day) && day > 0 ? Math.min(4, Math.floor((day - 1) / 7)) : 0;
};

export default function ReportsScreen() {
  const workspace = useWorkspace();
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const sales = workspace.sales.filter((sale) => sale.createdAt.startsWith(month));
  const monthlyExpenses = workspace.expenses.filter((expense) => expense.date.startsWith(month));
  const revenue = sales.reduce((total, sale) => total + sale.total, 0);
  const expenses = monthlyExpenses.reduce((total, expense) => total + expense.amount, 0);
  const profit = revenue - expenses;
  const receivables = workspace.invoices.filter((invoice) => invoice.status !== 'PAID').reduce((total, invoice) => total + invoice.total, 0);
  const weeklyRevenue = [0, 0, 0, 0, 0];
  const weeklyExpenses = [0, 0, 0, 0, 0];

  sales.forEach((sale) => {
    weeklyRevenue[bucketForDate(sale.createdAt)] += sale.total;
  });
  monthlyExpenses.forEach((expense) => {
    weeklyExpenses[bucketForDate(expense.date)] += expense.amount;
  });

  const hasMonthlyActivity = sales.length > 0 || monthlyExpenses.length > 0;
  const monthLabel = now.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Reports" subtitle="Calculated from your sales, expenses, and invoices." />
      <View className="flex-row gap-3">
        <MetricCard label="Revenue" value={formatMoney(revenue, currency)} color={colors.blue} />
        <MetricCard label="Net" value={formatMoney(profit, currency)} color={profit >= 0 ? colors.green : colors.amber} />
      </View>
      <View className="flex-row gap-3">
        <MetricCard label="Expenses" value={formatMoney(expenses, currency)} />
        <MetricCard label="Receivables" value={formatMoney(receivables, currency)} color={colors.amber} />
      </View>

      {hasMonthlyActivity ? <SurfaceCard className="gap-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-bold text-[#475569]">MONTHLY ACTIVITY</Text>
          <Text className="text-[10px] text-[#94A3B8]">{monthLabel}</Text>
        </View>
        <BarChart values={weeklyRevenue} comparison={weeklyExpenses} labels={['1–7', '8–14', '15–21', '22–28', `29–${daysInMonth}`]} valueLabel="Revenue" comparisonLabel="Expenses" />
        <Text className="text-xs leading-[18px] text-[#475569]">
          {sales.length} completed {sales.length === 1 ? 'sale' : 'sales'} and {monthlyExpenses.length} {monthlyExpenses.length === 1 ? 'expense' : 'expenses'} this month
        </Text>
      </SurfaceCard> : <EmptyState title="Nothing to report yet" message="The graph will update automatically when you record a sale or expense this month." />}
    </ScrollView>
  </SafeAreaView>;
}
