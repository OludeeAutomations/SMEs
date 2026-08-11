import React from 'react';
import { TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

interface AuthBackButtonProps {
  fallback: string;
}

export default function AuthBackButton({ fallback }: AuthBackButtonProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallback as never);
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Go back"
      activeOpacity={0.7}
      onPress={handlePress}
      className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-surface-dark"
    >
      <ArrowLeft size={20} color={colorScheme === 'dark' ? '#F8FAFC' : '#0F172A'} />
    </TouchableOpacity>
  );
}
