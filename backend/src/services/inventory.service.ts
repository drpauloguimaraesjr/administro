// backend/src/services/inventory.service.ts
// Versão simplificada e corrigida - sem dependências externas complexas

import { FieldValue } from 'firebase-admin/firestore';
import { db as _db } from '../config/firebaseAdmin.js';
import type {
    InventoryItem,
    InventoryBatch,
    InventoryMovement,
    InventoryAlert,
    ConsumptionAnalysis,
    InventorySummary
} from '../types/inventory.types.js';

const getDb = () => {
    if (!_db) throw new Error('Firebase not configured');
    return _db;
};

// =====================
// CRUD Items
// =====================

export async function getAllItems(): Promise<InventoryItem[]> {
    const snapshot = await getDb().collection('inventory_items').orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
}

export async function getItemById(id: string): Promise<InventoryItem | null> {
    const doc = await getDb().collection('inventory_items').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as InventoryItem;
}

export async function createItem(data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    const now = new Date().toISOString();
    const itemData = {
        ...data,
        currentQuantity: data.currentQuantity || 0,
        createdAt: now,
        updatedAt: now
    };
    const docRef = await getDb().collection('inventory_items').add(itemData);
    return { id: docRef.id, ...itemData } as InventoryItem;
}

export async function updateItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null> {
    const docRef = getDb().collection('inventory_items').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    const updateData = { ...data, updatedAt: new Date().toISOString() };
    await docRef.update(updateData);

    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as InventoryItem;
}

export async function deleteItem(id: string): Promise<boolean> {
    const docRef = getDb().collection('inventory_items').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    await docRef.delete();
    return true;
}

// =====================
// Lotes (Batches)
// =====================

export async function getBatches(itemId?: string): Promise<InventoryBatch[]> {
    let query = getDb().collection('inventory_batches').orderBy('expirationDate', 'asc') as FirebaseFirestore.Query;
    if (itemId) {
        query = getDb().collection('inventory_batches')
            .where('itemId', '==', itemId)
            .orderBy('expirationDate', 'asc');
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as InventoryBatch));
}

export async function createBatch(data: Omit<InventoryBatch, 'id'>): Promise<InventoryBatch> {
    const docRef = await getDb().collection('inventory_batches').add(data);

    // Atualiza estoque do item
    const itemRef = getDb().collection('inventory_items').doc(data.itemId);
    await itemRef.update({
        currentQuantity: FieldValue.increment(data.quantity),
        updatedAt: new Date().toISOString()
    });

    // Registra movimentação
    await createMovement({
        itemId: data.itemId,
        itemName: data.itemName,
        batchId: docRef.id,
        type: 'entrada',
        reason: 'compra',
        quantity: data.quantity,
        performedBy: 'Sistema',
        notes: `Lote ${data.lotNumber} - Validade: ${data.expirationDate}`
    });

    return { id: docRef.id, ...data };
}

// =====================
// Movimentações
// =====================

export async function getMovements(itemId?: string, limit = 100): Promise<InventoryMovement[]> {
    let query: FirebaseFirestore.Query = getDb().collection('inventory_movements')
        .orderBy('createdAt', 'desc')
        .limit(limit);

    if (itemId) {
        query = getDb().collection('inventory_movements')
            .where('itemId', '==', itemId)
            .orderBy('createdAt', 'desc')
            .limit(limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as InventoryMovement));
}

interface CreateMovementInput {
    itemId: string;
    itemName: string;
    batchId?: string;
    type: 'entrada' | 'saída' | 'ajuste' | 'perda' | 'transferência';
    reason: string;
    quantity: number;
    patientId?: string;
    patientName?: string;
    prescriptionId?: string;
    notes?: string;
    performedBy: string;
}

