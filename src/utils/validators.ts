import { z } from 'zod';

// ==========================================
// Authentication Schemas
// ==========================================

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signUpSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  businessEmail: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  companySize: z.string().min(1, { message: 'Please select a company size' }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const resetPasswordSchema = z.object({
  emailAddress: z.string().email({ message: 'Invalid email address' }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const otpSchema = z.object({
  code: z.string().length(6, { message: 'OTP must be exactly 6 digits' }),
});

export type OtpInput = z.infer<typeof otpSchema>;

// ==========================================
// Business Profile Schemas
// ==========================================

export const businessProfileSchema = z.object({
  businessName: z.string().min(2, { message: 'Business name is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  country: z.string().min(1, { message: 'Country is required' }),
  currency: z.string().min(1, { message: 'Currency is required' }),
  branchName: z.string().min(1, { message: 'Branch name is required' }),
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;

// ==========================================
// Sales & Customers Schemas
// ==========================================

export const addCustomerSchema = z.object({
  fullName: z.string().min(2, { message: 'Name is required' }),
  phoneNumber: z.string().min(10, { message: 'Invalid phone number length' }),
  emailAddress: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type AddCustomerInput = z.infer<typeof addCustomerSchema>;

export const recordSaleSchema = z.object({
  customerId: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'TRANSFER', 'CARD']),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive({ message: 'Quantity must be at least 1' }),
    price: z.number().positive(),
  })).min(1, { message: 'Must add at least 1 item' }),
  notes: z.string().optional(),
});

export type RecordSaleInput = z.infer<typeof recordSaleSchema>;

// ==========================================
// Inventory & Invoices Schemas
// ==========================================

export const addProductSchema = z.object({
  name: z.string().min(2, { message: 'Product name is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  costPrice: z.number().positive({ message: 'Cost price must be positive' }),
  sellingPrice: z.number().positive({ message: 'Selling price must be positive' }),
  stockQuantity: z.number().int().nonnegative({ message: 'Stock cannot be negative' }),
  lowStockThreshold: z.number().int().positive({ message: 'Threshold must be positive' }).default(5),
  supplierId: z.string().optional(),
});

export type AddProductInput = z.infer<typeof addProductSchema>;

export const createInvoiceSchema = z.object({
  customerId: z.string().min(1, { message: 'Select a customer' }),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })).min(1, { message: 'Must add at least 1 item' }),
  dueDate: z.string().min(1, { message: 'Due date is required' }),
  terms: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

// ==========================================
// Expenses Schemas
// ==========================================

export const addExpenseSchema = z.object({
  amount: z.number().positive({ message: 'Amount must be positive' }),
  category: z.string().min(1, { message: 'Category is required' }),
  description: z.string().min(2, { message: 'Description is required' }),
  merchant: z.string().optional(),
  date: z.string().min(1, { message: 'Date is required' }),
  isRecurring: z.boolean().default(false),
});

export type AddExpenseInput = z.infer<typeof addExpenseSchema>;
