
import { Router } from 'express';
import { WhatsAppQueuesService } from '../services/whatsapp-queues.service.js';

const router = Router();

// Listar todas
router.get('/', async (req, res) => {
    try {
        const queues = await WhatsAppQueuesService.getAll();
        res.json(queues);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Seed Defaults (Rota utilitária para setup inicial)
router.post('/seed', async (req, res) => {
    try {
        await WhatsAppQueuesService.seedDefaults();
        res.json({ message: 'Filas padrão criadas' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Criar
router.post('/', async (req, res) => {
    try {
        const queue = await WhatsAppQueuesService.create(req.body);
        res.status(201).json(queue);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Atualizar
router.put('/:id', async (req, res) => {
    try {
        const queue = await WhatsAppQueuesService.update(req.params.id, req.body);
        res.json(queue);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Excluir
router.delete('/:id', async (req, res) => {
    try {
        await WhatsAppQueuesService.delete(req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


export const whatsappQueuesRouter = router;
