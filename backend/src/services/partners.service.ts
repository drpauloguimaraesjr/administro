// backend/src/services/partners.service.ts

import { db } from '../config/firebaseAdmin.js';
import type {
    Partner,
    CreatePartnerInput,
    PartnerForwarding,
    CreateForwardingInput,
} from '../types/partners.types.js';

const getDb = () => {
    if (!db) throw new Error('Firebase not configured');
    return db;
};
const PARTNERS_COLLECTION = 'partners';
const FORWARDINGS_COLLECTION = 'partner_forwardings';

// =====================
// Partners CRUD
// =====================

export async function getAllPartners(activeOnly = false): Promise<Partner[]> {
    let query: FirebaseFirestore.Query = getDb().collection(PARTNERS_COLLECTION)
        .orderBy('name', 'asc');

    if (activeOnly) {
        query = getDb().collection(PARTNERS_COLLECTION)
            .where('isActive', '==', true)
            .orderBy('name', 'asc');
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Partner));
}

export async function getPartnerById(id: string): Promise<Partner | null> {
    const doc = await getDb().collection(PARTNERS_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Partner;
}

export async function createPartner(data: CreatePartnerInput): Promise<Partner> {
    const now = new Date().toISOString();
    const partnerData = {
        ...data,
        integrationMethod: data.integrationMethod || 'manual',
        isActive: true,
        createdAt: now,
        updatedAt: now,
    };

    const docRef = await getDb().collection(PARTNERS_COLLECTION).add(partnerData);
    return { id: docRef.id, ...partnerData } as Partner;
}

export async function updatePartner(id: string, data: Partial<CreatePartnerInput & { isActive: boolean }>): Promise<Partner | null> {
    const docRef = getDb().collection(PARTNERS_COLLECTION).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
    };

    await docRef.update(updateData);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as Partner;
}

export async function deletePartner(id: string): Promise<boolean> {
    const docRef = getDb().collection(PARTNERS_COLLECTION).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;

    await docRef.delete();
    return true;
}

// =====================
// Forwardings
// =====================

export async function getForwardings(filters?: {
    partnerId?: string;
    patientId?: string;
    status?: string;
}): Promise<PartnerForwarding[]> {
    let query: FirebaseFirestore.Query = getDb().collection(FORWARDINGS_COLLECTION)
        .orderBy('createdAt', 'desc');

    if (filters?.partnerId) {
        query = getDb().collection(FORWARDINGS_COLLECTION)
            .where('partnerId', '==', filters.partnerId)
            .orderBy('createdAt', 'desc');
    }

    if (filters?.patientId) {
        query = getDb().collection(FORWARDINGS_COLLECTION)
            .where('patientId', '==', filters.patientId)
            .orderBy('createdAt', 'desc');
    }

    const snapshot = await query.get();
    let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PartnerForwarding));

    if (filters?.status) {
        results = results.filter(f => f.status === filters.status);
    }

    return results;
}

export async function createForwarding(data: CreateForwardingInput): Promise<PartnerForwarding> {
    const now = new Date().toISOString();
    const forwardingData = {
        ...data,
        status: 'pending' as const,
        sentMethod: data.sentMethod || 'manual',
        createdAt: now,
        updatedAt: now,
    };

    const docRef = await getDb().collection(FORWARDINGS_COLLECTION).add(forwardingData);
    return { id: docRef.id, ...forwardingData } as PartnerForwarding;
}

export async function updateForwardingStatus(
    id: string,
    status: 'sent' | 'confirmed' | 'delivered' | 'cancelled',
    data?: { sentBy?: string; responseNotes?: string }
): Promise<PartnerForwarding | null> {
    const docRef = getDb().collection(FORWARDINGS_COLLECTION).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
        status,
        updatedAt: now,
    };

    if (status === 'sent') {
        updateData.sentAt = now;
        if (data?.sentBy) updateData.sentBy = data.sentBy;
    }

    if (data?.responseNotes) {
        updateData.responseNotes = data.responseNotes;
    }

    await docRef.update(updateData);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as PartnerForwarding;
}
