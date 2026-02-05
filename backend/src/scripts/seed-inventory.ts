// backend/src/scripts/seed-inventory.ts
// Execute com: npx ts-node src/scripts/seed-inventory.ts

import 'dotenv/config';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializa Firebase se ainda não inicializado
if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'administro-af341';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey) {
        initializeApp({
            credential: cert({ projectId, clientEmail, privateKey })
        });
    } else {
        console.error('❌ Credenciais do Firebase não encontradas.');
        console.error('   Configure FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY no .env');
        process.exit(1);
    }
}

const db = getFirestore();

// Tipos simples para o seed
interface MockItem {
    name: string;
    category: string;
    unit: string;
    currentQuantity: number;
    minStock: number;
    costPrice: number;
    sellPrice: number;
}

interface MockBatch {
    itemIndex: number;
    lotNumber: string;
    quantity: number;
    expirationDate: string;
}

interface MockMovement {
    itemId: string;
    itemName: string;
    type: string;
    reason: string;
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    performedBy: string;
    createdAt: string;
}

// Dados mockados
const mockItems: MockItem[] = [
    { name: 'Botox 100U', category: 'medicamento', unit: 'frasco', currentQuantity: 15, minStock: 5, costPrice: 850, sellPrice: 1200 },
    { name: 'Ácido Hialurônico 1ml', category: 'medicamento', unit: 'seringa', currentQuantity: 25, minStock: 10, costPrice: 420, sellPrice: 600 },
    { name: 'Vitamina C Injetável', category: 'medicamento', unit: 'ampola', currentQuantity: 50, minStock: 20, costPrice: 35, sellPrice: 80 },
    { name: 'Soro Fisiológico 500ml', category: 'material', unit: 'frasco', currentQuantity: 100, minStock: 30, costPrice: 8, sellPrice: 15 },
    { name: 'Agulha 30G', category: 'material', unit: 'unidade', currentQuantity: 200, minStock: 50, costPrice: 0.5, sellPrice: 2 },
    { name: 'Luva Procedimento P', category: 'material', unit: 'par', currentQuantity: 8, minStock: 50, costPrice: 0.8, sellPrice: 2 },
    { name: 'Sculptra 2 frascos', category: 'medicamento', unit: 'kit', currentQuantity: 3, minStock: 2, costPrice: 2800, sellPrice: 4500 },
    { name: 'Skinbooster', category: 'cosmético', unit: 'ampola', currentQuantity: 0, minStock: 5, costPrice: 380, sellPrice: 550 },
    { name: 'Lidocaína 2%', category: 'medicamento', unit: 'frasco', currentQuantity: 12, minStock: 5, costPrice: 25, sellPrice: 50 },
    { name: 'Protetor Solar FPS 60', category: 'cosmético', unit: 'tubo', currentQuantity: 30, minStock: 10, costPrice: 45, sellPrice: 120 },
];

const mockBatches: MockBatch[] = [
    { itemIndex: 0, lotNumber: 'BOT2025-001', quantity: 10, expirationDate: '2025-08-15' },
    { itemIndex: 0, lotNumber: 'BOT2025-002', quantity: 5, expirationDate: '2026-03-20' },
    { itemIndex: 1, lotNumber: 'AH2024-050', quantity: 10, expirationDate: '2025-02-10' },
    { itemIndex: 1, lotNumber: 'AH2025-001', quantity: 15, expirationDate: '2026-06-30' },
    { itemIndex: 2, lotNumber: 'VITC-2025-100', quantity: 50, expirationDate: '2026-12-01' },
    { itemIndex: 6, lotNumber: 'SCP2025-01', quantity: 3, expirationDate: '2026-09-15' },
];

function generateMovements(itemId: string, itemName: string, daysBack: number): MockMovement[] {
    const movements: MockMovement[] = [];
    const reasons = ['prescrição', 'procedimento'];

    for (let i = 0; i < daysBack; i++) {
        if (Math.random() > 0.3) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const quantity = Math.floor(Math.random() * 3) + 1;
            movements.push({
                itemId,
                itemName,
                type: 'saída',
                reason: reasons[Math.floor(Math.random() * reasons.length)],
                quantity: -quantity,
                previousQuantity: 100,
                newQuantity: 100 - quantity,
                performedBy: 'Sistema (Seed)',
                createdAt: date.toISOString()
            });
        }
    }

    return movements;
}

