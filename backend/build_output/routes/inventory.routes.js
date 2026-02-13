// backend/src/routes/inventory.routes.ts
import { Router } from 'express';
import * as inventoryService from '../services/inventory.service.js';
const router = Router();
// =====================
// Items
// =====================
// GET /api/inventory - Listar todos os itens
router.get('/', async (req, res) => {
    try {
        const items = await inventoryService.getAllItems();
        res.json(items);
    }
    catch (error) {
        console.error('Erro ao listar itens:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET /api/inventory/summary - Dashboard resumo
router.get('/summary', async (req, res) => {
    try {
        const summary = await inventoryService.getSummary();
        res.json(summary);
    }
    catch (error) {
        console.error('Erro ao buscar resumo:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET /api/inventory/:id - Buscar item por ID
router.get('/:id', async (req, res) => {
    try {
        const item = await inventoryService.getItemById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        res.json(item);
    }
    catch (error) {
        console.error('Erro ao buscar item:', error);
        res.status(500).json({ error: error.message });
    }
});
// POST /api/inventory - Criar item
router.post('/', async (req, res) => {
    try {
        const item = await inventoryService.createItem(req.body);
        res.status(201).json(item);
    }
    catch (error) {
        console.error('Erro ao criar item:', error);
        res.status(500).json({ error: error.message });
    }
});
// PUT /api/inventory/:id - Atualizar item
router.put('/:id', async (req, res) => {
    try {
        const item = await inventoryService.updateItem(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        res.json(item);
    }
    catch (error) {
        console.error('Erro ao atualizar item:', error);
        res.status(500).json({ error: error.message });
    }
});
// DELETE /api/inventory/:id - Deletar item
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await inventoryService.deleteItem(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('Erro ao deletar item:', error);
        res.status(500).json({ error: error.message });
    }
});
// =====================
// Batches (Lotes)
// =====================
// GET /api/inventory/batches - Listar lotes
router.get('/batches/all', async (req, res) => {
    try {
        const itemId = req.query.itemId;
        const batches = await inventoryService.getBatches(itemId);
        res.json(batches);
    }
    catch (error) {
        console.error('Erro ao listar lotes:', error);
        res.status(500).json({ error: error.message });
    }
});
// POST /api/inventory/batches - Criar lote (entrada de estoque)
router.post('/batches', async (req, res) => {
    try {
        const batch = await inventoryService.createBatch(req.body);
        res.status(201).json(batch);
    }
    catch (error) {
        console.error('Erro ao criar lote:', error);
        res.status(500).json({ error: error.message });
    }
});
// =====================
// Movements (Movimentações)
// =====================
// GET /api/inventory/movements - Listar movimentações
router.get('/movements/all', async (req, res) => {
    try {
        const itemId = req.query.itemId;
        const limit = req.query.limit ? parseInt(req.query.limit) : 100;
        const movements = await inventoryService.getMovements(itemId, limit);
        res.json(movements);
    }
    catch (error) {
        console.error('Erro ao listar movimentações:', error);
        res.status(500).json({ error: error.message });
    }
});
// POST /api/inventory/movements - Registrar movimentação (saída/ajuste)
router.post('/movements', async (req, res) => {
    try {
        const movement = await inventoryService.createMovement(req.body);
        res.status(201).json(movement);
    }
    catch (error) {
        console.error('Erro ao registrar movimentação:', error);
        res.status(500).json({ error: error.message });
    }
});
// =====================
// Alerts
// =====================
// GET /api/inventory/alerts - Listar alertas
router.get('/alerts/all', async (req, res) => {
    try {
        const status = req.query.status;
        const alerts = await inventoryService.getAlerts(status);
        res.json(alerts);
    }
    catch (error) {
        console.error('Erro ao listar alertas:', error);
        res.status(500).json({ error: error.message });
    }
});
// POST /api/inventory/alerts/check - Verificar e gerar alertas
router.post('/alerts/check', async (req, res) => {
    try {
        const alerts = await inventoryService.checkAndGenerateAlerts();
        res.json({ generated: alerts.length, alerts });
    }
    catch (error) {
        console.error('Erro ao verificar alertas:', error);
        res.status(500).json({ error: error.message });
    }
});
// POST /api/inventory/alerts/:id/acknowledge - Marcar alerta como visto
router.post('/alerts/:id/acknowledge', async (req, res) => {
    try {
        const userId = req.body.userId || 'unknown';
        const alert = await inventoryService.acknowledgeAlert(req.params.id, userId);
        if (!alert) {
            return res.status(404).json({ error: 'Alerta não encontrado' });
        }
        res.json(alert);
    }
    catch (error) {
        console.error('Erro ao reconhecer alerta:', error);
        res.status(500).json({ error: error.message });
    }
});
// POST /api/inventory/alerts/:id/resolve - Resolver alerta
router.post('/alerts/:id/resolve', async (req, res) => {
    try {
        const alert = await inventoryService.resolveAlert(req.params.id);
        if (!alert) {
            return res.status(404).json({ error: 'Alerta não encontrado' });
        }
        res.json(alert);
    }
    catch (error) {
        console.error('Erro ao resolver alerta:', error);
        res.status(500).json({ error: error.message });
    }
});
// =====================
// Consumption Analysis
// =====================
// GET /api/inventory/consumption/summary - Resumo de consumo de todos os itens
router.get('/consumption/summary', async (req, res) => {
    try {
        const period = req.query.period ? parseInt(req.query.period) : 30;
        const summary = await inventoryService.getConsumptionSummary(period);
        res.json(summary);
    }
    catch (error) {
        console.error('Erro ao buscar resumo de consumo:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET /api/inventory/consumption/:id - Análise de consumo de um item
router.get('/consumption/:id', async (req, res) => {
    try {
        const period = req.query.period ? parseInt(req.query.period) : 30;
        const analysis = await inventoryService.analyzeConsumption(req.params.id, period);
        if (!analysis) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        res.json(analysis);
    }
    catch (error) {
        console.error('Erro ao analisar consumo:', error);
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=inventory.routes.js.map