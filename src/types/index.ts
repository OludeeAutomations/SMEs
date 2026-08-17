export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  country: string;
  currency: string;
  branchName: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  supplierId?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  emailAddress?: string;
  address?: string;
  notes?: string;
  totalBought: number;
  amountOwed: number;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  subtotal: number;
  total: number;
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD';
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  total: number;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  dueDate: string;
  terms?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  merchant?: string;
  date: string;
  isRecurring: boolean;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phoneNumber: string;
  emailAddress?: string;
  address?: string;
  outstandingBalance: number;
  createdAt: string;
}
