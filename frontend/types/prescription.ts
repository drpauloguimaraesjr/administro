export interface PrescriptionFormula {
    id: string;
    name: string;
    usage: string;
    presentation: string;
    description: string;
    dosage: string;
    supplier: string;
    category?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    clinicId: string;
}
