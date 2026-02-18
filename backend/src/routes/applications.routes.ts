// backend/src/routes/applications.routes.ts

import { Router, Request, Response } from 'express';
import * as appService from '../services/applications.service.js';
import type { ApplicationStatus } from '../types/applications.types.js';

const router = Router();

// =====================
// Dashboard & Summaries
// =====================

// GET /api/applications/summary
router.get('/summary', async (req: Request, res: Response) => {
    try {
        const summary = await appService.getDashboardSummary();
        res.json(summary);
    } catch (error: any) {
        console.error('Erro ao buscar resumo de aplicações:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/applications/products - Visão por produto
router.get('/products', async (req: Request, res: Response) => {
    try {
        const products = await appService.getProductSummary();
        res.json(products);
    } catch (error: any) {
        console.error('Erro ao buscar resumo por produto:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/applications/patient/:patientId - Timeline do paciente
router.get('/patient/:patientId', async (req: Request, res: Response) => {
    try {
        const timeline = await appService.getPatientTimeline(req.params.patientId);
        res.json(timeline);
    } catch (error: any) {
        console.error('Erro ao buscar timeline do paciente:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// List & Fetch
// =====================

// GET /api/applications - Listar pedidos (filtros opcionais)
router.get('/', async (req: Request, res: Response) => {
    try {
        const status = req.query.status as ApplicationStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const date = req.query.date as string | undefined;

        const orders = await appService.getAllOrders({ status, patientId, date });
        res.json(orders);
    } catch (error: any) {
        console.error('Erro ao listar aplicações:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/applications/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const order = await appService.getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Aplicação não encontrada' });
        }
        res.json(order);
    } catch (error: any) {
        console.error('Erro ao buscar aplicação:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// Create
// =====================

// POST /api/applications
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            prescriptionId,
            patientId,
            patientName,
            productName,
            productDetails,
            quantity,
            unit,
            route: administrationRoute,
            priority,
            scheduledFor,
            prescribedBy,
        } = req.body;

        if (!patientId || !patientName || !productName) {
            return res.status(400).json({
                error: 'Campos obrigatórios: patientId, patientName, productName'
            });
        }

        if (!quantity || !unit || !administrationRoute) {
            return res.status(400).json({
                error: 'Campos obrigatórios: quantity, unit, route'
            });
        }

        if (!prescribedBy) {
            return res.status(400).json({
                error: 'Campo obrigatório: prescribedBy'
            });
        }

        const order = await appService.createOrder({
            prescriptionId,
            patientId,
            patientName,
            productName,
            productDetails,
            quantity: parseInt(quantity) || 1,
            unit,
            route: administrationRoute,
            priority: priority || 'routine',
            scheduledFor,
            prescribedBy,
        });

        res.status(201).json(order);
    } catch (error: any) {
        console.error('Erro ao criar aplicação:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// Status Transitions
// =====================

// PUT /api/applications/:id/purchase - Confirmar compra
router.put('/:id/purchase', async (req: Request, res: Response) => {
    try {
        const { confirmedBy, batchNumber, batchExpiration, manufacturer, notes } = req.body;

        if (!confirmedBy) {
            return res.status(400).json({ error: 'Campo obrigatório: confirmedBy' });
        }

        const order = await appService.confirmPurchase(req.params.id, {
            confirmedBy,
            batchNumber,
            batchExpiration,
            manufacturer,
            notes,
        });

        if (!order) {
            return res.status(404).json({ error: 'Aplicação não encontrada' });
        }

        res.json(order);
    } catch (error: any) {
        console.error('Erro ao confirmar compra:', error);
        const status = error.message.includes('inválida') ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

// PUT /api/applications/:id/schedule - Agendar aplicação
router.put('/:id/schedule', async (req: Request, res: Response) => {
    try {
        const { scheduledFor, scheduledBy } = req.body;

        if (!scheduledFor || !scheduledBy) {
            return res.status(400).json({
                error: 'Campos obrigatórios: scheduledFor, scheduledBy'
            });
        }

        const order = await appService.scheduleApplication(
            req.params.id,
            scheduledFor,
            scheduledBy
        );

        if (!order) {
            return res.status(404).json({ error: 'Aplicação não encontrada' });
        }

        res.json(order);
    } catch (error: any) {
        console.error('Erro ao agendar aplicação:', error);
        const status = error.message.includes('inválida') ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

// PUT /api/applications/:id/administer - Registrar aplicação (compliance)
router.put('/:id/administer', async (req: Request, res: Response) => {
    try {
        const { administeredBy, applicationSite, notes } = req.body;

        if (!administeredBy) {
            return res.status(400).json({ error: 'Campo obrigatório: administeredBy' });
        }

        const order = await appService.registerApplication(req.params.id, {
            administeredBy,
            applicationSite,
            notes,
        });

        if (!order) {
            return res.status(404).json({ error: 'Aplicação não encontrada' });
        }

        res.json(order);
    } catch (error: any) {
        console.error('Erro ao registrar aplicação:', error);
        const status = error.message.includes('inválida') ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

// PUT /api/applications/:id/cancel - Cancelar
router.put('/:id/cancel', async (req: Request, res: Response) => {
    try {
        const { cancelledBy, reason } = req.body;

        if (!cancelledBy) {
            return res.status(400).json({ error: 'Campo obrigatório: cancelledBy' });
        }

        const order = await appService.cancelOrder(req.params.id, cancelledBy, reason);

        if (!order) {
            return res.status(404).json({ error: 'Aplicação não encontrada' });
        }

        res.json(order);
    } catch (error: any) {
        console.error('Erro ao cancelar aplicação:', error);
        const status = error.message.includes('inválida') ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

export default router;
