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