export async function createMovement(data: CreateMovementInput): Promise<InventoryMovement> {
    // Busca quantidade atual do item
    const itemDoc = await getDb().collection('inventory_items').doc(data.itemId).get();
    const currentQty = itemDoc.exists ? (itemDoc.data()?.currentQuantity || 0) : 0;

    const movementData = {
        ...data,
        previousQuantity: currentQty,
        newQuantity: currentQty + data.quantity,
        createdAt: new Date().toISOString()
    };

    const docRef = await getDb().collection('inventory_movements').add(movementData);

    // Atualiza estoque do item (se não for entrada de lote, que já atualiza)
    if (data.type !== 'entrada') {
        await getDb().collection('inventory_items').doc(data.itemId).update({
            currentQuantity: FieldValue.increment(data.quantity),
            updatedAt: new Date().toISOString()
        });
    }

    return { id: docRef.id, ...movementData } as InventoryMovement;
}

// =====================
// Match de Produto (Fuzzy Search)
// =====================

export interface StockMatchResult {
    found: boolean;
    product: InventoryItem | null;
    hasStock: boolean;
    availableQuantity: number;
    suggestedBatch: {
        id: string;
        batchNumber: string;
        expirationDate: string;
        availableQuantity: number;
    } | null;
}

function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
        .replace(/[^a-z0-9\s]/g, '')       // Remove caracteres especiais
        .trim();
}

export async function matchProduct(searchName: string): Promise<StockMatchResult> {
    const noMatch: StockMatchResult = {
        found: false,
        product: null,
        hasStock: false,
        availableQuantity: 0,
        suggestedBatch: null,
    };

    if (!searchName || searchName.length < 2) return noMatch;

    const normalizedSearch = normalizeText(searchName);
    const searchTokens = normalizedSearch.split(/\s+/).filter(t => t.length >= 2);

    const allItems = await getAllItems();

    // Scoring: find best match
    let bestMatch: InventoryItem | null = null;
    let bestScore = 0;

    for (const item of allItems) {
        let score = 0;

        const normalizedName = normalizeText(item.name);
        const normalizedGeneric = item.genericName ? normalizeText(item.genericName) : '';
        const normalizedAliases = (item.aliases || []).map(normalizeText);

        // Exact match (highest priority)
        if (normalizedName === normalizedSearch) {
            score = 100;
        } else if (normalizedGeneric === normalizedSearch) {
            score = 95;
        } else if (normalizedAliases.some(a => a === normalizedSearch)) {
            score = 90;
        }
        // Contains match
        else if (normalizedName.includes(normalizedSearch) || normalizedSearch.includes(normalizedName)) {
            score = 80;
        } else if (normalizedGeneric && (normalizedGeneric.includes(normalizedSearch) || normalizedSearch.includes(normalizedGeneric))) {
            score = 75;
        } else if (normalizedAliases.some(a => a.includes(normalizedSearch) || normalizedSearch.includes(a))) {
            score = 70;
        }
        // Token matching (partial — ex: "VITAMINA B12" vs "CIANOCOBALAMINA VITAMINA B12 5000MCG")
        else {
            const allTexts = [normalizedName, normalizedGeneric, ...normalizedAliases].filter(Boolean);
            let tokenScore = 0;
            for (const token of searchTokens) {
                if (allTexts.some(text => text.includes(token))) {
                    tokenScore += 1;
                }
            }
            if (tokenScore > 0 && searchTokens.length > 0) {
                score = Math.round((tokenScore / searchTokens.length) * 60);
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    }

    // Minimum threshold
    if (!bestMatch || bestScore < 30) return noMatch;

    // Find best batch (FIFO — oldest valid expiration date)
    const now = new Date();
    const batchesSnapshot = await getDb().collection('inventory_batches')
        .where('itemId', '==', bestMatch.id)
        .orderBy('expirationDate', 'asc')
        .get();

    const validBatches = batchesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as InventoryBatch))
        .filter(b => {
            const expDate = new Date(b.expirationDate);
            return expDate > now && b.quantity > 0;
        });

    const suggestedBatch = validBatches.length > 0 ? validBatches[0] : null;
    const totalAvailable = validBatches.reduce((sum, b) => sum + b.quantity, 0);

    return {
        found: true,
        product: bestMatch,
        hasStock: totalAvailable > 0,
        availableQuantity: totalAvailable,
        suggestedBatch: suggestedBatch ? {
            id: suggestedBatch.id,
            batchNumber: suggestedBatch.lotNumber,
            expirationDate: suggestedBatch.expirationDate,
            availableQuantity: suggestedBatch.quantity,
        } : null,
    };
}

