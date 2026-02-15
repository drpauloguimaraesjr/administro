// backend/src/routes/partners.routes.ts

import { Router, Request, Response } from 'express';
import * as partnersService from '../services/partners.service.js';

const router = Router();

// =====================
// Partners CRUD
// =====================

// GET /api/partners - Listar parceiros
router.get('/', async (req: Request, res: Response) => {
    try {
        const activeOnly = req.query.active === 'true';
        const partners = await partnersService.getAllPartners(activeOnly);
        res.json(partners);
    } catch (error: any) {
        console.error('Erro ao listar parceiros:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/partners/:id - Buscar parceiro por ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const partner = await partnersService.getPartnerById(req.params.id);
        if (!partner) {
            return res.status(404).json({ error: 'Parceiro não encontrado' });
        }
        res.json(partner);
    } catch (error: any) {
        console.error('Erro ao buscar parceiro:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/partners - Criar parceiro
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, type } = req.body;
        if (!name || !type) {
            return res.status(400).json({ error: 'Campos obrigatórios: name, type' });
        }

        const partner = await partnersService.createPartner(req.body);
        res.status(201).json(partner);
    } catch (error: any) {
        console.error('Erro ao criar parceiro:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/partners/:id - Atualizar parceiro
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const partner = await partnersService.updatePartner(req.params.id, req.body);
        if (!partner) {
            return res.status(404).json({ error: 'Parceiro não encontrado' });
        }
        res.json(partner);
    } catch (error: any) {
        console.error('Erro ao atualizar parceiro:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/partners/:id - Remover parceiro
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deleted = await partnersService.deletePartner(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Parceiro não encontrado' });
        }
        res.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao remover parceiro:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// Forwardings
// =====================

// GET /api/partners/forwardings/all - Listar encaminhamentos
router.get('/forwardings/all', async (req: Request, res: Response) => {
    try {
        const partnerId = req.query.partnerId as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const status = req.query.status as string | undefined;

        const forwardings = await partnersService.getForwardings({ partnerId, patientId, status });
        res.json(forwardings);
    } catch (error: any) {
        console.error('Erro ao listar encaminhamentos:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/partners/forwardings - Criar encaminhamento
router.post('/forwardings', async (req: Request, res: Response) => {
    try {
        const { partnerId, partnerName, patientId, patientName, prescriptionId, formulaName, formulaDetails } = req.body;

        if (!partnerId || !partnerName || !patientId || !patientName || !prescriptionId || !formulaName) {
            return res.status(400).json({
                error: 'Campos obrigatórios: partnerId, partnerName, patientId, patientName, prescriptionId, formulaName'
            });
        }

        const forwarding = await partnersService.createForwarding(req.body);
        res.status(201).json(forwarding);
    } catch (error: any) {
        console.error('Erro ao criar encaminhamento:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/partners/forwardings/:id/status - Atualizar status do encaminhamento
router.put('/forwardings/:id/status', async (req: Request, res: Response) => {
    try {
        const { status, sentBy, responseNotes } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Campo obrigatório: status' });
        }

        const forwarding = await partnersService.updateForwardingStatus(
            req.params.id,
            status,
            { sentBy, responseNotes }
        );

        if (!forwarding) {
            return res.status(404).json({ error: 'Encaminhamento não encontrado' });
        }

        res.json(forwarding);
    } catch (error: any) {
        console.error('Erro ao atualizar encaminhamento:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
