// src/routes/medicalRecords.ts
import { Router, Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';

const router = Router();

// ============ ANAMNESIS ============

// GET /api/medical-records/:patientId/anamnesis
router.get('/:patientId/anamnesis', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const doc = await db.collection('medical_records')
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
        const db = getFirestore();
        const now = new Date().toISOString();

        const anamnesis = {
            ...req.body,
            patientId: req.params.patientId,
            updatedAt: now,
            createdAt: req.body.createdAt || now,
        };

        await db.collection('medical_records')
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
        const db = getFirestore();
        const snapshot = await db.collection('medical_records')
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
        const db = getFirestore();
        const now = new Date().toISOString();

        const evolution = {
            ...req.body,
            patientId: req.params.patientId,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await db.collection('medical_records')
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
        const db = getFirestore();
        const docRef = db.collection('medical_records')
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
        const db = getFirestore();
        await db.collection('medical_records')
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
        const db = getFirestore();
        const snapshot = await db.collection('medical_records')
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
        const db = getFirestore();
        const now = new Date().toISOString();

        const prescription = {
            ...req.body,
            patientId: req.params.patientId,
            createdAt: now,
        };

        const docRef = await db.collection('medical_records')
            .doc(req.params.patientId)
            .collection('prescriptions')
            .add(prescription);

        res.status(201).json({ id: docRef.id, ...prescription });
    } catch (error: any) {
        console.error('Erro ao criar prescrição:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ DOCUMENTS ============

// GET /api/medical-records/:patientId/documents
router.get('/:patientId/documents', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const snapshot = await db.collection('medical_records')
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
        const db = getFirestore();
        const now = new Date().toISOString();

        const document = {
            name: req.body.name,
            type: req.body.type || 'document',
            url: req.body.url,
            patientId: req.params.patientId,
            uploadedAt: now,
        };

        const docRef = await db.collection('medical_records')
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
        const db = getFirestore();
        await db.collection('medical_records')
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

export default router;
