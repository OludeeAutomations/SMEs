import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { colors, SurfaceCard } from '@/components/dashboard-ui';

export default function EaseAIAssistantScreen() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('Revenue may grow 14% if stock gaps are fixed');
  const ask = (prompt: string) => {
    setQuestion(prompt);
    setAnswer(prompt.toLowerCase().includes('stock') ? '18 fast-moving products need restocking this week.' : 'Revenue may grow 14% if stock gaps are fixed');
  };
  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between"><Text className="text-2xl font-bold text-[#0F172A]">AI Assistant</Text><Pressable onPress={() => { setQuestion(''); setAnswer(''); }}><Plus size={23} color={colors.blue} /></Pressable></View>
        <SurfaceCard className="min-h-[132px]">
          <TextInput value={question} onChangeText={setQuestion} onSubmitEditing={() => ask(question)} multiline placeholder="Ask about profit, customers, stock, cash flow, and forecasts in natural language." placeholderTextColor="#475569" className="min-h-[96px] text-[13px] leading-5 text-[#0F172A]" />
        </SurfaceCard>
        <View className="flex-row gap-2">
          {['How much profit did I make?', 'Show low stock items'].map((prompt, index) => <Pressable key={prompt} onPress={() => ask(prompt)} className={`rounded-full px-3 py-2 ${index === 0 ? 'bg-[#2563EB]' : 'border border-[#DCE3EE] bg-white'}`}><Text className={`text-[10px] font-semibold ${index === 0 ? 'text-white' : 'text-[#0F172A]'}`}>{prompt}</Text></Pressable>)}
        </View>
        <SurfaceCard className="py-1">
          <View className="flex-row items-center gap-3 py-3"><View className="h-9 w-9 rounded-[14px] bg-[#EAF2FF]" /><View className="flex-1"><Text className="text-xs font-semibold text-[#0F172A]">You</Text><Text className="mt-1 text-[11px] text-[#475569]">{question || "Predict next month's revenue"}</Text></View><Text className="font-mono text-xs font-bold text-[#0F172A]">₦4.8M</Text></View>
          <View className="h-px bg-[#DCE3EE]" />
          <View className="flex-row items-center gap-3 py-3"><View className="h-9 w-9 rounded-[14px] bg-[#E8FBF4]" /><View className="flex-1"><Text className="text-xs font-semibold text-[#0F172A]">Ease</Text><Text className="mt-1 text-[11px] text-[#475569]">{answer || 'Ask a question to get an insight.'}</Text></View><Text className="font-mono text-xs font-bold text-[#0F172A]">₦5.1M</Text></View>
        </SurfaceCard>
        <View className="rounded-[5px] border border-[#BFDBFE] bg-[#EFF6FF] p-4"><Text className="text-[10px] font-bold text-[#2563EB]">SMART RECOMMENDATION</Text><Text className="mt-2 text-xs leading-[18px] text-[#0F172A]">Send a weekly report every Friday at 5pm and remind overdue customers automatically.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}
