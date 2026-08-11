import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BarChart, ListRow, SurfaceCard } from '@/components/dashboard-ui';

export default function EaseInventoryDashboardScreen(){const router=useRouter();return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}><ScrollView contentContainerClassName="gap-4 px-5 pb-8 pt-5"><Text className="text-2xl font-bold text-[#0F172A]">Inventory</Text>
<SurfaceCard className="gap-1"><Text className="text-[11px] text-[#475569]">Items</Text><Text className="font-mono text-lg font-bold text-[#2563EB]">1,248</Text><Text className="text-[11px] text-[#475569]">Low stock</Text><Text className="font-mono text-lg font-bold text-[#F59E0B]">18</Text><BarChart heights={[32,18,40,28,54,35,46]} compact/></SurfaceCard>
<View className="rounded-3xl border border-[#FED7AA] bg-[#FFF7ED] p-4"><Text className="text-[10px] font-bold text-[#B45309]">LOW STOCK ALERT</Text><Text className="mt-2 text-xs leading-[18px] text-[#92400E]">Cooking oil, sugar, and detergent may run out within 4 days based on current sales pace.</Text></View>
<SurfaceCard className="py-0"><ListRow title="Cooking Oil" subtitle="18 units left" value="₦18,500" onPress={()=>router.push('/(app)/inventory/demo-product')}/><View className="h-px bg-[#DCE3EE]"/><ListRow title="Rice 50kg" subtitle="41 units left" value="₦72,000" onPress={()=>router.push('/(app)/inventory/demo-product')}/><View className="h-px bg-[#DCE3EE]"/><ListRow title="Detergent" subtitle="9 units left" value="₦6,800" onPress={()=>router.push('/(app)/inventory/demo-product')}/></SurfaceCard></ScrollView></SafeAreaView>}
