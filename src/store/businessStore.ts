import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Customer, Expense, Invoice, Product, Sale, Supplier } from '@/types';
import { createReference } from '@/utils/references';

export interface Project { id: string; title: string; completed: boolean; createdAt: string }
export interface TeamMember { id: string; name: string; email: string; role: string; status?: 'PENDING' | 'ACTIVE'; createdAt: string; acceptedAt?: string }
export interface InventoryMovement { id: string; productId: string; productName: string; quantity: number; type: 'OPENING' | 'ADJUSTMENT' | 'SALE'; createdAt: string }
export interface AIConversation { id: string; title: string; createdAt: string }
export interface AIMessage { id: string; conversationId: string; role: 'USER' | 'ASSISTANT'; content: string; createdAt: string }
export interface SaleDraft { id: string; customerId?: string; productId?: string; item: string; amount: number; quantity: number; paymentMethod: Sale['paymentMethod']; createdAt: string; updatedAt: string }
export interface SupplierBill { id: string; supplierId: string; supplierName: string; description: string; amount: number; dueDate: string; status: 'UNPAID' | 'PAID'; createdAt: string }
export interface CustomerBalanceAdjustment { id: string; customerId: string; type: 'INCREASE' | 'DECREASE'; amount: number; reason: string; createdAt: string }
export interface WorkspaceData {
  products: Product[]; customers: Customer[]; sales: Sale[]; invoices: Invoice[];
  expenses: Expense[]; suppliers: Supplier[]; projects: Project[];
  expenseCategories: string[]; inventoryCategories: string[]; automations: Record<string, boolean>;
  teamMembers: TeamMember[]; preferences: Record<string, string | boolean>;
  inventoryMovements: InventoryMovement[]; aiConversations: AIConversation[]; aiMessages: AIMessage[];
  saleDrafts: SaleDraft[]; supplierBills: SupplierBill[]; customerBalanceAdjustments: CustomerBalanceAdjustment[];
}
type ProductInput = Omit<Product, 'id' | 'createdAt'>;
type CustomerInput = Omit<Customer, 'id' | 'createdAt' | 'totalBought' | 'amountOwed'> & Partial<Pick<Customer, 'totalBought' | 'amountOwed'>>;
type ExpenseInput = Omit<Expense, 'id' | 'createdAt'>;
type InvoiceInput = Omit<Invoice, 'id' | 'createdAt'>;
type SupplierInput = Omit<Supplier, 'id' | 'createdAt' | 'outstandingBalance'> & Partial<Pick<Supplier, 'outstandingBalance'>>;
type SaleInput = Omit<Sale, 'id' | 'createdAt'>;

