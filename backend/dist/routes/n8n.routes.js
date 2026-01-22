/**
 * Rotas para integração com n8n
 * Recebe dados processados do n8n e salva no Firestore
 */
import { Router } from 'express';
import { db } from '../config/firebaseAdmin.js';
const router = Router();
/**
 * POST /api/n8n/create-transaction
 * Recebe transação processada do n8n e salva no Firestore
 */
router.post('/create-transaction', async (req, res) => {
    try {
        const payload = req.body;
        // Validação dos dados obrigatórios
        if (!payload.amount || !payload.type || !payload.contextId) {
            return res.status(400).json({
                error: 'Campos obrigatórios: amount, type, contextId',
                received: payload,
            });
        }
        // Valida tipos
        if (!['income', 'expense'].includes(payload.type)) {
            return res.status(400).json({
                error: 'type deve ser "income" ou "expense"',
            });
        }
        if (!['HOME', 'CLINIC'].includes(payload.contextId)) {
            return res.status(400).json({
                error: 'contextId deve ser "HOME" ou "CLINIC"',
            });
        }
        // Cria transação no formato do Firestore
        const transaction = {
            amount: payload.amount,
            type: payload.type,
            status: 'paid', // Comprovantes geralmente são pagos
            date: payload.date ? new Date(payload.date) : new Date(),
            description: payload.description || 'Transação via WhatsApp',
            category: payload.category || 'Outros',
            contextId: payload.contextId,
            attachmentUrl: payload.attachmentUrl,
            createdBy: payload.createdBy || 'whatsapp', // Identifica que veio do WhatsApp
            createdByName: payload.createdByName || 'WhatsApp',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // Salva no Firestore
        const docRef = await db.collection('transactions').add(transaction);
        console.log('✅ Transação criada:', {
            id: docRef.id,
            amount: transaction.amount,
            type: transaction.type,
            contextId: transaction.contextId,
        });
        res.json({
            success: true,
            transactionId: docRef.id,
            transaction: {
                ...transaction,
                id: docRef.id,
            },
        });
    }
    catch (error) {
        console.error('❌ Erro ao criar transação:', error);
        res.status(500).json({
            error: 'Erro ao criar transação',
            message: error.message,
        });
    }
});
/**
 * POST /api/n8n/create-pending-confirmation
 * Cria confirmação pendente após extração de dados do n8n
 */
router.post('/create-pending-confirmation', async (req, res) => {
    try {
        const payload = req.body;
        // Validação básica
        if (!payload.from || !payload.messageId || !payload.extractedData) {
            return res.status(400).json({
                error: 'Campos obrigatórios: from, messageId, extractedData',
            });
        }
        const confirmationId = `confirm_${Date.now()}_${payload.messageId}`;
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expira em 10 minutos
        const pendingConfirmation = {
            id: confirmationId,
            messageId: payload.messageId,
            from: payload.from,
            fromName: payload.fromName || 'Usuário',
            extractedData: payload.extractedData,
            confirmationMessage: payload.confirmationMessage,
            status: 'pending',
            createdAt: new Date(),
            expiresAt: expiresAt,
        };
        // Salva no Firestore
        await db.collection('pending_confirmations').doc(confirmationId).set(pendingConfirmation);
        console.log('✅ Confirmação pendente criada:', confirmationId);
        res.json({
            success: true,
            confirmationId: confirmationId,
            pendingConfirmation: pendingConfirmation,
        });
    }
    catch (error) {
        console.error('❌ Erro ao criar confirmação pendente:', error);
        res.status(500).json({
            error: 'Erro ao criar confirmação pendente',
            message: error.message,
        });
    }
});
/**
 * GET /api/n8n/pending-confirmation/:from
 * Busca confirmação pendente mais recente de um número
 */
router.get('/pending-confirmation/:from', async (req, res) => {
    try {
        const from = req.params.from.replace('@s.whatsapp.net', '');
        // Busca confirmação pendente mais recente que não expirou
        const snapshot = await db.collection('pending_confirmations')
            .where('from', '==', from.includes('@') ? from : `${from}@s.whatsapp.net`)
            .where('status', '==', 'pending')
            .where('expiresAt', '>', new Date())
            .orderBy('expiresAt', 'desc')
            .limit(1)
            .get();
        if (snapshot.empty) {
            return res.status(404).json({
                error: 'Nenhuma confirmação pendente encontrada',
            });
        }
        const doc = snapshot.docs[0];
        const data = doc.data();
        res.json({
            success: true,
            confirmation: {
                id: doc.id,
                ...data,
            },
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar confirmação pendente:', error);
        res.status(500).json({
            error: 'Erro ao buscar confirmação pendente',
            message: error.message,
        });
    }
});
/**
 * POST /api/n8n/confirm-transaction
 * Processa confirmação do usuário e cria transação
 */
router.post('/confirm-transaction', async (req, res) => {
    try {
        const { confirmationId, category, contextId } = req.body;
        if (!confirmationId || !contextId) {
            return res.status(400).json({
                error: 'Campos obrigatórios: confirmationId, contextId',
            });
        }
        // Busca confirmação pendente
        const confirmationDoc = await db.collection('pending_confirmations').doc(confirmationId).get();
        if (!confirmationDoc.exists) {
            return res.status(404).json({
                error: 'Confirmação não encontrada ou já expirada',
            });
        }
        const confirmation = confirmationDoc.data();
        if (confirmation?.status !== 'pending') {
            return res.status(400).json({
                error: 'Confirmação já foi processada',
            });
        }
        // Valida contexto
        if (!['HOME', 'CLINIC'].includes(contextId)) {
            return res.status(400).json({
                error: 'contextId deve ser "HOME" ou "CLINIC"',
            });
        }
        // Prepara dados da transação
        const extractedData = confirmation.extractedData;
        const transaction = {
            amount: extractedData.amount || 0,
            type: extractedData.type || 'expense',
            status: 'paid',
            date: extractedData.date ? new Date(extractedData.date) : new Date(),
            description: extractedData.description || 'Transação via WhatsApp',
            category: category || extractedData.category || 'Outros',
            contextId: contextId,
            attachmentUrl: extractedData.attachmentUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // Cria transação
        const transactionRef = await db.collection('transactions').add(transaction);
        // Marca confirmação como confirmada
        await db.collection('pending_confirmations').doc(confirmationId).update({
            status: 'confirmed',
            confirmedAt: new Date(),
            transactionId: transactionRef.id,
            confirmedCategory: category || extractedData.category,
            confirmedContextId: contextId,
        });
        console.log('✅ Transação confirmada e criada:', transactionRef.id);
        res.json({
            success: true,
            transactionId: transactionRef.id,
            transaction: {
                ...transaction,
                id: transactionRef.id,
            },
        });
    }
    catch (error) {
        console.error('❌ Erro ao confirmar transação:', error);
        res.status(500).json({
            error: 'Erro ao confirmar transação',
            message: error.message,
        });
    }
});
/**
 * GET /api/n8n/health
 * Health check para n8n verificar se o endpoint está ativo
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'n8n-integration',
        timestamp: new Date().toISOString(),
    });
});
export default router;
//# sourceMappingURL=n8n.routes.js.map