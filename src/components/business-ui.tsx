import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors, SurfaceCard } from './dashboard-ui';

export function ScreenHeader({ title, subtitle, actionLabel, onAction }: { title: string; subtitle?: string; actionLabel?: string; onAction?: () => void }) {
  return <View className="flex-row items-start justify-between gap-3">
    <View className="flex-1"><Text className="text-2xl font-bold text-[#0F172A]">{title}</Text>{subtitle ? <Text className="mt-1 text-[13px] leading-[18px] text-[#475569]">{subtitle}</Text> : null}</View>
    {onAction ? <Pressable accessibilityRole="button" onPress={onAction} className="flex-row items-center gap-1 rounded-[5px] bg-[#2563EB] px-3 py-2.5"><Plus size={16} color="white" /><Text className="text-xs font-bold text-white">{actionLabel ?? 'Add'}</Text></Pressable> : null}
  </View>;
}

export function EmptyState({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  return <SurfaceCard className="items-center gap-2 py-8">
    <View className="h-11 w-11 rounded-[16px] bg-[#EAF2FF]" />
    <Text className="text-sm font-bold text-[#0F172A]">{title}</Text>
    <Text className="max-w-[260px] text-center text-xs leading-[18px] text-[#475569]">{message}</Text>
    {onAction ? <Pressable onPress={onAction} className="mt-2 rounded-[5px] bg-[#2563EB] px-4 py-2.5"><Text className="text-xs font-bold text-white">{actionLabel}</Text></Pressable> : null}
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

export { colors };
