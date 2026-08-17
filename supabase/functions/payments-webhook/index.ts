// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2';
import { json, markInvoicePaid, verifyProviderPayment } from '../_shared/payment.ts';

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function validPaystackSignature(body: string, signature: string) {
  const key = Deno.env.get('PAYSTACK_SECRET_KEY');
  if (!key || !signature) return false;
  const cryptoKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(body));
  return bytesToHex(digest) === signature.toLowerCase();
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ message: 'Method not allowed.' }, 405);
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    const paystackSignature = req.headers.get('x-paystack-signature') || '';
    let reference = '';

    if (paystackSignature) {
      if (!await validPaystackSignature(rawBody, paystackSignature)) return json({ message: 'Invalid signature.' }, 401);
      reference = String(payload.data?.reference || '');
    } else {
      const signature = req.headers.get('verif-hash') || '';
      const expected = Deno.env.get('FLUTTERWAVE_WEBHOOK_HASH') || '';
      if (!expected || signature !== expected) return json({ message: 'Invalid signature.' }, 401);
      reference = String(payload.data?.tx_ref || '');
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: request, error } = await admin.from('payment_requests').select('*').eq('reference', reference).maybeSingle();
    if (error) throw error;
    if (!request) return json({ received: true });
    if (request.status !== 'PAID' && await verifyProviderPayment(request)) await markInvoicePaid(admin, request);
    return json({ received: true });
  } catch (error) {
    console.error(error);
    return json({ message: 'Webhook processing failed.' }, 500);
  }
});
