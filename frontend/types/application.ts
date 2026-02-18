export type ApplicationStatus =
    | 'prescribed'
    | 'waiting_purchase'
    | 'purchased'
    | 'scheduled'
    | 'administered'
    | 'cancelled';

export interface ApplicationOrder {
    id: string;
    prescriptionId?: string;
    patientId: string;
    patientName: string;
    productName: string;
    productDetails?: string;
    quantity: number;
    unit: string;
    route: string;
    status: ApplicationStatus;
    priority: 'routine' | 'urgent' | 'stat';
    purchaseConfirmed: boolean;
    purchaseConfirmedAt?: string;
    purchaseConfirmedBy?: string;
    purchaseNotes?: string;
    batchNumber?: string;
    batchExpiration?: string;
    manufacturer?: string;
    administeredBy?: string;
    administeredAt?: string;
    applicationSite?: string;
    administrationNotes?: string;
    cancelledBy?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    scheduledFor?: string;
    prescribedBy: string;
    createdAt: string;
    updatedAt: string;
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
