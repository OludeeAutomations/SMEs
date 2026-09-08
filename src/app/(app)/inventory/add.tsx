import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import ProductImagePicker from '@/components/ProductImagePicker';
import { ScreenHeader } from '@/components/business-ui';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { parseAmount } from '@/utils/format';

export default function AddProductScreen() {
  const router = useRouter();
  const workspace = useWorkspace();
  const addProduct = useBusinessStore((state) => state.addProduct);
  const [name, setName] = useState(''); const [category, setCategory] = useState(''); const [imageUrl, setImageUrl] = useState('');
  const [cost, setCost] = useState(''); const [price, setPrice] = useState(''); const [stock, setStock] = useState(''); const [threshold, setThreshold] = useState('5');
  const save = () => {
    const sellingPrice = parseAmount(price); const costPrice = parseAmount(cost); const stockQuantity = parseAmount(stock); const lowStockThreshold = parseAmount(threshold);
    if (name.trim().length < 2 || !category.trim() || sellingPrice <= 0) return Alert.alert('Check product details', 'Name, category, and a valid selling price are required.');
    if (![stockQuantity, lowStockThreshold].every(Number.isInteger)) return Alert.alert('Check quantities', 'Stock and low-stock alert must be whole numbers.');
    if (workspace.products.some((product) => product.name.trim().toLowerCase() === name.trim().toLowerCase())) return Alert.alert('Product already exists', 'Use the existing product and adjust its stock instead.');
    addProduct({ name: name.trim(), category: category.trim(), imageUrl: imageUrl || undefined, costPrice, sellingPrice, stockQuantity, lowStockThreshold });
    Alert.alert('Product added', `${name.trim()} is now in inventory.`, [{ text: 'View inventory', onPress: () => router.replace('/(app)/inventory') }]);
  };
  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}><ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" keyboardShouldPersistTaps="handled">
    <ScreenHeader title="Add product" subtitle="Sales reduce stock automatically and adjustments stay in history." />
    <ProductImagePicker value={imageUrl} onChange={setImageUrl} />
    <Input label="Product name" placeholder="e.g. Cooking Oil 5L" value={name} onChangeText={setName} />
    <Input label="Category" placeholder="e.g. Groceries" value={category} onChangeText={setCategory} />
    <Input label="Cost price" placeholder="0" value={cost} onChangeText={setCost} keyboardType="numeric" />
    <Input label="Selling price" placeholder="0" value={price} onChangeText={setPrice} keyboardType="numeric" />
    <Input label="Opening stock" placeholder="0" value={stock} onChangeText={setStock} keyboardType="numeric" />
    <Input label="Low-stock alert at" placeholder="5" value={threshold} onChangeText={setThreshold} keyboardType="numeric" />
    <Button title="Save product" onPress={save} className="h-14 rounded-[5px]" />
  </ScrollView></SafeAreaView>;
}
