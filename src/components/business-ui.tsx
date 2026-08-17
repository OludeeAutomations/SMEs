import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { colors, SurfaceCard } from './dashboard-ui';
import { useSyncStore } from '@/store/syncStore';

const rootScreens = new Set(['/home', '/sales', '/ai', '/reports', '/hub', '/inventory', '/customers', '/expenses', '/invoices', '/suppliers', '/settings', '/automation', '/projects']);

export function ScreenHeader({ title, subtitle, actionLabel, onAction, showBack }: { title: string; subtitle?: string; actionLabel?: string; onAction?: () => void; showBack?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { from } = useLocalSearchParams<{ from?: string | string[] }>();
  const openedFromMore = Array.isArray(from) ? from.includes('more') : from === 'more';
  const canGoBack = showBack ?? (openedFromMore || !rootScreens.has(pathname));
  return <View className="gap-2">
    {canGoBack ? <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={4} onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/home')} className="h-11 w-11 items-center justify-center rounded-full bg-white">
      <ChevronLeft size={25} color="#0F172A" />
    </Pressable> : null}
    <View className="flex-row items-start justify-between gap-3">
      <View className="flex-1"><Text className="text-2xl font-bold text-[#0F172A]">{title}</Text>{subtitle ? <Text className="mt-1 text-[13px] leading-[18px] text-[#475569]">{subtitle}</Text> : null}</View>
      {onAction ? <Pressable accessibilityRole="button" onPress={onAction} className="min-h-11 flex-row items-center gap-1 rounded-[5px] bg-[#0B1F5E] px-3 active:bg-[#071845]"><Plus size={16} color="white" /><Text className="text-xs font-bold text-white">{actionLabel ?? 'Add'}</Text></Pressable> : null}
    </View>
  </View>;
}

export function EmptyState({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  return <SurfaceCard className="items-center gap-2 py-8">
    <View className="h-11 w-11 rounded-[16px] bg-[#EAF2FF]" />
    <Text className="text-sm font-bold text-[#0F172A]">{title}</Text>
    <Text className="max-w-[260px] text-center text-xs leading-[18px] text-[#475569]">{message}</Text>
    {onAction ? <Pressable accessibilityRole="button" onPress={onAction} className="mt-2 rounded-[5px] bg-[#0B1F5E] px-4 py-2.5 active:bg-[#071845]"><Text className="text-xs font-bold text-white">{actionLabel}</Text></Pressable> : null}
  </SurfaceCard>;
}

export function DataRow({ title, subtitle, value, onPress }: { title: string; subtitle?: string; value?: string; onPress?: () => void }) {
  return <Pressable disabled={!onPress} onPress={onPress} className="flex-row items-center justify-between gap-3 py-3">
    <View className="min-w-0 flex-1"><Text numberOfLines={1} className="text-[13px] font-semibold text-[#0F172A]">{title}</Text>{subtitle ? <Text numberOfLines={1} className="mt-0.5 text-[11px] text-[#475569]">{subtitle}</Text> : null}</View>
    {value ? <Text className="font-mono text-xs font-bold text-[#0F172A]">{value}</Text> : null}
  </Pressable>;
}

export function Divider() { return <View className="h-px bg-[#DCE3EE]" />; }

export function ChoiceChips({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return <View className="flex-row flex-wrap gap-2">{options.map((option) => <Pressable key={option} onPress={() => onChange(option)} className={`rounded-full px-4 py-2 ${value === option ? 'bg-[#2563EB]' : 'border border-[#DCE3EE] bg-white'}`}><Text className={`text-xs font-semibold ${value === option ? 'text-white' : 'text-[#0F172A]'}`}>{option}</Text></Pressable>)}</View>;
}

export function SyncStatusPill() {
  const { status, error } = useSyncStore();
  const previousStatus = useRef(status);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const completedSave = previousStatus.current === 'saving' && status === 'synced';
    previousStatus.current = status;
    if (status === 'saving') setShowSaved(false);
    if (!completedSave) return;
    setShowSaved(true);
    const timer = setTimeout(() => setShowSaved(false), 1800);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === 'offline' || status === 'error') {
    return <View className="rounded-[5px] border border-[#FED7AA] bg-[#FFF7ED] px-3 py-2.5">
      <Text accessibilityHint={error ?? undefined} className="text-[11px] font-medium leading-4 text-[#92400E]">
        Saved on this device. We’ll sync when you’re online.
      </Text>
    </View>;
  }
  if (!showSaved) return null;
  return <View className="self-start rounded-full bg-[#E8FBF4] px-3 py-1.5">
    <Text className="text-[10px] font-semibold text-[#047857]">Saved</Text>
  </View>;
}

export { colors };
