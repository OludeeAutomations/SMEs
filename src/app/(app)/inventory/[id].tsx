import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import ProductImagePicker from '@/components/ProductImagePicker';
import { EmptyState, ScreenHeader } from '@/components/business-ui';
import { MetricCard, SurfaceCard, colors } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { formatMoney, parseAmount } from '@/utils/format';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const workspace = useWorkspace();
  const product = workspace.products.find((item) => item.id === id);
  const adjustStock = useBusinessStore((state) => state.adjustStock);
  const updateProductImage = useBusinessStore((state) => state.updateProductImage);
  const updateProduct = useBusinessStore((state) => state.updateProduct);
  const deleteProduct = useBusinessStore((state) => state.deleteProduct);
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const [quantity, setQuantity] = useState('');
  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [cost, setCost] = useState(product ? String(product.costPrice) : '');
  const [price, setPrice] = useState(product ? String(product.sellingPrice) : '');

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

  const saveDetails = () => {
    if (!name.trim() || !category.trim() || parseAmount(price) <= 0) return Alert.alert('Check details', 'Name, category, and a valid selling price are required.');
    updateProduct(product.id, { name: name.trim(), category: category.trim(), costPrice: parseAmount(cost), sellingPrice: parseAmount(price) });
    Alert.alert('Product updated');
  };
  const remove = () => Alert.alert('Delete product?', 'Historical sales will be kept.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { deleteProduct(product.id); router.replace('/(app)/inventory'); } }]);

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5">
      <ScreenHeader title={product.name} subtitle={product.category} showBack />
      <ProductImagePicker value={product.imageUrl} onChange={(imageUrl) => updateProductImage(product.id, imageUrl)} />
      <MetricCard label="In stock" value={`${product.stockQuantity} units`} color={product.stockQuantity <= product.lowStockThreshold ? colors.amber : colors.green} />
      <MetricCard label="Selling price" value={formatMoney(product.sellingPrice, currency)} color={colors.blue} />
      <SurfaceCard className="gap-3">
        <Input label="Product name" value={name} onChangeText={setName} />
        <Input label="Category" value={category} onChangeText={setCategory} />
        <Input label="Cost price" value={cost} onChangeText={setCost} keyboardType="numeric" />
        <Input label="Selling price" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <Button title="Save product details" onPress={saveDetails} />
      </SurfaceCard>
      <SurfaceCard className="gap-3">
        <Input label="Adjustment quantity" placeholder="0" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
        <Button title="Add stock" onPress={() => adjust(1)} />
        <Button title="Remove stock" variant="secondary" onPress={() => adjust(-1)} />
      </SurfaceCard>
      <Button title="Delete product" variant="secondary" onPress={remove} />
    </ScrollView>
  </SafeAreaView>;
}