async function seed(): Promise<void> {
    console.log('🌱 Iniciando seed de dados de estoque...\n');

    // Limpa dados existentes
    console.log('🗑️ Limpando dados existentes...');
    const collections = ['inventory_items', 'inventory_batches', 'inventory_movements', 'inventory_alerts'];

    for (const col of collections) {
        const snapshot = await db.collection(col).get();
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        console.log(`   - ${col}: ${snapshot.size} documentos removidos`);
    }

    // Cria itens
    console.log('\n📦 Criando itens...');
    const createdItems: Array<{ id: string; name: string }> = [];

    for (const item of mockItems) {
        const now = new Date().toISOString();
        const docRef = await db.collection('inventory_items').add({
            ...item,
            createdAt: now,
            updatedAt: now
        });
        createdItems.push({ id: docRef.id, name: item.name });
        console.log(`   ✅ ${item.name} (qty: ${item.currentQuantity})`);
    }

    // Cria lotes
    console.log('\n📋 Criando lotes...');
    for (const batch of mockBatches) {
        const item = createdItems[batch.itemIndex];
        await db.collection('inventory_batches').add({
            itemId: item.id,
            itemName: item.name,
            lotNumber: batch.lotNumber,
            quantity: batch.quantity,
            expirationDate: batch.expirationDate,
            receivedAt: new Date().toISOString()
        });
        console.log(`   ✅ ${item.name} - Lote ${batch.lotNumber} (val: ${batch.expirationDate})`);
    }

    // Cria movimentações
    console.log('\n📊 Criando movimentações...');
    let totalMovements = 0;

    for (let i = 0; i < 5; i++) {
        const item = createdItems[i];
        const movements = generateMovements(item.id, item.name, 30);

        for (const movement of movements) {
            await db.collection('inventory_movements').add(movement);
            totalMovements++;
        }
        console.log(`   ✅ ${item.name}: ${movements.length} movimentações`);
    }

    console.log(`\n   Total: ${totalMovements} movimentações criadas`);

    // Gera alertas
    console.log('\n🚨 Gerando alertas...');

    await db.collection('inventory_alerts').add({
        type: 'low_stock',
        severity: 'critical',
        itemId: createdItems[5].id,
        itemName: 'Luva Procedimento P',
        message: 'Estoque crítico: Luva Procedimento P (8 par)',
        details: { currentQuantity: 8, minStock: 50, percentRemaining: 16 },
        status: 'active',
        createdAt: new Date().toISOString()
    });
    console.log('   ✅ Alerta: Luva Procedimento P (estoque baixo)');

    await db.collection('inventory_alerts').add({
        type: 'out_of_stock',
        severity: 'critical',
        itemId: createdItems[7].id,
        itemName: 'Skinbooster',
        message: 'Estoque esgotado: Skinbooster',
        details: { currentQuantity: 0 },
        status: 'active',
        createdAt: new Date().toISOString()
    });
    console.log('   ✅ Alerta: Skinbooster (esgotado)');

    await db.collection('inventory_alerts').add({
        type: 'expired',
        severity: 'critical',
        itemId: createdItems[1].id,
        itemName: 'Ácido Hialurônico 1ml',
        message: 'Lote vencido: Ácido Hialurônico 1ml - Lote AH2024-050',
        details: { lotNumber: 'AH2024-050', expirationDate: '2025-02-10', quantity: 10 },
        status: 'active',
        createdAt: new Date().toISOString()
    });
    console.log('   ✅ Alerta: Ácido Hialurônico (lote vencido)');

    console.log('\n✨ Seed concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   - ${createdItems.length} itens criados`);
    console.log(`   - ${mockBatches.length} lotes criados`);
    console.log(`   - ${totalMovements} movimentações criadas`);
    console.log(`   - 3 alertas criados`);

    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
});
