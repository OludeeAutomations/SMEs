import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';

export default function EaseOnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-bg-light dark:bg-bg-dark">
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs font-bold tracking-widest text-accent-blue uppercase mb-2">
          NEXT-GEN SME OPERATIONS
        </Text>

        <Text className="text-[28px] font-bold text-text-primary-light dark:text-text-primary-dark leading-[36px] mb-3">
          Run sales, inventory, invoices, and AI insights from one place.
        </Text>

        <Text className="text-[15px] leading-[22px] text-text-secondary-light dark:text-text-secondary-dark mb-6">
          Ease gives African SMEs a modern operating system with customer records, expense tracking, smart reminders, and predictive reporting.
        </Text>

        {/* Spacing wrapper for LinearGradient to ensure bottom margin applies correctly */}
        <View className="w-full mb-6 shadow-sm">
          <LinearGradient
            colors={['#059669', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 16, borderRadius: 28 }}
          >
            {/* Scrollable Middle Container Card with fixed height */}
            <View className="bg-white dark:bg-surface-dark rounded-[20px] p-3 w-full h-[220px]">
              <ScrollView 
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {/* Metric Card 1 */}
                <View className="bg-bg-light dark:bg-surface-2-dark border border-border-light dark:border-border-dark rounded-[16px] p-3.5 mb-3 shadow-xs">
                  <Text className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark font-inter">
                    ₦4.2M
                  </Text>
                  <Text className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mt-0.5 font-bold font-inter">
                    Monthly Revenue
                  </Text>
                </View>

                {/* Metric Card 2 */}
                <View className="bg-bg-light dark:bg-surface-2-dark border border-border-light dark:border-border-dark rounded-[16px] p-3.5 mb-3 shadow-xs">
                  <Text className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark font-inter">
                    94%
                  </Text>
                  <Text className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mt-0.5 font-bold font-inter">
                    Health Score
                  </Text>
                </View>

                {/* Metric Card 3 */}
                <View className="bg-bg-light dark:bg-surface-2-dark border border-border-light dark:border-border-dark rounded-[16px] p-3.5 mb-3 shadow-xs">
                  <Text className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark font-inter">
                    18
                  </Text>
                  <Text className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mt-0.5 font-bold font-inter">
                    Low Stock
                  </Text>
                </View>

                {/* Metric Card 4 */}
                <View className="bg-bg-light dark:bg-surface-2-dark border border-border-light dark:border-border-dark rounded-[16px] p-3.5 mb-3 shadow-xs">
                  <Text className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark font-inter">
                    5
                  </Text>
                  <Text className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mt-0.5 font-bold font-inter">
                    Open Invoices
                  </Text>
                </View>

                {/* Metric Card 5 */}
                <View className="bg-bg-light dark:bg-surface-2-dark border border-border-light dark:border-border-dark rounded-[16px] p-3.5 shadow-xs">
                  <Text className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark font-inter">
                    ₦1.8M
                  </Text>
                  <Text className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mt-0.5 font-bold font-inter">
                    Monthly Expenses
                  </Text>
                </View>
              </ScrollView>
            </View>
          </LinearGradient>
        </View>

        {/* Feature Chips with added mt-4 margin to guarantee spacing from the stats container */}
        <View className="flex-row gap-2 mt-4 mb-8">
          <View className="bg-[#EAF2FF] dark:bg-[#2563EB]/15 px-3 py-1.5 rounded-full">
            <Text className="text-xs font-semibold text-[#2563EB] dark:text-[#60a5fa]">
              Sales
            </Text>
          </View>

          <View className="bg-[#E8FBF4] dark:bg-[#059669]/15 px-3 py-1.5 rounded-full">
            <Text className="text-xs font-semibold text-[#059669] dark:text-[#34d399]">
              Inventory
            </Text>
          </View>

          <View className="bg-[#F0EBFF] dark:bg-[#7C3AED]/15 px-3 py-1.5 rounded-full">
            <Text className="text-xs font-semibold text-[#7C3AED] dark:text-[#a78bfa]">
              AI Insights
            </Text>
          </View>
        </View>

        <View className="gap-y-3">
          <Button
            title="Create account"
            variant="primary"
            onPress={() => router.push('/(auth)/signup')}
            className="h-[56px] justify-center"
          />

          <Button
            title="I already have an account"
            variant="secondary"
            onPress={() => router.push('/(auth)/login')}
            className="h-[56px] justify-center border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark"
            textClassName="text-text-primary-light dark:text-text-primary-dark"
          />
        </View>

        <Text className="text-xs text-text-muted-light dark:text-text-muted-dark text-center mt-6">
          Secure access, OTP verification, and encrypted business data.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
