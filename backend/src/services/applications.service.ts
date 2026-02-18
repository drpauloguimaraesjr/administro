// backend/src/services/applications.service.ts

import { getFirestore } from 'firebase-admin/firestore';
import type {
    ApplicationOrder,
    ApplicationStatus,
    CreateApplicationInput,
    ConfirmPurchaseInput,
    RegisterApplicationInput,
    ApplicationSummary,
    ProductSummaryItem,
} from '../types/applications.types.js';

const db = getFirestore();
const COLLECTION = 'applications';

// =====================
// Valid Status Transitions
// =====================

const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
    prescribed:       ['waiting_purchase', 'cancelled'],
    waiting_purchase: ['purchased', 'cancelled'],
    purchased:        ['scheduled', 'administered', 'cancelled'],
    scheduled:        ['administered', 'purchased', 'cancelled'],
    administered:     [],  // terminal
    cancelled:        ['prescribed'],  // can reactivate
};

// =====================
// List & Fetch
// =====================

export async function getAllOrders(filters?: {
    status?: ApplicationStatus;
    patientId?: string;
    date?: string;
}): Promise<ApplicationOrder[]> {
    let query: FirebaseFirestore.Query = db.collection(COLLECTION)
        .orderBy('createdAt', 'desc');

    if (filters?.status) {
        query = db.collection(COLLECTION)
            .where('status', '==', filters.status)
            .orderBy('createdAt', 'desc');
    }

    if (filters?.patientId) {
        query = db.collection(COLLECTION)
            .where('patientId', '==', filters.patientId)
            .orderBy('createdAt', 'desc');
    }

    const snapshot = await query.get();
    let orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApplicationOrder));

    if (filters?.date) {
        orders = orders.filter(o => o.createdAt.startsWith(filters.date!));
    }

    return orders;
}

export async function getOrderById(id: string): Promise<ApplicationOrder | null> {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as ApplicationOrder;
}

// =====================
// Create
// =====================

export async function createOrder(data: CreateApplicationInput): Promise<ApplicationOrder> {
    const now = new Date().toISOString();

    const orderData = {
        ...data,
        priority: data.priority || 'routine',
        status: 'prescribed' as ApplicationStatus,
        purchaseConfirmed: false,
        createdAt: now,
        updatedAt: now,
    };

    const docRef = await db.collection(COLLECTION).add(orderData);
    return { id: docRef.id, ...orderData } as ApplicationOrder;
}

// =====================
// Purchase Confirmation
// =====================

export async function confirmPurchase(
    id: string,
    input: ConfirmPurchaseInput
): Promise<ApplicationOrder | null> {
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    const current = { id: doc.id, ...doc.data() } as ApplicationOrder;

    if (!VALID_TRANSITIONS[current.status]?.includes('purchased')) {
        throw new Error(
            `Transição inválida: ${current.status} → purchased. ` +
            `Permitidos: ${VALID_TRANSITIONS[current.status]?.join(', ') || 'nenhuma'}`
        );
    }

    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
        status: 'purchased',
        purchaseConfirmed: true,
        purchaseConfirmedAt: now,
        purchaseConfirmedBy: input.confirmedBy,
        updatedAt: now,
    };

    if (input.batchNumber) updateData.batchNumber = input.batchNumber;
    if (input.batchExpiration) updateData.batchExpiration = input.batchExpiration;
    if (input.manufacturer) updateData.manufacturer = input.manufacturer;
    if (input.notes) updateData.purchaseNotes = input.notes;

    await docRef.update(updateData);

    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as ApplicationOrder;
}

// =====================
// Schedule
// =====================

export async function scheduleApplication(
    id: string,
    scheduledFor: string,
    scheduledBy: string
): Promise<ApplicationOrder | null> {
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    const current = { id: doc.id, ...doc.data() } as ApplicationOrder;

    if (!VALID_TRANSITIONS[current.status]?.includes('scheduled')) {
        throw new Error(
            `Transição inválida: ${current.status} → scheduled. ` +
            `Permitidos: ${VALID_TRANSITIONS[current.status]?.join(', ') || 'nenhuma'}`
        );
    }

    const now = new Date().toISOString();
    await docRef.update({
        status: 'scheduled',
        scheduledFor,
        updatedAt: now,
    });

    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as ApplicationOrder;
}

