export function formatMoney(value: number, currency = 'NGN') {
  const code = currency.toUpperCase().includes('NGN') ? 'NGN' : currency.split(/\s|-/)[0] || 'NGN';
  try { return new Intl.NumberFormat('en-NG', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(value); }
  catch { return `₦${Math.round(value).toLocaleString()}`; }
}
export const formatDate = (value: string) => new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
export const todayKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
export const parseAmount = (value: string) => Number(value.replace(/[^0-9.]/g, '')) || 0;
