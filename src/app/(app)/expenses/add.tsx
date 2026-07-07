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
  expensename: z.string().min(2, 'Expense name is required'),
  amount: z.string().min(2, 'Amount is required'),
  category: z.string().min(2, 'Category is required'),
  paidvia: z.string().min(2, 'Paid via is required'),
  date: z.string().min(2, 'Date is required')
});

type FormData = z.infer<typeof formSchema>;


export default function EaseAddExpenseScreen() {
  const router = useRouter();

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
              EASE ADD EXPENSE
            </Text>
            <Text className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark font-inter">
              {"Attach a receipt and tag the branch or cost center for accurate reporting."}
            </Text>
          </View>
        </View>

        

        {/* Form Fields */}
        {hasForm ? (
          <View className="mb-6">
            <Controller
          control={control}
          name="expensename"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Expense name"
              placeholder="Fuel refill"
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
          name="amount"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Amount"
              placeholder="₦42,000"
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
          name="category"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Category"
              placeholder="Fuel"
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
          name="paidvia"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Paid via"
              placeholder="Cash / Transfer"
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
          name="date"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Date"
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
        {false ? (
          <Card className="mb-6">
            <Text className="text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
              Designed Layout Highlights
            </Text>
            <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"Add expense"}
        </Text>
        <Text className="text-sm font-inter text-text-secondary-light dark:text-text-secondary-dark mb-2">
          • {"NOTES"}
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
          title="Save expense"
          variant="primary"
          onPress={() => router.push('/(app)/(tabs)/home')}
          className="mb-3"
        />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
