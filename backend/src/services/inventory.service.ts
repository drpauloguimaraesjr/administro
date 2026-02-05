import { db } from '../config/firebaseAdmin.js';
import {
  Product,
  StockBatch,
  StockMovement,
  StockAlert,
  CreateProductDTO,
  CreateBatchDTO,
  CreateMovementDTO,
  StockSummary,
  StockListItem,
} from '../shared/types/index.js';

const CLINIC_ID = 'default'; // TODO: Get from auth context

// Collections
const productsCollection = db.collection('products');
const batchesCollection = db.collection('stock_batches');
const movementsCollection = db.collection('stock_movements');
const alertsCollection = db.collection('stock_alerts');

// ====================================
// PRODUCTS
// ====================================

export const ProductService = {
  async getAll(): Promise<Product[]> {
    const snapshot = await productsCollection
      .where('clinicId', '==', CLINIC_ID)
      .where('isActive', '==', true)
      .orderBy('name')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  },

  async getById(id: string): Promise<Product | null> {
    const doc = await productsCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Product;
  },

  async create(data: CreateProductDTO, userId: string): Promise<Product> {
    const now = new Date().toISOString();
    
    const product: Omit<Product, 'id'> = {
      ...data,
      trackStock: data.trackStock ?? true,
      minStock: data.minStock ?? 0,
      optimalStock: data.optimalStock ?? 10,
      costPrice: data.costPrice ?? 0,
      sellPrice: data.sellPrice ?? 0,
      aliases: data.aliases ?? [],
      isActive: true,
      requiresPrescription: data.requiresPrescription ?? false,
      isControlled: data.isControlled ?? false,
      clinicId: CLINIC_ID,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    };

    const docRef = await productsCollection.add(product);
    return { id: docRef.id, ...product };
  },

  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    const docRef = productsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updateData);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as Product;
  },

  async delete(id: string): Promise<boolean> {
    const docRef = productsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;

    // Soft delete
    await docRef.update({ isActive: false, updatedAt: new Date().toISOString() });
    return true;
  },

  async search(query: string): Promise<Product[]> {
    // Simple search by name - for production, use Algolia or similar
    const snapshot = await productsCollection
      .where('clinicId', '==', CLINIC_ID)
      .where('isActive', '==', true)
      .get();

    const lowerQuery = query.toLowerCase();
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Product))
      .filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.genericName?.toLowerCase().includes(lowerQuery) ||
        p.aliases.some(a => a.toLowerCase().includes(lowerQuery))
      );
  },

  async findByNameOrAlias(name: string): Promise<Product | null> {
    const products = await this.search(name);
    if (products.length === 0) return null;
    
    // Try exact match first
    const exactMatch = products.find(p => 
      p.name.toLowerCase() === name.toLowerCase() ||
      p.aliases.some(a => a.toLowerCase() === name.toLowerCase())
    );
    
    return exactMatch || products[0];
  },
};

// ====================================
// BATCHES
// ====================================

