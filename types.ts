
export type TransactionType = 'INCOME' | 'EXPENSE';
export type InvoiceStatus = 'PENDING' | 'PAID';
export type InvoiceType = 'RECEIVABLE' | 'PAYABLE'; // CXC vs CXP
export type Role = 'ADMIN' | 'ACCOUNTANT' | 'OPERATOR';
export type TransactionStatus = 'PENDING' | 'VALIDATED' | 'REJECTED';
export type InvoiceValidationStatus = 'DRAFT' | 'VALIDATED';

export interface DBConfig {
  server: string;
  database: string;
  user: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
  username?: string;
  password?: string;
}

export interface Custodian {
  id: string;
  name: string;
  balance: number; // Current cash on hand
  avatar?: string;
}

export interface Invoice {
  id: string;
  entityName: string; // Who we owe or who owes us
  description: string;
  amount: number;
  dueDate: string;
  type: InvoiceType;
  status: InvoiceStatus; // Paid or Pending
  validationStatus: InvoiceValidationStatus; // Workflow status
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  custodianId: string;
  description: string;
  status: TransactionStatus;
  relatedInvoiceId?: string;
}

export interface FinancialSummary {
  totalCash: number;
  totalReceivables: number;
  totalPayables: number;
}
