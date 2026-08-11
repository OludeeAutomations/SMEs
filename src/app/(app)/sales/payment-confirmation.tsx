import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import StatWidget from '@/components/StatWidget';
import ProgressBar from '@/components/ProgressBar';




export default function EasePaymentConfirmationScreen() {
  const router = useRouter();
  const hasForm = false;

  

  return (
    <SafeAreaView className="flex-1 bg-bg-light dark:bg-bg-dark">
      <ScrollView contentContainerStyle={{ padding: 20 }} className="flex-1">
        
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-widest text-accent-blue font-inter mb-1">
              EASE PAYMENT CONFIRMATION
            </Text>
            <Text className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark font-inter">
              {"Payment confirmed"}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text className="text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark mb-6 font-inter">
            {"Blue Nile Foods has paid in full. The receipt is ready to share and the invoice status has been updated."}
          </Text>

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
          • {"₦82,000"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Send receipt"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Share on WhatsApp"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Done"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Add follow-up"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Schedule reminder"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Soon"}
        </Text>
          </Card>
        ) : null}

        {/* Actions */}
        <View className="mt-4">
          
          
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
