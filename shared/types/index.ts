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

<<<<<<< HEAD
// --- User & Permissions ---

export type UserRole = 'owner' | 'doctor' | 'nurse' | 'nursing_tech' | 'receptionist' | 'spouse' | 'secretary' | 'custom';

export interface Permission {
  module: 'patients' | 'appointments' | 'medical_records' | 'prescriptions' | 'financial' | 'crm' | 'whatsapp' | 'reports' | 'settings' | 'users';
  actions: ('view' | 'create' | 'edit' | 'delete' | 'export')[];
}
=======
export type UserRole = 'master' | 'doctor' | 'nurse' | 'receptionist' | 'admin';
>>>>>>> b90ac17 (feat: Knowledge Base Module - Notion+Firebase Sync)

export interface User {
  id: string;
  name: string;
  email: string;
<<<<<<< HEAD
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
=======
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
>>>>>>> b90ac17 (feat: Knowledge Base Module - Notion+Firebase Sync)

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

// --- WhatsApp Queues & Conversations ---

export interface WhatsAppQueue {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;

  // Configurações
  isActive: boolean;
  priority: number; // 1-5 (maior = mais prioritário)

  // Atribuição
  assignmentType: 'manual' | 'round_robin' | 'least_busy' | 'ai';
  assignedUsers: string[]; // IDs dos usuários que podem atender

  // Automação
  autoReply?: {
    enabled: boolean;
    message: string;
    delay: number; // segundos
  };

  // Horário de Funcionamento
  workingHours?: {
    enabled: boolean;
    schedule: {
      [key: string]: { // 0-6 (domingo-sábado)
        start: string;
        end: string;
      };
    };
    outsideHoursMessage?: string;
  };

  // IA (para fila de receitas)
  aiConfig?: {
    enabled: boolean;
    model: 'gpt-4' | 'gpt-4-turbo';
    systemPrompt: string;
    autoGenerate: boolean;
    requireApproval: boolean;
  };

  createdAt: string;
}

export interface WhatsAppMessage {
  id: string;
  conversationId: string;

  // Conteúdo
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  content: string;
  mediaUrl?: string;

  // Direção
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;

  // Status
  status: 'sent' | 'delivered' | 'read' | 'failed';

  // IA
  isAiGenerated?: boolean;
  aiContext?: any;

  timestamp: string;
}

export interface WhatsAppConversation {
  id: string;
  phone: string;
  contactName: string;

  // Atribuição
  queueId?: string;
  assignedTo?: string;
  assignedAt?: string;

  // Status
  status: 'waiting' | 'in_progress' | 'resolved' | 'closed';

  // Mensagens
  messages: WhatsAppMessage[];
  lastMessageAt: string;
  unreadCount: number;

  // Contexto
  patientId?: string;
  leadId?: string;
  appointmentId?: string;

  // Tags
  tags: string[];

  createdAt: string;
}

// --- Patient (Expanded for MedX) ---

export interface Patient {
  id: string;
  name: string;
  socialName?: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  gender: 'M' | 'F' | 'Outro';

  // Contato
  email?: string;
  phone: string;
  phoneAlternative?: string;
  phoneWork?: string;

  // Endereço
  address: string;
  neighborhood: string;
  zipCode: string;
  city: string;
  state?: string; // UF
  region?: string; // Região
  complement?: string;
  reference?: string; // Ponto de referência

  // Convênio
  insurance?: string; // Convênio
  insuranceNumber?: string; // Matrícula / Carteirinha
  cns?: string; // Cartão Nacional de Saúde

  // Complementares
  profession?: string;
  company?: string;
  civilStatus?: string; // Estado Civil
  education?: string; // Escolaridade
  religion?: string; // Religião
  marketingTags?: string[]; // VIP, Excluir do Mkt, etc

  // Origem
  referralSource?: string; // Conheceu por
  referredBy?: string; // Indicado por (Nome de contato)

  // Familiares
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  childrenCount?: number;

  // Meta
  source: 'Manual' | 'MedX Integration';
  medxId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string; // Observações gerais
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'export' | 'view';
  module: string; // 'patients', 'financial', etc.
  resourceId?: string; // ID do objeto afetado
  details?: string; // Descrição human-readable
  metadata?: any; // Dados técnicos (diff, ip, userAgent)
  timestamp: string;
}


// Inventory System
export * from './inventory.js';
