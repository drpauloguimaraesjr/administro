// backend/src/routes/inventory.routes.ts
import { Router, Request, Response } from 'express';
import * as inventoryService from '../services/inventory.service.js';

const router = Router();

// =====================
// Items
// =====================

// GET /api/inventory - Listar todos os itens
router.get('/', async (req: Request, res: Response) => {
    try {
        const items = await inventoryService.getAllItems();
        res.json(items);
    } catch (error: any) {
        console.error('Erro ao listar itens:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/inventory/summary - Dashboard resumo
router.get('/summary', async (req: Request, res: Response) => {
    try {
        const summary = await inventoryService.getSummary();
        res.json(summary);
    } catch (error: any) {
        console.error('Erro ao buscar resumo:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/inventory/match?name=VITAMINA+B12 - Fuzzy match de produto
router.get('/match', async (req: Request, res: Response) => {
    try {
        const name = req.query.name as string;
        if (!name || name.length < 2) {
            return res.status(400).json({ error: 'Parâmetro "name" é obrigatório (mín. 2 caracteres)' });
        }
        const result = await inventoryService.matchProduct(name);
        res.json(result);
    } catch (error: any) {
        console.error('Erro ao buscar match de produto:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/inventory/:id - Buscar item por ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const item = await inventoryService.getItemById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        res.json(item);
    } catch (error: any) {
        console.error('Erro ao buscar item:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/inventory - Criar item
router.post('/', async (req: Request, res: Response) => {
    try {
        const item = await inventoryService.createItem(req.body);
        res.status(201).json(item);
    } catch (error: any) {
        console.error('Erro ao criar item:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/inventory/:id - Atualizar item
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const item = await inventoryService.updateItem(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        res.json(item);
    } catch (error: any) {
        console.error('Erro ao atualizar item:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/inventory/:id - Deletar item
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deleted = await inventoryService.deleteItem(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        res.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao deletar item:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// Batches (Lotes)
// =====================

// GET /api/inventory/batches - Listar lotes
router.get('/batches/all', async (req: Request, res: Response) => {
    try {
        const itemId = req.query.itemId as string | undefined;
        const batches = await inventoryService.getBatches(itemId);
        res.json(batches);
    } catch (error: any) {
        console.error('Erro ao listar lotes:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/inventory/batches - Criar lote (entrada de estoque)
router.post('/batches', async (req: Request, res: Response) => {
    try {
        const batch = await inventoryService.createBatch(req.body);
        res.status(201).json(batch);
    } catch (error: any) {
        console.error('Erro ao criar lote:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// Movements (Movimentações)
// =====================

// GET /api/inventory/movements - Listar movimentações
router.get('/movements/all', async (req: Request, res: Response) => {
    try {
        const itemId = req.query.itemId as string | undefined;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
        const movements = await inventoryService.getMovements(itemId, limit);
        res.json(movements);
    } catch (error: any) {
        console.error('Erro ao listar movimentações:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/inventory/movements - Registrar movimentação (saída/ajuste)
router.post('/movements', async (req: Request, res: Response) => {
    try {
        const movement = await inventoryService.createMovement(req.body);
        res.status(201).json(movement);
    } catch (error: any) {
        console.error('Erro ao registrar movimentação:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/inventory/movements/prescription - Registrar saída por prescrição
router.post('/movements/prescription', async (req: Request, res: Response) => {
    try {
        const { productId, quantity, patientId, patientName, prescriptionId } = req.body;

        if (!productId || !quantity || !patientId || !patientName || !prescriptionId) {
            return res.status(400).json({
                error: 'Campos obrigatórios: productId, quantity, patientId, patientName, prescriptionId'
            });
        }

        const movement = await inventoryService.createPrescriptionMovement({
            productId,
            quantity: parseInt(quantity) || 1,
            patientId,
            patientName,
            prescriptionId,
        });

        res.status(201).json(movement);
    } catch (error: any) {
        console.error('Erro ao registrar saída por prescrição:', error);
        const status = error.message.includes('insuficiente') || error.message.includes('não encontrado') ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

// =====================
// Alerts
// =====================

// GET /api/inventory/alerts - Listar alertas
router.get('/alerts/all', async (req: Request, res: Response) => {
    try {
        const status = req.query.status as string | undefined;
        const alerts = await inventoryService.getAlerts(status);
        res.json(alerts);
    } catch (error: any) {
        console.error('Erro ao listar alertas:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/inventory/alerts/check - Verificar e gerar alertas
router.post('/alerts/check', async (req: Request, res: Response) => {
    try {
        const alerts = await inventoryService.checkAndGenerateAlerts();
        res.json({ generated: alerts.length, alerts });
    } catch (error: any) {
        console.error('Erro ao verificar alertas:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/inventory/alerts/:id/acknowledge - Marcar alerta como visto
router.post('/alerts/:id/acknowledge', async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || 'unknown';
        const alert = await inventoryService.acknowledgeAlert(req.params.id, userId);
        if (!alert) {
            return res.status(404).json({ error: 'Alerta não encontrado' });
        }
        res.json(alert);
    } catch (error: any) {
        console.error('Erro ao reconhecer alerta:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/inventory/alerts/:id/resolve - Resolver alerta
router.post('/alerts/:id/resolve', async (req: Request, res: Response) => {
    try {
        const alert = await inventoryService.resolveAlert(req.params.id);
        if (!alert) {
            return res.status(404).json({ error: 'Alerta não encontrado' });
        }
        res.json(alert);
    } catch (error: any) {
        console.error('Erro ao resolver alerta:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// Consumption Analysis
// =====================

// GET /api/inventory/consumption/summary - Resumo de consumo de todos os itens
router.get('/consumption/summary', async (req: Request, res: Response) => {
    try {
        const period = req.query.period ? parseInt(req.query.period as string) : 30;
        const summary = await inventoryService.getConsumptionSummary(period);
        res.json(summary);
    } catch (error: any) {
        console.error('Erro ao buscar resumo de consumo:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/inventory/consumption/:id - Análise de consumo de um item
router.get('/consumption/:id', async (req: Request, res: Response) => {
    try {
        const period = req.query.period ? parseInt(req.query.period as string) : 30;
        const analysis = await inventoryService.analyzeConsumption(req.params.id, period);
        if (!analysis) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        res.json(analysis);
    } catch (error: any) {
        console.error('Erro ao analisar consumo:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
