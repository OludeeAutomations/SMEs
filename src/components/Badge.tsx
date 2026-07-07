import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  type?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
  textClassName?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  type = 'neutral',
  className = '',
  textClassName = '',
}) => {
  const typeStyles = {
    success: 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30',
    danger: 'bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30',
    info: 'bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30',
    neutral: 'bg-surface-2-light dark:bg-surface-2-dark border border-border-light dark:border-border-dark',
  };

  const labelColors = {
    success: 'text-accent-emerald dark:text-emerald-400 font-semibold',
    warning: 'text-accent-orange dark:text-amber-400 font-semibold',
    danger: 'text-danger dark:text-red-400 font-semibold',
    info: 'text-accent-blue dark:text-blue-400 font-semibold',
    neutral: 'text-text-secondary-light dark:text-text-secondary-dark font-medium',
  };

  return (
    <View
      className={`px-3 py-1 rounded-full items-center justify-center self-start ${typeStyles[type]} ${className}`}
    >
      <Text className={`text-[10px] uppercase font-inter tracking-wider ${labelColors[type]} ${textClassName}`}>
        {label}
      </Text>
    </View>
  );
};

export default Badge;
