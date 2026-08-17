import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import ProductVisual from '@/components/ProductVisual';
import { ChoiceChips, ScreenHeader } from '@/components/business-ui';
import { SurfaceCard } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { formatMoney, parseAmount } from '@/utils/format';

export default function RecordSaleScreen() {
  const router = useRouter();
  const workspace = useWorkspace();
  const addSale = useBusinessStore((state) => state.addSale);
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [payment, setPayment] = useState<'CASH' | 'TRANSFER' | 'CARD'>('CASH');
  const selectedProduct = workspace.products.find((product) => product.id === productId);

  const selectProduct = (id: string) => {
    const product = workspace.products.find((candidate) => candidate.id === id);
    setProductId(product?.id ?? '');
    setItem(product?.name ?? '');
    setAmount(String(product?.sellingPrice ?? ''));
  };

  const total = parseAmount(amount) * Math.max(1, parseAmount(quantity));
  const save = () => {
    const qty = Math.max(1, parseAmount(quantity));
    const product = workspace.products.find((candidate) => candidate.id === productId);
    const customer = workspace.customers.find((candidate) => candidate.id === customerId);
    if (!item.trim() || parseAmount(amount) <= 0) return Alert.alert('Check sale', 'Enter an item and a valid unit price.');
    if (product && product.stockQuantity < qty) return Alert.alert('Not enough stock', `Only ${product.stockQuantity} units are available.`);
    const sale = addSale({
      customerId: customer?.id,
      customerName: customer?.fullName,
      items: [{ productId: product?.id ?? 'custom', productName: item.trim(), quantity: qty, price: parseAmount(amount) }],
      subtotal: total,
      total,
      paymentMethod: payment,
    });
    router.replace(`/(app)/sales/${sale.id}` as never);
  };

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Record new sale" subtitle="Choose an inventory product or enter a custom item/service." showBack />

      {workspace.customers.length ? <>
        <Text className="text-xs font-bold text-[#475569]">CUSTOMER (OPTIONAL)</Text>
        <ChoiceChips options={['Walk-in', ...workspace.customers.map((customer) => customer.fullName)]} value={workspace.customers.find((customer) => customer.id === customerId)?.fullName ?? 'Walk-in'} onChange={(name) => setCustomerId(workspace.customers.find((customer) => customer.fullName === name)?.id ?? '')} />
      </> : null}

      {workspace.products.length ? <>
        <Text className="text-xs font-bold text-[#475569]">CHOOSE A PRODUCT</Text>
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {workspace.products.map((product) => {
            const selected = product.id === productId;
            return <Pressable key={product.id} onPress={() => selectProduct(product.id)} className={`w-[48.5%] overflow-hidden rounded-[8px] border bg-white ${selected ? 'border-[#2563EB]' : 'border-[#DCE3EE]'}`}>
              <View className="h-28 items-center justify-center overflow-hidden bg-[#F2F5FA]">
                <ProductVisual imageUrl={product.imageUrl} name={product.name} category={product.category} iconSize={34} />
              </View>
              <View className="gap-1 p-3">
                <Text className="text-sm font-bold text-[#0F172A]" numberOfLines={1}>{product.name}</Text>
                <Text className="text-xs font-semibold text-[#2563EB]">{formatMoney(product.sellingPrice, currency)}</Text>
                <Text className="text-[10px] text-[#64748B]">{product.stockQuantity} in stock</Text>
              </View>
            </Pressable>;
          })}
        </View>
      </> : null}

      {selectedProduct ? <SurfaceCard className="flex-row items-center gap-3 p-3">
        <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-[7px] bg-[#F2F5FA]">
          <ProductVisual imageUrl={selectedProduct.imageUrl} name={selectedProduct.name} category={selectedProduct.category} iconSize={26} />
        </View>
        <View className="flex-1">
          <Text className="text-[11px] font-bold text-[#2563EB]">ITEM ADDED</Text>
          <Text className="mt-1 text-base font-bold text-[#0F172A]">{selectedProduct.name}</Text>
          <Text className="mt-1 text-xs text-[#64748B]">{selectedProduct.category} · {selectedProduct.stockQuantity} available</Text>
        </View>
      </SurfaceCard> : null}

      <Input label="Item or service" placeholder="What did you sell?" value={item} onChangeText={(value) => { setItem(value); setProductId(''); }} />
      <Input label="Unit price" placeholder="0" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Input label="Quantity" placeholder="1" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
      <Text className="text-xs font-bold text-[#475569]">PAYMENT METHOD</Text>
      <ChoiceChips options={['CASH', 'TRANSFER', 'CARD']} value={payment} onChange={(value) => setPayment(value as typeof payment)} />
      <SurfaceCard>
        <Text className="text-[11px] text-[#475569]">TOTAL</Text>
        <Text className="mt-2 font-mono text-xl font-bold text-[#2563EB]">{formatMoney(total, currency)}</Text>
      </SurfaceCard>
      <Button title="Complete sale" onPress={save} className="h-14 rounded-[5px]" />
    </ScrollView>
  </SafeAreaView>;
}
