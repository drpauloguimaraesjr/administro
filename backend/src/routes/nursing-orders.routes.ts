// backend/src/routes/nursing-orders.routes.ts

import { Router, Request, Response } from 'express';
import * as nursingService from '../services/nursing-orders.service.js';
import type { NursingOrderStatus } from '../types/nursing-orders.types.js';
import admin from 'firebase-admin';

const router = Router();
const db = admin.firestore();

// =====================
// List & Fetch
// =====================

// GET /api/nursing-orders - Listar pedidos (com filtros opcionais)
router.get('/', async (req: Request, res: Response) => {
    try {
        const status = req.query.status as NursingOrderStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const date = req.query.date as string | undefined;

        const orders = await nursingService.getAllOrders({ status, patientId, date });
        res.json(orders);
    } catch (error: any) {
        console.error('Erro ao listar pedidos de enfermagem:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/nursing-orders/today - Pedidos de hoje (painel enfermagem)
router.get('/today', async (req: Request, res: Response) => {
    try {
        const orders = await nursingService.getTodayOrders();
        res.json(orders);
    } catch (error: any) {
        console.error('Erro ao buscar pedidos de hoje:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/nursing-orders/summary - Resumo do dia
router.get('/summary', async (req: Request, res: Response) => {
    try {
        const summary = await nursingService.getSummary();
        res.json(summary);
    } catch (error: any) {
        console.error('Erro ao buscar resumo de enfermagem:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/nursing-orders/:id - Buscar pedido por ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const order = await nursingService.getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        res.json(order);
    } catch (error: any) {
        console.error('Erro ao buscar pedido:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// Internal Emission
// =====================

// POST /api/nursing-orders/internal-emission — Marca a receita como emitida internamente
router.post('/internal-emission', async (req: Request, res: Response) => {
    try {
        const {
            prescriptionId,
            patientId,
            patientName,
            prescriptionType,
            injectables,
            nursingOrdersCreated,
        } = req.body;

        if (!prescriptionId || !patientId) {
            return res.status(400).json({
                error: 'Campos obrigatórios: prescriptionId, patientId',
            });
        }

        const now = new Date().toISOString();

        // Update prescription document with internal emission status
        const prescriptionRef = db
            .collection('patients')
            .doc(patientId)
            .collection('prescriptions')
            .doc(prescriptionId);

        const prescriptionDoc = await prescriptionRef.get();
        if (!prescriptionDoc.exists) {
            return res.status(404).json({ error: 'Receita não encontrada' });
        }

        await prescriptionRef.update({
            internalEmission: {
                emitted: true,
                emittedAt: now,
                emittedBy: 'Médico',
                nursing: {
                    forwarded: nursingOrdersCreated > 0,
                    orderCount: nursingOrdersCreated || 0,
                    injectables: injectables || [],
                },
                pharmacy: {
                    forwarded: false, // Will be built later
                    status: 'pending',
                },
            },
            status: 'finalized',
            updatedAt: now,
        });

        console.log(`✅ Emissão interna: Receita ${prescriptionId} para paciente ${patientName}`);

        res.json({
            success: true,
            message: 'Receita emitida internamente',
            prescriptionId,
            patientId,
            timestamp: now,
            nursing: {
                forwarded: nursingOrdersCreated > 0,
                orderCount: nursingOrdersCreated || 0,
            },
        });
    } catch (error: any) {
        console.error('❌ Erro na emissão interna:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// Create
// =====================

// POST /api/nursing-orders - Criar pedido de administração
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            prescriptionId,
            patientId,
            patientName,
            productId,
            productName,
            batchId,
            batchNumber,
            quantity,
            unit,
            route: administrationRoute,
            instructions,
            priority,
            scheduledFor,
            prescribedBy,
        } = req.body;

        // Validate required fields
        if (!prescriptionId || !patientId || !patientName || !productId || !productName) {
            return res.status(400).json({
                error: 'Campos obrigatórios: prescriptionId, patientId, patientName, productId, productName'
            });
        }

        if (!quantity || !unit || !administrationRoute) {
            return res.status(400).json({
                error: 'Campos obrigatórios: quantity, unit, route'
            });
        }

        const order = await nursingService.createOrder({
            prescriptionId,
            patientId,
            patientName,
            productId,
            productName,
            batchId,
            batchNumber,
            quantity: parseInt(quantity) || 1,
            unit,
            route: administrationRoute,
            instructions: instructions || '',
            priority: priority || 'routine',
            scheduledFor,
            prescribedBy: prescribedBy || 'Médico',
        });

        res.status(201).json(order);
    } catch (error: any) {
        console.error('Erro ao criar pedido de enfermagem:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// Status Updates
// =====================

// PUT /api/nursing-orders/:id/status - Atualizar status (preparar, aplicar, cancelar)
router.put('/:id/status', async (req: Request, res: Response) => {
    try {
        const { status, performedBy, notes, cancellationReason } = req.body;

        if (!status || !performedBy) {
            return res.status(400).json({
                error: 'Campos obrigatórios: status, performedBy'
            });
        }

        const validStatuses: NursingOrderStatus[] = ['pending', 'preparing', 'ready', 'administered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}`
            });
        }

        const order = await nursingService.updateOrderStatus(req.params.id, {
            status,
            performedBy,
            notes,
            cancellationReason,
        });

        if (!order) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        res.json(order);
    } catch (error: any) {
        console.error('Erro ao atualizar status do pedido:', error);
        const status = error.message.includes('inválida') ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

export default router;
