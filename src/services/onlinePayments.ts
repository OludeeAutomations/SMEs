import { supabase } from './supabase';

export type PaymentProvider = 'Paystack' | 'Flutterwave';

type PaymentResponse = {
  configured?: boolean;
  checkoutUrl?: string;
  reference?: string;
  paid?: boolean;
  message?: string;
};

async function invokePayments(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke<PaymentResponse>('payments', { body });
  if (error) {
    let message = error.message || 'The payment service could not be reached.';
    const response = (error as { context?: Response }).context;
    if (response) {
      try {
        const payload = await response.json() as { message?: string };
        if (payload.message) message = payload.message;
      } catch {
        // Keep the SDK error when the function did not return JSON.
      }
    }
    throw new Error(message);
  }
  return data ?? {};
}

export async function checkPaymentProvider(provider: PaymentProvider) {
  const data = await invokePayments({ action: 'status', provider });
  return Boolean(data.configured);
}

export async function createInvoicePaymentLink(invoiceId: string, provider: PaymentProvider) {
  const data = await invokePayments({ action: 'create', invoiceId, provider });
  if (!data.checkoutUrl || !data.reference) throw new Error(data.message || 'No checkout link was returned.');
  return { checkoutUrl: data.checkoutUrl, reference: data.reference };
}

export async function verifyInvoicePayment(invoiceId: string) {
  const data = await invokePayments({ action: 'verify', invoiceId });
  return Boolean(data.paid);
}
