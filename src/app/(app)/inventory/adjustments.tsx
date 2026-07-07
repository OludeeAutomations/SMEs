import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import StatWidget from '@/components/StatWidget';
import ProgressBar from '@/components/ProgressBar';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/Input';


const formSchema = z.object({
  premiumCookingOil5L: z.string().min(2, 'Premium Cooking Oil 5L is required'),
  quantityDelta: z.string().min(2, 'Quantity Delta is required'),
  "-2units": z.string().min(2, '-2 units is required'),
  "damaged/Leaked": z.string().min(2, 'Damaged / Leaked is required')
});

type FormData = z.infer<typeof formSchema>;


export default function EaseInventoryStockAdjustmentsScreen() {
  const router = useRouter();
  const hasForm = true;

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {}
  });

  const onSubmit = (data: FormData) => {
    console.log('Submitted:', data);
    router.push('/(app)/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-light dark:bg-bg-dark">
      <ScrollView contentContainerStyle={{ padding: 20 }} className="flex-1">
        
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-widest text-accent-blue font-inter mb-1">
              EASE INVENTORY STOCK ADJUSTMENTS
            </Text>
            <Text className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark font-inter">
              {"Stock Adjustments"}
            </Text>
          </View>
        </View>

        {/* Form Fields */}
        {hasForm ? (
          <View className="mb-6">
            <Controller
          control={control}
          name="premiumCookingOil5L"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Premium Cooking Oil 5L"
              placeholder="Enter premium cooking oil 5l"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              isPassword={false}
              containerClassName="mb-3"
            />
          )}
        />

        <Controller
          control={control}
          name="quantityDelta"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Quantity Delta"
              placeholder="Enter quantity delta"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              isPassword={false}
              containerClassName="mb-3"
            />
          )}
        />

        <Controller
          control={control}
          name="-2units"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="-2 units"
              placeholder="Enter -2 units"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              isPassword={false}
              containerClassName="mb-3"
            />
          )}
        />

        <Controller
          control={control}
          name="damaged/Leaked"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Damaged / Leaked"
              placeholder="Enter damaged / leaked"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              isPassword={false}
              containerClassName="mb-3"
            />
          )}
        />
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
            title="4 items"
            value="LOGGED TODAY"
            className="mb-3"
          />
          </View>
        ) : null}

        {/* General Screen Info */}
        {false ? (
          <Card className="mb-6">
            <Text className="text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
              Designed Layout Highlights
            </Text>
            <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Adjust stock counts for damage, theft, or audit logs."}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"New Stock Adjustment"}
        </Text>
          </Card>
        ) : null}

        {/* Actions */}
        <View className="mt-4">
          
          <Button
            title="Submit"
            variant="primary"
            onPress={handleSubmit(onSubmit)}
            className="mb-3"
          />
                  <Button
          title="Log Adjustment"
          variant="secondary"
          onPress={() => router.push('/(app)/(tabs)/home')}
          className="mb-3"
        />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
