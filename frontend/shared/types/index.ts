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

export type UserRole = 'master' | 'doctor' | 'nurse' | 'receptionist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  // role: UserRole; 
  role: UserRole | 'owner' | 'spouse' | 'secretary';
  permissions: string[];
  specialty?: string;
  phone?: string;
  isActive: boolean;
  contexts: ContextType[];
  createdAt?: Date | string;
}

export interface Intercurrence {
  id: string;
  patientId: string;
  patientName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  description: string;
  aiAnalysis?: {
    summary: string;
    suggestion: string;
    riskScore: number;
  };
  chatContext?: string; // Log ID or text
  createdAt: string;
  updatedAt: string;
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

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type AppointmentType = 'first_visit' | 'return' | 'evaluation' | 'emergency';

export interface Appointment {
  id?: string;
  patientName: string;
  patientPhone: string;
  date: string | Date;
  time: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  contextId?: 'CLINIC';
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: string;
}
