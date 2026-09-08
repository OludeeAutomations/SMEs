import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataRow, Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { SurfaceCard } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useWorkspace } from '@/store/businessStore';
import { effectiveInvoiceStatus } from '@/utils/businessMetrics';
import { formatDate, formatMoney, todayKey } from '@/utils/format';

export default function NotificationsScreen() {
  const workspace = useWorkspace();
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const stockAlertsEnabled = workspace.automations.lowStockAlerts !== false;
  const invoiceAlertsEnabled = workspace.automations.invoiceReminders !== false;
  const alerts = [
    ...(workspace.automations.weeklyReport ? [{ id: 'weekly-report', title: 'Weekly summary ready', subtitle: `${workspace.sales.length} total sales · ${formatMoney(workspace.sales.reduce((sum, sale) => sum + sale.total, 0), currency)} recorded` }] : []),
    ...(stockAlertsEnabled ? workspace.products.filter((product) => product.stockQuantity <= product.lowStockThreshold).map((product) => ({ id: `product-${product.id}`, title: product.stockQuantity <= 0 ? 'Out of stock' : 'Low stock', subtitle: `${product.name} has ${product.stockQuantity} units left` })) : []),
    ...(invoiceAlertsEnabled ? workspace.invoices.filter((invoice) => invoice.status !== 'PAID').map((invoice) => ({ id: `invoice-${invoice.id}`, title: effectiveInvoiceStatus(invoice) === 'OVERDUE' ? 'Invoice overdue' : 'Payment pending', subtitle: `${invoice.customerName} owes ${formatMoney(invoice.total, currency)} · due ${formatDate(invoice.dueDate)}` })) : []),
    ...workspace.supplierBills.filter((bill) => bill.status === 'UNPAID' && bill.dueDate <= todayKey()).map((bill) => ({ id: `bill-${bill.id}`, title: bill.dueDate < todayKey() ? 'Supplier bill overdue' : 'Supplier bill due today', subtitle: `${bill.supplierName}: ${formatMoney(bill.amount, currency)}` })),
  ];

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}><ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5">
    <ScreenHeader title="Notifications" subtitle="Generated automatically from your workspace data." showBack />
    {alerts.length ? <SurfaceCard className="py-0">{alerts.map((alert, index) => <React.Fragment key={alert.id}><DataRow title={alert.title} subtitle={alert.subtitle} />{index < alerts.length - 1 ? <Divider /> : null}</React.Fragment>)}</SurfaceCard> : <EmptyState title="You're all caught up" message="Low-stock, invoice, and supplier-bill alerts will appear here." />}
  </ScrollView></SafeAreaView>;
}
