import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  ChartNoAxesCombined,
  PackageSearch,
  ReceiptText,
  UsersRound,
  type LucideIcon,
} from 'lucide-react-native';
import {
  subscriptionService,
  trialDaysRemaining,
  type Subscription,
} from '@/services/subscription';

const benefits: { label: string; icon: LucideIcon }[] = [
  { label: 'Sales, invoices, and customer records', icon: ReceiptText },
  { label: 'Inventory and low-stock alerts', icon: PackageSearch },
  { label: 'Reports and AI business insights', icon: ChartNoAxesCombined },
  { label: 'Branches, teams, and automated reminders', icon: UsersRound },
];

const formatDate = (value: string | null) => {
  if (!value) return 'After your trial';
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const daysRemaining = useMemo(() => trialDaysRemaining(subscription), [subscription]);
  const trialActive = subscription?.status === 'TRIALING' && daysRemaining > 0;
  const paidActive = subscription?.status === 'ACTIVE';
  const hasAccess = trialActive || paidActive;

  useEffect(() => {
    let active = true;
    subscriptionService.get()
      .then((value) => { if (active) setSubscription(value); })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const startTrial = async () => {
    if (hasAccess) {
      router.back();
      return;
    }
    try {
      setStarting(true);
      const next = await subscriptionService.startTrial();
      setSubscription(next);
      Alert.alert('Your free trial has started', 'You now have full access to Rekọda Pro for 30 days.');
    } catch (error) {
      Alert.alert('Could not start trial', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setStarting(false);
    }
  };

  const restorePurchase = async () => {
    try {
      setRestoring(true);
      const restored = await subscriptionService.get();
      setSubscription(restored);
      Alert.alert(
        restored ? 'Subscription restored' : 'No subscription found',
        restored
          ? 'Your Rekọda subscription has been restored on this device.'
          : 'We could not find a subscription for this account.',
      );
    } catch (error) {
      Alert.alert('Could not restore subscription', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const badge = paidActive ? 'ACTIVE PLAN' : trialActive ? `${daysRemaining} DAYS LEFT` : '30 DAYS FREE';
  const title = paidActive ? 'Your plan is active.' : trialActive ? 'Your free trial is active.' : 'Start your free trial.';
  const subtitle = paidActive
    ? 'You have full access to every Rekọda feature on the Pro monthly plan.'
    : trialActive
      ? `Use every Rekọda feature free until ${formatDate(subscription?.trialEndsAt ?? null)}.`
      : 'Use every Rekọda feature free for 30 days, then continue on one simple monthly plan.';
  const buttonTitle = paidActive ? 'Continue to Rekọda' : trialActive ? 'Continue using Rekọda' : 'Start 30-day free trial';

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top', 'bottom']}>
      <ScrollView
        contentContainerClassName="gap-[18px] px-5 pb-6 pt-3"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)/settings')}
          className="h-6 w-6 items-center justify-center"
        >
          <ArrowLeft size={24} color="#0F172A" />
        </Pressable>

        <View className="gap-2">
          <Text className="text-[28px] font-bold leading-[30px] text-[#0F172A]">{title}</Text>
          <Text className="text-sm leading-5 text-[#475569]">{subtitle}</Text>
        </View>

        <View className="min-h-[184px] gap-2.5 rounded-[5px] bg-[#0B1F5E] p-[18px]">
          <View className="self-start rounded-[5px] bg-[#1D4ED8] px-[9px] py-1.5">
            <Text className="text-[11px] font-bold text-white">{badge}</Text>
          </View>
          <Text className="text-[22px] font-bold text-white">Rekọda Pro</Text>
          <View className="flex-row items-end gap-[7px]">
            <Text className="font-mono text-[30px] font-bold leading-9 text-white">₦5,000</Text>
            <Text className="pb-1 text-xs text-[#BFDBFE]">/ month after trial</Text>
          </View>
          <Text className="text-[13px] font-semibold text-[#93C5FD]">
            {hasAccess ? 'Your Pro features are ready.' : 'No charge today. Cancel anytime.'}
          </Text>
        </View>

        <View className="gap-[11px]">
          <Text className="text-base font-bold text-[#0F172A]">Everything you need to run your business</Text>
          {benefits.map(({ label, icon: Icon }) => (
            <View key={label} className="flex-row items-center gap-2.5">
              <View className="h-7 w-7 items-center justify-center rounded-[5px] bg-[#EAF2FF]">
                <Icon size={16} color="#1D4ED8" />
              </View>
              <Text className="flex-1 text-[13px] font-medium text-[#334155]">{label}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row gap-2.5">
          <View className="flex-1 gap-1 rounded-[5px] bg-[#EFF6FF] p-3">
            <Text className="text-[10px] font-bold text-[#2563EB]">TODAY</Text>
            <Text className="text-sm font-bold text-[#0F172A]">{hasAccess ? 'Full access' : 'Start free'}</Text>
          </View>
          <View className="flex-1 gap-1 rounded-[5px] bg-[#F2F5FA] p-3">
            <Text className="text-[10px] font-bold text-[#64748B]">DAY 30</Text>
            <Text className="text-sm font-bold text-[#0F172A]">₦5,000 monthly</Text>
          </View>
        </View>

        <View className="items-center gap-2.5">
          <Pressable
            accessibilityRole="button"
            disabled={loading || starting}
            onPress={startTrial}
            className="h-14 w-full flex-row items-center justify-center gap-2 rounded-[5px] bg-[#0B1F5E] disabled:opacity-50"
            style={{ shadowColor: '#0B1F5E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.13, shadowRadius: 20, elevation: 4 }}
          >
            {loading || starting
              ? <ActivityIndicator color="#FFFFFF" />
              : <><Text className="text-[15px] font-bold text-white">{buttonTitle}</Text><ArrowRight size={18} color="#FFFFFF" /></>}
          </Pressable>
          <Text className="text-xs text-[#64748B]">You won’t be charged until your trial ends.</Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-xs text-[#64748B]">Already subscribed?</Text>
            <Pressable accessibilityRole="button" disabled={restoring} onPress={restorePurchase}>
              <Text className="text-xs font-bold text-[#2563EB]">{restoring ? 'Restoring…' : 'Restore purchase'}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
