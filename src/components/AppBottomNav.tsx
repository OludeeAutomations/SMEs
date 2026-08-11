import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BarChart3, Bot, Home, MoreHorizontal, ReceiptText } from 'lucide-react-native';
import { colors } from './dashboard-ui';

const tabs = [
  { label: 'Home', route: '/(app)/(tabs)/home', icon: Home },
  { label: 'Sales', route: '/(app)/(tabs)/sales', icon: ReceiptText },
  { label: 'AI', route: '/(app)/(tabs)/ai', icon: Bot },
  { label: 'Reports', route: '/(app)/(tabs)/reports', icon: BarChart3 },
  { label: 'More', route: '/(app)/(tabs)/hub', icon: MoreHorizontal },
] as const;

export default function AppBottomNav() {
  const router = useRouter();
  return (
    <View className="absolute bottom-3 left-4 right-4 h-[70px] flex-row rounded-[26px] border border-[#DCE3EE] bg-white px-2 py-2 shadow-lg">
      {tabs.map(({ label, route, icon: Icon }) => {
        const active = label === 'More';
        return (
          <Pressable key={label} onPress={() => router.replace(route)} className={`flex-1 items-center justify-center gap-1 rounded-[18px] ${active ? 'bg-[#F2F5FA]' : ''}`}>
            <Icon size={21} color={active ? colors.blue : colors.muted} />
            <Text className={`text-[10px] ${active ? 'font-bold text-[#2563EB]' : 'text-[#94A3B8]'}`}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
