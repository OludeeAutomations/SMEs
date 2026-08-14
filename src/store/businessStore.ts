import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Customer, Expense, Invoice, Product, Sale, Supplier } from '@/types';

export interface Project { id: string; title: string; completed: boolean; createdAt: string }
export interface TeamMember { id: string; name: string; email: string; role: string; createdAt: string }
export interface WorkspaceData {
  products: Product[]; customers: Customer[]; sales: Sale[]; invoices: Invoice[];
  expenses: Expense[]; suppliers: Supplier[]; projects: Project[];
  expenseCategories: string[]; inventoryCategories: string[]; automations: Record<string, boolean>;
  teamMembers: TeamMember[]; preferences: Record<string, string | boolean>;
}
type ProductInput = Omit<Product, 'id' | 'createdAt'>;
type CustomerInput = Omit<Customer, 'id' | 'createdAt' | 'totalBought' | 'amountOwed'> & Partial<Pick<Customer, 'totalBought' | 'amountOwed'>>;
type ExpenseInput = Omit<Expense, 'id' | 'createdAt'>;
type InvoiceInput = Omit<Invoice, 'id' | 'createdAt'>;
type SupplierInput = Omit<Supplier, 'id' | 'createdAt' | 'outstandingBalance'> & Partial<Pick<Supplier, 'outstandingBalance'>>;
type SaleInput = Omit<Sale, 'id' | 'createdAt'>;

interface BusinessState {
  activeUserId: string | null; workspaces: Record<string, WorkspaceData>; hasHydrated: boolean;
  setActiveUser: (userId: string | null) => void; setHasHydrated: (value: boolean) => void;
  addProduct: (input: ProductInput) => Product; adjustStock: (productId: string, quantity: number) => void;
  addCustomer: (input: CustomerInput) => Customer; addExpense: (input: ExpenseInput) => Expense;
  addInvoice: (input: InvoiceInput) => Invoice; updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => void;
  addSale: (input: SaleInput) => Sale; addSupplier: (input: SupplierInput) => Supplier;
  addProject: (title: string) => void; toggleProject: (id: string) => void;
  addExpenseCategory: (category: string) => void; addInventoryCategory: (category: string) => void;
  setAutomation: (key: string, enabled: boolean) => void; clearWorkspace: () => void;
  addTeamMember: (name: string, email: string, role: string) => void;
  setPreference: (key: string, value: string | boolean) => void;
}

