/**
 * Tipos compartilhados entre Frontend e Backend
 * Mantém consistência na comunicação entre as partes do sistema
 */

export type ContextType = 'HOME' | 'CLINIC' | 'OVERVIEW';

export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'paid' | 'pending';

export interface Transaction {
  id?: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: Date | string;
  description: string;
  category: string;
  contextId: 'HOME' | 'CLINIC';
  attachmentUrl?: string;
  createdBy?: string; // Email do usuário que criou
  createdByName?: string; // Nome do usuário que criou
  supplier?: string; // Fornecedor / Beneficiário
  invoiceNumber?: string; // Número da Nota Fiscal / Recibo
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Investment {
  id?: string;
  name: string;
  type: 'real_estate' | 'stocks' | 'bonds' | 'crypto' | 'other';
  totalAmount: number;
  investedAmount: number;
  installments?: {
    total: number;
    paid: number;
    value: number;
    dueDate: Date | string;
  };
  contextId: 'HOME' | 'CLINIC';
  createdBy?: string; // Email do usuário que criou
  createdByName?: string; // Nome do usuário que criou
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Wallet {
  id: string;
  name: string;
  contextType: ContextType;
  balance?: number;
  createdAt?: Date | string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'spouse' | 'secretary';
  contexts: ContextType[];
  createdAt?: Date | string;
}

/**
 * Payload recebido do n8n após processamento OCR
 */
export interface N8nTransactionPayload {
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
  category: string;
  contextId: 'HOME' | 'CLINIC';
  attachmentUrl?: string;
}


export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // ISO date (yyyy-mm-dd)
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  duration: number; // minutes
  type: 'first_visit' | 'return' | 'evaluation';
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  whatsappSent: boolean;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}
