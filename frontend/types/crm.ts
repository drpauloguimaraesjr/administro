
export type LeadStage = 'first_contact' | 'medical_appointment' | 'appointment_confirmation' | 'procedure_confirmation' | 'complications' | 'doubts' | 'dr_paulo';

export type LeadSource =
    | 'whatsapp'
    | 'instagram'
    | 'facebook'
    | 'google'
    | 'indication'
    | 'website'
    | 'phone'
    | 'other';

export type Priority = 'low' | 'medium' | 'high';

export interface StageChange {
    from: string;
    to: string;
    changedAt: string;
    changedBy: string;
    notes?: string;
}

export interface Interaction {
    id: string;
    type: 'call' | 'whatsapp' | 'email' | 'meeting' | 'note';
    direction?: 'inbound' | 'outbound';
    content: string;
    duration?: number;
    outcome?: 'successful' | 'no_answer' | 'rescheduled' | 'not_interested';
    createdAt: string;
    createdBy: string;
}

export type TaskType = 'call' | 'whatsapp' | 'email' | 'meeting' | 'follow_up' | 'other';
export type TaskStatus = 'pending' | 'completed' | 'cancelled';

export interface Task {
    id: string;
    leadId?: string;
    patientId?: string;
    title: string;
    description?: string;
    type: TaskType;
    priority: Priority;
    status: TaskStatus;
    dueDate: string;
    assignedTo: string;
    completedAt?: string;
    createdAt: string;
    createdBy: string;
    // Visual meta
    leadName?: string; // Para display rápido
}

export interface Lead {
    id: string;

    // Dados Pessoais
    name: string;
    email?: string;
    phone: string;
    cpf?: string;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other';

    // Origem
    source: LeadSource;
    sourceDetails?: string;
    referredBy?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;

    // Pipeline
    stage: LeadStage;
    stageUpdatedAt: string;
    stageHistory: StageChange[];

    // Qualificação
    interest?: string;
    budget?: Priority;
    urgency?: Priority;
    score?: number; // 0-100
    tags?: string[];

    // Atribuição
    assignedTo?: string;
    assignedAt?: string;

    // Interações
    lastContactAt?: string;
    nextFollowUpAt?: string;
    interactions?: Interaction[];

    // Conversão
    convertedToPatientId?: string;
    convertedAt?: string;
    lostReason?: string;
    lostAt?: string;

    // Metadados
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    estimatedValue?: number; // Valor estimado para cálculo do pipeline
}

// Kanban Types
export interface KanbanColumn {
    id: LeadStage;
    title: string;
    color: string;
    emoji: string;
    leads: Lead[];
}
