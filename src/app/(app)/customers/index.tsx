import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { colors, ListRow, MetricCard, SurfaceCard } from '@/components/dashboard-ui';

export default function EaseCustomersScreen() {
  const router = useRouter(); const [search, setSearch] = useState('');
  const customers = [['Amina Trading','36 purchases • ₦120k outstanding','AT'],['Blue Nile Foods','18 purchases • Settled today','BN'],['Kara Market','9 purchases • ₦45k outstanding','KM']].filter(([name]) => name.toLowerCase().includes(search.toLowerCase()));
  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}><ScrollView contentContainerClassName="gap-4 px-5 pb-8 pt-5">
    <Text className="text-2xl font-bold text-[#0F172A]">Customers</Text>
    <View className="h-14 flex-row items-center gap-2 rounded-2xl border border-[#DCE3EE] bg-white px-4"><Search size={18} color={colors.muted}/><TextInput value={search} onChangeText={setSearch} placeholder="Search customers" placeholderTextColor={colors.muted} className="flex-1 text-sm text-[#0F172A]" /></View>
    <View className="flex-row gap-3"><MetricCard label="Active" value="1,284" color={colors.blue}/><MetricCard label="Balance" value="₦420k" color={colors.amber}/></View>
    <SurfaceCard className="py-0">{customers.map(([name,sub,initials],i)=><React.Fragment key={name}><ListRow title={`${initials}   ${name}`} subtitle={sub} onPress={()=>router.push('/(app)/customers/demo-customer')}/>{i<customers.length-1?<View className="h-px bg-[#DCE3EE]"/>:null}</React.Fragment>)}</SurfaceCard>
  </ScrollView></SafeAreaView>;
}
