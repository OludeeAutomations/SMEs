// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2';
import { json, markInvoicePaid, normalizeCurrency, verifyProviderPayment, type Provider } from '../_shared/payment.ts';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authorization = req.headers.get('Authorization') || '';
    const client = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
    const admin = createClient(url, serviceKey);
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return json({ message: 'Please sign in again.' }, 401);

    const body = await req.json();
    const action = String(body.action || '');
    const provider = body.provider as Provider;
    if (action === 'status') {
      if (!['Paystack', 'Flutterwave'].includes(provider)) return json({ message: 'Choose a valid provider.' }, 400);
      const configured = provider === 'Paystack' ? Boolean(Deno.env.get('PAYSTACK_SECRET_KEY')) : Boolean(Deno.env.get('FLUTTERWAVE_SECRET_KEY'));
      return json({ configured });
    }

    const { data: row, error: workspaceError } = await admin.from('business_workspaces').select('business,data').eq('user_id', user.id).single();
    if (workspaceError) throw workspaceError;
    const invoiceId = String(body.invoiceId || '');
    const workspace = row.data ?? {};
    const invoice = (workspace.invoices ?? []).find((item: any) => item.id === invoiceId);
    if (!invoice) return json({ message: 'Invoice not found.' }, 404);

    if (action === 'verify') {
      const { data: request } = await admin.from('payment_requests').select('*').eq('user_id', user.id).eq('invoice_id', invoiceId).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (!request) return json({ paid: false, message: 'No payment link has been created for this invoice.' });
      if (request.status === 'PAID') return json({ paid: true });
      const paid = await verifyProviderPayment(request);
      if (paid) await markInvoicePaid(admin, request);
      return json({ paid });
    }

    if (action !== 'create') return json({ message: 'Unknown payment action.' }, 400);
    if (!['Paystack', 'Flutterwave'].includes(provider)) return json({ message: 'Choose Paystack or Flutterwave in Payment settings.' }, 400);
    if (invoice.status === 'PAID') return json({ message: 'This invoice is already paid.' }, 400);
    const customer = (workspace.customers ?? []).find((item: any) => item.id === invoice.customerId);
    if (!customer?.emailAddress) return json({ message: 'Add an email address to this customer first.' }, 400);

    const amount = Number(invoice.total);
    if (!Number.isFinite(amount) || amount <= 0) return json({ message: 'The invoice amount is invalid.' }, 400);
    const currency = normalizeCurrency(row.business?.currency);
    const reference = `ease_${crypto.randomUUID().replaceAll('-', '')}`;
    const redirectUrl = `${url}/functions/v1/payment-complete`;
    let checkoutUrl = '';

    if (provider === 'Paystack') {
      const key = Deno.env.get('PAYSTACK_SECRET_KEY');
      if (!key) return json({ message: 'Paystack is not configured on the server.' }, 503);
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customer.emailAddress, amount: Math.round(amount * 100), currency, reference, callback_url: redirectUrl, metadata: { user_id: user.id, invoice_id: invoice.id } }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.status) return json({ message: payload.message || 'Paystack could not create the checkout.' }, 502);
      checkoutUrl = payload.data.authorization_url;
    } else {
      const key = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
      if (!key) return json({ message: 'Flutterwave is not configured on the server.' }, 503);
      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_ref: reference, amount, currency, redirect_url: redirectUrl, customer: { email: customer.emailAddress, name: customer.fullName, phonenumber: customer.phoneNumber }, customizations: { title: row.business?.name || 'Invoice payment', description: `Invoice ${invoice.id.slice(-6).toUpperCase()}` }, meta: { user_id: user.id, invoice_id: invoice.id } }),
      });
      const payload = await response.json();
      if (!response.ok || payload.status !== 'success') return json({ message: payload.message || 'Flutterwave could not create the checkout.' }, 502);
      checkoutUrl = payload.data.link;
    }

    const { error: insertError } = await admin.from('payment_requests').insert({ user_id: user.id, invoice_id: invoice.id, provider, reference, amount, currency, customer_email: customer.emailAddress, checkout_url: checkoutUrl });
    if (insertError) throw insertError;
    return json({ checkoutUrl, reference });
  } catch (error) {
    console.error(error);
    return json({ message: error instanceof Error ? error.message : 'Payment service failed.' }, 500);
  }
});
