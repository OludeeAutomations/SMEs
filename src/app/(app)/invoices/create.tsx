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
  customer: z.string().min(2, 'Customer is required'),
  duedate: z.string().min(2, 'Due date is required'),
  reference: z.string().min(2, 'Reference is required')
});

type FormData = z.infer<typeof formSchema>;


export default function EaseCreateInvoiceScreen() {
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
              EASE CREATE INVOICE
            </Text>
            <Text className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark font-inter">
              {"Premium Rice 50kg"}
            </Text>
          </View>
        </View>

        

        {/* Form Fields */}
        {hasForm ? (
          <View className="mb-6">
            <Controller
          control={control}
          name="customer"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Customer"
              placeholder="Select customer"
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
          name="duedate"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Due date"
              placeholder="26 Jul 2026"
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
          name="reference"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Reference"
              placeholder="INV-3044"
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
            title="₦146k"
            value="Subtotal"
            className="mb-3"
          />
          <StatWidget
            title="₦146k"
            value="Total"
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
          • {"Create invoice"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"LINE ITEMS"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"2 units x ₦36,000"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"₦72k"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Cooking Oil 5L"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"4 units x ₦18,500"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"₦74k"}
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
