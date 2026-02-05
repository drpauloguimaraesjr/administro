/**
 * Seed script for inventory mock data
 * Run with: npx ts-node src/scripts/seed-inventory.ts
 */

import { db } from '../config/firebaseAdmin.js';

const CLINIC_ID = 'default';

// Mock Products
const mockProducts = [
  {
    name: 'Botox 100U',
    genericName: 'Toxina Botulínica Tipo A',
    type: 'injectable',
    category: 'Toxina Botulínica',
    unit: 'fr',
    trackStock: true,
    minStock: 5,
    optimalStock: 15,
    costPrice: 850,
    sellPrice: 1200,
    aliases: ['Botox', 'BTX', 'Toxina'],
    isActive: true,
    requiresPrescription: true,
    isControlled: false,
    storageConditions: 'refrigerated',
  },
  {
    name: 'Ácido Hialurônico 1ml',
    genericName: 'Ácido Hialurônico',
    type: 'injectable',
    category: 'Preenchedor',
    unit: 'un',
    trackStock: true,
    minStock: 10,
    optimalStock: 30,
    costPrice: 450,
    sellPrice: 800,
    aliases: ['AH', 'Hialurônico', 'Filler'],
    isActive: true,
    requiresPrescription: true,
    isControlled: false,
    storageConditions: 'room',
  },
  {
    name: 'Vitamina C Injetável 5ml',
    genericName: 'Ácido Ascórbico',
    type: 'injectable',
    category: 'Vitaminas',
    unit: 'amp',
    trackStock: true,
    minStock: 20,
    optimalStock: 50,
    costPrice: 25,
    sellPrice: 60,
    aliases: ['Vit C', 'Ácido Ascórbico'],
    isActive: true,
    requiresPrescription: false,
    isControlled: false,
    storageConditions: 'refrigerated',
  },
  {
    name: 'Glutationa 600mg',
    genericName: 'Glutationa',
    type: 'injectable',
    category: 'Antioxidantes',
    unit: 'amp',
    trackStock: true,
    minStock: 15,
    optimalStock: 40,
    costPrice: 45,
    sellPrice: 90,
    aliases: ['GSH', 'Gluta'],
    isActive: true,
    requiresPrescription: false,
    isControlled: false,
    storageConditions: 'refrigerated',
  },
  {
    name: 'Complexo B Injetável',
    genericName: 'Complexo B',
    type: 'injectable',
    category: 'Vitaminas',
    unit: 'amp',
    trackStock: true,
    minStock: 25,
    optimalStock: 60,
    costPrice: 15,
    sellPrice: 40,
    aliases: ['Comp B', 'Vitaminas B'],
    isActive: true,
    requiresPrescription: false,
    isControlled: false,
    storageConditions: 'room',
  },
  {
    name: 'Lidocaína 2%',
    genericName: 'Cloridrato de Lidocaína',
    type: 'medication',
    category: 'Anestésicos',
    unit: 'fr',
    trackStock: true,
    minStock: 10,
    optimalStock: 25,
    costPrice: 18,
    sellPrice: 35,
    aliases: ['Lido', 'Anestésico'],
    isActive: true,
    requiresPrescription: true,
    isControlled: false,
    storageConditions: 'room',
  },
];

