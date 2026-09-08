import { describe, expect, it } from 'vitest';
import { getBusinessAdvice } from './businessAdvisor';
import type { WorkspaceData } from '@/store/businessStore';

const workspace: WorkspaceData = {
  products: [], customers: [], sales: [], invoices: [], expenses: [], suppliers: [{ id: 's1', name: 'Main Supplier', phoneNumber: '08000000000', outstandingBalance: 5000, createdAt: '2026-09-01' }],
  projects: [{ id: 'p1', title: 'Count stock', completed: false, createdAt: '2026-09-01' }], expenseCategories: [], inventoryCategories: [], automations: {}, teamMembers: [], preferences: {}, inventoryMovements: [], aiConversations: [], aiMessages: [], saleDrafts: [],
  supplierBills: [{ id: 'b1', supplierId: 's1', supplierName: 'Main Supplier', description: 'September stock', amount: 5000, dueDate: '2026-01-01', status: 'UNPAID', createdAt: '2026-09-01' }],
};

describe('local business advisor', () => {
  it('answers supplier questions from workspace records', () => expect(getBusinessAdvice('Which supplier bills are urgent?', workspace).title).toBe('Supplier and bills review'));
  it('answers task questions from workspace records', () => expect(getBusinessAdvice('What task should I focus on?', workspace).answer).toContain('1 open task'));
});
