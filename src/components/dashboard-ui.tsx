import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';

export const colors = {
  bg: '#F5F7FB',
  surface: '#FFFFFF',
  surface2: '#F2F5FA',
  border: '#DCE3EE',
  text: '#0F172A',
  secondary: '#475569',
  muted: '#94A3B8',
  blue: '#2563EB',
  green: '#10B981',
  amber: '#F59E0B',
  purple: '#7C3AED',
};

export function SurfaceCard({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return <View className={`rounded-3xl border border-[#DCE3EE] bg-white p-4 ${className}`}>{children}</View>;
}

export function MetricCard({ label, value, color = colors.text, className = '' }: { label: string; value: string; color?: string; className?: string }) {
  return (
    <SurfaceCard className={`min-h-24 flex-1 justify-between ${className}`}>
      <Text className="text-[11px] text-[#475569]">{label}</Text>
      <Text className="font-mono text-lg font-bold" style={{ color }}>{value}</Text>
    </SurfaceCard>
  );
}

export function BarChart({ heights, compact = false }: { heights: number[]; compact?: boolean }) {
  return (
    <View className={`flex-row items-end gap-2 ${compact ? 'h-[52px]' : 'h-[120px]'}`}>
      {heights.map((height, index) => (
        <View
          key={`${height}-${index}`}
          className={`flex-1 rounded-lg ${index === 3 || index === 5 ? 'bg-[#10B981]' : 'bg-[#2563EB]'}`}
          style={{ height }}
        />
      ))}
    </View>
  );
}

export function GradientCard({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <LinearGradient colors={['#2563EB', '#10B981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className={`overflow-hidden rounded-3xl p-4 ${className}`}>
      {children}
    </LinearGradient>
  );
}

export function QuickAction({ label, icon: Icon, onPress }: { label: string; icon: LucideIcon; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="h-[92px] w-[31%] items-center justify-center gap-2 rounded-[22px] border border-[#DCE3EE] bg-white p-3">
      <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#F2F5FA]">
        <Icon size={21} color={colors.blue} />
      </View>
      <Text className="text-[11px] font-semibold text-[#0F172A]">{label}</Text>
    </Pressable>
  );
}

export function ListRow({ title, subtitle, value, icon: Icon, tint = '#EAF2FF', onPress }: { title: string; subtitle: string; value?: string; icon?: LucideIcon; tint?: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-[14px]" style={{ backgroundColor: tint }}>
          {Icon ? <Icon size={18} color={colors.blue} /> : null}
        </View>
        <View>
          <Text className="text-[13px] font-semibold text-[#0F172A]">{title}</Text>
          <Text className="mt-0.5 text-[11px] text-[#475569]">{subtitle}</Text>
        </View>
      </View>
      {value ? <Text className="font-mono text-[12px] font-bold text-[#0F172A]">{value}</Text> : null}
    </Pressable>
  );
}

export function MoreTile({ title, subtitle, icon: Icon, color, tint, onPress }: { title: string; subtitle: string; icon: LucideIcon; color: string; tint: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="h-[124px] w-[48%] rounded-[22px] border border-[#DCE3EE] bg-white p-3.5">
      <View className="h-[38px] w-[38px] items-center justify-center rounded-[14px]" style={{ backgroundColor: tint }}>
        <Icon size={18} color={color} />
      </View>
      <Text className="mt-2 text-sm font-bold text-[#0F172A]">{title}</Text>
      <Text className="mt-1 text-[11px] leading-[14px] text-[#475569]">{subtitle}</Text>
    </Pressable>
  );
}
