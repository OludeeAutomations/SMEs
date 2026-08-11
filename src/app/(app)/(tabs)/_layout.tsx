import React from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: () => <View />,
        }}
      />
      
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Sales',
          tabBarIcon: () => <View />,
        }}
      />
      
      <Tabs.Screen
        name="ai"
        options={{
          title: 'Ease AI',
          tabBarIcon: () => <View />,
        }}
      />
      
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: () => <View />,
        }}
      />
      
      <Tabs.Screen
        name="hub"
        options={{
          title: 'More',
          tabBarIcon: () => <View />,
        }}
      />
    </Tabs>
  );
}
