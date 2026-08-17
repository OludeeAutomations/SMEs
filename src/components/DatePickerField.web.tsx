import React from 'react';
import { Text, View } from 'react-native';

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
}

const toDateKey = (date?: Date) => date ? [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-') : undefined;

export function DatePickerField({ label, value, onChange, minimumDate, maximumDate, error }: DatePickerFieldProps) {
  const input = React.createElement('input', {
    type: 'date',
    value,
    min: toDateKey(minimumDate),
    max: toDateKey(maximumDate),
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value),
    'aria-label': label,
    style: {
      width: '100%', height: 56, boxSizing: 'border-box', borderRadius: 5,
      border: `1px solid ${error ? '#DC2626' : '#E7EBF1'}`, backgroundColor: '#FFFFFF',
      color: '#0F172A', fontFamily: 'inherit', fontSize: 14, padding: '0 16px',
    },
  });

  return <View className="w-full gap-1.5">
    <Text className="ml-1 text-xs font-semibold text-[#334155]">{label}</Text>
    {input}
    {error ? <Text className="ml-1.5 text-[11px] font-medium text-[#DC2626]">{error}</Text> : null}
  </View>;
}

export default DatePickerField;