export const BatchService = {
  async getAll(): Promise<StockBatch[]> {
    const snapshot = await batchesCollection
      .where('clinicId', '==', CLINIC_ID)
      .orderBy('expirationDate')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockBatch));
  },

  async getByProduct(productId: string): Promise<StockBatch[]> {
    const snapshot = await batchesCollection
      .where('clinicId', '==', CLINIC_ID)
      .where('productId', '==', productId)
      .where('status', 'in', ['active', 'low', 'expiring'])
      .orderBy('expirationDate')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockBatch));
  },

  async getById(id: string): Promise<StockBatch | null> {
    const doc = await batchesCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as StockBatch;
  },

  async create(data: CreateBatchDTO, userId: string): Promise<StockBatch> {
    const product = await ProductService.getById(data.productId);
    if (!product) throw new Error('Product not found');

    const now = new Date().toISOString();
    const totalCost = data.initialQuantity * data.unitCost;

    const batch: Omit<StockBatch, 'id'> = {
      ...data,
      productName: product.name,
      currentQuantity: data.initialQuantity,
      reservedQuantity: 0,
      availableQuantity: data.initialQuantity,
      totalCost,
      status: 'active',
      clinicId: CLINIC_ID,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    };

    const docRef = await batchesCollection.add(batch);

    // Create entry movement
    await MovementService.create({
      productId: data.productId,
      batchId: docRef.id,
      type: 'in',
      reason: 'purchase',
      quantity: data.initialQuantity,
      notes: `Entrada inicial - Lote ${data.batchNumber}`,
    }, userId);

    return { id: docRef.id, ...batch };
  },

  async updateQuantity(id: string, quantityChange: number, userId: string): Promise<StockBatch | null> {
    const docRef = batchesCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    const batch = doc.data() as StockBatch;
    const newQuantity = batch.currentQuantity + quantityChange;
    const newAvailable = newQuantity - batch.reservedQuantity;

    // Determine status
    let status: StockBatch['status'] = 'active';
    if (newQuantity <= 0) {
      status = 'depleted';
    } else {
      const product = await ProductService.getById(batch.productId);
      if (product && newQuantity <= product.minStock) {
        status = 'low';
      }
      
      // Check expiration
      const daysUntilExpiration = Math.ceil(
        (new Date(batch.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiration <= 0) {
        status = 'expired';
      } else if (daysUntilExpiration <= 30) {
        status = 'expiring';
      }
    }

    await docRef.update({
      currentQuantity: newQuantity,
      availableQuantity: newAvailable,
      status,
      updatedAt: new Date().toISOString(),
    });

    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as StockBatch;
  },

  // FIFO: Get the batch that expires first
  async getFirstToExpire(productId: string, requiredQuantity: number = 1): Promise<StockBatch | null> {
    const batches = await this.getByProduct(productId);
    
    const available = batches.find(b => 
      b.availableQuantity >= requiredQuantity && 
      b.status !== 'expired' && 
      b.status !== 'depleted'
    );
    
    return available || null;
  },
};

// ====================================
// MOVEMENTS
// ====================================

export const MovementService = {
  async getAll(limit: number = 100): Promise<StockMovement[]> {
    const snapshot = await movementsCollection
      .where('clinicId', '==', CLINIC_ID)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockMovement));
  },

  async getByProduct(productId: string, limit: number = 50): Promise<StockMovement[]> {
    const snapshot = await movementsCollection
      .where('clinicId', '==', CLINIC_ID)
      .where('productId', '==', productId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockMovement));
  },

  async getByBatch(batchId: string): Promise<StockMovement[]> {
    const snapshot = await movementsCollection
      .where('clinicId', '==', CLINIC_ID)
      .where('batchId', '==', batchId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockMovement));
  },

  async create(data: CreateMovementDTO, userId: string): Promise<StockMovement> {
    const batch = await BatchService.getById(data.batchId);
    if (!batch) throw new Error('Batch not found');

    const product = await ProductService.getById(data.productId);
    if (!product) throw new Error('Product not found');

    const now = new Date().toISOString();
    
    // Calculate quantity change (negative for 'out' movements)
    const quantityChange = ['in', 'return'].includes(data.type) 
      ? Math.abs(data.quantity) 
      : -Math.abs(data.quantity);

    const previousQuantity = batch.currentQuantity;
    const newQuantity = previousQuantity + quantityChange;

    if (newQuantity < 0) {
      throw new Error(`Quantidade insuficiente no lote. Disponível: ${batch.availableQuantity}`);
    }

    const movement: Omit<StockMovement, 'id'> = {
      productId: data.productId,
      productName: product.name,
      batchId: data.batchId,
      batchNumber: batch.batchNumber,
      type: data.type,
      reason: data.reason,
      quantity: Math.abs(data.quantity),
      previousQuantity,
      newQuantity,
      unitCost: batch.unitCost,
      totalCost: Math.abs(data.quantity) * batch.unitCost,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      patientId: data.patientId,
      patientName: data.patientName,
      notes: data.notes,
      clinicId: CLINIC_ID,
      createdBy: userId,
      createdAt: now,
    };

    const docRef = await movementsCollection.add(movement);

    // Update batch quantity
    await BatchService.updateQuantity(data.batchId, quantityChange, userId);

    return { id: docRef.id, ...movement };
  },

  // Convenience method for prescriptions
  async createFromPrescription(
    productId: string,
    quantity: number,
    patientId: string,
    patientName: string,
    prescriptionId: string,
    userId: string
  ): Promise<StockMovement | null> {
    // Get first batch to expire (FIFO)
    const batch = await BatchService.getFirstToExpire(productId, quantity);
    if (!batch) {
      console.warn(`No available batch for product ${productId}`);
      return null;
    }

    return this.create({
      productId,
      batchId: batch.id,
      type: 'out',
      reason: 'prescription',
      quantity,
      referenceType: 'prescription',
      referenceId: prescriptionId,
      patientId,
      patientName,
    }, userId);
  },
};

// ====================================
// ALERTS
// ====================================