// =====================
// Prescription Movement (registro dedicado)
// =====================

interface PrescriptionMovementInput {
    productId: string;
    quantity: number;
    patientId: string;
    patientName: string;
    prescriptionId: string;
}

export async function createPrescriptionMovement(data: PrescriptionMovementInput): Promise<InventoryMovement> {
    const item = await getItemById(data.productId);
    if (!item) {
        throw new Error('Produto não encontrado no estoque');
    }

    if (item.currentQuantity < data.quantity) {
        throw new Error(`Estoque insuficiente. Disponível: ${item.currentQuantity} ${item.unit}`);
    }

    // Find best batch (FIFO) and decrement
    const now = new Date();
    const batchesSnapshot = await getDb().collection('inventory_batches')
        .where('itemId', '==', data.productId)
        .orderBy('expirationDate', 'asc')
        .get();

    const validBatches = batchesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as InventoryBatch))
        .filter(b => new Date(b.expirationDate) > now && b.quantity > 0);

    let remainingQty = data.quantity;
    const batchUpdates: { batchId: string; deducted: number }[] = [];

    for (const batch of validBatches) {
        if (remainingQty <= 0) break;

        const deduct = Math.min(batch.quantity, remainingQty);
        batchUpdates.push({ batchId: batch.id, deducted: deduct });
        remainingQty -= deduct;
    }

    if (remainingQty > 0) {
        throw new Error('Estoque insuficiente nos lotes disponíveis');
    }

    // Apply batch decrements
    for (const update of batchUpdates) {
        await getDb().collection('inventory_batches').doc(update.batchId).update({
            quantity: FieldValue.increment(-update.deducted),
        });
    }

    // Create the movement record
    const movement = await createMovement({
        itemId: data.productId,
        itemName: item.name,
        batchId: batchUpdates[0]?.batchId,
        type: 'saída',
        reason: 'prescrição',
        quantity: -data.quantity, // negative for output
        patientId: data.patientId,
        patientName: data.patientName,
        prescriptionId: data.prescriptionId,
        performedBy: 'Médico',
        notes: `Saída por prescrição - Paciente: ${data.patientName}`,
    });

    return movement;
}


// =====================
// Alertas
// =====================

export async function getAlerts(status?: string): Promise<InventoryAlert[]> {
    let query: FirebaseFirestore.Query = getDb().collection('inventory_alerts')
        .orderBy('createdAt', 'desc');

    if (status) {
        query = getDb().collection('inventory_alerts')
            .where('status', '==', status)
            .orderBy('createdAt', 'desc');
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as InventoryAlert));
}

interface CreateAlertInput {
    type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'high_consumption';
    severity: 'critical' | 'warning' | 'info';
    itemId: string;
    itemName: string;
    batchId?: string;
    message: string;
    details: Record<string, unknown>;
}

async function createAlert(data: CreateAlertInput): Promise<InventoryAlert> {
    // Verifica se já existe alerta ativo igual
    const existingQuery = await getDb().collection('inventory_alerts')
        .where('itemId', '==', data.itemId)
        .where('type', '==', data.type)
        .where('status', '==', 'active')
        .get();

    if (!existingQuery.empty) {
        const existing = existingQuery.docs[0];
        return { id: existing.id, ...existing.data() } as InventoryAlert;
    }

    const alertData = {
        ...data,
        status: 'active',
        createdAt: new Date().toISOString()
    };

    const docRef = await getDb().collection('inventory_alerts').add(alertData);
    return { id: docRef.id, ...alertData } as InventoryAlert;
}

