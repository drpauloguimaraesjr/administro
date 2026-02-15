// backend/src/types/nursing-orders.types.ts

export interface NursingOrder {
    id: string;
    prescriptionId: string;
    patientId: string;
    patientName: string;
    productId: string;
    productName: string;
    batchId?: string;
    batchNumber?: string;
    quantity: number;
    unit: string;
    route: string;              // IM, EV, SC, VO, etc.
    instructions: string;
    status: NursingOrderStatus;
    priority: 'routine' | 'urgent' | 'stat';
    scheduledFor?: string;      // ISO date — quando aplicar
    // Workflow tracking
    preparedBy?: string;
    preparedAt?: string;
    administeredBy?: string;
    administeredAt?: string;
    administrationNotes?: string;
    cancelledBy?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    // Origin
    prescribedBy: string;
    clinicId?: string;
    createdAt: string;
    updatedAt: string;
}

export type NursingOrderStatus = 
    | 'pending'        // Aguardando preparo
    | 'preparing'      // Em preparo pela enfermagem
    | 'ready'          // Pronto para administração
    | 'administered'   // Aplicado no paciente
    | 'cancelled';     // Cancelado

export interface CreateNursingOrderInput {
    prescriptionId: string;
    patientId: string;
    patientName: string;
    productId: string;
    productName: string;
    batchId?: string;
    batchNumber?: string;
    quantity: number;
    unit: string;
    route: string;
    instructions: string;
    priority?: 'routine' | 'urgent' | 'stat';
    scheduledFor?: string;
    prescribedBy: string;
    clinicId?: string;
}

export interface UpdateNursingOrderStatusInput {
    status: NursingOrderStatus;
    performedBy: string;
    notes?: string;
    cancellationReason?: string;
}

export interface NursingOrderSummary {
    pending: number;
    preparing: number;
    ready: number;
    administered: number;
    cancelled: number;
    total: number;
}