export const AlertService = {
  async getActive(): Promise<StockAlert[]> {
    const snapshot = await alertsCollection
      .where('clinicId', '==', CLINIC_ID)
      .where('status', '==', 'active')
      .orderBy('severity')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockAlert));
  },

  async create(alert: Omit<StockAlert, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>): Promise<StockAlert> {
    const now = new Date().toISOString();
    
    const newAlert: Omit<StockAlert, 'id'> = {
      ...alert,
      clinicId: CLINIC_ID,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await alertsCollection.add(newAlert);
    return { id: docRef.id, ...newAlert };
  },

  async acknowledge(id: string, userId: string): Promise<void> {
    await alertsCollection.doc(id).update({
      status: 'acknowledged',
      acknowledgedBy: userId,
      acknowledgedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async resolve(id: string): Promise<void> {
    await alertsCollection.doc(id).update({
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  // Check and generate alerts
  async checkAndGenerateAlerts(): Promise<number> {
    let alertsGenerated = 0;
    const now = new Date();

    // Get all active batches
    const batches = await BatchService.getAll();
    const products = await ProductService.getAll();
    const productMap = new Map(products.map(p => [p.id, p]));

    for (const batch of batches) {
      if (batch.status === 'depleted') continue;

      const product = productMap.get(batch.productId);
      if (!product) continue;

      // Check expiration
      const expirationDate = new Date(batch.expirationDate);
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiration <= 0) {
        await this.create({
          productId: batch.productId,
          productName: batch.productName,
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          type: 'expired',
          severity: 'critical',
          title: 'Produto Vencido',
          message: `${batch.productName} (Lote ${batch.batchNumber}) está vencido!`,
          details: { expirationDate: batch.expirationDate, daysUntilExpiration },
          suggestedActions: ['Remover do estoque', 'Descarte adequado'],
          status: 'active',
        });
        alertsGenerated++;
      } else if (daysUntilExpiration <= 15) {
        await this.create({
          productId: batch.productId,
          productName: batch.productName,
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          type: 'expiring_soon',
          severity: 'critical',
          title: 'Vencimento Próximo',
          message: `${batch.productName} (Lote ${batch.batchNumber}) vence em ${daysUntilExpiration} dias`,
          details: { expirationDate: batch.expirationDate, daysUntilExpiration },
          suggestedActions: ['Priorizar uso', 'Verificar possibilidade de troca'],
          status: 'active',
        });
        alertsGenerated++;
      } else if (daysUntilExpiration <= 30) {
        await this.create({
          productId: batch.productId,
          productName: batch.productName,
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          type: 'expiring_soon',
          severity: 'warning',
          title: 'Atenção à Validade',
          message: `${batch.productName} (Lote ${batch.batchNumber}) vence em ${daysUntilExpiration} dias`,
          details: { expirationDate: batch.expirationDate, daysUntilExpiration },
          status: 'active',
        });
        alertsGenerated++;
      }

      // Check low stock
      if (batch.currentQuantity <= product.minStock && batch.currentQuantity > 0) {
        await this.create({
          productId: batch.productId,
          productName: batch.productName,
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          type: 'low_stock',
          severity: batch.currentQuantity <= product.minStock / 2 ? 'critical' : 'warning',
          title: 'Estoque Baixo',
          message: `${batch.productName} com apenas ${batch.currentQuantity} ${product.unit}(s) restantes`,
          details: {
            currentQuantity: batch.currentQuantity,
            minQuantity: product.minStock,
          },
          suggestedActions: ['Realizar pedido de compra'],
          status: 'active',
        });
        alertsGenerated++;
      }
    }

    return alertsGenerated;
  },
};

// ====================================
// CONSUMPTION ANALYTICS
// ====================================

export const ConsumptionService = {
  async getProductConsumption(productId: string, days: number = 30): Promise<{
    productId: string;
    productName: string;
    period: { start: string; end: string };
    totalConsumed: number;
    averageDaily: number;
    consumptionByDay: Array<{ date: string; quantity: number }>;
    consumptionTrend: 'increasing' | 'stable' | 'decreasing';
    trendPercentage: number;
    estimatedDaysUntilStockout: number | null;
    currentStock: number;
  }> {
    const product = await ProductService.getById(productId);
    if (!product) throw new Error('Product not found');

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    // Get all movements for this product
    const movements = await MovementService.getByProduct(productId, 500);
    
    // Filter to date range and only 'out' movements
    const relevantMovements = movements.filter(m => {
      const moveDate = new Date(m.createdAt);
      return moveDate >= startDate && moveDate <= now && m.type === 'out';
    });

    // Group by day
    const consumptionByDay: Map<string, number> = new Map();
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      consumptionByDay.set(d.toISOString().split('T')[0], 0);
    }

    for (const movement of relevantMovements) {
      const day = movement.createdAt.split('T')[0];
      const current = consumptionByDay.get(day) || 0;
      consumptionByDay.set(day, current + movement.quantity);
    }

    const consumptionArray = Array.from(consumptionByDay.entries())
      .map(([date, quantity]) => ({ date, quantity }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalConsumed = consumptionArray.reduce((sum, d) => sum + d.quantity, 0);
    const averageDaily = totalConsumed / days;

    // Calculate trend (compare first half vs second half)
    const midpoint = Math.floor(consumptionArray.length / 2);
    const firstHalf = consumptionArray.slice(0, midpoint);
    const secondHalf = consumptionArray.slice(midpoint);

    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.quantity, 0) / firstHalf.length || 0;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.quantity, 0) / secondHalf.length || 0;

    let consumptionTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    let trendPercentage = 0;

    if (firstHalfAvg > 0) {
      trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
      if (trendPercentage > 15) consumptionTrend = 'increasing';
      else if (trendPercentage < -15) consumptionTrend = 'decreasing';
    }

    // Get current stock
    const batches = await BatchService.getByProduct(productId);
    const currentStock = batches.reduce((sum, b) => sum + b.availableQuantity, 0);

    // Estimate days until stockout
    const estimatedDaysUntilStockout = averageDaily > 0 
      ? Math.floor(currentStock / averageDaily) 
      : null;

    return {
      productId,
      productName: product.name,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      totalConsumed,
      averageDaily: Math.round(averageDaily * 100) / 100,
      consumptionByDay: consumptionArray,
      consumptionTrend,
      trendPercentage: Math.round(trendPercentage * 10) / 10,
      estimatedDaysUntilStockout,
      currentStock,
    };
  },

  async getAllProductsConsumption(days: number = 30): Promise<Array<{
    productId: string;
    productName: string;
    category: string;
    totalConsumed: number;
    averageDaily: number;
    consumptionTrend: 'increasing' | 'stable' | 'decreasing';
    trendPercentage: number;
    currentStock: number;
    estimatedDaysUntilStockout: number | null;
    status: 'ok' | 'warning' | 'critical';
  }>> {
    const products = await ProductService.getAll();
    const results = [];

    for (const product of products) {
      try {
        const consumption = await this.getProductConsumption(product.id, days);
        
        // Determine status
        let status: 'ok' | 'warning' | 'critical' = 'ok';
        if (consumption.estimatedDaysUntilStockout !== null) {
          if (consumption.estimatedDaysUntilStockout <= 7) status = 'critical';
          else if (consumption.estimatedDaysUntilStockout <= 14) status = 'warning';
        }
        if (consumption.consumptionTrend === 'increasing' && consumption.trendPercentage > 30) {
          status = status === 'ok' ? 'warning' : status;
        }

        results.push({
          productId: product.id,
          productName: product.name,
          category: product.category,
          totalConsumed: consumption.totalConsumed,
          averageDaily: consumption.averageDaily,
          consumptionTrend: consumption.consumptionTrend,
          trendPercentage: consumption.trendPercentage,
          currentStock: consumption.currentStock,
          estimatedDaysUntilStockout: consumption.estimatedDaysUntilStockout,
          status,
        });
      } catch (error) {
        console.error(`Error getting consumption for product ${product.id}:`, error);
      }
    }

    // Sort by status priority, then by trend
    return results.sort((a, b) => {
      const statusOrder = { critical: 0, warning: 1, ok: 2 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return b.trendPercentage - a.trendPercentage;
    });
  },

  async getConsumptionSummary(days: number = 30): Promise<{
    period: { start: string; end: string; days: number };
    totalMovements: number;
    totalConsumed: number;
    totalValue: number;
    topConsumed: Array<{ productName: string; quantity: number; value: number }>;
    trends: {
      increasing: number;
      stable: number;
      decreasing: number;
    };
    alerts: {
      lowStockSoon: number;
      highConsumption: number;
    };
  }> {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const allConsumption = await this.getAllProductsConsumption(days);
    const movements = await MovementService.getAll(1000);

    const relevantMovements = movements.filter(m => {
      const moveDate = new Date(m.createdAt);
      return moveDate >= startDate && m.type === 'out';
    });

    const totalValue = relevantMovements.reduce((sum, m) => sum + (m.totalCost || 0), 0);

    // Top consumed products
    const topConsumed = allConsumption
      .filter(p => p.totalConsumed > 0)
      .slice(0, 5)
      .map(p => ({
        productName: p.productName,
        quantity: p.totalConsumed,
        value: 0, // Would need to calculate from movements
      }));

    // Trend counts
    const trends = {
      increasing: allConsumption.filter(p => p.consumptionTrend === 'increasing').length,
      stable: allConsumption.filter(p => p.consumptionTrend === 'stable').length,
      decreasing: allConsumption.filter(p => p.consumptionTrend === 'decreasing').length,
    };

    // Alert counts
    const alerts = {
      lowStockSoon: allConsumption.filter(p => 
        p.estimatedDaysUntilStockout !== null && p.estimatedDaysUntilStockout <= 14
      ).length,
      highConsumption: allConsumption.filter(p => 
        p.consumptionTrend === 'increasing' && p.trendPercentage > 30
      ).length,
    };

    return {
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
        days,
      },
      totalMovements: relevantMovements.length,
      totalConsumed: allConsumption.reduce((sum, p) => sum + p.totalConsumed, 0),
      totalValue,
      topConsumed,
      trends,
      alerts,
    };
  },
};

// ====================================
// SUMMARY / DASHBOARD
// ====================================

export const InventoryService = {
  async getSummary(): Promise<StockSummary> {
    const [products, batches, alerts] = await Promise.all([
      ProductService.getAll(),
      BatchService.getAll(),
      AlertService.getActive(),
    ]);

    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    let totalValue = 0;
    let expiringThisMonth = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;

    const productQuantities = new Map<string, number>();

    for (const batch of batches) {
      if (batch.status === 'depleted') continue;

      totalValue += batch.currentQuantity * batch.unitCost;

      const expDate = new Date(batch.expirationDate);
      if (expDate <= endOfMonth && expDate > now) {
        expiringThisMonth++;
      }

      const current = productQuantities.get(batch.productId) || 0;
      productQuantities.set(batch.productId, current + batch.currentQuantity);
    }

    for (const product of products) {
      const quantity = productQuantities.get(product.id) || 0;
      if (quantity === 0) {
        outOfStockItems++;
      } else if (quantity <= product.minStock) {
        lowStockItems++;
      }
    }

    const alertsCount = {
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length,
    };

    return {
      totalProducts: products.length,
      totalBatches: batches.filter(b => b.status !== 'depleted').length,
      totalValue,
      alertsCount,
      expiringThisMonth,
      lowStockItems,
      outOfStockItems,
    };
  },

  async getStockList(): Promise<StockListItem[]> {
    const [products, batches] = await Promise.all([
      ProductService.getAll(),
      BatchService.getAll(),
    ]);

    const result: StockListItem[] = [];

    for (const product of products) {
      const productBatches = batches.filter(b => b.productId === product.id && b.status !== 'depleted');
      
      if (productBatches.length === 0) {
        result.push({
          productId: product.id,
          productName: product.name,
          category: product.category,
          unit: product.unit,
          totalQuantity: 0,
          availableQuantity: 0,
          minStock: product.minStock,
          status: 'out',
          averageCost: product.costPrice,
          totalValue: 0,
          batchCount: 0,
        });
        continue;
      }

      const totalQuantity = productBatches.reduce((sum, b) => sum + b.currentQuantity, 0);
      const availableQuantity = productBatches.reduce((sum, b) => sum + b.availableQuantity, 0);
      const totalValue = productBatches.reduce((sum, b) => sum + (b.currentQuantity * b.unitCost), 0);
      const avgCost = totalValue / totalQuantity;

      // Find nearest expiration
      const sortedByExpiration = [...productBatches].sort(
        (a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
      );
      const nearestExpiration = sortedByExpiration[0]?.expirationDate;
      const daysUntilExpiration = nearestExpiration
        ? Math.ceil((new Date(nearestExpiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : undefined;

      // Determine status
      let status: StockListItem['status'] = 'ok';
      if (totalQuantity === 0) {
        status = 'out';
      } else if (totalQuantity <= product.minStock / 2) {
        status = 'critical';
      } else if (totalQuantity <= product.minStock) {
        status = 'low';
      }

      result.push({
        productId: product.id,
        productName: product.name,
        category: product.category,
        unit: product.unit,
        totalQuantity,
        availableQuantity,
        minStock: product.minStock,
        status,
        nearestExpiration,
        daysUntilExpiration,
        averageCost: avgCost,
        totalValue,
        batchCount: productBatches.length,
      });
    }

    return result.sort((a, b) => {
      // Sort by status priority, then by name
      const statusOrder = { out: 0, critical: 1, low: 2, ok: 3 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return a.productName.localeCompare(b.productName);
    });
  },
};
