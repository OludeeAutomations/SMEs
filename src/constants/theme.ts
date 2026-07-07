import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surface2: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    accentBlue: '#2563EB',
    accentEmerald: '#059669',
    accentIndigo: '#4F46E5',
    accentOrange: '#D97706',
    danger: '#DC2626',
    success: '#10B981',
    warning: '#F59E0B',
  },
  dark: {
    background: '#111B2D',
    surface: '#162235',
    surface2: '#1F2E46',
    textPrimary: '#F8FAFC',
    textSecondary: '#B7C3D6',
    textMuted: '#64748B',
    border: '#1E293B',
    accentBlue: '#3B82F6',
    accentEmerald: '#10B981',
    accentIndigo: '#6366F1',
    accentOrange: '#F59E0B',
    danger: '#EF4444',
    success: '#34D399',
    warning: '#FBBF24',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter',
    mono: 'System',
  },
  android: {
    sans: 'Inter',
    mono: 'monospace',
  },
  default: {
    sans: 'Inter',
    mono: 'monospace',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
export const BorderColors = {
  light: '#E2E8F0',
  dark: '#1E293B',
};
export const CardBorderRadius = 16;
export const ScreenBorderRadius = 32;
