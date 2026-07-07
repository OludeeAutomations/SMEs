import React from 'react';
import { View, Text } from 'react-native';
import Card from './Card';

interface StatWidgetProps {
  title: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: {
    label: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  className?: string;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  title,
  value,
  subValue,
  icon,
  trend,
  className = '',
}) => {
  const trendColors = {
    positive: 'text-accent-emerald bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400',
    negative: 'text-danger bg-red-50 dark:bg-red-950/20 dark:text-red-400',
    neutral: 'text-text-secondary-light bg-surface-2-light dark:bg-surface-2-dark dark:text-text-secondary-dark',
  };

  return (
    <Card className={`flex-col justify-between min-h-[110px] flex-1 ${className}`}>
      <View className="flex-row items-center justify-between w-full mb-2">
        <Text className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider font-inter">
          {title}
        </Text>
        {icon && <View className="opacity-75">{icon}</View>}
      </View>

      <View className="flex-row items-end justify-between w-full">
        <View className="flex-col justify-end">
          <Text className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark font-inter">
            {value}
          </Text>
          {subValue && (
            <Text className="text-[10px] text-text-muted-light dark:text-text-muted-dark font-inter mt-0.5">
              {subValue}
            </Text>
          )}
        </View>

        {trend && (
          <View className={`px-2 py-0.5 rounded-lg ${trendColors[trend.type]}`}>
            <Text className="text-[9px] font-bold font-inter">{trend.label}</Text>
          </View>
        )}
      </View>
    </Card>
  );
};

export default StatWidget;
