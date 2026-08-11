import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import StatWidget from '@/components/StatWidget';
import ProgressBar from '@/components/ProgressBar';




export default function EaseInvoiceHistoryScreen() {
  const router = useRouter();
  const hasForm = false;

  

  return (
    <SafeAreaView className="flex-1 bg-bg-light dark:bg-bg-dark">
      <ScrollView contentContainerStyle={{ padding: 20 }} className="flex-1">
        
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-widest text-accent-blue font-inter mb-1">
              EASE INVOICE HISTORY
            </Text>
            <Text className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark font-inter">
              {"Invoice History"}
            </Text>
          </View>
        </View>

        

        {/* Form Fields */}
        {hasForm ? (
          <View className="mb-6">
    
          </View>
        ) : null}

        {/* Stat Widgets */}
        {true ? (
          <View className="flex-row flex-wrap gap-3 mb-6">
              <StatWidget
            title="Stat"
            value="9:41 AM"
            className="mb-3"
          />
          <StatWidget
            title="124"
            value="Sent"
            className="mb-3"
          />
          <StatWidget
            title="112"
            value="Paid"
            className="mb-3"
          />
          </View>
        ) : null}

        {/* General Screen Info */}
        {true ? (
          <Card className="mb-6">
            <Text className="text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
              Designed Layout Highlights
            </Text>
            <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Invoice history"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"INV-3021"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Blue Nile Foods"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"₦120k due"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"INV-3019"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Amina Trading"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"₦82k partial"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"INV-3011"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Kara Market"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"₦64k overdue"}
        </Text>
          </Card>
        ) : null}

        {/* Actions */}
        <View className="mt-4">
          
                  <Button
          title="Share invoice"
          variant="secondary"
          onPress={() => router.push('/(app)/(tabs)/home')}
          className="mb-3"
        />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
