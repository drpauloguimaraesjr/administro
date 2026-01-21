// src/routes/patients.ts
import { Router, Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';

const router = Router();

// GET /api/patients - Listar todos (com busca opcional)
router.get('/', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const search = (req.query.search as string || '').toLowerCase();

        let query = db.collection('patients').orderBy('name');
        const snapshot = await query.get();

        let patients = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Filtro de busca client-side (Firestore não suporta LIKE)
        if (search) {
            patients = patients.filter(p =>
                (p as any).name?.toLowerCase().includes(search) ||
                (p as any).cpf?.includes(search) ||
                (p as any).phone?.includes(search)
            );
        }

        res.json(patients);
    } catch (error: any) {
        console.error('Erro ao buscar pacientes:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/patients/:id - Buscar por ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const doc = await db.collection('patients').doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }

        res.json({ id: doc.id, ...doc.data() });
    } catch (error: any) {
        console.error('Erro ao buscar paciente:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/patients - Criar paciente
router.post('/', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const now = new Date().toISOString();

        const patient = {
            ...req.body,
            createdAt: now,
            updatedAt: now
        };

        const docRef = await db.collection('patients').add(patient);
        res.status(201).json({ id: docRef.id, ...patient });
    } catch (error: any) {
        console.error('Erro ao criar paciente:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/patients/:id - Atualizar paciente
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const docRef = db.collection('patients').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }

        const updates = {
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        await docRef.update(updates);
        res.json({ id: req.params.id, ...doc.data(), ...updates });
    } catch (error: any) {
        console.error('Erro ao atualizar paciente:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/patients/:id - Remover paciente
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const docRef = db.collection('patients').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }

        await docRef.delete();
        res.json({ success: true, message: 'Paciente removido' });
    } catch (error: any) {
        console.error('Erro ao remover paciente:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