// =====================
// Register Application (Compliance)
// =====================

export async function registerApplication(
    id: string,
    input: RegisterApplicationInput
): Promise<ApplicationOrder | null> {
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    const current = { id: doc.id, ...doc.data() } as ApplicationOrder;

    if (!VALID_TRANSITIONS[current.status]?.includes('administered')) {
        throw new Error(
            `Transição inválida: ${current.status} → administered. ` +
            `Permitidos: ${VALID_TRANSITIONS[current.status]?.join(', ') || 'nenhuma'}`
        );
    }

    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
        status: 'administered',
        administeredBy: input.administeredBy,
        administeredAt: now,
        updatedAt: now,
    };

    if (input.applicationSite) updateData.applicationSite = input.applicationSite;
    if (input.notes) updateData.administrationNotes = input.notes;

    await docRef.update(updateData);

    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as ApplicationOrder;
}

// =====================
// Cancel
// =====================

export async function cancelOrder(
    id: string,
    cancelledBy: string,
    reason?: string
): Promise<ApplicationOrder | null> {
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    const current = { id: doc.id, ...doc.data() } as ApplicationOrder;

    if (!VALID_TRANSITIONS[current.status]?.includes('cancelled')) {
        throw new Error(
            `Transição inválida: ${current.status} → cancelled. ` +
            `Estado atual não permite cancelamento.`
        );
    }

    const now = new Date().toISOString();
    await docRef.update({
        status: 'cancelled',
        cancelledBy,
        cancelledAt: now,
        cancellationReason: reason || '',
        updatedAt: now,
    });

    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as ApplicationOrder;
}

// =====================
// Patient Timeline
// =====================

export async function getPatientTimeline(patientId: string): Promise<ApplicationOrder[]> {
    const snapshot = await db.collection(COLLECTION)
        .where('patientId', '==', patientId)
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApplicationOrder));
}

// =====================
// Product Summary
// =====================

export async function getProductSummary(): Promise<ProductSummaryItem[]> {
    const snapshot = await db.collection(COLLECTION).get();
    const orders = snapshot.docs.map(doc => doc.data() as Omit<ApplicationOrder, 'id'>);

    const productMap = new Map<string, ProductSummaryItem>();

    for (const order of orders) {
        const existing = productMap.get(order.productName);

        if (existing) {
            existing.totalOrders++;
            if (order.status === 'administered') existing.administered++;
            if (order.status === 'waiting_purchase') existing.waitingPurchase++;
            if (order.status === 'purchased' || order.status === 'scheduled') existing.purchased++;
            if (order.administeredAt && (!existing.lastAdministered || order.administeredAt > existing.lastAdministered)) {
                existing.lastAdministered = order.administeredAt;
            }
            if (!existing.patients.includes(order.patientName)) {
                existing.patients.push(order.patientName);
            }
        } else {
            productMap.set(order.productName, {
                productName: order.productName,
                totalOrders: 1,
                administered: order.status === 'administered' ? 1 : 0,
                waitingPurchase: order.status === 'waiting_purchase' ? 1 : 0,
                purchased: (order.status === 'purchased' || order.status === 'scheduled') ? 1 : 0,
                lastAdministered: order.administeredAt,
                patients: [order.patientName],
            });
        }
    }

    return Array.from(productMap.values())
        .sort((a, b) => b.totalOrders - a.totalOrders);
}

// =====================
// Dashboard Summary
// =====================

export async function getDashboardSummary(): Promise<ApplicationSummary> {
    const today = new Date().toISOString().split('T')[0];

    const snapshot = await db.collection(COLLECTION).get();
    const orders = snapshot.docs.map(doc => doc.data() as Omit<ApplicationOrder, 'id'>);

    const todayAdministered = orders.filter(o =>
        o.status === 'administered' && o.administeredAt?.startsWith(today)
    ).length;

    return {
        prescribed: orders.filter(o => o.status === 'prescribed').length,
        waitingPurchase: orders.filter(o => o.status === 'waiting_purchase').length,
        purchased: orders.filter(o => o.status === 'purchased').length,
        scheduled: orders.filter(o => o.status === 'scheduled').length,
        administered: orders.filter(o => o.status === 'administered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        total: orders.length,
        todayApplications: todayAdministered,
    };
}
