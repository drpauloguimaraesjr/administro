
import { Router } from 'express';
import { LeadsService } from '../services/leads.service.js';

const router = Router();

// GET /api/leads
router.get('/', async (req, res) => {
    try {
        const leads = await LeadsService.getAll();
        res.json(leads);
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

// POST /api/leads/seed - Criar leads de teste
router.post('/seed', async (req, res) => {
    try {
        const LEADS_SEED = [
            // LEAD FRIO
            { name: 'Maria Aparecida Silva', phone: '46999001001', source: 'whatsapp', stage: 'lead_frio', urgency: 'low', interest: 'Quer saber sobre preços', assignedTo: null, tags: ['novo'] },
            { name: 'João Carlos Pereira', phone: '46999002002', source: 'instagram', stage: 'lead_frio', urgency: 'medium', interest: 'Procedimentos estéticos', assignedTo: 'helenita', tags: ['estética'] },
            { name: 'Ana Paula Costa', phone: '46999003003', source: 'indication', stage: 'lead_frio', urgency: 'low', interest: 'Indicação', assignedTo: null, tags: ['indicação'] },

            // MARCAÇÃO DE CONSULTA
            { name: 'Roberto Fernandes', phone: '46999004004', source: 'whatsapp', stage: 'marcacao_consulta', urgency: 'high', interest: 'Consulta urgente', assignedTo: 'sandra', tags: ['urgente'] },
            { name: 'Claudia Oliveira', phone: '46999005005', source: 'phone', stage: 'marcacao_consulta', urgency: 'medium', interest: 'Retorno', assignedTo: 'iraciele', tags: ['retorno'] },

            // CONFIRMAÇÃO CONSULTA
            { name: 'Fernando Lima', phone: '46999006006', source: 'whatsapp', stage: 'confirmacao_consulta', urgency: 'medium', interest: 'Consulta amanhã 14h', assignedTo: 'edilene', tags: ['consulta'] },
            { name: 'Patricia Santos', phone: '46999007007', source: 'instagram', stage: 'confirmacao_consulta', urgency: 'low', interest: 'Consulta sexta 10h', assignedTo: 'helenita', tags: ['consulta'] },
            { name: 'Marcos Rodrigues', phone: '46999008008', source: 'website', stage: 'confirmacao_consulta', urgency: 'medium', interest: 'Primeira consulta', assignedTo: 'jeniffer', tags: ['primeira-consulta'] },

            // CONFIRMAÇÃO PROCEDIMENTO
            { name: 'Luciana Almeida', phone: '46999009009', source: 'whatsapp', stage: 'confirmacao_procedimento', urgency: 'high', interest: 'Procedimento segunda - jejum', assignedTo: 'sandra', estimatedValue: 1500, tags: ['procedimento'] },
            { name: 'Carlos Eduardo', phone: '46999010010', source: 'phone', stage: 'confirmacao_procedimento', urgency: 'medium', interest: 'Cirurgia quarta 14h', assignedTo: 'iraciele', estimatedValue: 3000, tags: ['cirurgia'] },

            // DÚVIDAS E INTERCORRÊNCIAS
            { name: 'Adriana Martins', phone: '46999011011', source: 'whatsapp', stage: 'duvidas_intercorrencias', urgency: 'high', interest: 'Pós-procedimento - inchaço', assignedTo: 'helenita', tags: ['pós-op', 'urgente'] },
            { name: 'Ricardo Souza', phone: '46999012012', source: 'whatsapp', stage: 'duvidas_intercorrencias', urgency: 'medium', interest: 'Dúvida medicação', assignedTo: 'edilene', tags: ['medicação'] },

            // DR. PAULO
            { name: 'Caso Complexo - Sra. Helena', phone: '46999013013', source: 'whatsapp', stage: 'dr_paulo', urgency: 'high', interest: 'Helenita precisa orientação', assignedTo: null, tags: ['chamado-interno'] },
            { name: 'Autorização - Sr. Antônio', phone: '46999014014', source: 'phone', stage: 'dr_paulo', urgency: 'medium', interest: 'Sandra solicita desconto', assignedTo: null, tags: ['financeiro'] },
        ];

        const created: any[] = [];
        for (const leadData of LEADS_SEED) {
            const lead = await LeadsService.create({
                ...leadData,
                score: Math.floor(Math.random() * 50) + 30,
            } as any);
            created.push(lead);
        }

        res.status(201).json({
            message: `${created.length} leads de teste criados!`,
            leads: created
        });
    } catch (error) {
        console.error('Error seeding leads:', error);
        res.status(500).json({ error: 'Failed to seed leads' });
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
    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({ error: 'Failed to fetch lead' });
    }
});

// POST /api/leads
router.post('/', async (req, res) => {
    try {
        const lead = await LeadsService.create(req.body);
        res.status(201).json(lead);
    } catch (error) {
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
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

// DELETE /api/leads/:id
router.delete('/:id', async (req, res) => {
    try {
        await LeadsService.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
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
    } catch (error) {
        console.error('Error updating stage:', error);
        res.status(500).json({ error: 'Failed to update stage' });
    }
});

// PATCH /api/leads/:id/assign - Atribuir lead a membro da equipe
router.patch('/:id/assign', async (req, res) => {
    try {
        const { assignedTo } = req.body;
        // assignedTo pode ser null (remover atribuição) ou string (ID do membro)
        await LeadsService.assignTo(req.params.id, assignedTo);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error assigning lead:', error);
        res.status(500).json({ error: 'Failed to assign lead' });
    }
});

export default router;
