import { Router } from 'express';
import { LeadsService } from '../services/leads.service.js';
const router = Router();
// GET /api/leads
router.get('/', async (req, res) => {
    try {
        const leads = await LeadsService.getAll();
        res.json(leads);
    }
    catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});
// GET /api/leads/:id
router.get('/:id', async (req, res) => {
    try {
        const lead = await LeadsService.getById(req.params.id);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }
        res.json(lead);
    }
    catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({ error: 'Failed to fetch lead' });
    }
});
// POST /api/leads
router.post('/', async (req, res) => {
    try {
        const lead = await LeadsService.create(req.body);
        res.status(201).json(lead);
    }
    catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ error: 'Failed to create lead' });
    }
});
// PUT /api/leads/:id
router.put('/:id', async (req, res) => {
    try {
        const lead = await LeadsService.update(req.params.id, req.body);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }
        res.json(lead);
    }
    catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ error: 'Failed to update lead' });
    }
});
// DELETE /api/leads/:id
router.delete('/:id', async (req, res) => {
    try {
        await LeadsService.delete(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ error: 'Failed to delete lead' });
    }
});
// PATCH /api/leads/:id/stage
router.patch('/:id/stage', async (req, res) => {
    try {
        const { stage } = req.body;
        if (!stage) {
            return res.status(400).json({ error: 'Stage is required' });
        }
        // TODO: Obter userId da sessão/token real
        await LeadsService.updateStage(req.params.id, stage, 'system');
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error('Error updating stage:', error);
        res.status(500).json({ error: 'Failed to update stage' });
    }
});
export default router;
//# sourceMappingURL=leads.js.map