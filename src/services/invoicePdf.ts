import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Customer, Invoice } from '@/types';
import type { BusinessProfile, UserProfile } from '@/store/authStore';
import { formatDate, formatMoney } from '@/utils/format';

type InvoicePdfInput = {
  invoice: Invoice;
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

export function buildInvoiceHtml({ invoice, business, user, customer }: InvoicePdfInput) {
  const currency = business.currency || 'NGN';
  const invoiceNumber = invoice.id.slice(-6).toUpperCase();
  const logo = safeLogoUrl(business.logoUrl);
  const subtotal = invoice.items.reduce((total, item) => total + item.quantity * item.price, 0);
  const statusClass = invoice.status === 'PAID' ? 'paid' : invoice.status === 'OVERDUE' ? 'overdue' : 'unpaid';
  const rows = invoice.items.map((item, index) => `
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
        .invoice-heading { text-align: right; }
        .invoice-heading h1 { color: #0B1F5E; font-size: 30px; letter-spacing: 1.5px; margin: 0 0 7px; }
        .invoice-number { color: #475569; font-weight: 700; }
        .status { display: inline-block; margin-top: 10px; padding: 6px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; letter-spacing: .7px; }
        .paid { background: #E8FBF4; color: #047857; }
        .unpaid { background: #FFF7ED; color: #B45309; }
        .overdue { background: #FEF2F2; color: #B91C1C; }
        .details { display: flex; justify-content: space-between; gap: 28px; margin: 28px 0; }
        .detail-box { flex: 1; }
        .label { color: #64748B; font-size: 10px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; margin-bottom: 9px; }
        .customer-name { font-size: 15px; font-weight: 800; margin-bottom: 5px; }
        .muted { color: #475569; line-height: 1.6; }
        .dates { min-width: 210px; border-left: 3px solid #2563EB; background: #F8FAFC; padding: 13px 16px; }
        .date-row { display: flex; justify-content: space-between; gap: 20px; padding: 4px 0; }
        .date-row span:first-child { color: #64748B; }
        .date-row span:last-child { font-weight: 700; }
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
        .notes { flex: 1; }
        .payment { flex: 1; background: #F2F5FA; border-radius: 7px; padding: 14px; }
        .note-copy { color: #475569; line-height: 1.65; white-space: pre-wrap; }
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
              <div class="business-meta">${escapeHtml(business.branchName)} · ${escapeHtml(business.country)}<br/>${escapeHtml(user?.email)}</div>
            </div>
          </div>
          <div class="invoice-heading">
            <h1>INVOICE</h1>
            <div class="invoice-number">#${escapeHtml(invoiceNumber)}</div>
            <div class="status ${statusClass}">${escapeHtml(invoice.status)}</div>
          </div>
        </header>

        <section class="details">
          <div class="detail-box">
            <div class="label">Bill to</div>
            <div class="customer-name">${escapeHtml(invoice.customerName)}</div>
            <div class="muted">${escapeHtml(customer?.phoneNumber)}${customer?.emailAddress ? `<br/>${escapeHtml(customer.emailAddress)}` : ''}${customer?.address ? `<br/>${escapeHtml(customer.address)}` : ''}</div>
          </div>
          <div class="dates">
            <div class="date-row"><span>Issued</span><span>${escapeHtml(formatDate(invoice.createdAt))}</span></div>
            <div class="date-row"><span>Due date</span><span>${escapeHtml(formatDate(invoice.dueDate))}</span></div>
            <div class="date-row"><span>Currency</span><span>${escapeHtml(currency)}</span></div>
          </div>
        </section>

        <table>
          <thead><tr><th>Item</th><th class="number">Qty</th><th class="number">Unit price</th><th class="number">Amount</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>

        <section class="summary">
          <div class="summary-row"><span>Subtotal</span><strong>${escapeHtml(formatMoney(subtotal, currency))}</strong></div>
          <div class="summary-row"><span>Adjustment</span><strong>${escapeHtml(formatMoney(invoice.total - subtotal, currency))}</strong></div>
          <div class="summary-row grand-total"><span>Total due</span><span>${escapeHtml(formatMoney(invoice.total, currency))}</span></div>
        </section>

        <section class="bottom">
          <div class="notes"><div class="label">Terms & notes</div><div class="note-copy">${escapeHtml(invoice.terms || 'Thank you for your business. Please make payment by the due date and reference the invoice number.')}</div></div>
          <div class="payment"><div class="label">Payment information</div><div class="note-copy">Please contact ${escapeHtml(business.name)} for payment details. Reference invoice #${escapeHtml(invoiceNumber)} when paying.</div></div>
        </section>
        <footer class="footer">Generated by Ease · ${escapeHtml(business.name)}</footer>
      </main>
    </body>
  </html>`;
}

export async function shareInvoicePdf(input: InvoicePdfInput) {
  const html = buildInvoiceHtml(input);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: `Share invoice ${input.invoice.id.slice(-6).toUpperCase()}`,
    });
    return;
  }
  await Print.printAsync({ html });
}
