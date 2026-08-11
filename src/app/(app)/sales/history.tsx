import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import StatWidget from '@/components/StatWidget';
import ProgressBar from '@/components/ProgressBar';




export default function EaseSalesHistoryScreen() {
  const router = useRouter();
  const hasForm = false;

  

  return (
    <SafeAreaView className="flex-1 bg-bg-light dark:bg-bg-dark">
      <ScrollView contentContainerStyle={{ padding: 20 }} className="flex-1">
        
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-widest text-accent-blue font-inter mb-1">
              EASE SALES HISTORY
            </Text>
            <Text className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark font-inter">
              {"Wholesale rice order"}
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
            title="₦286k"
            value="Today"
            className="mb-3"
          />
          <StatWidget
            title="84"
            value="Orders"
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
          • {"Sales history"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"POS-2041"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Blue Nile Foods"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"₦82k"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"POS-2040"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"₦140k"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"POS-2039"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Card payment confirmed"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"₦64k"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"POS-2038"}
        </Text>
          </Card>
        ) : null}

        {/* Actions */}
        <View className="mt-4">
          
                  <Button
          title="All Sales"
          variant="secondary"
          onPress={() => router.push('/(app)/(tabs)/home')}
          className="mb-3"
        />
        <Button
          title="Cash"
          variant="secondary"
          onPress={() => router.push('/(app)/(tabs)/home')}
          className="mb-3"
        />
        <Button
          title="Transfer"
          variant="secondary"
          onPress={() => router.push('/(app)/(tabs)/home')}
          className="mb-3"
        />
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
