// backend/src/types/inventory.types.ts

export interface InventoryItem {
    id: string;
    name: string;
    category: 'medicamento' | 'material' | 'cosmético' | 'equipamento' | 'outro';
    unit: string; // unidade, ml, mg, cx, etc.
    currentQuantity: number;
    minStock: number; // estoque mínimo para alertar
    maxStock?: number;
    costPrice?: number;
    sellPrice?: number;
    location?: string; // sala, gaveta, etc.
    supplier?: string;
    createdAt: string;
    updatedAt: string;
}

export interface InventoryBatch {
    id: string;
    itemId: string;
    itemName: string;
    lotNumber: string;
    quantity: number;
    expirationDate: string; // YYYY-MM-DD
    receivedAt: string;
    supplier?: string;
    invoiceNumber?: string;
    unitCost?: number;
}

export interface InventoryMovement {
    id: string;
    itemId: string;
    itemName: string;
    batchId?: string;
    type: 'entrada' | 'saída' | 'ajuste' | 'perda' | 'transferência';
    reason: 'compra' | 'prescrição' | 'procedimento' | 'perda' | 'vencimento' | 'ajuste_inventário' | 'devolução' | 'outro';
    quantity: number; // positivo para entrada, negativo para saída
    previousQuantity: number;
    newQuantity: number;
    patientId?: string;
    patientName?: string;
    prescriptionId?: string;
    notes?: string;
    performedBy: string;
    createdAt: string;
}

export interface InventoryAlert {
    id: string;
    type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'high_consumption';
    severity: 'critical' | 'warning' | 'info';
    itemId: string;
    itemName: string;
    batchId?: string;
    message: string;
    details: Record<string, any>;
    status: 'active' | 'acknowledged' | 'resolved';
    createdAt: string;
    acknowledgedAt?: string;
    acknowledgedBy?: string;
    resolvedAt?: string;
}

export interface ConsumptionAnalysis {
    itemId: string;
    itemName: string;
    period: number; // dias
    totalConsumed: number;
    averageDaily: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    trendPercentage: number;
    currentStock: number;
    estimatedDaysUntilStockout: number;
    recommendedReorderDate: string | null;
    consumptionHistory: Array<{
        date: string;
        quantity: number;
    }>;
}

export interface InventorySummary {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    expiringCount: number; // 30 dias
    expiredCount: number;
    criticalAlerts: number;
    warningAlerts: number;
}
