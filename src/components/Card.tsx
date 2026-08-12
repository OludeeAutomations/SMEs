import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'flat' | 'elevated' | 'outlined';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'flat',
  className = '',
  ...props
}) => {
  const variantStyles = {
    flat: 'bg-surface-light dark:bg-surface-dark border border-border-light/40 dark:border-border-dark/40',
    elevated: 'bg-surface-light dark:bg-surface-dark shadow-sm shadow-text-primary-light/5 dark:shadow-black/50 elevation-1',
    outlined: 'bg-transparent border border-border-light dark:border-border-dark',
  };

  return (
    <View
      className={`p-4 rounded-[5px] overflow-hidden ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};

export default Card;
