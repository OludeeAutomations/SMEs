import { supabase } from './supabase';

export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';

export interface Subscription {
  userId: string;
  plan: 'PRO_MONTHLY';
  status: SubscriptionStatus;
  currency: string;
  priceKobo: number;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  currentPeriodEndsAt: string | null;
  provider: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionRow {
  user_id: string;
  plan: 'PRO_MONTHLY';
  status: SubscriptionStatus;
  currency: string;
  price_kobo: number;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  current_period_ends_at: string | null;
  provider: string | null;
  created_at: string;
  updated_at: string;
}

const columns = 'user_id,plan,status,currency,price_kobo,trial_started_at,trial_ends_at,current_period_ends_at,provider,created_at,updated_at';

const fromRow = (row: SubscriptionRow): Subscription => ({
  userId: row.user_id,
  plan: row.plan,
  status: row.status,
  currency: row.currency,
  priceKobo: Number(row.price_kobo),
  trialStartedAt: row.trial_started_at,
  trialEndsAt: row.trial_ends_at,
  currentPeriodEndsAt: row.current_period_ends_at,
  provider: row.provider,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const readableError = (message: string) => {
  if (message.includes('start_rekoda_trial') || message.includes('subscriptions')) {
    return new Error('Subscriptions are not available yet. Please try again shortly.');
  }
  return new Error(message);
};

export const subscriptionService = {
  async get(): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(columns)
      .maybeSingle();
    if (error) throw readableError(error.message);
    return data ? fromRow(data as SubscriptionRow) : null;
  },

  async startTrial(): Promise<Subscription> {
    const { data, error } = await supabase.rpc('start_rekoda_trial');
    if (error) throw readableError(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error('The free trial could not be started.');
    return fromRow(row as SubscriptionRow);
  },
};

export const trialDaysRemaining = (subscription: Subscription | null) => {
  if (!subscription?.trialEndsAt || subscription.status !== 'TRIALING') return 0;
  return Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86_400_000));
};
