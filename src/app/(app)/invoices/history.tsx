import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChoiceChips, DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { SurfaceCard } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useWorkspace } from '@/store/businessStore';
import { effectiveInvoiceStatus } from '@/utils/businessMetrics';
import { formatDate, formatMoney } from '@/utils/format';
import { displayReference } from '@/utils/references';

export default function InvoiceHistoryScreen() {
  const router = useRouter();
  const workspace = useWorkspace();
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const [filter, setFilter] = useState('ALL');
  const invoices = workspace.invoices.filter((invoice) => filter === 'ALL' || effectiveInvoiceStatus(invoice) === filter);
  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5">
      <ScreenHeader title="Invoice history" subtitle="Filter paid, unpaid, and overdue invoices." showBack />
      <ChoiceChips options={['ALL', 'PAID', 'UNPAID', 'OVERDUE']} value={filter} onChange={setFilter} />
      {invoices.length ? <SurfaceCard className="py-0">
        {invoices.map((invoice, index) => <React.Fragment key={invoice.id}>
          <DataRow title={displayReference('INV', invoice)} subtitle={`${invoice.customerName} · ${effectiveInvoiceStatus(invoice)} · due ${formatDate(invoice.dueDate)}`} value={formatMoney(invoice.total, currency)} onPress={() => router.push(`/(app)/invoices/${invoice.id}` as never)} />
          {index < invoices.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : <EmptyState title="No matching invoices" message="Invoices matching this status will appear here." />}
    </ScrollView>
  </SafeAreaView>;
}
