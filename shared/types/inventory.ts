// ====================================
// INVENTORY SYSTEM TYPES - CALYX
// ====================================

// Produto Base (template)
export interface Product {
  id: string;
  name: string;
  genericName?: string;
  type: 'medication' | 'material' | 'injectable' | 'supplement' | 'procedure';
  category: string;
  unit: 'amp' | 'comp' | 'ml' | 'un' | 'fr' | 'cx' | 'kg' | 'g';
  
  // Fabricante padrão
  defaultManufacturer?: string;
  
  // Controle de estoque
  trackStock: boolean;
  minStock: number;
  optimalStock: number;
  
  // Preços
  costPrice: number;
  sellPrice: number;
  markup?: number;
  
  // Match inteligente
  aliases: string[];
  barcode?: string;
  sku?: string;
  
  // Classificação
  isActive: boolean;
  requiresPrescription: boolean;
  isControlled: boolean;
  controlType?: 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'A1' | 'A2' | 'A3' | 'B1' | 'B2';
  
  // Armazenamento
  storageConditions?: 'room' | 'refrigerated' | 'frozen';
  storageNotes?: string;
  
  // Metadata
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Lote de Estoque
export interface StockBatch {
  id: string;
  productId: string;
  productName: string; // Denormalized for queries
  
  // Identificação do Lote
  batchNumber: string;
  manufacturer: string;
  supplier?: string;
  
  // Datas importantes
  manufacturingDate: string;
  expirationDate: string;
  purchaseDate: string;
  receivedDate?: string;
  
  // Quantidades
  initialQuantity: number;
  currentQuantity: number;
  reservedQuantity: number;
  availableQuantity: number; // currentQuantity - reservedQuantity
  
  // Custos
  unitCost: number;
  totalCost: number;
  
  // Status
  status: 'active' | 'low' | 'expiring' | 'expired' | 'depleted';
  
  // Localização
  location?: string;
  shelf?: string;
  
  // Documentação
  invoiceNumber?: string;
  invoiceDate?: string;
  notes?: string;
  
  // Metadata
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Movimentação de Estoque
export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  batchId: string;
  batchNumber: string;
  
  // Tipo de movimento
  type: 'in' | 'out' | 'adjustment' | 'transfer' | 'loss' | 'return';
  reason: 
    | 'purchase'      // Compra
    | 'prescription'  // Prescrição/aplicação
    | 'procedure'     // Procedimento
    | 'expired'       // Vencido
    | 'damaged'       // Danificado
    | 'lost'          // Perda/extravio
    | 'manual'        // Ajuste manual
    | 'inventory'     // Inventário
    | 'transfer_in'   // Transferência entrada
    | 'transfer_out'  // Transferência saída
    | 'return_supplier' // Devolução fornecedor
    | 'return_patient'; // Devolução paciente
  
  // Quantidades
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  
  // Custo do movimento
  unitCost?: number;
  totalCost?: number;
  
  // Referências
  referenceType?: 'prescription' | 'appointment' | 'purchase' | 'adjustment' | 'patient';
  referenceId?: string;
  patientId?: string;
  patientName?: string;
  
  // Detalhes
  notes?: string;
  
  // Metadata
  clinicId: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

// Alerta de Estoque
export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  batchId?: string;
  batchNumber?: string;
  
  // Tipo e severidade
  type: 'low_stock' | 'expiring_soon' | 'expired' | 'high_consumption' | 'stockout';
  severity: 'info' | 'warning' | 'critical';
  
  // Mensagem
  title: string;
  message: string;
  
  // Detalhes específicos
  details: {
    currentQuantity?: number;
    minQuantity?: number;
    expirationDate?: string;
    daysUntilExpiration?: number;
    consumptionRate?: number;
    daysUntilDepleted?: number;
    previousConsumption?: number;
    currentConsumption?: number;
  };
  
  // Ações sugeridas
  suggestedActions?: string[];
  
  // Status
  status: 'active' | 'acknowledged' | 'resolved' | 'snoozed';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  snoozeUntil?: string;
  
  // Metadata
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics de Consumo
export interface ConsumptionAnalytics {
  id: string;
  productId: string;
  productName: string;
  
  // Período
  period: 'daily' | 'weekly' | 'monthly';
  periodStart: string;
  periodEnd: string;
  
  // Métricas
  totalConsumed: number;
  averageDaily: number;
  consumptionTrend: 'increasing' | 'stable' | 'decreasing';
  trendPercentage: number;
  
  // Padrões
  peakDays?: string[];
  peakHours?: number[];
  
  // Previsões
  estimatedDaysUntilStockout: number;
  recommendedReorderDate?: string;
  recommendedReorderQuantity?: number;
  
  // Custos
  totalCost: number;
  averageCostPerUnit: number;
  
  // Metadata
  clinicId: string;
  calculatedAt: string;
}

// Ordem de Compra (para futuro)
export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  status: 'draft' | 'pending' | 'ordered' | 'partial' | 'received' | 'cancelled';
  
  items: PurchaseOrderItem[];
  
  totalAmount: number;
  notes?: string;
  
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  
  clinicId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity?: number;
}

// ====================================
// DTOs e Helpers
// ====================================

export interface CreateProductDTO {
  name: string;
  genericName?: string;
  type: Product['type'];
  category: string;
  unit: Product['unit'];
  defaultManufacturer?: string;
  trackStock?: boolean;
  minStock?: number;
  optimalStock?: number;
  costPrice?: number;
  sellPrice?: number;
  aliases?: string[];
  requiresPrescription?: boolean;
  isControlled?: boolean;
  controlType?: Product['controlType'];
  storageConditions?: Product['storageConditions'];
}

export interface CreateBatchDTO {
  productId: string;
  batchNumber: string;
  manufacturer: string;
  supplier?: string;
  manufacturingDate: string;
  expirationDate: string;
  purchaseDate: string;
  initialQuantity: number;
  unitCost: number;
  location?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface CreateMovementDTO {
  productId: string;
  batchId: string;
  type: StockMovement['type'];
  reason: StockMovement['reason'];
  quantity: number;
  referenceType?: StockMovement['referenceType'];
  referenceId?: string;
  patientId?: string;
  patientName?: string;
  notes?: string;
}

// Resumo de estoque para dashboard
export interface StockSummary {
  totalProducts: number;
  totalBatches: number;
  totalValue: number;
  
  alertsCount: {
    critical: number;
    warning: number;
    info: number;
  };
  
  expiringThisMonth: number;
  lowStockItems: number;
  outOfStockItems: number;
}

// Item para listagem
export interface StockListItem {
  productId: string;
  productName: string;
  category: string;
  unit: string;
  totalQuantity: number;
  availableQuantity: number;
  minStock: number;
  status: 'ok' | 'low' | 'critical' | 'out';
  nearestExpiration?: string;
  daysUntilExpiration?: number;
  averageCost: number;
  totalValue: number;
  batchCount: number;
}
