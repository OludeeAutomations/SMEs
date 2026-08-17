import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { EmptyState, ScreenHeader } from '@/components/business-ui';
import { MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { formatMoney, parseAmount } from '@/utils/format';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workspace = useWorkspace();
  const product = workspace.products.find((item) => item.id === id);
  const adjustStock = useBusinessStore((state) => state.adjustStock);
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const [quantity, setQuantity] = useState('');

  if (!product) {
    return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-5 pt-5">
        <ScreenHeader title="Product" showBack />
        <EmptyState title="Product not found" message="This product may no longer exist." />
      </ScrollView>
    </SafeAreaView>;
  }

  const adjust = (direction: number) => {
    const value = parseAmount(quantity);
    if (!value) return Alert.alert('Enter a quantity');
    adjustStock(product.id, direction * value);
    setQuantity('');
  };

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5">
      <ScreenHeader title={product.name} subtitle={product.category} showBack />
      <MetricCard label="In stock" value={`${product.stockQuantity} units`} color={product.stockQuantity <= product.lowStockThreshold ? colors.amber : colors.green} />
      <MetricCard label="Selling price" value={formatMoney(product.sellingPrice, currency)} color={colors.blue} />
      <SurfaceCard className="gap-3">
        <Input label="Adjustment quantity" placeholder="0" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
        <Button title="Add stock" onPress={() => adjust(1)} />
        <Button title="Remove stock" variant="secondary" onPress={() => adjust(-1)} />
      </SurfaceCard>
    </ScrollView>
  </SafeAreaView>;
}
