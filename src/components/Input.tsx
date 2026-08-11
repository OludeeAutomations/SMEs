import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  containerClassName?: string;
  inputClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  isPassword = false,
  containerClassName = '',
  inputClassName = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const isPasswordInput = isPassword;

  return (
    <View className={`w-full flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <Text className="ml-1 font-inter text-xs font-semibold text-[#334155] dark:text-[#CBD5E1]">
          {label}
        </Text>
      )}
      
      <View
        className={`h-[56px] w-full flex-row items-center rounded-2xl border-2 bg-white px-4 dark:bg-[#162235] ${
          error
            ? 'border-[#DC2626]'
            : isFocused
            ? 'border-[#2563EB]'
            : 'border-[#CBD5E1] dark:border-[#334155]'
        }`}
      >
        {leftIcon && <View className="mr-3 opacity-60">{leftIcon}</View>}
        
        <TextInput
          secureTextEntry={isPasswordInput && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#64748B"
          className={`flex-1 text-sm text-text-primary-light dark:text-text-primary-dark font-inter h-full py-0 ${inputClassName}`}
          style={{ textAlignVertical: 'center' }}
          {...props}
        />
        
        {isPasswordInput && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
            className="p-1"
          >
            {showPassword ? (
              <EyeOff size={20} color="#94A3B8" />
            ) : (
              <Eye size={20} color="#94A3B8" />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="text-[11px] text-danger ml-1.5 font-inter font-medium">
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;