export async function checkAndGenerateAlerts(): Promise<InventoryAlert[]> {
    const alerts: InventoryAlert[] = [];
    const now = new Date();

    const items = await getAllItems();

    for (const item of items) {
        // Alerta de estoque baixo
        if (item.currentQuantity <= item.minStock && item.currentQuantity > 0) {
            const severity = item.currentQuantity <= item.minStock * 0.5 ? 'critical' : 'warning';
            const alert = await createAlert({
                type: 'low_stock',
                severity,
                itemId: item.id,
                itemName: item.name,
                message: `Estoque baixo: ${item.name} (${item.currentQuantity} ${item.unit})`,
                details: {
                    currentQuantity: item.currentQuantity,
                    minStock: item.minStock,
                    percentRemaining: Math.round((item.currentQuantity / item.minStock) * 100)
                }
            });
            alerts.push(alert);
        }

        // Alerta de estoque zerado
        if (item.currentQuantity <= 0) {
            const alert = await createAlert({
                type: 'out_of_stock',
                severity: 'critical',
                itemId: item.id,
                itemName: item.name,
                message: `Estoque esgotado: ${item.name}`,
                details: { currentQuantity: 0 }
            });
            alerts.push(alert);
        }
    }

    // Busca lotes para verificar validade
    const batches = await getBatches();

    for (const batch of batches) {
        const expirationDate = new Date(batch.expirationDate);
        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiration < 0) {
            const alert = await createAlert({
                type: 'expired',
                severity: 'critical',
                itemId: batch.itemId,
                itemName: batch.itemName,
                batchId: batch.id,
                message: `Lote vencido: ${batch.itemName} - Lote ${batch.lotNumber}`,
                details: {
                    lotNumber: batch.lotNumber,
                    expirationDate: batch.expirationDate,
                    daysExpired: Math.abs(daysUntilExpiration),
                    quantity: batch.quantity
                }
            });
            alerts.push(alert);
        } else if (daysUntilExpiration <= 30) {
            const severity = daysUntilExpiration <= 15 ? 'critical' : 'warning';
            const alert = await createAlert({
                type: 'expiring_soon',
                severity,
                itemId: batch.itemId,
                itemName: batch.itemName,
                batchId: batch.id,
                message: `Vencendo em ${daysUntilExpiration} dias: ${batch.itemName} - Lote ${batch.lotNumber}`,
                details: {
                    lotNumber: batch.lotNumber,
                    expirationDate: batch.expirationDate,
                    daysUntilExpiration,
                    quantity: batch.quantity
                }
            });
            alerts.push(alert);
        }
    }

    return alerts;
}

export async function acknowledgeAlert(id: string, userId: string): Promise<InventoryAlert | null> {
    const docRef = getDb().collection('inventory_alerts').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    await docRef.update({
        status: 'acknowledged',
        acknowledgedAt: new Date().toISOString(),
        acknowledgedBy: userId
    });

    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as InventoryAlert;
}

export async function resolveAlert(id: string): Promise<InventoryAlert | null> {
    const docRef = getDb().collection('inventory_alerts').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    await docRef.update({
        status: 'resolved',
        resolvedAt: new Date().toISOString()
    });

    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as InventoryAlert;
}

// =====================
// Análise de Consumo
// =====================