// Generate batches with varying conditions
function generateBatches(productId: string, productName: string) {
  const now = new Date();
  const batches = [];
  
  // Batch 1: Normal, good quantity
  const batch1Exp = new Date(now);
  batch1Exp.setMonth(batch1Exp.getMonth() + 8);
  batches.push({
    productId,
    productName,
    batchNumber: `LOT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    manufacturer: 'Lab Pharma',
    supplier: 'Distribuidora Med',
    manufacturingDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    expirationDate: batch1Exp.toISOString(),
    purchaseDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    initialQuantity: 20,
    currentQuantity: 15,
    reservedQuantity: 0,
    availableQuantity: 15,
    unitCost: 100,
    totalCost: 2000,
    status: 'active',
    clinicId: CLINIC_ID,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    createdBy: 'seed-script',
  });
  
  return batches;
}

// Generate movements simulating usage patterns
function generateMovements(productId: string, productName: string, batchId: string, batchNumber: string) {
  const movements = [];
  const now = new Date();
  
  // Simulate 30 days of movements
  for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    // Random usage: 0-3 units per day, with increasing trend
    const baseUsage = Math.floor(Math.random() * 2);
    const trendMultiplier = 1 + (30 - daysAgo) * 0.02; // Increasing trend
    const usage = Math.floor(baseUsage * trendMultiplier);
    
    if (usage > 0) {
      movements.push({
        productId,
        productName,
        batchId,
        batchNumber,
        type: 'out',
        reason: 'prescription',
        quantity: usage,
        previousQuantity: 20,
        newQuantity: 20 - usage,
        unitCost: 100,
        totalCost: usage * 100,
        patientId: `patient-${Math.floor(Math.random() * 100)}`,
        patientName: `Paciente ${Math.floor(Math.random() * 100)}`,
        clinicId: CLINIC_ID,
        createdBy: 'seed-script',
        createdAt: date.toISOString(),
      });
    }
  }
  
  return movements;
}

async function seedInventory() {
  console.log('🌱 Starting inventory seed...\n');
  
  const productsCollection = db.collection('products');
  const batchesCollection = db.collection('stock_batches');
  const movementsCollection = db.collection('stock_movements');
  const alertsCollection = db.collection('stock_alerts');
  
  // Clear existing data (optional - comment out if you want to keep data)
  console.log('🗑️  Clearing existing inventory data...');
  const existingProducts = await productsCollection.where('clinicId', '==', CLINIC_ID).get();
  const existingBatches = await batchesCollection.where('clinicId', '==', CLINIC_ID).get();
  const existingMovements = await movementsCollection.where('clinicId', '==', CLINIC_ID).get();
  const existingAlerts = await alertsCollection.where('clinicId', '==', CLINIC_ID).get();
  
  const batch = db.batch();
  existingProducts.docs.forEach(doc => batch.delete(doc.ref));
  existingBatches.docs.forEach(doc => batch.delete(doc.ref));
  existingMovements.docs.forEach(doc => batch.delete(doc.ref));
  existingAlerts.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log('✅ Cleared existing data\n');
  
  // Create products
  console.log('📦 Creating products...');
  const now = new Date().toISOString();
  const createdProducts: Array<{ id: string; name: string }> = [];
  
  for (const product of mockProducts) {
    const docRef = await productsCollection.add({
      ...product,
      clinicId: CLINIC_ID,
      createdAt: now,
      updatedAt: now,
      createdBy: 'seed-script',
    });
    createdProducts.push({ id: docRef.id, name: product.name });
    console.log(`  ✅ ${product.name}`);
  }
  
  // Create batches and movements for each product
  console.log('\n📋 Creating batches and movements...');
  
  for (const product of createdProducts) {
    // Create different scenarios for different products
    const productIndex = createdProducts.indexOf(product);
    
    let batches;
    if (productIndex === 0) {
      // Botox: Low stock scenario
      batches = [{
        productId: product.id,
        productName: product.name,
        batchNumber: 'LOT-BTX001',
        manufacturer: 'Allergan',
        supplier: 'Distribuidora Premium',
        manufacturingDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        initialQuantity: 10,
        currentQuantity: 3, // LOW STOCK!
        reservedQuantity: 0,
        availableQuantity: 3,
        unitCost: 850,
        totalCost: 8500,
        status: 'low',
        clinicId: CLINIC_ID,
        createdAt: now,
        updatedAt: now,
        createdBy: 'seed-script',
      }];
    } else if (productIndex === 1) {
      // Ácido Hialurônico: Expiring soon
      batches = [{
        productId: product.id,
        productName: product.name,
        batchNumber: 'LOT-AH001',
        manufacturer: 'Galderma',
        supplier: 'Distribuidora Med',
        manufacturingDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
        expirationDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days!
        purchaseDate: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000).toISOString(),
        initialQuantity: 25,
        currentQuantity: 12,
        reservedQuantity: 0,
        availableQuantity: 12,
        unitCost: 450,
        totalCost: 11250,
        status: 'expiring',
        clinicId: CLINIC_ID,
        createdAt: now,
        updatedAt: now,
        createdBy: 'seed-script',
      }];
    } else if (productIndex === 2) {
      // Vitamina C: High consumption trend
      batches = [{
        productId: product.id,
        productName: product.name,
        batchNumber: 'LOT-VITC01',
        manufacturer: 'EMS',
        supplier: 'Distribuidora Saúde',
        manufacturingDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        expirationDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
        purchaseDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        initialQuantity: 50,
        currentQuantity: 18, // Was 50, high consumption
        reservedQuantity: 0,
        availableQuantity: 18,
        unitCost: 25,
        totalCost: 1250,
        status: 'active',
        clinicId: CLINIC_ID,
        createdAt: now,
        updatedAt: now,
        createdBy: 'seed-script',
      }];
    } else {
      // Normal scenarios
      batches = [{
        productId: product.id,
        productName: product.name,
        batchNumber: `LOT-${product.name.substring(0, 3).toUpperCase()}${productIndex}`,
        manufacturer: 'Generic Lab',
        supplier: 'Distribuidora Med',
        manufacturingDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        expirationDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000).toISOString(),
        purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        initialQuantity: 40,
        currentQuantity: 28,
        reservedQuantity: 0,
        availableQuantity: 28,
        unitCost: mockProducts[productIndex]?.costPrice || 50,
        totalCost: 40 * (mockProducts[productIndex]?.costPrice || 50),
        status: 'active',
        clinicId: CLINIC_ID,
        createdAt: now,
        updatedAt: now,
        createdBy: 'seed-script',
      }];
    }
    
    for (const batchData of batches) {
      const batchRef = await batchesCollection.add(batchData);
      console.log(`  📦 ${product.name} - Lote ${batchData.batchNumber} (${batchData.currentQuantity} un)`);
      
      // Generate movements with different patterns
      const movements = generateMovementsForProduct(
        product.id,
        product.name,
        batchRef.id,
        batchData.batchNumber,
        productIndex
      );
      
      for (const movement of movements) {
        await movementsCollection.add(movement);
      }
      console.log(`    📊 ${movements.length} movimentações criadas`);
    }
  }
  
  // Create some alerts
  console.log('\n🚨 Creating alerts...');
  
  const alerts = [
    {
      productId: createdProducts[0].id,
      productName: 'Botox 100U',
      batchId: 'batch-1',
      batchNumber: 'LOT-BTX001',
      type: 'low_stock',
      severity: 'critical',
      title: 'Estoque Crítico',
      message: 'Botox 100U com apenas 3 unidades restantes',
      details: { currentQuantity: 3, minQuantity: 5 },
      suggestedActions: ['Realizar pedido urgente', 'Verificar fornecedores'],
      status: 'active',
      clinicId: CLINIC_ID,
      createdAt: now,
      updatedAt: now,
    },
    {
      productId: createdProducts[1].id,
      productName: 'Ácido Hialurônico 1ml',
      batchId: 'batch-2',
      batchNumber: 'LOT-AH001',
      type: 'expiring_soon',
      severity: 'warning',
      title: 'Vencimento Próximo',
      message: 'Ácido Hialurônico 1ml (Lote LOT-AH001) vence em 20 dias',
      details: { expirationDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), daysUntilExpiration: 20 },
      suggestedActions: ['Priorizar uso', 'Verificar possibilidade de troca'],
      status: 'active',
      clinicId: CLINIC_ID,
      createdAt: now,
      updatedAt: now,
    },
    {
      productId: createdProducts[2].id,
      productName: 'Vitamina C Injetável 5ml',
      type: 'high_consumption',
      severity: 'info',
      title: 'Consumo Elevado',
      message: 'Vitamina C Injetável teve aumento de 45% no consumo este mês',
      details: { previousConsumption: 22, currentConsumption: 32, consumptionRate: 1.45 },
      suggestedActions: ['Aumentar estoque mínimo', 'Verificar tendência'],
      status: 'active',
      clinicId: CLINIC_ID,
      createdAt: now,
      updatedAt: now,
    },
  ];
  
  for (const alert of alerts) {
    await alertsCollection.add(alert);
    console.log(`  🚨 ${alert.title}: ${alert.productName}`);
  }
  
  console.log('\n✅ Seed completed successfully!');
  console.log(`   📦 ${createdProducts.length} produtos`);
  console.log(`   📋 ${createdProducts.length} lotes`);
  console.log(`   🚨 ${alerts.length} alertas`);
  
  process.exit(0);
}

function generateMovementsForProduct(
  productId: string,
  productName: string,
  batchId: string,
  batchNumber: string,
  productIndex: number
) {
  const movements = [];
  const now = new Date();
  
  // Initial entry
  movements.push({
    productId,
    productName,
    batchId,
    batchNumber,
    type: 'in',
    reason: 'purchase',
    quantity: productIndex === 0 ? 10 : productIndex === 1 ? 25 : productIndex === 2 ? 50 : 40,
    previousQuantity: 0,
    newQuantity: productIndex === 0 ? 10 : productIndex === 1 ? 25 : productIndex === 2 ? 50 : 40,
    unitCost: mockProducts[productIndex]?.costPrice || 50,
    totalCost: (productIndex === 0 ? 10 : 40) * (mockProducts[productIndex]?.costPrice || 50),
    notes: 'Entrada inicial - Compra',
    clinicId: CLINIC_ID,
    createdBy: 'seed-script',
    createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  });
  
  // Generate usage movements based on product type
  let currentQty = productIndex === 0 ? 10 : productIndex === 1 ? 25 : productIndex === 2 ? 50 : 40;
  
  for (let daysAgo = 44; daysAgo >= 0; daysAgo--) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    // Skip weekends occasionally
    if (date.getDay() === 0) continue;
    
    let usage = 0;
    
    if (productIndex === 2) {
      // Vitamina C: Increasing trend (high consumption)
      const weekNum = Math.floor((44 - daysAgo) / 7);
      const baseUsage = 1 + weekNum; // Increases each week
      usage = Math.random() < 0.7 ? baseUsage : 0;
    } else if (productIndex === 0) {
      // Botox: Steady but running low
      usage = Math.random() < 0.15 ? 1 : 0;
    } else {
      // Others: Random usage
      usage = Math.random() < 0.4 ? Math.floor(Math.random() * 2) + 1 : 0;
    }
    
    if (usage > 0 && currentQty > usage) {
      const newQty = currentQty - usage;
      movements.push({
        productId,
        productName,
        batchId,
        batchNumber,
        type: 'out',
        reason: 'prescription',
        quantity: usage,
        previousQuantity: currentQty,
        newQuantity: newQty,
        unitCost: mockProducts[productIndex]?.costPrice || 50,
        totalCost: usage * (mockProducts[productIndex]?.costPrice || 50),
        patientId: `patient-${Math.floor(Math.random() * 200)}`,
        patientName: `Paciente ${Math.floor(Math.random() * 200)}`,
        clinicId: CLINIC_ID,
        createdBy: 'seed-script',
        createdAt: date.toISOString(),
      });
      currentQty = newQty;
    }
  }
  
  return movements;
}

seedInventory().catch(console.error);
