// backend/src/types/applications.types.ts

export type ApplicationStatus =
    | 'prescribed'        // Médico prescreveu
    | 'waiting_purchase'  // Aguardando paciente comprar
    | 'purchased'         // Paciente confirmou compra
    | 'scheduled'         // Agendado para aplicação
    | 'administered'      // Aplicado
    | 'cancelled';        // Cancelado

export interface ApplicationOrder {
    id: string;
    // Referências
    prescriptionId?: string;
    patientId: string;
    patientName: string;
    // Produto
    productName: string;
    productDetails?: string;      // Concentração, apresentação
    quantity: number;
    unit: string;
    route: string;                // IM, EV, SC, VO
    // Status
    status: ApplicationStatus;
    priority: 'routine' | 'urgent' | 'stat';
    // Compra do paciente
    purchaseConfirmed: boolean;
    purchaseConfirmedAt?: string;
    purchaseConfirmedBy?: string;
    purchaseNotes?: string;
    // Dados do lote (quando paciente traz o produto)
    batchNumber?: string;
    batchExpiration?: string;
    manufacturer?: string;
    // Aplicação
    administeredBy?: string;
    administeredAt?: string;
    applicationSite?: string;     // Braço D, Glúteo E, etc.
    administrationNotes?: string;
    // Cancelamento
    cancelledBy?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    // Agendamento
    scheduledFor?: string;
    // Prescritor
    prescribedBy: string;
    // Timestamps
    createdAt: string;
    updatedAt: string;
}

export interface CreateApplicationInput {
    prescriptionId?: string;
    patientId: string;
    patientName: string;
    productName: string;
    productDetails?: string;
    quantity: number;
    unit: string;
    route: string;
    priority?: 'routine' | 'urgent' | 'stat';
    scheduledFor?: string;
    prescribedBy: string;
}

export interface ConfirmPurchaseInput {
    confirmedBy: string;
    batchNumber?: string;
    batchExpiration?: string;
    manufacturer?: string;
    notes?: string;
}

export interface RegisterApplicationInput {
    administeredBy: string;
    applicationSite?: string;
    notes?: string;
}

export interface ApplicationSummary {
    prescribed: number;
    waitingPurchase: number;
    purchased: number;
    scheduled: number;
    administered: number;
    cancelled: number;
    total: number;
    todayApplications: number;
}

export interface ProductSummaryItem {
    productName: string;
    totalOrders: number;
    administered: number;
    waitingPurchase: number;
    purchased: number;
    lastAdministered?: string;
    patients: string[];
}