interface BusinessState {
  activeUserId: string | null; workspaces: Record<string, WorkspaceData>; dirtyUsers: Record<string, boolean>; hasHydrated: boolean;
  setActiveUser: (userId: string | null) => void; setHasHydrated: (value: boolean) => void;
  addProduct: (input: ProductInput) => Product; updateProductImage: (productId: string, imageUrl: string) => void; adjustStock: (productId: string, quantity: number) => void;
  updateProduct: (productId: string, input: Partial<ProductInput>) => void; deleteProduct: (productId: string) => void;
  addCustomer: (input: CustomerInput) => Customer; updateCustomer: (customerId: string, input: Partial<CustomerInput>) => void; deleteCustomer: (customerId: string) => void;
  addCustomerBalanceAdjustment: (customerId: string, type: CustomerBalanceAdjustment['type'], amount: number, reason: string) => CustomerBalanceAdjustment | undefined;
  addExpense: (input: ExpenseInput) => Expense; updateExpense: (expenseId: string, input: Partial<ExpenseInput>) => void; deleteExpense: (expenseId: string) => void;
  addInvoice: (input: InvoiceInput) => Invoice; updateInvoice: (invoiceId: string, input: Partial<InvoiceInput>) => void; updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => void; deleteInvoice: (invoiceId: string) => void;
  addSale: (input: SaleInput) => Sale; addSupplier: (input: SupplierInput) => Supplier;
  updateSupplier: (supplierId: string, input: Partial<SupplierInput>) => void; deleteSupplier: (supplierId: string) => void;
  addProject: (title: string) => void; updateProject: (id: string, title: string) => void; toggleProject: (id: string) => void; deleteProject: (id: string) => void;
  saveSaleDraft: (input: Omit<SaleDraft, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => SaleDraft; deleteSaleDraft: (id: string) => void;
  addSupplierBill: (input: Omit<SupplierBill, 'id' | 'createdAt' | 'status'>) => SupplierBill; updateSupplierBillStatus: (id: string, status: SupplierBill['status']) => void; deleteSupplierBill: (id: string) => void;
  addExpenseCategory: (category: string) => void; addInventoryCategory: (category: string) => void;
  setAutomation: (key: string, enabled: boolean) => void; clearWorkspace: () => void;
  addTeamMember: (name: string, email: string, role: string, id?: string, status?: TeamMember['status']) => void;
  deleteTeamMember: (id: string) => void;
  addAIExchange: (question: string, answer: string) => void;
  setPreference: (key: string, value: string | boolean) => void;
  replaceWorkspace: (userId: string, workspace: WorkspaceData) => void;
  markSynced: (userId: string) => void;
}

export const emptyWorkspace = (): WorkspaceData => ({
  products: [], customers: [], sales: [], invoices: [], expenses: [], suppliers: [], projects: [],
  expenseCategories: [], inventoryCategories: [], automations: {}, teamMembers: [], preferences: {},
  inventoryMovements: [], aiConversations: [], aiMessages: [],
  saleDrafts: [], supplierBills: [], customerBalanceAdjustments: [],
});
const makeId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useBusinessStore = create<BusinessState>()(persist((set, get) => {
  const update = (recipe: (workspace: WorkspaceData) => WorkspaceData) => {
    const userId = get().activeUserId;
    if (!userId) return;
    set((state) => ({
      workspaces: { ...state.workspaces, [userId]: recipe(state.workspaces[userId] ?? emptyWorkspace()) },
      dirtyUsers: { ...state.dirtyUsers, [userId]: true },
    }));
  };
  return {
    activeUserId: null, workspaces: {}, dirtyUsers: {}, hasHydrated: false,
    setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    setActiveUser: (activeUserId) => set((state) => ({
      activeUserId,
      workspaces: activeUserId ? { ...state.workspaces, [activeUserId]: normalizeWorkspace(state.workspaces[activeUserId]) } : state.workspaces,
    })),
    replaceWorkspace: (userId, workspace) => set((state) => ({ workspaces: { ...state.workspaces, [userId]: normalizeWorkspace(workspace) }, dirtyUsers: { ...state.dirtyUsers, [userId]: false } })),
    markSynced: (userId) => set((state) => ({ dirtyUsers: { ...state.dirtyUsers, [userId]: false } })),
    addProduct: (input) => {
      const createdAt = new Date().toISOString();
      const product = { ...input, id: makeId('product'), createdAt };
      update((workspace) => ({
        ...workspace,
        products: [product, ...workspace.products],
        inventoryMovements: input.stockQuantity > 0 ? [{ id: makeId('movement'), productId: product.id, productName: product.name, quantity: input.stockQuantity, type: 'OPENING', createdAt }, ...(workspace.inventoryMovements ?? [])] : (workspace.inventoryMovements ?? []),
      })); return product;
    },
    updateProductImage: (productId, imageUrl) => update((workspace) => ({ ...workspace, products: workspace.products.map((product) => product.id === productId ? { ...product, imageUrl } : product) })),
    updateProduct: (productId, input) => update((workspace) => ({ ...workspace, products: workspace.products.map((product) => product.id === productId ? { ...product, ...input } : product) })),
    deleteProduct: (productId) => update((workspace) => ({ ...workspace, products: workspace.products.filter((product) => product.id !== productId) })),
    adjustStock: (productId, quantity) => update((workspace) => {
      const product = workspace.products.find((item) => item.id === productId);
      if (!product) return workspace;
      const nextQuantity = Math.max(0, product.stockQuantity + quantity);
      const actualChange = nextQuantity - product.stockQuantity;
      return {
        ...workspace,
        products: workspace.products.map((item) => item.id === productId ? { ...item, stockQuantity: nextQuantity } : item),
        inventoryMovements: actualChange ? [{ id: makeId('movement'), productId, productName: product.name, quantity: actualChange, type: 'ADJUSTMENT', createdAt: new Date().toISOString() }, ...(workspace.inventoryMovements ?? [])] : (workspace.inventoryMovements ?? []),
      };
    }),
    addCustomer: (input) => {
      const customer = { totalBought: 0, amountOwed: 0, ...input, id: makeId('customer'), createdAt: new Date().toISOString() };
      update((workspace) => ({ ...workspace, customers: [customer, ...workspace.customers] })); return customer;
    },
    updateCustomer: (customerId, input) => update((workspace) => ({ ...workspace, customers: workspace.customers.map((customer) => customer.id === customerId ? { ...customer, ...input } : customer) })),
    deleteCustomer: (customerId) => update((workspace) => ({
      ...workspace,
      customers: workspace.customers.filter((customer) => customer.id !== customerId),
      customerBalanceAdjustments: workspace.customerBalanceAdjustments.filter((adjustment) => adjustment.customerId !== customerId),
    })),
    addCustomerBalanceAdjustment: (customerId, type, amount, reason) => {
      let adjustment: CustomerBalanceAdjustment | undefined;
      update((workspace) => {
        const customer = workspace.customers.find((item) => item.id === customerId);
        const cleanReason = reason.trim();
        if (!customer || !Number.isFinite(amount) || amount <= 0 || !cleanReason) return workspace;
        if (type === 'DECREASE' && amount > customer.amountOwed) return workspace;
        adjustment = { id: makeId('balance'), customerId, type, amount, reason: cleanReason, createdAt: new Date().toISOString() };
        const change = type === 'INCREASE' ? amount : -amount;
        return {
          ...workspace,
          customers: workspace.customers.map((item) => item.id === customerId ? { ...item, amountOwed: item.amountOwed + change } : item),
          customerBalanceAdjustments: [adjustment, ...workspace.customerBalanceAdjustments],
        };
      });
      return adjustment;
    },
    addExpense: (input) => {
      const expense = { ...input, id: makeId('expense'), createdAt: new Date().toISOString() };
      update((workspace) => ({ ...workspace, expenses: [expense, ...workspace.expenses], expenseCategories: workspace.expenseCategories.includes(expense.category) ? workspace.expenseCategories : [...workspace.expenseCategories, expense.category] })); return expense;
    },
    updateExpense: (expenseId, input) => update((workspace) => ({ ...workspace, expenses: workspace.expenses.map((expense) => expense.id === expenseId ? { ...expense, ...input } : expense) })),
    deleteExpense: (expenseId) => update((workspace) => ({ ...workspace, expenses: workspace.expenses.filter((expense) => expense.id !== expenseId) })),
    addInvoice: (input) => {
      const invoice: Invoice = { ...input, id: makeId('invoice'), createdAt: new Date().toISOString() };
      invoice.reference = createReference('INV', invoice.createdAt, get().activeUserId ? get().workspaces[get().activeUserId!]?.invoices ?? [] : []);
      update((workspace) => ({ ...workspace, invoices: [invoice, ...workspace.invoices], customers: workspace.customers.map((customer) => customer.id === invoice.customerId ? { ...customer, amountOwed: customer.amountOwed + invoice.total } : customer) })); return invoice;
    },
    updateInvoice: (invoiceId, input) => update((workspace) => {
      const current = workspace.invoices.find((invoice) => invoice.id === invoiceId);
      if (!current) return workspace;
      const next = { ...current, ...input };
      const currentDebt = current.status === 'PAID' ? 0 : current.total;
      const nextDebt = next.status === 'PAID' ? 0 : next.total;
      return {
        ...workspace,
        invoices: workspace.invoices.map((invoice) => invoice.id === invoiceId ? next : invoice),
        customers: workspace.customers.map((customer) => {
          let amountOwed = customer.amountOwed;
          if (customer.id === current.customerId) amountOwed -= currentDebt;
          if (customer.id === next.customerId) amountOwed += nextDebt;
          return customer.id === current.customerId || customer.id === next.customerId ? { ...customer, amountOwed: Math.max(0, amountOwed) } : customer;
        }),
      };
    }),
    updateInvoiceStatus: (invoiceId, status) => update((workspace) => {
      const invoice = workspace.invoices.find((item) => item.id === invoiceId);
      if (!invoice || invoice.status === status) return workspace;
      const debtChange = invoice.status === 'PAID' ? invoice.total : status === 'PAID' ? -invoice.total : 0;
      return {
        ...workspace,
        invoices: workspace.invoices.map((item) => item.id === invoiceId ? { ...item, status } : item),
        customers: debtChange ? workspace.customers.map((customer) => customer.id === invoice.customerId ? { ...customer, amountOwed: Math.max(0, customer.amountOwed + debtChange) } : customer) : workspace.customers,
      };
    }),
    deleteInvoice: (invoiceId) => update((workspace) => {
      const invoice = workspace.invoices.find((item) => item.id === invoiceId);
      return {
        ...workspace,
        invoices: workspace.invoices.filter((item) => item.id !== invoiceId),
        customers: invoice && invoice.status !== 'PAID' ? workspace.customers.map((customer) => customer.id === invoice.customerId ? { ...customer, amountOwed: Math.max(0, customer.amountOwed - invoice.total) } : customer) : workspace.customers,
      };
    }),
    addSale: (input) => {
      const sale: Sale = { ...input, id: makeId('sale'), createdAt: new Date().toISOString() };
      sale.reference = createReference('SALE', sale.createdAt, get().activeUserId ? get().workspaces[get().activeUserId!]?.sales ?? [] : []);
      update((workspace) => ({
        ...workspace, sales: [sale, ...workspace.sales],
        inventoryMovements: [...sale.items.filter((item) => workspace.products.some((product) => product.id === item.productId)).map((item) => ({ id: makeId('movement'), productId: item.productId, productName: item.productName, quantity: -item.quantity, type: 'SALE' as const, createdAt: sale.createdAt })), ...(workspace.inventoryMovements ?? [])],
        products: workspace.products.map((product) => { const sold = sale.items.find((item) => item.productId === product.id); return sold ? { ...product, stockQuantity: Math.max(0, product.stockQuantity - sold.quantity) } : product; }),
        customers: workspace.customers.map((customer) => customer.id === sale.customerId ? { ...customer, totalBought: customer.totalBought + sale.total } : customer),
      })); return sale;
    },
    addSupplier: (input) => {
      const supplier = { outstandingBalance: 0, ...input, id: makeId('supplier'), createdAt: new Date().toISOString() };
      update((workspace) => ({ ...workspace, suppliers: [supplier, ...workspace.suppliers] })); return supplier;
    },
    updateSupplier: (supplierId, input) => update((workspace) => ({ ...workspace, suppliers: workspace.suppliers.map((supplier) => supplier.id === supplierId ? { ...supplier, ...input } : supplier) })),
    deleteSupplier: (supplierId) => update((workspace) => ({ ...workspace, suppliers: workspace.suppliers.filter((supplier) => supplier.id !== supplierId), supplierBills: workspace.supplierBills.filter((bill) => bill.supplierId !== supplierId) })),
    addProject: (title) => update((workspace) => ({ ...workspace, projects: [{ id: makeId('project'), title, completed: false, createdAt: new Date().toISOString() }, ...workspace.projects] })),
    updateProject: (projectId, title) => update((workspace) => ({ ...workspace, projects: workspace.projects.map((project) => project.id === projectId ? { ...project, title } : project) })),
    toggleProject: (projectId) => update((workspace) => ({ ...workspace, projects: workspace.projects.map((project) => project.id === projectId ? { ...project, completed: !project.completed } : project) })),
    deleteProject: (projectId) => update((workspace) => ({ ...workspace, projects: workspace.projects.filter((project) => project.id !== projectId) })),
    saveSaleDraft: (input) => {
      const now = new Date().toISOString();
      const existing = input.id ? get().workspaces[get().activeUserId ?? '']?.saleDrafts.find((draft) => draft.id === input.id) : undefined;
      const draft: SaleDraft = { ...input, id: input.id ?? makeId('draft'), createdAt: existing?.createdAt ?? now, updatedAt: now };
      update((workspace) => ({ ...workspace, saleDrafts: existing ? workspace.saleDrafts.map((item) => item.id === draft.id ? draft : item) : [draft, ...workspace.saleDrafts] }));
      return draft;
    },
    deleteSaleDraft: (draftId) => update((workspace) => ({ ...workspace, saleDrafts: workspace.saleDrafts.filter((draft) => draft.id !== draftId) })),
    addSupplierBill: (input) => {
      const bill: SupplierBill = { ...input, id: makeId('bill'), status: 'UNPAID', createdAt: new Date().toISOString() };
      update((workspace) => ({
        ...workspace,
        supplierBills: [bill, ...workspace.supplierBills],
        suppliers: workspace.suppliers.map((supplier) => supplier.id === bill.supplierId ? { ...supplier, outstandingBalance: supplier.outstandingBalance + bill.amount } : supplier),
      }));
      return bill;
    },
    updateSupplierBillStatus: (billId, status) => update((workspace) => {
      const bill = workspace.supplierBills.find((item) => item.id === billId);
      if (!bill || bill.status === status) return workspace;
      const delta = status === 'PAID' ? -bill.amount : bill.amount;
      return {
        ...workspace,
        supplierBills: workspace.supplierBills.map((item) => item.id === billId ? { ...item, status } : item),
        suppliers: workspace.suppliers.map((supplier) => supplier.id === bill.supplierId ? { ...supplier, outstandingBalance: Math.max(0, supplier.outstandingBalance + delta) } : supplier),
      };
    }),
    deleteSupplierBill: (billId) => update((workspace) => {
      const bill = workspace.supplierBills.find((item) => item.id === billId);
      return {
        ...workspace,
        supplierBills: workspace.supplierBills.filter((item) => item.id !== billId),
        suppliers: bill?.status === 'UNPAID' ? workspace.suppliers.map((supplier) => supplier.id === bill.supplierId ? { ...supplier, outstandingBalance: Math.max(0, supplier.outstandingBalance - bill.amount) } : supplier) : workspace.suppliers,
      };
    }),
    addExpenseCategory: (category) => update((workspace) => ({ ...workspace, expenseCategories: workspace.expenseCategories.includes(category) ? workspace.expenseCategories : [...workspace.expenseCategories, category] })),
    addInventoryCategory: (category) => update((workspace) => ({ ...workspace, inventoryCategories: workspace.inventoryCategories.includes(category) ? workspace.inventoryCategories : [...workspace.inventoryCategories, category] })),
    setAutomation: (key, enabled) => update((workspace) => ({ ...workspace, automations: { ...workspace.automations, [key]: enabled } })),
    addTeamMember: (name, email, role, id, status = 'PENDING') => update((workspace) => ({
      ...workspace,
      teamMembers: [{ id: id ?? makeId('member'), name, email, role, status, createdAt: new Date().toISOString() }, ...(workspace.teamMembers ?? [])],
    })),
    deleteTeamMember: (memberId) => update((workspace) => ({ ...workspace, teamMembers: workspace.teamMembers.filter((member) => member.id !== memberId) })),
    addAIExchange: (question, answer) => update((workspace) => {
      const createdAt = new Date().toISOString();
      const conversationId = makeId('conversation');
      return {
        ...workspace,
        aiConversations: [{ id: conversationId, title: question.slice(0, 80), createdAt }, ...(workspace.aiConversations ?? [])],
        aiMessages: [
          { id: makeId('message'), conversationId, role: 'USER', content: question, createdAt },
          { id: makeId('message'), conversationId, role: 'ASSISTANT', content: answer, createdAt },
          ...(workspace.aiMessages ?? []),
        ],
      };
    }),
    setPreference: (key, value) => update((workspace) => ({ ...workspace, preferences: { ...(workspace.preferences ?? {}), [key]: value } })),
    clearWorkspace: () => { const userId = get().activeUserId; if (userId) set((state) => ({ workspaces: { ...state.workspaces, [userId]: emptyWorkspace() }, dirtyUsers: { ...state.dirtyUsers, [userId]: true } })); },
  };
}, {
  name: 'rekoda-business-data-v3',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: ({ workspaces, dirtyUsers }) => ({ workspaces, dirtyUsers }),
  onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
}));

export const normalizeWorkspace = (workspace?: Partial<WorkspaceData> | null): WorkspaceData => ({
  ...emptyWorkspace(), ...workspace,
  products: workspace?.products ?? [], customers: workspace?.customers ?? [], sales: workspace?.sales ?? [],
  invoices: workspace?.invoices ?? [], expenses: workspace?.expenses ?? [], suppliers: workspace?.suppliers ?? [],
  projects: workspace?.projects ?? [], expenseCategories: workspace?.expenseCategories ?? [],
  inventoryCategories: workspace?.inventoryCategories ?? [], automations: workspace?.automations ?? {},
  teamMembers: workspace?.teamMembers ?? [], preferences: workspace?.preferences ?? {},
  inventoryMovements: workspace?.inventoryMovements ?? [], aiConversations: workspace?.aiConversations ?? [], aiMessages: workspace?.aiMessages ?? [],
  saleDrafts: workspace?.saleDrafts ?? [], supplierBills: workspace?.supplierBills ?? [],
  customerBalanceAdjustments: workspace?.customerBalanceAdjustments ?? [],
});

const EMPTY = emptyWorkspace();
export const useWorkspace = () => useBusinessStore((state) => state.activeUserId ? state.workspaces[state.activeUserId] ?? EMPTY : EMPTY);
