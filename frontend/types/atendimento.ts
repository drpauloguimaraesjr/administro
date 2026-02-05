// ===========================================
// TIPOS DO MÓDULO DE ATENDIMENTO COM IA
// ===========================================

// Instância Z-API (WhatsApp)
export interface ZAPIInstance {
  id: string;
  name: string;                    // Ex: "Recepção Principal"
  phone: string;                   // Número do WhatsApp
  zapiInstanceId: string;          // ID da instância na Z-API
  zapiToken: string;               // Token de autenticação
  status: 'connected' | 'disconnected' | 'connecting' | 'qr_required';
  qrCode?: string;                 // QR Code base64 quando necessário
  assignedAgentId?: string;        // Agente de IA vinculado
  assignedEmployeeId?: string;     // Funcionário responsável
  createdAt: string;
  updatedAt: string;
}

// Funcionário/Atendente
export interface Employee {
  id: string;
  name: string;
  role: string;                    // Ex: "Recepcionista", "Secretária"
  email?: string;
  phone?: string;
  workSchedule: WorkSchedule;
  isActive: boolean;
  createdAt: string;
}

// Horário de trabalho
export interface WorkSchedule {
  monday: DaySchedule | null;
  tuesday: DaySchedule | null;
  wednesday: DaySchedule | null;
  thursday: DaySchedule | null;
  friday: DaySchedule | null;
  saturday: DaySchedule | null;
  sunday: DaySchedule | null;
}

export interface DaySchedule {
  start: string;  // "08:00"
  end: string;    // "18:00"
  breakStart?: string;
  breakEnd?: string;
}

// Agente de IA
export interface AIAgent {
  id: string;
  name: string;                    // Ex: "Agente Maria"
  mode: AgentMode;
  personality: AgentPersonality;
  linkedEmployeeId?: string;       // Funcionário que ele imita
  linkedInstanceId?: string;       // Instância WhatsApp vinculada
  knowledgeBaseId?: string;        // Base de conhecimento
  learningEnabled: boolean;        // Se aprende com edições
  stats: AgentStats;
  createdAt: string;
  updatedAt: string;
}

export type AgentMode = 
  | 'autopilot'     // Responde automaticamente
  | 'copilot'       // Sugere respostas para aprovação
  | 'disabled';     // Desativado

export interface AgentPersonality {
  tone: 'formal' | 'friendly' | 'professional' | 'casual';
  responseStyle: 'concise' | 'detailed' | 'balanced';
  greetingTemplate?: string;
  signatureTemplate?: string;
  customInstructions?: string;
}

export interface AgentStats {
  totalMessages: number;
  autoResponses: number;
  suggestionsAccepted: number;
  suggestionsEdited: number;
  suggestionsRejected: number;
  avgResponseTime: number;         // em segundos
  satisfactionScore?: number;      // 0-100
}

// Conversa
export interface Conversation {
  id: string;
  instanceId: string;
  contactPhone: string;
  contactName?: string;
  patientId?: string;              // Se vinculado a paciente
  status: ConversationStatus;
  lastMessageAt: string;
  unreadCount: number;
  assignedTo?: 'agent' | 'employee';
  sentinelFlags: SentinelFlag[];
  messages: Message[];
  createdAt: string;
}

export type ConversationStatus = 
  | 'active'
  | 'waiting_response'
  | 'resolved'
  | 'escalated';

export interface Message {
  id: string;
  conversationId: string;
  direction: 'inbound' | 'outbound';
  content: string;
  contentType: 'text' | 'image' | 'audio' | 'document' | 'location';
  mediaUrl?: string;
  sender: MessageSender;
  aiSuggestion?: AISuggestion;
  sentinelAnalysis?: SentinelAnalysis;
  timestamp: string;
}

export interface MessageSender {
  type: 'contact' | 'employee' | 'agent';
  id?: string;
  name?: string;
}

// Sugestão da IA
export interface AISuggestion {
  id: string;
  suggestedText: string;
  confidence: number;              // 0-100
  status: 'pending' | 'accepted' | 'edited' | 'rejected';
  editedText?: string;
  respondedAt?: string;
}

// ===========================================
// SISTEMA SENTINELA
// ===========================================

export interface SentinelAlert {
  id: string;
  conversationId: string;
  instanceId: string;
  type: SentinelAlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  triggerMessage: string;
  suggestedAction?: string;
  status: 'new' | 'viewed' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export type SentinelAlertType =
  | 'insecurity'            // Cliente demonstra insegurança
  | 'distrust'              // Desconfiança
  | 'complaint'             // Reclamação
  | 'price_concern'         // Preocupação com preço
  | 'competitor_mention'    // Mencionou concorrente
  | 'aggression'            // Tom agressivo
  | 'frustration'           // Frustração
  | 'unresolved_question'   // Dúvida não respondida
  | 'delayed_response'      // Demora na resposta
  | 'cancellation_intent'   // Intenção de cancelar
  | 'urgent_medical'        // Urgência médica
  | 'custom';               // Personalizado

export interface SentinelFlag {
  type: SentinelAlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  messageId: string;
  timestamp: string;
}

export interface SentinelAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;          // -100 a 100
  flags: SentinelFlag[];
  keywords: string[];
  requiresAttention: boolean;
}

// ===========================================
// CONFIGURAÇÕES
// ===========================================

export interface AttendanceConfig {
  autopilotSchedule: {
    enabled: boolean;
    outsideWorkHours: boolean;
    weekends: boolean;
    holidays: boolean;
  };
  sentinelConfig: {
    enabled: boolean;
    alertDestination: 'telegram' | 'email' | 'dashboard' | 'all';
    alertTelegramChatId?: string;
    alertEmail?: string;
    sensitivityLevel: 'low' | 'medium' | 'high';
    alertTypes: SentinelAlertType[];
  };
  responseConfig: {
    maxAutoResponseDelay: number;  // segundos
    requireApprovalFor: string[];  // tipos de mensagem
    fallbackMessage: string;
  };
}

// ===========================================
// DASHBOARD
// ===========================================

export interface AttendanceDashboard {
  overview: {
    totalConversations: number;
    activeConversations: number;
    pendingResponses: number;
    avgResponseTime: number;
  };
  instances: {
    total: number;
    connected: number;
    disconnected: number;
  };
  agents: {
    total: number;
    autopilot: number;
    copilot: number;
  };
  sentinel: {
    newAlerts: number;
    criticalAlerts: number;
    resolvedToday: number;
  };
  performance: {
    messagesHandledByAI: number;
    messagesHandledByHumans: number;
    aiAccuracyRate: number;
  };
}
