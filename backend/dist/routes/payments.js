// src/routes/payments.ts
import { Router } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
const router = Router();
// GET /api/payments - List all payments (with optional filters)
router.get('/', async (req, res) => {
    try {
        const db = getFirestore();
        let query = db.collection('payments').orderBy('date', 'desc');
        const snapshot = await query.get();
        let payments = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        // Filter by patientId if provided
        if (req.query.patientId) {
            payments = payments.filter((p) => p.patientId === req.query.patientId);
        }
        // Filter by status if provided
        if (req.query.status) {
            payments = payments.filter((p) => p.status === req.query.status);
        }
        res.json(payments);
    }
    catch (error) {
        console.error('Erro ao buscar pagamentos:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET /api/payments/:id
router.get('/:id', async (req, res) => {
    try {
        const db = getFirestore();
        const doc = await db.collection('payments').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }
        res.json({ id: doc.id, ...doc.data() });
    }
    catch (error) {
        console.error('Erro ao buscar pagamento:', error);
        res.status(500).json({ error: error.message });
    }
});
// POST /api/payments - Create payment
router.post('/', async (req, res) => {
    try {
        const db = getFirestore();
        const now = new Date().toISOString();
        const payment = {
            patientId: req.body.patientId,
            patientName: req.body.patientName,
            appointmentId: req.body.appointmentId || null,
            amount: req.body.amount,
            method: req.body.method, // pix, dinheiro, cartao_credito, cartao_debito, convenio
            status: req.body.status || 'pending', // pending, paid, cancelled
            date: req.body.date || now.split('T')[0],
            description: req.body.description || 'Consulta médica',
            paidAt: req.body.status === 'paid' ? now : null,
            createdAt: now,
            updatedAt: now,
        };
        const docRef = await db.collection('payments').add(payment);
        res.status(201).json({ id: docRef.id, ...payment });
    }
    catch (error) {
        console.error('Erro ao criar pagamento:', error);
        res.status(500).json({ error: error.message });
    }
});
// PUT /api/payments/:id - Update payment
router.put('/:id', async (req, res) => {
    try {
        const db = getFirestore();
        const docRef = db.collection('payments').doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }
        const now = new Date().toISOString();
        const updates = {
            ...req.body,
            updatedAt: now,
        };
        // If marking as paid, set paidAt
        if (req.body.status === 'paid' && !doc.data()?.paidAt) {
            updates.paidAt = now;
        }
        await docRef.update(updates);
        res.json({ id: req.params.id, ...doc.data(), ...updates });
    }
    catch (error) {
        console.error('Erro ao atualizar pagamento:', error);
        res.status(500).json({ error: error.message });
    }
});
// DELETE /api/payments/:id
router.delete('/:id', async (req, res) => {
    try {
        const db = getFirestore();
        await db.collection('payments').doc(req.params.id).delete();
        res.json({ success: true });
    }
    catch (error) {
        console.error('Erro ao remover pagamento:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET /api/payments/stats/summary - Financial summary
router.get('/stats/summary', async (req, res) => {
    try {
        const db = getFirestore();
        const snapshot = await db.collection('payments').get();
        let totalReceived = 0;
        let totalPending = 0;
        let countPaid = 0;
        let countPending = 0;
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.status === 'paid') {
                totalReceived += data.amount || 0;
                countPaid++;
            }
            else if (data.status === 'pending') {
                totalPending += data.amount || 0;
                countPending++;
            }
        });
        res.json({
            totalReceived,
            totalPending,
            countPaid,
            countPending,
            total: snapshot.size,
        });
    }
    catch (error) {
        console.error('Erro ao buscar resumo:', error);
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=payments.js.map