import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Home, TrendingUp, Bot, BarChart3, LayoutGrid } from 'lucide-react-native';
import { Colors } from '../../../constants/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: themeColors.accentBlue,
        tabBarInactiveTintColor: themeColors.textMuted,
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 10,
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.border,
          borderColor: themeColors.border,
          borderWidth: 1,
          height: 70,
          borderRadius: 26,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          fontFamily: 'Inter',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size - 2} />,
        }}
      />
      
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Sales',
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size - 2} />,
        }}
      />
      
      <Tabs.Screen
        name="ai"
        options={{
          title: 'Ease AI',
          tabBarIcon: ({ color, size }) => <Bot color={color} size={size - 2} />,
        }}
      />
      
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size - 2} />,
        }}
      />
      
      <Tabs.Screen
        name="hub"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size - 2} />,
        }}
      />
    </Tabs>
  );
}
