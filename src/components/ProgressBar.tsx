import React from 'react';
import { View, Text } from 'react-native';

interface ProgressBarProps {
  progress: number; // between 0 and 100
  colorClassName?: string;
  railClassName?: string;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  colorClassName = 'bg-accent-blue',
  railClassName = 'bg-surface-2-light dark:bg-surface-2-dark',
  showLabel = false,
  className = '',
}) => {
  const cappedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View className={`w-full flex-col gap-1 ${className}`}>
      <View className={`w-full h-2 rounded-full overflow-hidden ${railClassName}`}>
        <View
          style={{ width: `${cappedProgress}%` }}
          className={`h-full rounded-full ${colorClassName}`}
        />
      </View>
      {showLabel && (
        <Text className="text-[10px] text-right font-medium font-inter text-text-secondary-light dark:text-text-secondary-dark">
          {Math.round(cappedProgress)}% Completed
        </Text>
      )}
    </View>
  );
};

export default ProgressBar;