export const emptyWorkspace = (): WorkspaceData => ({
  products: [], customers: [], sales: [], invoices: [], expenses: [], suppliers: [], projects: [],
  expenseCategories: [], inventoryCategories: [], automations: {}, teamMembers: [], preferences: {},
});
const makeId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useBusinessStore = create<BusinessState>()(persist((set, get) => {
  const update = (recipe: (workspace: WorkspaceData) => WorkspaceData) => {
    const userId = get().activeUserId;
    if (!userId) return;
    set((state) => ({ workspaces: { ...state.workspaces, [userId]: recipe(state.workspaces[userId] ?? emptyWorkspace()) } }));
  };
  return {
    activeUserId: null, workspaces: {}, hasHydrated: false,
    setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    setActiveUser: (activeUserId) => set((state) => ({
      activeUserId,
      workspaces: activeUserId && !state.workspaces[activeUserId] ? { ...state.workspaces, [activeUserId]: emptyWorkspace() } : state.workspaces,
    })),
    addProduct: (input) => {
      const product = { ...input, id: makeId('product'), createdAt: new Date().toISOString() };
      update((workspace) => ({ ...workspace, products: [product, ...workspace.products] })); return product;
    },
    adjustStock: (productId, quantity) => update((workspace) => ({ ...workspace, products: workspace.products.map((product) => product.id === productId ? { ...product, stockQuantity: Math.max(0, product.stockQuantity + quantity) } : product) })),
    addCustomer: (input) => {
      const customer = { totalBought: 0, amountOwed: 0, ...input, id: makeId('customer'), createdAt: new Date().toISOString() };
      update((workspace) => ({ ...workspace, customers: [customer, ...workspace.customers] })); return customer;
    },
    addExpense: (input) => {
      const expense = { ...input, id: makeId('expense'), createdAt: new Date().toISOString() };
      update((workspace) => ({ ...workspace, expenses: [expense, ...workspace.expenses], expenseCategories: workspace.expenseCategories.includes(expense.category) ? workspace.expenseCategories : [...workspace.expenseCategories, expense.category] })); return expense;
    },
    addInvoice: (input) => {
      const invoice = { ...input, id: makeId('invoice'), createdAt: new Date().toISOString() };
      update((workspace) => ({ ...workspace, invoices: [invoice, ...workspace.invoices], customers: workspace.customers.map((customer) => customer.id === invoice.customerId ? { ...customer, amountOwed: customer.amountOwed + invoice.total } : customer) })); return invoice;
    },
    updateInvoiceStatus: (invoiceId, status) => update((workspace) => {
      const invoice = workspace.invoices.find((item) => item.id === invoiceId);
      const justPaid = invoice && invoice.status !== 'PAID' && status === 'PAID';
      return { ...workspace, invoices: workspace.invoices.map((item) => item.id === invoiceId ? { ...item, status } : item), customers: justPaid ? workspace.customers.map((customer) => customer.id === invoice.customerId ? { ...customer, amountOwed: Math.max(0, customer.amountOwed - invoice.total) } : customer) : workspace.customers };
    }),
    addSale: (input) => {
      const sale = { ...input, id: makeId('sale'), createdAt: new Date().toISOString() };
      update((workspace) => ({
        ...workspace, sales: [sale, ...workspace.sales],
        products: workspace.products.map((product) => { const sold = sale.items.find((item) => item.productId === product.id); return sold ? { ...product, stockQuantity: Math.max(0, product.stockQuantity - sold.quantity) } : product; }),
        customers: workspace.customers.map((customer) => customer.id === sale.customerId ? { ...customer, totalBought: customer.totalBought + sale.total } : customer),
      })); return sale;
    },
    addSupplier: (input) => {
      const supplier = { outstandingBalance: 0, ...input, id: makeId('supplier'), createdAt: new Date().toISOString() };
      update((workspace) => ({ ...workspace, suppliers: [supplier, ...workspace.suppliers] })); return supplier;
    },
    addProject: (title) => update((workspace) => ({ ...workspace, projects: [{ id: makeId('project'), title, completed: false, createdAt: new Date().toISOString() }, ...workspace.projects] })),
    toggleProject: (projectId) => update((workspace) => ({ ...workspace, projects: workspace.projects.map((project) => project.id === projectId ? { ...project, completed: !project.completed } : project) })),
    addExpenseCategory: (category) => update((workspace) => ({ ...workspace, expenseCategories: workspace.expenseCategories.includes(category) ? workspace.expenseCategories : [...workspace.expenseCategories, category] })),
    addInventoryCategory: (category) => update((workspace) => ({ ...workspace, inventoryCategories: workspace.inventoryCategories.includes(category) ? workspace.inventoryCategories : [...workspace.inventoryCategories, category] })),
    setAutomation: (key, enabled) => update((workspace) => ({ ...workspace, automations: { ...workspace.automations, [key]: enabled } })),
    addTeamMember: (name, email, role) => update((workspace) => ({ ...workspace, teamMembers: [{ id: makeId('member'), name, email, role, createdAt: new Date().toISOString() }, ...(workspace.teamMembers ?? [])] })),
    setPreference: (key, value) => update((workspace) => ({ ...workspace, preferences: { ...(workspace.preferences ?? {}), [key]: value } })),
    clearWorkspace: () => { const userId = get().activeUserId; if (userId) set((state) => ({ workspaces: { ...state.workspaces, [userId]: emptyWorkspace() } })); },
  };
}, {
  name: 'ease-business-data-v2', storage: createJSONStorage(() => AsyncStorage),
  partialize: ({ workspaces }) => ({ workspaces }),
  onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
}));

const EMPTY = emptyWorkspace();
export const useWorkspace = () => useBusinessStore((state) => state.activeUserId ? state.workspaces[state.activeUserId] ?? EMPTY : EMPTY);
