export function formatMoney(value: number, currency = 'NGN') {
  const code = currency.toUpperCase().includes('NGN') ? 'NGN' : currency.split(/\s|-/)[0] || 'NGN';
  try { return new Intl.NumberFormat('en-NG', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(value); }
  catch { return `₦${Math.round(value).toLocaleString()}`; }
}
export const formatDate = (value: string) => new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
export const todayKey = () => new Date().toISOString().slice(0, 10);
export const parseAmount = (value: string) => Number(value.replace(/[^0-9.]/g, '')) || 0;
