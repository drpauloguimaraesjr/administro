// backend/src/types/partners.types.ts

export interface Partner {
    id: string;
    name: string;
    type: 'farmácia' | 'fornecedor' | 'laboratório';
    contactName?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    integrationMethod: 'email' | 'whatsapp' | 'manual';
    specialties?: string[];       // Ex: "manipulados", "oncológicos", "dermatológicos"
    notes?: string;
    isActive: boolean;
    clinicId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePartnerInput {
    name: string;
    type: 'farmácia' | 'fornecedor' | 'laboratório';
    contactName?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    integrationMethod?: 'email' | 'whatsapp' | 'manual';
    specialties?: string[];
    notes?: string;
    clinicId?: string;
}

export interface PartnerForwarding {
    id: string;
    partnerId: string;
    partnerName: string;
    patientId: string;
    patientName: string;
    prescriptionId: string;
    formulaName: string;
    formulaDetails: string;
    status: 'pending' | 'sent' | 'confirmed' | 'delivered' | 'cancelled';
    sentAt?: string;
    sentBy?: string;
    sentMethod?: 'email' | 'whatsapp' | 'manual';
    responseNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateForwardingInput {
    partnerId: string;
    partnerName: string;
    patientId: string;
    patientName: string;
    prescriptionId: string;
    formulaName: string;
    formulaDetails: string;
    sentMethod?: 'email' | 'whatsapp' | 'manual';
}