export async function analyzeConsumption(itemId: string, periodDays = 30): Promise<ConsumptionAnalysis | null> {
    const item = await getItemById(itemId);
    if (!item) return null;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const movementsSnapshot = await getDb().collection('inventory_movements')
        .where('itemId', '==', itemId)
        .where('type', '==', 'saída')
        .where('createdAt', '>=', startDate.toISOString())
        .orderBy('createdAt', 'asc')
        .get();

    const movements = movementsSnapshot.docs.map(doc => doc.data());

    // Agrupa por dia
    const consumptionByDay: Record<string, number> = {};
    movements.forEach(m => {
        const day = m.createdAt.split('T')[0];
        consumptionByDay[day] = (consumptionByDay[day] || 0) + Math.abs(m.quantity);
    });

    const consumptionHistory = Object.entries(consumptionByDay).map(([date, quantity]) => ({ date, quantity }));
    const totalConsumed = movements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const averageDaily = totalConsumed / periodDays;

    // Calcula tendência
    const halfPeriod = Math.floor(periodDays / 2);
    const firstHalfEnd = new Date(startDate);
    firstHalfEnd.setDate(firstHalfEnd.getDate() + halfPeriod);

    let firstHalfTotal = 0;
    let secondHalfTotal = 0;

    movements.forEach(m => {
        const date = new Date(m.createdAt);
        if (date <= firstHalfEnd) {
            firstHalfTotal += Math.abs(m.quantity);
        } else {
            secondHalfTotal += Math.abs(m.quantity);
        }
    });

    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    let trendPercentage = 0;

    if (firstHalfTotal > 0) {
        trendPercentage = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
        if (trendPercentage > 15) trend = 'increasing';
        else if (trendPercentage < -15) trend = 'decreasing';
    }

    const estimatedDaysUntilStockout = averageDaily > 0
        ? Math.floor(item.currentQuantity / averageDaily)
        : -1;

    let recommendedReorderDate: string | null = null;
    if (averageDaily > 0 && item.currentQuantity > item.minStock) {
        const daysUntilMinStock = Math.floor((item.currentQuantity - item.minStock) / averageDaily);
        const reorderDate = new Date();
        reorderDate.setDate(reorderDate.getDate() + daysUntilMinStock);
        recommendedReorderDate = reorderDate.toISOString().split('T')[0];
    }

    return {
        itemId: item.id,
        itemName: item.name,
        period: periodDays,
        totalConsumed,
        averageDaily: Math.round(averageDaily * 100) / 100,
        trend,
        trendPercentage: Math.round(trendPercentage),
        currentStock: item.currentQuantity,
        estimatedDaysUntilStockout,
        recommendedReorderDate,
        consumptionHistory
    };
}

export async function getConsumptionSummary(periodDays = 30): Promise<ConsumptionAnalysis[]> {
    const items = await getAllItems();
    const analyses: ConsumptionAnalysis[] = [];

    for (const item of items) {
        const analysis = await analyzeConsumption(item.id, periodDays);
        if (analysis && analysis.totalConsumed > 0) {
            analyses.push(analysis);
        }
    }

    return analyses.sort((a, b) => b.totalConsumed - a.totalConsumed);
}

// =====================
// Summary/Dashboard
// =====================

export async function getSummary(): Promise<InventorySummary> {
    const items = await getAllItems();
    const batches = await getBatches();
    const alerts = await getAlerts('active');

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    items.forEach(item => {
        if (item.costPrice) {
            totalValue += item.currentQuantity * item.costPrice;
        }
        if (item.currentQuantity <= 0) {
            outOfStockCount++;
        } else if (item.currentQuantity <= item.minStock) {
            lowStockCount++;
        }
    });

    let expiringCount = 0;
    let expiredCount = 0;

    batches.forEach(batch => {
        const expDate = new Date(batch.expirationDate);
        if (expDate < now) {
            expiredCount++;
        } else if (expDate <= thirtyDaysFromNow) {
            expiringCount++;
        }
    });

    return {
        totalItems: items.length,
        totalValue: Math.round(totalValue * 100) / 100,
        lowStockCount,
        outOfStockCount,
        expiringCount,
        expiredCount,
        criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
        warningAlerts: alerts.filter(a => a.severity === 'warning').length
    };
}
