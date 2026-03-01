// src/routes/medicalRecords.ts
import { Router, Request, Response } from 'express';
import { db } from '../config/firebaseAdmin.js';

const getDb = () => {
    if (!db) throw new Error('Firebase not configured');
    return db;
};

const router = Router();

// ============ ANAMNESIS ============

// GET /api/medical-records/:patientId/anamnesis
router.get('/:patientId/anamnesis', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const doc = await getDb().collection('medical_records')
            .doc(req.params.patientId)
            .collection('anamnesis')
            .doc('main')
            .get();

        if (!doc.exists) {
            return res.json(null);
        }

        res.json({ id: doc.id, ...doc.data() });
    } catch (error: any) {
        console.error('Erro ao buscar anamnese:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST/PUT /api/medical-records/:patientId/anamnesis
router.post('/:patientId/anamnesis', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const now = new Date().toISOString();

        const anamnesis = {
            ...req.body,
            patientId: req.params.patientId,
            updatedAt: now,
            createdAt: req.body.createdAt || now,
        };

        await getDb().collection('medical_records')
            .doc(req.params.patientId)
            .collection('anamnesis')
            .doc('main')
            .set(anamnesis, { merge: true });

        res.json(anamnesis);
    } catch (error: any) {
        console.error('Erro ao salvar anamnese:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ EVOLUTIONS ============

// GET /api/medical-records/:patientId/evolutions
router.get('/:patientId/evolutions', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const snapshot = await getDb().collection('medical_records')
            .doc(req.params.patientId)
            .collection('evolutions')
            .orderBy('date', 'desc')
            .get();

        const evolutions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(evolutions);
    } catch (error: any) {
        console.error('Erro ao buscar evoluções:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/medical-records/:patientId/evolutions
router.post('/:patientId/evolutions', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const now = new Date().toISOString();

        const evolution = {
            ...req.body,
            patientId: req.params.patientId,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await getDb().collection('medical_records')
            .doc(req.params.patientId)
            .collection('evolutions')
            .add(evolution);

        res.status(201).json({ id: docRef.id, ...evolution });
    } catch (error: any) {
        console.error('Erro ao criar evolução:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/medical-records/:patientId/evolutions/:id
router.put('/:patientId/evolutions/:id', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const docRef = getDb().collection('medical_records')
            .doc(req.params.patientId)
            .collection('evolutions')
            .doc(req.params.id);

        const updates = {
            ...req.body,
            updatedAt: new Date().toISOString(),
        };

        await docRef.update(updates);
        res.json({ id: req.params.id, ...updates });
    } catch (error: any) {
        console.error('Erro ao atualizar evolução:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/medical-records/:patientId/evolutions/:id
router.delete('/:patientId/evolutions/:id', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        await getDb().collection('medical_records')
            .doc(req.params.patientId)
            .collection('evolutions')
            .doc(req.params.id)
            .delete();

        res.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao remover evolução:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ PRESCRIPTIONS ============

// GET /api/medical-records/:patientId/prescriptions
router.get('/:patientId/prescriptions', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const snapshot = await getDb().collection('medical_records')
            .doc(req.params.patientId)
            .collection('prescriptions')
            .orderBy('date', 'desc')
            .get();

        const prescriptions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(prescriptions);
    } catch (error: any) {
        console.error('Erro ao buscar prescrições:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/medical-records/:patientId/prescriptions
router.post('/:patientId/prescriptions', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const now = new Date().toISOString();

        const prescription = {
            ...req.body,
            patientId: req.params.patientId,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await getDb().collection('medical_records')
            .doc(req.params.patientId)
            .collection('prescriptions')
            .add(prescription);

        res.status(201).json({ id: docRef.id, ...prescription });
    } catch (error: any) {
        console.error('Erro ao criar prescrição:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/medical-records/:patientId/prescriptions/:id (for auto-save)
router.put('/:patientId/prescriptions/:id', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const docRef = getDb().collection('medical_records')
            .doc(req.params.patientId)
            .collection('prescriptions')
            .doc(req.params.id);

        const updates = {
            ...req.body,
            updatedAt: new Date().toISOString(),
        };

        await docRef.update(updates);
        res.json({ id: req.params.id, ...updates });
    } catch (error: any) {
        console.error('Erro ao atualizar prescrição:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/medical-records/:patientId/prescriptions/:id
router.delete('/:patientId/prescriptions/:id', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        await getDb().collection('medical_records')
            .doc(req.params.patientId)
            .collection('prescriptions')
            .doc(req.params.id)
            .delete();

        res.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao remover prescrição:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/medical-records/prescriptions/generate-title (AI-powered title generation)
router.post('/prescriptions/generate-title', async (req: Request, res: Response) => {
    try {
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.json({ title: 'Nova Receita' });
        }

        // Strip HTML tags to get plain text
        const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

        if (plainText.length < 10) {
            return res.json({ title: 'Nova Receita' });
        }

        // Try to use OpenAI/Claude API if configured
        const openaiKey = process.env.OPENAI_API_KEY;
        const anthropicKey = process.env.ANTHROPIC_API_KEY;

        if (anthropicKey) {
            // Use Claude
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': anthropicKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 50,
                    messages: [{
                        role: 'user',
                        content: `Gere um título curto (máximo 5 palavras) para esta receita médica. Retorne APENAS o título, sem explicações:\n\n${plainText.substring(0, 500)}`
                    }]
                })
            });

            const data = await response.json();
            const title = data.content?.[0]?.text?.trim() || extractKeywords(plainText);
            return res.json({ title });
        } else if (openaiKey) {
            // Use OpenAI
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    max_tokens: 50,
                    messages: [{
                        role: 'user',
                        content: `Gere um título curto (máximo 5 palavras) para esta receita médica. Retorne APENAS o título, sem explicações:\n\n${plainText.substring(0, 500)}`
                    }]
                })
            });

            const data = await response.json();
            const title = data.choices?.[0]?.message?.content?.trim() || extractKeywords(plainText);
            return res.json({ title });
        } else {
            // Fallback: extract keywords manually
            const title = extractKeywords(plainText);
            return res.json({ title });
        }
    } catch (error: any) {
        console.error('Erro ao gerar título:', error);
        // Fallback to keyword extraction
        const plainText = (req.body.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return res.json({ title: extractKeywords(plainText) });
    }
});

// Helper function to extract keywords from prescription text
function extractKeywords(text: string): string {
    // Common medication patterns
    const medicationPatterns = [
        /vitamina\s*[a-z0-9]+/gi,
        /[a-záéíóú]+\s*\d+\s*mg/gi,
        /[a-záéíóú]+\s*\d+\s*mcg/gi,
        /[a-záéíóú]+\s*\d+\s*ml/gi,
        /dipirona|paracetamol|ibuprofeno|omeprazol|losartana|metformina|atenolol|amoxicilina|azitromicina|prednisona|dexametasona|celestone|decadron/gi,
    ];

    const matches: string[] = [];
    for (const pattern of medicationPatterns) {
        const found = text.match(pattern);
        if (found) {
            matches.push(...found.map(m => m.trim()));
        }
    }

    if (matches.length > 0) {
        // Return up to 3 unique medications
        const unique = [...new Set(matches.map(m => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()))];
        return unique.slice(0, 3).join(' + ') || 'Receita Médica';
    }

    // Fallback: check for usage type
    if (/uso injet[aá]vel/i.test(text)) return 'Medicação Injetável';
    if (/uso oral/i.test(text)) return 'Medicação Oral';
    if (/uso t[oó]pico/i.test(text)) return 'Medicação Tópica';

    return 'Receita Médica';
}

// ============ DOCUMENTS ============

// GET /api/medical-records/:patientId/documents
router.get('/:patientId/documents', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const snapshot = await getDb().collection('medical_records')
            .doc(req.params.patientId)
            .collection('documents')
            .orderBy('uploadedAt', 'desc')
            .get();

        const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(documents);
    } catch (error: any) {
        console.error('Erro ao buscar documentos:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/medical-records/:patientId/documents (metadata only, URL from client)
router.post('/:patientId/documents', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const now = new Date().toISOString();

        const document = {
            name: req.body.name,
            type: req.body.type || 'document',
            url: req.body.url,
            patientId: req.params.patientId,
            uploadedAt: now,
        };

        const docRef = await getDb().collection('medical_records')
            .doc(req.params.patientId)
            .collection('documents')
            .add(document);

        res.status(201).json({ id: docRef.id, ...document });
    } catch (error: any) {
        console.error('Erro ao criar documento:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/medical-records/:patientId/documents/:id
router.delete('/:patientId/documents/:id', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        await getDb().collection('medical_records')
            .doc(req.params.patientId)
            .collection('documents')
            .doc(req.params.id)
            .delete();

        res.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao remover documento:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ PRESCRIPTION TEMPLATES (Favorites) ============

// GET /api/medical-records/templates - Get all templates (global, not patient-specific)
router.get('/templates', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const snapshot = await getDb().collection('prescription_templates')
            .orderBy('usageCount', 'desc')
            .get();

        const templates = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(templates);
    } catch (error: any) {
        console.error('Erro ao buscar templates:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/medical-records/templates - Create a new template
router.post('/templates', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const now = new Date().toISOString();

        const template = {
            name: req.body.name,
            content: req.body.content,
            type: req.body.type || 'simples',
            category: req.body.category || 'geral',
            tags: req.body.tags || [],
            isFavorite: req.body.isFavorite || false,
            usageCount: 0,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await getDb().collection('prescription_templates').add(template);

        res.status(201).json({ id: docRef.id, ...template });
    } catch (error: any) {
        console.error('Erro ao criar template:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/medical-records/templates/:id - Update a template
router.put('/templates/:id', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const docRef = getDb().collection('prescription_templates').doc(req.params.id);

        const updates = {
            ...req.body,
            updatedAt: new Date().toISOString(),
        };

        await docRef.update(updates);
        res.json({ id: req.params.id, ...updates });
    } catch (error: any) {
        console.error('Erro ao atualizar template:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/medical-records/templates/:id/use - Increment usage count
router.put('/templates/:id/use', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const docRef = getDb().collection('prescription_templates').doc(req.params.id);

        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Template não encontrado' });
        }

        const currentCount = doc.data()?.usageCount || 0;
        await docRef.update({
            usageCount: currentCount + 1,
            lastUsedAt: new Date().toISOString()
        });

        res.json({ success: true, usageCount: currentCount + 1 });
    } catch (error: any) {
        console.error('Erro ao incrementar uso:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/medical-records/templates/:id/favorite - Toggle favorite status
router.put('/templates/:id/favorite', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const docRef = getDb().collection('prescription_templates').doc(req.params.id);

        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Template não encontrado' });
        }

        const isFavorite = !doc.data()?.isFavorite;
        await docRef.update({ isFavorite });

        res.json({ success: true, isFavorite });
    } catch (error: any) {
        console.error('Erro ao favoritar template:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/medical-records/templates/:id - Delete a template
router.delete('/templates/:id', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        await getDb().collection('prescription_templates').doc(req.params.id).delete();

        res.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao remover template:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;

