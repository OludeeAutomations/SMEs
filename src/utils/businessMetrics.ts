import type { Invoice, Product, Sale } from '@/types';

const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function costOfGoodsSold(products: Product[], sales: Sale[]) {
  return sales.reduce((total, sale) => total + sale.items.reduce((itemTotal, item) => {
    const product = products.find((candidate) => candidate.id === item.productId)
      ?? products.find((candidate) => normalized(candidate.name) === normalized(item.productName));
    return itemTotal + (product?.costPrice ?? 0) * item.quantity;
  }, 0), 0);
}

export function effectiveInvoiceStatus(invoice: Invoice, today = localDateKey()): Invoice['status'] {
  if (invoice.status === 'PAID') return 'PAID';
  return invoice.dueDate < today ? 'OVERDUE' : 'UNPAID';
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
