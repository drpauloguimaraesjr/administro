// ====================================
// BILLING SYSTEM TYPES - CALYX
// ====================================

// Item de Faturamento (cobrança individual)
export interface BillingItem {
  id: string;
  
  // Paciente
  patientId: string;
  patientName: string;
  
  // Produto/Serviço
  productId?: string;
  productName: string;
  category: 'medication' | 'procedure' | 'consultation' | 'exam' | 'material' | 'other';
  
  // Referências
  prescriptionId?: string;
  appointmentId?: string;
  movementId?: string; // referência ao movimento de estoque
  
  // Valores
  quantity: number;
  unitPrice: number;
  discount: number; // valor absoluto
  discountPercent?: number;
  totalPrice: number; // (quantity * unitPrice) - discount
  
  // Custo (para cálculo de margem)
  unitCost?: number;
  totalCost?: number;
  profitMargin?: number; // percentual de lucro
  
  // Status
  status: 'pending' | 'invoiced' | 'paid' | 'cancelled' | 'refunded';
  
  // Pagamento
  paymentMethod?: 'cash' | 'credit' | 'debit' | 'pix' | 'transfer' | 'insurance' | 'other';
  paymentDate?: string;
  paymentNotes?: string;
  
  // Nota fiscal / Recibo
  invoiceNumber?: string;
  receiptNumber?: string;
  
  // Metadata
  notes?: string;
  clinicId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Fatura (agrupamento de itens)
export interface Invoice {
  id: string;
  invoiceNumber: string;
  
  // Paciente
  patientId: string;
  patientName: string;
  patientCpf?: string;
  patientEmail?: string;
  
  // Itens
  items: BillingItem[];
  itemIds: string[];
  
  // Totais
  subtotal: number;
  totalDiscount: number;
  total: number;
  
  // Status
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  
  // Datas
  issueDate: string;
  dueDate?: string;
  paidDate?: string;
  
  // Pagamento
  amountPaid: number;
  paymentMethod?: string;
  
  // Metadata
  notes?: string;
  clinicId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Resumo de faturamento por paciente
export interface PatientBillingSummary {
  patientId: string;
  patientName: string;
  
  pendingItems: number;
  pendingAmount: number;
  
  paidItems: number;
  paidAmount: number;
  
  totalItems: number;
  totalAmount: number;
  
  lastBillingDate?: string;
  lastPaymentDate?: string;
}

// Resumo geral de faturamento
export interface BillingSummary {
  // Pendentes
  pendingCount: number;
  pendingAmount: number;
  
  // Pagos (período)
  paidCount: number;
  paidAmount: number;
  
  // Totais
  totalCount: number;
  totalAmount: number;
  
  // Lucro
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  
  // Por método de pagamento
  byPaymentMethod: {
    method: string;
    count: number;
    amount: number;
  }[];
  
  // Por categoria
  byCategory: {
    category: string;
    count: number;
    amount: number;
  }[];
}

// Tabela de Preços
export interface PriceTable {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  
  // Markup padrão para esta tabela
  defaultMarkup: number; // percentual
  
  // Itens da tabela
  items: PriceTableItem[];
  
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceTableItem {
  productId: string;
  productName: string;
  costPrice: number;
  sellPrice: number;
  markup: number; // percentual calculado
}

// ====================================
// DTOs
// ====================================

export interface CreateBillingItemDTO {
  patientId: string;
  patientName: string;
  productId?: string;
  productName: string;
  category: BillingItem['category'];
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountPercent?: number;
  unitCost?: number;
  prescriptionId?: string;
  appointmentId?: string;
  movementId?: string;
  notes?: string;
}

export interface UpdateBillingItemDTO {
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  status?: BillingItem['status'];
  paymentMethod?: BillingItem['paymentMethod'];
  paymentDate?: string;
  paymentNotes?: string;
  notes?: string;
}

export interface MarkAsPaidDTO {
  paymentMethod: BillingItem['paymentMethod'];
  paymentDate?: string;
  paymentNotes?: string;
}

// Filtros para listagem
export interface BillingFilters {
  patientId?: string;
  status?: BillingItem['status'] | BillingItem['status'][];
  category?: BillingItem['category'];
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: BillingItem['paymentMethod'];
}
