import { Router } from 'express';
import { BillingService } from '../services/billing.service.js';
const router = Router();
const getUserId = (req) => req.user?.id || req.headers['x-user-id'] || 'system';
// ====================================
// LIST & SUMMARY
// ====================================
// GET /api/billing/summary
router.get('/summary', async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const summary = await BillingService.getSummary(dateFrom, dateTo);
        res.json(summary);
    }
    catch (error) {
        console.error('Error getting billing summary:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET /api/billing/patients-summary
router.get('/patients-summary', async (req, res) => {
    try {
        const summary = await BillingService.getPatientsSummary();
        res.json(summary);
    }
    catch (error) {
        console.error('Error getting patients billing summary:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET /api/billing/pending
router.get('/pending', async (req, res) => {
    try {
        const items = await BillingService.getPending();
        res.json(items);
    }
    catch (error) {
        console.error('Error getting pending billing items:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET /api/billing
router.get('/', async (req, res) => {
    try {
        const filters = {
            patientId: req.query.patientId,
            status: req.query.status,
            category: req.query.category,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            paymentMethod: req.query.paymentMethod,
        };
        const limit = parseInt(req.query.limit) || 100;
        const items = await BillingService.getAll(filters, limit);
        res.json(items);
    }
    catch (error) {
        console.error('Error getting billing items:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET /api/billing/patient/:patientId
router.get('/patient/:patientId', async (req, res) => {
    try {
        const status = req.query.status
            ? req.query.status.split(',')
            : undefined;
        const items = await BillingService.getByPatient(req.params.patientId, status);
        res.json(items);
    }
    catch (error) {
        console.error('Error getting patient billing:', error);
        res.status(500).json({ error: error.message });
    }
});
// ====================================
// CRUD
// ====================================
// GET /api/billing/:id
router.get('/:id', async (req, res) => {
    try {
        const item = await BillingService.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Billing item not found' });
        }
        res.json(item);
    }
    catch (error) {
        console.error('Error getting billing item:', error);
        res.status(500).json({ error: error.message });
    }
});
// POST /api/billing
router.post('/', async (req, res) => {
    try {
        const userId = getUserId(req);
        const item = await BillingService.create(req.body, userId);
        res.status(201).json(item);
    }
    catch (error) {
        console.error('Error creating billing item:', error);
        res.status(500).json({ error: error.message });
    }
});
// PUT /api/billing/:id
router.put('/:id', async (req, res) => {
    try {
        const item = await BillingService.update(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ error: 'Billing item not found' });
        }
        res.json(item);
    }
    catch (error) {
        console.error('Error updating billing item:', error);
        res.status(500).json({ error: error.message });
    }
});
// DELETE /api/billing/:id
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await BillingService.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Billing item not found' });
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting billing item:', error);
        res.status(500).json({ error: error.message });
    }
});
// ====================================
// PAYMENT ACTIONS
// ====================================
// POST /api/billing/:id/pay
router.post('/:id/pay', async (req, res) => {
    try {
        const item = await BillingService.markAsPaid(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ error: 'Billing item not found' });
        }
        res.json(item);
    }
    catch (error) {
        console.error('Error marking as paid:', error);
        res.status(500).json({ error: error.message });
    }
});
// POST /api/billing/pay-multiple
router.post('/pay-multiple', async (req, res) => {
    try {
        const { ids, ...paymentData } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'ids array is required' });
        }
        const count = await BillingService.markMultipleAsPaid(ids, paymentData);
        res.json({ success: true, count });
    }
    catch (error) {
        console.error('Error marking multiple as paid:', error);
        res.status(500).json({ error: error.message });
    }
});
// POST /api/billing/:id/cancel
router.post('/:id/cancel', async (req, res) => {
    try {
        const item = await BillingService.cancel(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Billing item not found' });
        }
        res.json(item);
    }
    catch (error) {
        console.error('Error cancelling billing item:', error);
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=billing.routes.js.map