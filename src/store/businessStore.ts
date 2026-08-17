import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Customer, Expense, Invoice, Product, Sale, Supplier } from '@/types';

export interface Project { id: string; title: string; completed: boolean; createdAt: string }
export interface TeamMember { id: string; name: string; email: string; role: string; createdAt: string }
export interface InventoryMovement { id: string; productId: string; productName: string; quantity: number; type: 'OPENING' | 'ADJUSTMENT' | 'SALE'; createdAt: string }
export interface AIConversation { id: string; title: string; createdAt: string }
export interface AIMessage { id: string; conversationId: string; role: 'USER' | 'ASSISTANT'; content: string; createdAt: string }
export interface WorkspaceData {
  products: Product[]; customers: Customer[]; sales: Sale[]; invoices: Invoice[];
  expenses: Expense[]; suppliers: Supplier[]; projects: Project[];
  expenseCategories: string[]; inventoryCategories: string[]; automations: Record<string, boolean>;
  teamMembers: TeamMember[]; preferences: Record<string, string | boolean>;
  inventoryMovements: InventoryMovement[]; aiConversations: AIConversation[]; aiMessages: AIMessage[];
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
  addCustomer: (input: CustomerInput) => Customer; addExpense: (input: ExpenseInput) => Expense;
  addInvoice: (input: InvoiceInput) => Invoice; updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => void;
  addSale: (input: SaleInput) => Sale; addSupplier: (input: SupplierInput) => Supplier;
  addProject: (title: string) => void; toggleProject: (id: string) => void;
  addExpenseCategory: (category: string) => void; addInventoryCategory: (category: string) => void;
  setAutomation: (key: string, enabled: boolean) => void; clearWorkspace: () => void;
  addTeamMember: (name: string, email: string, role: string) => void;
  addAIExchange: (question: string, answer: string) => void;
  setPreference: (key: string, value: string | boolean) => void;
  replaceWorkspace: (userId: string, workspace: WorkspaceData) => void;
  markSynced: (userId: string) => void;
}

export const emptyWorkspace = (): WorkspaceData => ({
  products: [], customers: [], sales: [], invoices: [], expenses: [], suppliers: [], projects: [],
  expenseCategories: [], inventoryCategories: [], automations: {}, teamMembers: [], preferences: {},
  inventoryMovements: [], aiConversations: [], aiMessages: [],
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
      workspaces: activeUserId && !state.workspaces[activeUserId] ? { ...state.workspaces, [activeUserId]: emptyWorkspace() } : state.workspaces,
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
        inventoryMovements: [...sale.items.filter((item) => workspace.products.some((product) => product.id === item.productId)).map((item) => ({ id: makeId('movement'), productId: item.productId, productName: item.productName, quantity: -item.quantity, type: 'SALE' as const, createdAt: sale.createdAt })), ...(workspace.inventoryMovements ?? [])],
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
  name: 'ease-business-data-v2', storage: createJSONStorage(() => AsyncStorage),
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
});

const EMPTY = emptyWorkspace();
export const useWorkspace = () => useBusinessStore((state) => state.activeUserId ? state.workspaces[state.activeUserId] ?? EMPTY : EMPTY);
