import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductVisual from '@/components/ProductVisual';
import { Divider, EmptyState, ScreenHeader } from '@/components/business-ui';
import { BarChart, MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useWorkspace } from '@/store/businessStore';
import { formatMoney } from '@/utils/format';

export default function InventoryScreen() {
  const router = useRouter();
  const workspace = useWorkspace();
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const lowStock = workspace.products.filter((product) => product.stockQuantity <= product.lowStockThreshold);
  const stockValue = workspace.products.reduce((total, product) => total + product.costPrice * product.stockQuantity, 0);
  const categoryStock = Array.from(new Set(workspace.products.map((product) => product.category)))
    .map((category) => ({
      category,
      quantity: workspace.products.filter((product) => product.category === category).reduce((total, product) => total + product.stockQuantity, 0),
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Inventory" subtitle="Live stock quantities and values." actionLabel="Product" onAction={() => router.push('/(app)/inventory/add')} />
      <View className="flex-row gap-3">
        <MetricCard label="Products" value={String(workspace.products.length)} color={colors.blue} />
        <MetricCard label="Low stock" value={String(lowStock.length)} color={colors.amber} />
      </View>
      <MetricCard label="Stock value" value={formatMoney(stockValue, currency)} />

      {categoryStock.length ? <SurfaceCard className="gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-bold text-[#475569]">STOCK BY CATEGORY</Text>
          <Text className="text-[10px] text-[#94A3B8]">Current quantities</Text>
        </View>
        <BarChart values={categoryStock.map((item) => item.quantity)} labels={categoryStock.map((item) => item.category.length > 8 ? `${item.category.slice(0, 7)}…` : item.category)} valueLabel="Units in stock" color={colors.green} />
      </SurfaceCard> : null}

      {workspace.products.length ? <SurfaceCard className="py-0">
        {workspace.products.map((product, index) => <React.Fragment key={product.id}>
          <Pressable onPress={() => router.push(`/(app)/inventory/${product.id}` as never)} className="flex-row items-center gap-3 py-3 active:opacity-70">
            <View className="h-14 w-14 shrink-0 overflow-hidden rounded-[8px] border border-[#DCE3EE] bg-[#F2F5FA]">
              <ProductVisual imageUrl={product.imageUrl} name={product.name} category={product.category} iconSize={25} />
            </View>
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="text-[15px] font-bold text-[#0F172A]">{product.name}</Text>
              <Text numberOfLines={1} className="mt-1 text-[12px] text-[#475569]">{product.stockQuantity} in stock · {product.category}</Text>
            </View>
            <Text className="font-mono text-xs font-bold text-[#0F172A]">{formatMoney(product.sellingPrice, currency)}</Text>
          </Pressable>
          {index < workspace.products.length - 1 ? <Divider /> : null}
        </React.Fragment>)}
      </SurfaceCard> : <EmptyState title="No products yet" message="Add products to track quantities, stock value, and low-stock alerts." actionLabel="Add first product" onAction={() => router.push('/(app)/inventory/add')} />}
    </ScrollView>
  </SafeAreaView>;
}
