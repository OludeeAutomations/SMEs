import { describe, expect, it } from 'vitest';
import { costOfGoodsSold, effectiveInvoiceStatus, localDateKey } from './businessMetrics';
import type { Invoice, Product, Sale } from '@/types';

const product: Product = { id: 'p1', name: 'Rice', category: 'Food', costPrice: 600, sellingPrice: 1000, stockQuantity: 8, lowStockThreshold: 2, createdAt: '2026-09-01T10:00:00Z' };
const sale: Sale = { id: 's1', items: [{ productId: 'p1', productName: 'Rice', quantity: 3, price: 1000 }], subtotal: 3000, total: 3000, paymentMethod: 'CASH', createdAt: '2026-09-08T10:00:00Z' };

describe('business metrics', () => {
  it('calculates cost of sold inventory', () => expect(costOfGoodsSold([product], [sale])).toBe(1800));
  it('does not invent a cost for custom sale items', () => expect(costOfGoodsSold([], [sale])).toBe(0));
  it('uses the device local date', () => expect(localDateKey(new Date(2026, 8, 8))).toBe('2026-09-08'));
  it('marks an unpaid past-due invoice as overdue without changing paid invoices', () => {
    const invoice: Invoice = { id: 'i1', customerId: 'c1', customerName: 'Ada', items: [], total: 1000, status: 'UNPAID', dueDate: '2026-09-07', createdAt: '2026-09-01' };
    expect(effectiveInvoiceStatus(invoice, '2026-09-08')).toBe('OVERDUE');
    expect(effectiveInvoiceStatus({ ...invoice, status: 'PAID' }, '2026-09-08')).toBe('PAID');
  });
});
