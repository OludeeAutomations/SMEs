import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bot, Lightbulb, Send, Sparkles } from 'lucide-react-native';
import { EmptyState, ScreenHeader } from '@/components/business-ui';
import { SurfaceCard } from '@/components/dashboard-ui';
import { useAuthStore } from '@/store/authStore';
import { useBusinessStore, useWorkspace } from '@/store/businessStore';
import { BusinessAdvice, getBusinessAdvice } from '@/services/businessAdvisor';

const prompts = [
  'What should I focus on?',
  'Which stock should I reorder?',
  'How is profit this month?',
  'Who should I collect from?',
];

export default function AIScreen() {
  const workspace = useWorkspace();
  const currency = useAuthStore((state) => state.business?.currency ?? 'NGN');
  const business = useAuthStore((state) => state.business);
  const addAIExchange = useBusinessStore((state) => state.addAIExchange);
  const [question, setQuestion] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const [advice, setAdvice] = useState<BusinessAdvice | null>(null);
  const hasData = Boolean(workspace.sales.length || workspace.expenses.length || workspace.products.length || workspace.invoices.length || workspace.customers.length);

  const ask = (value = question) => {
    const cleanQuestion = value.trim();
    if (!cleanQuestion) return;
    const nextAdvice = getBusinessAdvice(cleanQuestion, workspace, currency);
    setLastQuestion(cleanQuestion);
    setAdvice(nextAdvice);
    addAIExchange(cleanQuestion, [nextAdvice.title, nextAdvice.answer, ...nextAdvice.insights, ...nextAdvice.actions].join('\n'));
    setQuestion('');
  };

  return <SafeAreaView className="flex-1 bg-[#F5F7FB]" edges={['top']}>
    <ScrollView contentContainerClassName="gap-4 px-5 pb-28 pt-5" keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Business Assistant" subtitle={`Advice based on ${business?.name ?? 'your business'} data.`} />

      <SurfaceCard className="gap-3">
        <View className="flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-[14px] bg-[#EAF2FF]"><Bot size={19} color="#2563EB" /></View>
          <View className="flex-1"><Text className="text-sm font-bold text-[#0F172A]">Ask Ease</Text><Text className="text-[11px] text-[#475569]">Sales, profit, stock, expenses, debt, or customers</Text></View>
        </View>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          onSubmitEditing={() => ask()}
          multiline
          placeholder="e.g. What should I restock and why?"
          placeholderTextColor="#94A3B8"
          className="min-h-[76px] rounded-[5px] bg-[#F2F5FA] px-3 py-3 text-[13px] leading-5 text-[#0F172A]"
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Ask Ease" disabled={!question.trim()} onPress={() => ask()} className={`self-end flex-row items-center gap-2 rounded-[5px] px-4 py-2.5 ${question.trim() ? 'bg-[#0B1F5E]' : 'bg-[#94A3B8]'}`}>
          <Text className="text-xs font-bold text-white">Ask</Text><Send size={16} color="white" />
        </Pressable>
      </SurfaceCard>

      <View className="flex-row flex-wrap gap-2">
        {prompts.map((prompt) => <Pressable key={prompt} onPress={() => ask(prompt)} className="rounded-full border border-[#DCE3EE] bg-white px-3 py-2.5">
          <Text className="text-[10px] font-semibold text-[#0F172A]">{prompt}</Text>
        </Pressable>)}
      </View>

      {advice ? <>
        <SurfaceCard className="gap-3">
          <View className="flex-row items-center gap-2"><Sparkles size={17} color="#2563EB" /><Text className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">Ease analysis</Text></View>
          <Text className="text-[11px] text-[#64748B]">You asked: “{lastQuestion}”</Text>
          <Text className="text-lg font-bold text-[#0F172A]">{advice.title}</Text>
          <Text className="text-[13px] leading-5 text-[#0F172A]">{advice.answer}</Text>
          {advice.insights.map((insight) => <View key={insight} className="flex-row gap-2"><View className="mt-2 h-1.5 w-1.5 rounded-full bg-[#2563EB]" /><Text className="flex-1 text-[12px] leading-5 text-[#475569]">{insight}</Text></View>)}
        </SurfaceCard>

        <SurfaceCard className="gap-3 border-[#BFDBFE] bg-[#EFF6FF]">
          <View className="flex-row items-center gap-2"><Lightbulb size={18} color="#0B1F5E" /><Text className="text-xs font-bold text-[#0B1F5E]">RECOMMENDED NEXT STEPS</Text></View>
          {advice.actions.map((action, index) => <View key={action} className="flex-row gap-3">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-[#0B1F5E]"><Text className="text-[10px] font-bold text-white">{index + 1}</Text></View>
            <Text className="flex-1 text-[12px] leading-5 text-[#0F172A]">{action}</Text>
          </View>)}
          {advice.dataNote ? <Text className="border-t border-[#BFDBFE] pt-3 text-[10px] leading-4 text-[#64748B]">{advice.dataNote}</Text> : null}
        </SurfaceCard>
      </> : !hasData ? <EmptyState title="Add business data first" message="Record sales, products, expenses, invoices, or customers so Ease can give useful recommendations." /> : <SurfaceCard className="items-center gap-2 py-7"><Sparkles size={24} color="#2563EB" /><Text className="text-sm font-bold text-[#0F172A]">Ready to analyse your business</Text><Text className="text-center text-xs leading-5 text-[#475569]">Ask what to restock, where money is going, who owes you, or what to focus on next.</Text></SurfaceCard>}
    </ScrollView>
  </SafeAreaView>;
}
