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
  deepBlue: '#0B1F5E',
  green: '#10B981',
  amber: '#F59E0B',
  purple: '#7C3AED',
};

export function SurfaceCard({ children, className = '', onPress }: React.PropsWithChildren<{ className?: string; onPress?: () => void }>) {
  const content = <View className={`rounded-[5px] border border-[#DCE3EE] bg-white p-4 ${className}`}>{children}</View>;
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress}>{content}</Pressable> : content;
}

export function MetricCard({ label, value, color = colors.text, className = '' }: { label: string; value: string; color?: string; className?: string }) {
  return (
    <SurfaceCard className={`min-h-24 flex-1 justify-between ${className}`}>
      <Text className="text-[11px] text-[#475569]">{label}</Text>
      <Text className="font-mono text-lg font-bold" style={{ color }}>{value}</Text>
    </SurfaceCard>
  );
}

export function BarChart({
  values,
  comparison,
  labels,
  valueLabel,
  comparisonLabel,
  color = colors.blue,
  comparisonColor = colors.amber,
  compact = false,
}: {
  values: number[];
  comparison?: number[];
  labels: string[];
  valueLabel: string;
  comparisonLabel?: string;
  color?: string;
  comparisonColor?: string;
  compact?: boolean;
}) {
  const secondary = comparison ?? [];
  const maxValue = Math.max(1, ...values, ...secondary);
  const chartHeight = compact ? 52 : 120;
  const barHeight = (value: number) => value > 0 ? Math.max(6, (value / maxValue) * chartHeight) : 2;

  return (
    <View className="gap-2">
      <View className={`flex-row items-end gap-2 border-b border-[#DCE3EE] ${compact ? 'h-[52px]' : 'h-[120px]'}`}>
        {labels.map((label, index) => (
          <View key={label} className="h-full flex-1 flex-row items-end justify-center gap-1">
            <View accessibilityLabel={`${label} ${valueLabel}: ${values[index] ?? 0}`} className={`${comparison ? 'w-[36%]' : 'w-[58%]'} rounded-t-[4px]`} style={{ height: barHeight(values[index] ?? 0), backgroundColor: color }} />
            {comparison ? <View accessibilityLabel={`${label} ${comparisonLabel}: ${comparison[index] ?? 0}`} className="w-[36%] rounded-t-[4px]" style={{ height: barHeight(comparison[index] ?? 0), backgroundColor: comparisonColor }} /> : null}
          </View>
        ))}
      </View>
      <View className="flex-row gap-2">
        {labels.map((label) => <Text key={label} className="flex-1 text-center text-[9px] text-[#64748B]">{label}</Text>)}
      </View>
      <View className="flex-row items-center gap-4">
        <View className="flex-row items-center gap-1.5"><View className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} /><Text className="text-[10px] text-[#475569]">{valueLabel}</Text></View>
        {comparison && comparisonLabel ? <View className="flex-row items-center gap-1.5"><View className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: comparisonColor }} /><Text className="text-[10px] text-[#475569]">{comparisonLabel}</Text></View> : null}
      </View>
    </View>
  );
}

export function GradientCard({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <View className="w-full overflow-hidden rounded-[5px]">
      <LinearGradient
        colors={['#2563EB', '#10B981']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: '100%', padding: 16 }}
      >
        <View className={`w-full ${className}`}>{children}</View>
      </LinearGradient>
    </View>
  );
}

export function QuickAction({ label, icon: Icon, onPress }: { label: string; icon: LucideIcon; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="h-[92px] w-[31%] items-center justify-center gap-2 rounded-[5px] border border-[#1D4ED8] bg-[#1D4ED8] p-3 active:opacity-90">
      <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#0B1F5E]">
        <Icon size={21} color="#BFDBFE" />
      </View>
      <Text className="text-[11px] font-semibold text-white">{label}</Text>
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

export function MoreTile({ title, subtitle, icon: Icon, color, tint, onPress, dark = false }: { title: string; subtitle: string; icon: LucideIcon; color: string; tint: string; onPress: () => void; dark?: boolean }) {
  return (
    <Pressable onPress={onPress} className={`h-[124px] w-[48%] rounded-[5px] border p-3.5 active:opacity-90 ${dark ? 'border-[#1D4ED8] bg-[#1D4ED8]' : 'border-[#DCE3EE] bg-white'}`}>
      <View className="h-[38px] w-[38px] items-center justify-center rounded-[14px]" style={{ backgroundColor: tint }}>
        <Icon size={18} color={color} />
      </View>
      <Text className={`mt-2 text-sm font-bold ${dark ? 'text-white' : 'text-[#0F172A]'}`}>{title}</Text>
      <Text className={`mt-1 text-[11px] leading-[14px] ${dark ? 'text-[#DBEAFE]' : 'text-[#475569]'}`}>{subtitle}</Text>
    </Pressable>
  );
}
