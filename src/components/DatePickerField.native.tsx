import React, { useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { CalendarDays } from 'lucide-react-native';

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
}

const parseDate = (value: string) => {
  const parts = value.split('-').map(Number);
  if (parts.length === 3 && parts.every(Number.isFinite)) return new Date(parts[0], parts[1] - 1, parts[2], 12);
  return new Date();
};

const toDateKey = (date: Date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

export function DatePickerField({ label, value, onChange, minimumDate, maximumDate, error }: DatePickerFieldProps) {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(() => parseDate(value));
  const selectedDate = parseDate(value);

  const open = () => {
    setDraft(selectedDate);
    setVisible(true);
  };
  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    setVisible(false);
    if (event.type === 'set' && date) onChange(toDateKey(date));
  };

  return <View className="w-full gap-1.5">
    <Text className="ml-1 text-xs font-semibold text-[#334155]">{label}</Text>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Choose ${label.toLowerCase()}`}
      onPress={open}
      className={`h-[56px] w-full flex-row items-center justify-between rounded-[5px] border bg-white px-4 ${error ? 'border-[#DC2626]' : 'border-[#E7EBF1]'}`}
    >
      <Text className="text-sm text-[#0F172A]">{selectedDate.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
      <CalendarDays size={20} color="#2563EB" />
    </Pressable>
    {error ? <Text className="ml-1.5 text-[11px] font-medium text-[#DC2626]">{error}</Text> : null}

    {Platform.OS === 'android' && visible ? <DateTimePicker
      value={selectedDate}
      mode="date"
      display="default"
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      onChange={handleAndroidChange}
    /> : null}

    {Platform.OS === 'ios' ? <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={() => setVisible(false)} />
        <View className="rounded-t-[24px] bg-white px-5 pb-8 pt-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Pressable onPress={() => setVisible(false)} className="px-2 py-3"><Text className="font-semibold text-[#64748B]">Cancel</Text></Pressable>
            <Text className="text-base font-bold text-[#0F172A]">Choose {label.toLowerCase()}</Text>
            <Pressable onPress={() => { onChange(toDateKey(draft)); setVisible(false); }} className="px-2 py-3"><Text className="font-bold text-[#2563EB]">Done</Text></Pressable>
          </View>
          <DateTimePicker
            value={draft}
            mode="date"
            display="inline"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={(_, date) => date && setDraft(date)}
            themeVariant="light"
            accentColor="#2563EB"
          />
        </View>
      </View>
    </Modal> : null}
  </View>;
}

export default DatePickerField;
