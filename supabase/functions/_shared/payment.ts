// @ts-nocheck
export type Provider = 'Paystack' | 'Flutterwave';

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export function normalizeCurrency(value: unknown) {
  const code = String(value || 'NGN').trim().split(/\s+/)[0].toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : 'NGN';
}

export async function verifyProviderPayment(request: any) {
  if (request.provider === 'Paystack') {
    const key = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!key) throw new Error('Paystack is not configured.');
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(request.reference)}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const payload = await response.json();
    return response.ok && payload.status && payload.data?.status === 'success'
      && Number(payload.data.amount) >= Math.round(Number(request.amount) * 100)
      && String(payload.data.currency).toUpperCase() === request.currency;
  }

  const key = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
  if (!key) throw new Error('Flutterwave is not configured.');
  const response = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(request.reference)}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const payload = await response.json();
  return response.ok && payload.status === 'success' && payload.data?.status === 'successful'
    && Number(payload.data.amount) >= Number(request.amount)
    && String(payload.data.currency).toUpperCase() === request.currency;
}

export async function markInvoicePaid(admin: any, request: any) {
  const { data: row, error } = await admin.from('business_workspaces').select('data').eq('user_id', request.user_id).single();
  if (error) throw error;
  const workspace = row.data ?? {};
  const invoices = Array.isArray(workspace.invoices) ? workspace.invoices : [];
  const invoice = invoices.find((item: any) => item.id === request.invoice_id);
  if (!invoice) throw new Error('Invoice no longer exists.');

  if (invoice.status !== 'PAID') {
    workspace.invoices = invoices.map((item: any) => item.id === request.invoice_id ? { ...item, status: 'PAID' } : item);
    workspace.customers = (Array.isArray(workspace.customers) ? workspace.customers : []).map((customer: any) =>
      customer.id === invoice.customerId
        ? { ...customer, amountOwed: Math.max(0, Number(customer.amountOwed || 0) - Number(invoice.total || 0)) }
        : customer,
    );
    const { error: saveError } = await admin.from('business_workspaces').update({ data: workspace, updated_at: new Date().toISOString() }).eq('user_id', request.user_id);
    if (saveError) throw saveError;
  }

  const { error: paymentError } = await admin.from('payment_requests').update({ status: 'PAID', paid_at: new Date().toISOString() }).eq('id', request.id);
  if (paymentError) throw paymentError;
}
