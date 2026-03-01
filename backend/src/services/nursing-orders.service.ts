// backend/src/services/nursing-orders.service.ts

import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebaseAdmin.js';
import type {
    NursingOrder,
    NursingOrderStatus,
    CreateNursingOrderInput,
    UpdateNursingOrderStatusInput,
    NursingOrderSummary,
} from '../types/nursing-orders.types.js';

const getDb = () => {
    if (!db) throw new Error('Firebase not configured');
    return db;
};
const COLLECTION = 'nursing_orders';

// =====================
// CRUD
// =====================

export async function getAllOrders(filters?: {
    status?: NursingOrderStatus;
    patientId?: string;
    date?: string; // YYYY-MM-DD
}): Promise<NursingOrder[]> {
    let query: FirebaseFirestore.Query = getDb().collection(COLLECTION)
        .orderBy('createdAt', 'desc');

    if (filters?.status) {
        query = getDb().collection(COLLECTION)
            .where('status', '==', filters.status)
            .orderBy('createdAt', 'desc');
    }

    if (filters?.patientId) {
        query = getDb().collection(COLLECTION)
            .where('patientId', '==', filters.patientId)
            .orderBy('createdAt', 'desc');
    }

    const snapshot = await query.get();
    let orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NursingOrder));

    // Date filtering (client-side since Firestore doesn't support range + orderBy on different fields easily)
    if (filters?.date) {
        orders = orders.filter(o => o.createdAt.startsWith(filters.date!));
    }

    return orders;
}

export async function getTodayOrders(): Promise<NursingOrder[]> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Get all non-cancelled orders from today
    const snapshot = await getDb().collection(COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as NursingOrder))
        .filter(o => {
            const orderDate = o.createdAt.split('T')[0];
            const scheduledDate = o.scheduledFor?.split('T')[0];
            return (orderDate === today || scheduledDate === today) && o.status !== 'cancelled';
        });
}

export async function getOrderById(id: string): Promise<NursingOrder | null> {
    const doc = await getDb().collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as NursingOrder;
}

export async function createOrder(data: CreateNursingOrderInput): Promise<NursingOrder> {
    const now = new Date().toISOString();

    const orderData = {
        ...data,
        priority: data.priority || 'routine',
        status: 'pending' as NursingOrderStatus,
        createdAt: now,
        updatedAt: now,
    };

    const docRef = await getDb().collection(COLLECTION).add(orderData);
    return { id: docRef.id, ...orderData } as NursingOrder;
}

// =====================
// Status Workflow
// =====================

const VALID_TRANSITIONS: Record<NursingOrderStatus, NursingOrderStatus[]> = {
    pending: ['preparing', 'cancelled'],
    preparing: ['ready', 'pending', 'cancelled'],  // can revert to pending
    ready: ['administered', 'preparing', 'cancelled'],
    administered: [],  // terminal state
    cancelled: ['pending'],  // can reactivate
};

export async function updateOrderStatus(
    id: string,
    input: UpdateNursingOrderStatusInput
): Promise<NursingOrder | null> {
    const docRef = getDb().collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    const currentOrder = { id: doc.id, ...doc.data() } as NursingOrder;
    const currentStatus = currentOrder.status;
    const newStatus = input.status;

    // Validate transition
    if (!VALID_TRANSITIONS[currentStatus]?.includes(newStatus)) {
        throw new Error(
            `Transição inválida: ${currentStatus} → ${newStatus}. ` +
            `Transições permitidas: ${VALID_TRANSITIONS[currentStatus]?.join(', ') || 'nenhuma'}`
        );
    }

    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
        status: newStatus,
        updatedAt: now,
    };

    // Set workflow-specific fields
    switch (newStatus) {
        case 'preparing':
            updateData.preparedBy = input.performedBy;
            updateData.preparedAt = now;
            break;

        case 'ready':
            // Keep preparedBy from preparing step
            break;

        case 'administered':
            updateData.administeredBy = input.performedBy;
            updateData.administeredAt = now;
            if (input.notes) {
                updateData.administrationNotes = input.notes;
            }
            break;

        case 'cancelled':
            updateData.cancelledBy = input.performedBy;
            updateData.cancelledAt = now;
            if (input.cancellationReason) {
                updateData.cancellationReason = input.cancellationReason;
            }
            break;

        case 'pending':
            // Reactivation — clear cancellation data
            updateData.cancelledBy = null;
            updateData.cancelledAt = null;
            updateData.cancellationReason = null;
            break;
    }

    await docRef.update(updateData);

    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as NursingOrder;
}

// =====================
// Summary
// =====================

export async function getSummary(): Promise<NursingOrderSummary> {
    const today = new Date().toISOString().split('T')[0];

    const snapshot = await getDb().collection(COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();

    const todayOrders = snapshot.docs
        .map(doc => doc.data() as Omit<NursingOrder, 'id'>)
        .filter(o => {
            const orderDate = o.createdAt.split('T')[0];
            const scheduledDate = o.scheduledFor?.split('T')[0];
            return orderDate === today || scheduledDate === today;
        });

    return {
        pending: todayOrders.filter(o => o.status === 'pending').length,
        preparing: todayOrders.filter(o => o.status === 'preparing').length,
        ready: todayOrders.filter(o => o.status === 'ready').length,
        administered: todayOrders.filter(o => o.status === 'administered').length,
        cancelled: todayOrders.filter(o => o.status === 'cancelled').length,
        total: todayOrders.length,
    };
}
