import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import StatWidget from '@/components/StatWidget';
import ProgressBar from '@/components/ProgressBar';




export default function EaseAutomationScreen() {
  const router = useRouter();
  const hasForm = false;

  

  return (
    <SafeAreaView className="flex-1 bg-bg-light dark:bg-bg-dark">
      <ScrollView contentContainerStyle={{ padding: 20 }} className="flex-1">
        
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-widest text-accent-blue font-inter mb-1">
              EASE AUTOMATION
            </Text>
            <Text className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark font-inter">
              {"Invoice reminders"}
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
          </View>
        ) : null}

        {/* General Screen Info */}
        {true ? (
          <Card className="mb-6">
            <Text className="text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
              Designed Layout Highlights
            </Text>
            <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Automation"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Auto-send when due date is near"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"On"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Low stock alerts"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Notify the storekeeper instantly"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Weekly report"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Email summary every Friday"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"BUSINESS WORKFLOW"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"If a customer misses payment, create a follow-up reminder and log the activity automatically."}
        </Text>
          </Card>
        ) : null}

        {/* Actions */}
        <View className="mt-4">
          
                  <Button
          title="Home"
          variant="secondary"
          onPress={() => router.push('/(app)/(tabs)/home')}
          className="mb-3"
        />
        <Button
          title="Sales"
          variant="secondary"
          onPress={() => router.push('/(app)/(tabs)/home')}
          className="mb-3"
        />
        <Button
          title="AI"
          variant="secondary"
          onPress={() => router.push('/(app)/(tabs)/home')}
          className="mb-3"
        />
        <Button
          title="Reports"
          variant="secondary"
          onPress={() => router.push('/(app)/(tabs)/home')}
          className="mb-3"
        />
        <Button
          title="More"
          variant="secondary"
          onPress={() => router.push('/(app)/(tabs)/home')}
          className="mb-3"
        />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
