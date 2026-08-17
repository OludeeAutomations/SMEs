import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Customer, Sale } from '@/types';
import type { BusinessProfile, UserProfile } from '@/store/authStore';
import { formatDate, formatMoney } from '@/utils/format';

type ReceiptPdfInput = {
  sale: Sale;
  business: BusinessProfile;
  user: UserProfile | null;
  customer?: Customer;
};

const escapeHtml = (value?: string | number | null) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const safeLogoUrl = (value?: string) => value && /^https:\/\//i.test(value) ? escapeHtml(value) : '';

export function buildReceiptHtml({ sale, business, user, customer }: ReceiptPdfInput) {
  const currency = business.currency || 'NGN';
  const receiptNumber = sale.id.slice(-6).toUpperCase();
  const logo = safeLogoUrl(business.logoUrl);
  const customerName = sale.customerName || 'Walk-in customer';
  const rows = sale.items.map((item, index) => `
    <tr>
      <td><span class="item-index">${index + 1}</span>${escapeHtml(item.productName)}</td>
      <td class="number">${item.quantity}</td>
      <td class="number">${escapeHtml(formatMoney(item.price, currency))}</td>
      <td class="number total-cell">${escapeHtml(formatMoney(item.quantity * item.price, currency))}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        @page { size: A4; margin: 0; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #ffffff; color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 12px; }
        .page { width: 100%; min-height: 100vh; padding: 44px 48px 36px; position: relative; }
        .brand-bar { height: 8px; background: #0B1F5E; position: absolute; top: 0; left: 0; right: 0; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 28px; border-bottom: 1px solid #DCE3EE; }
        .brand { display: flex; align-items: center; gap: 14px; }
        .logo { width: 54px; height: 54px; object-fit: cover; border-radius: 10px; border: 1px solid #DCE3EE; }
        .logo-fallback { width: 54px; height: 54px; border-radius: 10px; background: #E8FBF4; color: #047857; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; }
        .business-name { font-size: 20px; font-weight: 800; margin: 0 0 5px; }
        .business-meta { color: #475569; line-height: 1.55; }
        .receipt-heading { text-align: right; }
        .receipt-heading h1 { color: #0B1F5E; font-size: 30px; letter-spacing: 1.5px; margin: 0 0 7px; }
        .receipt-number { color: #475569; font-weight: 700; }
        .paid { display: inline-block; margin-top: 10px; padding: 6px 12px; border-radius: 20px; background: #E8FBF4; color: #047857; font-size: 10px; font-weight: 800; letter-spacing: .7px; }
        .details { display: flex; justify-content: space-between; gap: 28px; margin: 28px 0; }
        .detail-box { flex: 1; }
        .label { color: #64748B; font-size: 10px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; margin-bottom: 9px; }
        .customer-name { font-size: 15px; font-weight: 800; margin-bottom: 5px; }
        .muted { color: #475569; line-height: 1.6; }
        .sale-info { min-width: 225px; border-left: 3px solid #2563EB; background: #F8FAFC; padding: 13px 16px; }
        .info-row { display: flex; justify-content: space-between; gap: 20px; padding: 4px 0; }
        .info-row span:first-child { color: #64748B; }
        .info-row span:last-child { font-weight: 700; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { padding: 12px 10px; background: #0B1F5E; color: #ffffff; font-size: 10px; letter-spacing: .5px; text-align: left; }
        th.number, td.number { text-align: right; }
        td { padding: 14px 10px; border-bottom: 1px solid #E2E8F0; vertical-align: middle; }
        .item-index { display: inline-flex; width: 22px; height: 22px; margin-right: 8px; align-items: center; justify-content: center; border-radius: 6px; background: #EFF6FF; color: #2563EB; font-size: 10px; font-weight: 800; }
        .total-cell { font-weight: 800; }
        .summary { width: 300px; margin: 22px 0 28px auto; }
        .summary-row { display: flex; justify-content: space-between; padding: 7px 2px; color: #475569; }
        .grand-total { margin-top: 6px; padding: 15px 16px; background: #0B1F5E; color: #ffffff; border-radius: 7px; font-size: 17px; font-weight: 800; }
        .bottom { display: flex; gap: 24px; border-top: 1px solid #DCE3EE; padding-top: 20px; }
        .message { flex: 1; }
        .payment { flex: 1; background: #F2F5FA; border-radius: 7px; padding: 14px; }
        .copy { color: #475569; line-height: 1.65; white-space: pre-wrap; }
        .footer { margin-top: 34px; text-align: center; color: #94A3B8; font-size: 10px; }
      </style>
    </head>
    <body>
      <main class="page">
        <div class="brand-bar"></div>
        <header class="header">
          <div class="brand">
            ${logo ? `<img class="logo" src="${logo}" />` : `<div class="logo-fallback">${escapeHtml(business.name.slice(0, 2).toUpperCase())}</div>`}
            <div>
              <div class="business-name">${escapeHtml(business.name)}</div>
              <div class="business-meta">${escapeHtml(business.branchName)} &middot; ${escapeHtml(business.country)}<br/>${escapeHtml(user?.email)}</div>
            </div>
          </div>
          <div class="receipt-heading">
            <h1>RECEIPT</h1>
            <div class="receipt-number">#${escapeHtml(receiptNumber)}</div>
            <div class="paid">PAID</div>
          </div>
        </header>

        <section class="details">
          <div class="detail-box">
            <div class="label">Received from</div>
            <div class="customer-name">${escapeHtml(customerName)}</div>
            <div class="muted">${escapeHtml(customer?.phoneNumber)}${customer?.emailAddress ? `<br/>${escapeHtml(customer.emailAddress)}` : ''}${customer?.address ? `<br/>${escapeHtml(customer.address)}` : ''}</div>
          </div>
          <div class="sale-info">
            <div class="info-row"><span>Date</span><span>${escapeHtml(formatDate(sale.createdAt))}</span></div>
            <div class="info-row"><span>Payment</span><span>${escapeHtml(sale.paymentMethod)}</span></div>
            <div class="info-row"><span>Currency</span><span>${escapeHtml(currency)}</span></div>
          </div>
        </section>

        <table>
          <thead><tr><th>Item</th><th class="number">Qty</th><th class="number">Unit price</th><th class="number">Amount</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>

        <section class="summary">
          <div class="summary-row"><span>Subtotal</span><strong>${escapeHtml(formatMoney(sale.subtotal, currency))}</strong></div>
          <div class="summary-row"><span>Adjustment</span><strong>${escapeHtml(formatMoney(sale.total - sale.subtotal, currency))}</strong></div>
          <div class="summary-row grand-total"><span>Total paid</span><span>${escapeHtml(formatMoney(sale.total, currency))}</span></div>
        </section>

        <section class="bottom">
          <div class="message"><div class="label">Thank you</div><div class="copy">Thank you for choosing ${escapeHtml(business.name)}. Please keep this receipt as proof of payment.</div></div>
          <div class="payment"><div class="label">Payment confirmation</div><div class="copy">Payment received in full by ${escapeHtml(sale.paymentMethod.toLowerCase())}. Reference receipt #${escapeHtml(receiptNumber)} for enquiries.</div></div>
        </section>
        ${sale.notes ? `<section style="margin-top:20px"><div class="label">Notes</div><div class="copy">${escapeHtml(sale.notes)}</div></section>` : ''}
        <footer class="footer">Generated by Ease &middot; ${escapeHtml(business.name)}</footer>
      </main>
    </body>
  </html>`;
}

export async function shareReceiptPdf(input: ReceiptPdfInput) {
  const html = buildReceiptHtml(input);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: `Share receipt ${input.sale.id.slice(-6).toUpperCase()}`,
    });
    return;
  }
  await Print.printAsync({ html });
}
