import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const activeLabel = pathname.startsWith('/sales')
    ? 'Sales'
    : pathname.endsWith('/ai')
      ? 'AI'
      : pathname.endsWith('/reports')
        ? 'Reports'
        : pathname.endsWith('/home')
          ? 'Home'
          : 'More';

  return (
    <View
      className="absolute left-5 right-5 h-[78px] flex-row rounded-[28px] border border-[#DCE3EE] bg-white p-2"
      style={{
        bottom: Math.max(insets.bottom, 12),
        zIndex: 100,
        elevation: 18,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.16,
        shadowRadius: 18,
      }}
    >
      {tabs.map(({ label, route, icon: Icon }) => {
        const active = label === activeLabel;
        return (
          <Pressable
            key={label}
            onPress={() => router.replace(route)}
            className={`flex-1 items-center justify-center gap-1 rounded-[18px] ${active ? 'bg-[#F2F5FA]' : ''}`}
          >
            <Icon size={23} strokeWidth={active ? 2.4 : 2} color={active ? colors.blue : colors.muted} />
            <Text className={`text-[11px] ${active ? 'font-bold text-[#2563EB]' : 'font-medium text-[#94A3B8]'}`}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
