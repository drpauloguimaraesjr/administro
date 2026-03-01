import { db } from '../config/firebaseAdmin.js';
import {
  BillingItem,
  BillingSummary,
  PatientBillingSummary,
  CreateBillingItemDTO,
  UpdateBillingItemDTO,
  MarkAsPaidDTO,
  BillingFilters,
} from '../shared/types/billing.js';

const CLINIC_ID = 'default'; // TODO: Get from auth context

const getBillingCollection = () => {
  if (!db) throw new Error('Firebase not configured');
  return db.collection('billing_items');
};

export const BillingService = {
  // ====================================
  // CRUD Operations
  // ====================================

  async getAll(filters?: BillingFilters, limit: number = 100): Promise<BillingItem[]> {
    let query: FirebaseFirestore.Query = getBillingCollection()
      .where('clinicId', '==', CLINIC_ID);

    if (filters?.patientId) {
      query = query.where('patientId', '==', filters.patientId);
    }

    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.where('status', 'in', filters.status);
      } else {
        query = query.where('status', '==', filters.status);
      }
    }

    if (filters?.category) {
      query = query.where('category', '==', filters.category);
    }

    if (filters?.paymentMethod) {
      query = query.where('paymentMethod', '==', filters.paymentMethod);
    }

    query = query.orderBy('createdAt', 'desc').limit(limit);

    const snapshot = await query.get();
    let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BillingItem));

    // Date filtering (client-side due to Firestore limitations)
    if (filters?.dateFrom) {
      items = items.filter(item => item.createdAt >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      items = items.filter(item => item.createdAt <= filters.dateTo!);
    }

    return items;
  },

  async getById(id: string): Promise<BillingItem | null> {
    const doc = await getBillingCollection().doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as BillingItem;
  },

  async getByPatient(patientId: string, status?: BillingItem['status'][]): Promise<BillingItem[]> {
    let query: FirebaseFirestore.Query = getBillingCollection()
      .where('clinicId', '==', CLINIC_ID)
      .where('patientId', '==', patientId);

    if (status && status.length > 0) {
      query = query.where('status', 'in', status);
    }

    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BillingItem));
  },

  async getPending(): Promise<BillingItem[]> {
    const snapshot = await getBillingCollection()
      .where('clinicId', '==', CLINIC_ID)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BillingItem));
  },

  async create(data: CreateBillingItemDTO, userId: string): Promise<BillingItem> {
    const now = new Date().toISOString();

    // Calculate totals
    let discount = data.discount || 0;
    if (data.discountPercent && !data.discount) {
      discount = (data.quantity * data.unitPrice) * (data.discountPercent / 100);
    }

    const totalPrice = (data.quantity * data.unitPrice) - discount;
    const totalCost = data.unitCost ? data.quantity * data.unitCost : undefined;
    const profitMargin = totalCost && totalPrice > 0
      ? ((totalPrice - totalCost) / totalPrice) * 100
      : undefined;

    const item: Omit<BillingItem, 'id'> = {
      patientId: data.patientId,
      patientName: data.patientName,
      productId: data.productId,
      productName: data.productName,
      category: data.category,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      discount,
      discountPercent: data.discountPercent,
      totalPrice,
      unitCost: data.unitCost,
      totalCost,
      profitMargin,
      status: 'pending',
      prescriptionId: data.prescriptionId,
      appointmentId: data.appointmentId,
      movementId: data.movementId,
      notes: data.notes,
      clinicId: CLINIC_ID,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await getBillingCollection().add(item);
    return { id: docRef.id, ...item };
  },

  async update(id: string, data: UpdateBillingItemDTO): Promise<BillingItem | null> {
    const docRef = getBillingCollection().doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    const current = doc.data() as BillingItem;

    // Recalculate totals if quantity, price, or discount changed
    const quantity = data.quantity ?? current.quantity;
    const unitPrice = data.unitPrice ?? current.unitPrice;
    const discount = data.discount ?? current.discount;
    const totalPrice = (quantity * unitPrice) - discount;

    const updateData: Partial<BillingItem> = {
      ...data,
      totalPrice,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate cost and margin if applicable
    if (current.unitCost) {
      updateData.totalCost = quantity * current.unitCost;
      updateData.profitMargin = totalPrice > 0
        ? ((totalPrice - updateData.totalCost) / totalPrice) * 100
        : 0;
    }

    await docRef.update(updateData);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as BillingItem;
  },

  async markAsPaid(id: string, data: MarkAsPaidDTO): Promise<BillingItem | null> {
    const docRef = getBillingCollection().doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    await docRef.update({
      status: 'paid',
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate || new Date().toISOString(),
      paymentNotes: data.paymentNotes,
      updatedAt: new Date().toISOString(),
    });

    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as BillingItem;
  },

  async markMultipleAsPaid(ids: string[], data: MarkAsPaidDTO): Promise<number> {
    const batch = db.batch();
    const now = new Date().toISOString();
    const paymentDate = data.paymentDate || now;

    for (const id of ids) {
      const docRef = getBillingCollection().doc(id);
      batch.update(docRef, {
        status: 'paid',
        paymentMethod: data.paymentMethod,
        paymentDate,
        paymentNotes: data.paymentNotes,
        updatedAt: now,
      });
    }

    await batch.commit();
    return ids.length;
  },

  async cancel(id: string): Promise<BillingItem | null> {
    const docRef = getBillingCollection().doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    await docRef.update({
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    });

    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as BillingItem;
  },

  async delete(id: string): Promise<boolean> {
    const docRef = getBillingCollection().doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;

    await docRef.delete();
    return true;
  },

  // ====================================
  // Summaries & Reports
  // ====================================

  async getSummary(dateFrom?: string, dateTo?: string): Promise<BillingSummary> {
    let query: FirebaseFirestore.Query = getBillingCollection()
      .where('clinicId', '==', CLINIC_ID);

    const snapshot = await query.get();
    let items = snapshot.docs.map(doc => doc.data() as BillingItem);

    // Filter by date if provided
    if (dateFrom) {
      items = items.filter(item => item.createdAt >= dateFrom);
    }
    if (dateTo) {
      items = items.filter(item => item.createdAt <= dateTo);
    }

    // Calculate summaries
    const pending = items.filter(i => i.status === 'pending');
    const paid = items.filter(i => i.status === 'paid');

    const pendingAmount = pending.reduce((sum, i) => sum + i.totalPrice, 0);
    const paidAmount = paid.reduce((sum, i) => sum + i.totalPrice, 0);
    const totalAmount = items.reduce((sum, i) => sum + i.totalPrice, 0);

    const totalCost = items
      .filter(i => i.totalCost)
      .reduce((sum, i) => sum + (i.totalCost || 0), 0);
    const totalProfit = paidAmount - totalCost;
    const profitMargin = paidAmount > 0 ? (totalProfit / paidAmount) * 100 : 0;

    // Group by payment method
    const byPaymentMethod = paid.reduce((acc, item) => {
      const method = item.paymentMethod || 'other';
      const existing = acc.find(a => a.method === method);
      if (existing) {
        existing.count++;
        existing.amount += item.totalPrice;
      } else {
        acc.push({ method, count: 1, amount: item.totalPrice });
      }
      return acc;
    }, [] as { method: string; count: number; amount: number }[]);

    // Group by category
    const byCategory = items.reduce((acc, item) => {
      const existing = acc.find(a => a.category === item.category);
      if (existing) {
        existing.count++;
        existing.amount += item.totalPrice;
      } else {
        acc.push({ category: item.category, count: 1, amount: item.totalPrice });
      }
      return acc;
    }, [] as { category: string; count: number; amount: number }[]);

    return {
      pendingCount: pending.length,
      pendingAmount,
      paidCount: paid.length,
      paidAmount,
      totalCount: items.length,
      totalAmount,
      totalCost,
      totalProfit,
      profitMargin,
      byPaymentMethod,
      byCategory,
    };
  },

  async getPatientsSummary(): Promise<PatientBillingSummary[]> {
    const snapshot = await getBillingCollection()
      .where('clinicId', '==', CLINIC_ID)
      .get();

    const items = snapshot.docs.map(doc => doc.data() as BillingItem);

    // Group by patient
    const byPatient = new Map<string, PatientBillingSummary>();

    for (const item of items) {
      if (!byPatient.has(item.patientId)) {
        byPatient.set(item.patientId, {
          patientId: item.patientId,
          patientName: item.patientName,
          pendingItems: 0,
          pendingAmount: 0,
          paidItems: 0,
          paidAmount: 0,
          totalItems: 0,
          totalAmount: 0,
        });
      }

      const summary = byPatient.get(item.patientId)!;
      summary.totalItems++;
      summary.totalAmount += item.totalPrice;

      if (item.status === 'pending') {
        summary.pendingItems++;
        summary.pendingAmount += item.totalPrice;
      } else if (item.status === 'paid') {
        summary.paidItems++;
        summary.paidAmount += item.totalPrice;
        if (!summary.lastPaymentDate || item.paymentDate! > summary.lastPaymentDate) {
          summary.lastPaymentDate = item.paymentDate;
        }
      }

      if (!summary.lastBillingDate || item.createdAt > summary.lastBillingDate) {
        summary.lastBillingDate = item.createdAt;
      }
    }

    // Sort by pending amount (highest first)
    return Array.from(byPatient.values())
      .sort((a, b) => b.pendingAmount - a.pendingAmount);
  },

  // ====================================
  // Integration with Stock
  // ====================================

  async createFromStockMovement(
    movementId: string,
    productId: string,
    productName: string,
    quantity: number,
    unitPrice: number,
    unitCost: number,
    patientId: string,
    patientName: string,
    prescriptionId: string | undefined,
    userId: string
  ): Promise<BillingItem> {
    return this.create({
      patientId,
      patientName,
      productId,
      productName,
      category: 'medication',
      quantity,
      unitPrice,
      unitCost,
      prescriptionId,
      movementId,
    }, userId);
  },
};
