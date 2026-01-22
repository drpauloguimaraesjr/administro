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

// --- User & Permissions ---

export type UserRole = 'owner' | 'doctor' | 'nurse' | 'nursing_tech' | 'receptionist' | 'spouse' | 'secretary' | 'custom';

export interface Permission {
  module: 'patients' | 'appointments' | 'medical_records' | 'prescriptions' | 'financial' | 'crm' | 'whatsapp' | 'reports' | 'settings' | 'users';
  actions: ('view' | 'create' | 'edit' | 'delete' | 'export')[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;

  // Professional
  role: UserRole;
  customRoleName?: string;
  professionalId?: string; // CRM, COREN, etc
  specialty?: string;

  // Permissions & Contexts
  contexts: ContextType[]; // Mantendo compatibilidade legada
  permissions: Permission[];

  // Agenda Configuration
  hasAgenda: boolean;
  agendaConfig?: {
    workingDays: number[]; // 0-6 (domingo-sábado)
    workingHours: {
      start: string; // "08:00"
      end: string; // "18:00"
      lunchStart?: string;
      lunchEnd?: string;
    };
    appointmentDuration: number; // minutos
    allowOnlineBooking: boolean;
  };

  // WhatsApp Configuration
  canAnswerWhatsApp: boolean;
  whatsappQueues: string[]; // IDs das filas que pode atender

  // Status
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  createdBy?: string;
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    { module: 'patients', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'appointments', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'medical_records', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'prescriptions', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'financial', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'crm', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'whatsapp', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'reports', actions: ['view', 'export'] },
    { module: 'settings', actions: ['view', 'edit'] },
    { module: 'users', actions: ['view', 'create', 'edit', 'delete'] }
  ],
  doctor: [
    { module: 'patients', actions: ['view', 'create', 'edit'] },
    { module: 'appointments', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'medical_records', actions: ['view', 'create', 'edit'] },
    { module: 'prescriptions', actions: ['view', 'create', 'edit'] },
    { module: 'financial', actions: ['view'] },
    { module: 'crm', actions: ['view', 'create', 'edit'] },
    { module: 'whatsapp', actions: ['view', 'create'] },
    { module: 'reports', actions: ['view'] }
  ],
  receptionist: [
    { module: 'patients', actions: ['view', 'create', 'edit'] },
    { module: 'appointments', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'financial', actions: ['view', 'create', 'edit'] },
    { module: 'whatsapp', actions: ['view', 'create'] },
    { module: 'crm', actions: ['view', 'create', 'edit'] }
  ]
};

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
  createdBy?: string;
  createdByName?: string;
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

// CRM Types (Duplicated from frontend types for shared usage potentially)
// Idealmente isso estaria em um pacote separado ou monorepo real
// Por enquanto vamos manter a interface Lead disponível no backend também
export type LeadStage = 'new' | 'contacted' | 'qualified' | 'scheduled' | 'converted' | 'lost';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone: string;
  source: string;
  stage: LeadStage;
  stageUpdatedAt: string;
  score?: number;
  tags?: string[];
  lastContactAt?: string;
  createdAt: string;
  updatedAt: string;
  // ... outros campos podem ser adicionados conforme necessidade
  stageHistory?: any[];
  interactions?: any[];
}
