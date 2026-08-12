import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  textClassName?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  className = '',
  textClassName = '',
  onPress,
  ...props
}) => {
  // Styles for different button variants
  const variantStyles = {
    primary: 'bg-accent-blue active:bg-blue-700',
    secondary: 'bg-surface-2-light dark:bg-surface-2-dark active:opacity-80',
    outline: 'border border-accent-blue bg-transparent active:bg-accent-blue/10',
    ghost: 'bg-transparent active:bg-surface-2-light dark:active:bg-surface-2-dark',
    danger: 'bg-danger active:bg-red-700',
    success: 'bg-accent-emerald active:bg-emerald-700',
  };

  const textColors = {
    primary: 'text-white font-bold',
    secondary: 'text-text-primary-light dark:text-text-primary-dark font-semibold',
    outline: 'text-accent-blue font-bold',
    ghost: 'text-accent-blue font-semibold',
    danger: 'text-white font-bold',
    success: 'text-white font-bold',
  };

  const sizeStyles = {
    sm: 'py-2 px-4 rounded-[5px]',
    md: 'py-3.5 px-6 rounded-[5px]',
    lg: 'py-4 px-8 rounded-[5px] w-full',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center transition-all ${sizeStyles[size]} ${variantStyles[variant]} ${
        isDisabled ? 'opacity-50' : ''
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' || variant === 'ghost' ? '#2563EB' : '#FFFFFF'}
        />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon && <View className="mr-1">{icon}</View>}
          <Text className={`text-center font-inter ${textSizeStyles[size]} ${textColors[variant]} ${textClassName}`}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
