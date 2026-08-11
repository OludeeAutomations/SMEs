import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  BarChart3,
  Bell,
  Bot,
  ChevronRight,
  FileText,
  Package,
  ReceiptText,
  Settings,
  Sparkles,
  Truck,
  Users,
  WalletCards,
} from 'lucide-react-native';

const tools = [
  { title: 'Sales', subtitle: 'History, drafts and receipts', route: '/(app)/sales/history', icon: ReceiptText },
  { title: 'Customers', subtitle: 'Profiles, balances and debtors', route: '/(app)/customers', icon: Users },
  { title: 'Inventory', subtitle: 'Products, adjustments and alerts', route: '/(app)/inventory', icon: Package },
  { title: 'Invoices', subtitle: 'Create, send and track invoices', route: '/(app)/invoices', icon: FileText },
  { title: 'Expenses', subtitle: 'Records, categories and analytics', route: '/(app)/expenses', icon: WalletCards },
  { title: 'Suppliers', subtitle: 'Profiles, purchases and bills', route: '/(app)/suppliers', icon: Truck },
  { title: 'Reports', subtitle: 'Revenue, profit and cash flow', route: '/(app)/(tabs)/reports', icon: BarChart3 },
  { title: 'AI Assistant', subtitle: 'Questions, insights and forecasts', route: '/(app)/(tabs)/ai', icon: Bot },
  { title: 'Automation', subtitle: 'Reminders and workflows', route: '/(app)/automation', icon: Sparkles },
  { title: 'Notifications', subtitle: 'Sales, inventory and AI alerts', route: '/(app)/settings/notifications', icon: Bell },
  { title: 'Settings', subtitle: 'Business, roles and integrations', route: '/(app)/settings', icon: Settings },
];

const secondaryTools = [
  { title: 'Record a sale', route: '/(app)/sales/record' },
  { title: 'Draft sales', route: '/(app)/sales/drafts' },
  { title: 'Cash sales history', route: '/(app)/sales/history-cash' },
  { title: 'Transfer sales history', route: '/(app)/sales/history-transfer' },
  { title: 'Sale details', route: '/(app)/sales/demo-sale' },
  { title: 'Payment confirmation', route: '/(app)/sales/payment-confirmation' },
  { title: 'Receipt preview', route: '/(app)/sales/receipt-preview' },
  { title: 'Receipt template', route: '/(app)/sales/receipt-template' },
  { title: 'Add customer', route: '/(app)/customers/add' },
  { title: 'Customer details', route: '/(app)/customers/demo-customer' },
  { title: 'Debtor book', route: '/(app)/customers/debtors' },
  { title: 'Add inventory item', route: '/(app)/inventory/add' },
  { title: 'Inventory details', route: '/(app)/inventory/demo-product' },
  { title: 'Stock adjustments', route: '/(app)/inventory/adjustments' },
  { title: 'Inventory categories', route: '/(app)/inventory/categories' },
  { title: 'Low-stock monitor', route: '/(app)/inventory/low-stock' },
  { title: 'Create invoice', route: '/(app)/invoices/create' },
  { title: 'Invoice details', route: '/(app)/invoices/demo-invoice' },
  { title: 'Invoice history', route: '/(app)/invoices/history' },
  { title: 'Custom invoice templates', route: '/(app)/invoices/templates' },
  { title: 'Add expense', route: '/(app)/expenses/add' },
  { title: 'Expense categories', route: '/(app)/expenses/categories' },
  { title: 'Expense analytics', route: '/(app)/expenses/analytics' },
  { title: 'Supplier details', route: '/(app)/suppliers/demo-supplier' },
  { title: 'Supplier bills', route: '/(app)/suppliers/bills' },
  { title: 'Projects & tasks', route: '/(app)/projects' },
  { title: 'Business settings', route: '/(app)/settings/business-config' },
  { title: 'Roles & permissions', route: '/(app)/settings/roles' },
  { title: 'Payment gateways', route: '/(app)/settings/payments' },
  { title: 'Design system', route: '/(app)/settings/design-system' },
];

export default function EaseMoreHubScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-bg-light dark:bg-bg-dark" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">More</Text>
        <Text className="mb-5 mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
          Everything else in one organized launcher.
        </Text>

        <View className="mb-5 rounded-3xl bg-accent-blue p-5">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-white/70">Quick access</Text>
          <Text className="mt-2 text-lg font-bold text-white">Jump straight into your main tools.</Text>
          <Text className="mt-1 text-xs leading-5 text-white/80">Every designed screen can be opened from this page.</Text>
        </View>

        <View className="flex-row flex-wrap justify-between gap-y-3">
          {tools.map(({ title, subtitle, route, icon: Icon }) => (
            <Pressable
              key={title}
              onPress={() => router.push(route as never)}
              className="w-[48.5%] rounded-2xl border border-border-light bg-white p-4 dark:border-border-dark dark:bg-surface-dark"
            >
              <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
                <Icon size={19} color="#2563EB" />
              </View>
              <Text className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">{title}</Text>
              <Text className="mt-1 text-[10px] leading-4 text-text-secondary-light dark:text-text-secondary-dark">{subtitle}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="mb-2 mt-7 text-[10px] font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">Additional screens</Text>
        <View className="overflow-hidden rounded-2xl border border-border-light bg-white px-4 dark:border-border-dark dark:bg-surface-dark">
          {secondaryTools.map(({ title, route }, index) => (
            <Pressable
              key={title}
              onPress={() => router.push(route as never)}
              className={`flex-row items-center py-4 ${index < secondaryTools.length - 1 ? 'border-b border-border-light dark:border-border-dark' : ''}`}
            >
              <Text className="flex-1 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">{title}</Text>
              <ChevronRight size={17} color="#94A3B8" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
