// src/routes/patients.ts
import { Router, Request, Response } from 'express';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const router = Router();

// GET /api/patients - Listar todos (com busca opcional e filtros)
router.get('/', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const search = (req.query.search as string || '').toLowerCase();
        const tag = req.query.tag as string;
        const status = req.query.status as string;

        let query = db.collection('patients').orderBy('name');
        const snapshot = await query.get();

        let patients = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Filter by search
        if (search) {
            patients = patients.filter(p =>
                (p as any).name?.toLowerCase().includes(search) ||
                (p as any).cpf?.includes(search) ||
                (p as any).phone?.includes(search)
            );
        }

        // Filter by tag
        if (tag) {
            patients = patients.filter(p =>
                (p as any).tags?.includes(tag)
            );
        }

        // Filter by status
        if (status) {
            patients = patients.filter(p =>
                (p as any).status === status
            );
        }

        res.json(patients);
    } catch (error: any) {
        console.error('Erro ao buscar pacientes:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/patients/birthdays - Aniversariantes do mês
router.get('/birthdays', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;

        const snapshot = await db.collection('patients').get();

        const birthdays = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((p: any) => {
                if (!p.birthDate) return false;
                const birthMonth = new Date(p.birthDate).getMonth() + 1;
                return birthMonth === month;
            })
            .sort((a: any, b: any) => {
                const dayA = new Date(a.birthDate).getDate();
                const dayB = new Date(b.birthDate).getDate();
                return dayA - dayB;
            });

        res.json(birthdays);
    } catch (error: any) {
        console.error('Erro ao buscar aniversariantes:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/patients/inactive - Pacientes inativos (sem consulta há X dias)
router.get('/inactive', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const days = parseInt(req.query.days as string) || 90; // Default 90 dias
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const snapshot = await db.collection('patients').get();

        const inactive = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((p: any) => {
                if (!p.lastVisit && !p.lastAppointment) {
                    // Nunca teve consulta, considerar pela data de criação
                    const created = new Date(p.createdAt || '2000-01-01');
                    return created < cutoffDate;
                }
                const lastVisit = new Date(p.lastVisit || p.lastAppointment || '2000-01-01');
                return lastVisit < cutoffDate;
            })
            .sort((a: any, b: any) => {
                const dateA = new Date(a.lastVisit || a.lastAppointment || a.createdAt || '2000-01-01');
                const dateB = new Date(b.lastVisit || b.lastAppointment || b.createdAt || '2000-01-01');
                return dateA.getTime() - dateB.getTime();
            });

        res.json(inactive);
    } catch (error: any) {
        console.error('Erro ao buscar pacientes inativos:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/patients/stats - Estatísticas gerais
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const snapshot = await db.collection('patients').get();

        const patients = snapshot.docs.map(doc => doc.data());
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const stats = {
            total: patients.length,
            vip: patients.filter((p: any) => p.tags?.includes('VIP')).length,
            new: patients.filter((p: any) => p.tags?.includes('Novo')).length,
            recurring: patients.filter((p: any) => p.tags?.includes('Recorrente')).length,
            birthdaysThisMonth: patients.filter((p: any) => {
                if (!p.birthDate) return false;
                return new Date(p.birthDate).getMonth() + 1 === currentMonth;
            }).length,
            newLast30Days: patients.filter((p: any) => {
                if (!p.createdAt) return false;
                return new Date(p.createdAt) > thirtyDaysAgo;
            }).length,
            inactive90Days: patients.filter((p: any) => {
                const lastVisit = new Date(p.lastVisit || p.lastAppointment || p.createdAt || '2000-01-01');
                return lastVisit < ninetyDaysAgo;
            }).length,
        };

        res.json(stats);
    } catch (error: any) {
        console.error('Erro ao buscar estatísticas:', error);
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

// GET /api/patients/:id/timeline - Timeline completa do paciente
router.get('/:id/timeline', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const patientId = req.params.id;
        const timeline: any[] = [];

        // Get patient info
        const patientDoc = await db.collection('patients').doc(patientId).get();
        if (!patientDoc.exists) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }

        // Add creation event
        const patientData = patientDoc.data();
        timeline.push({
            type: 'patient_created',
            title: 'Paciente cadastrado',
            date: patientData?.createdAt,
            icon: 'user-plus'
        });

        // Get prescriptions
        const prescriptionsSnap = await db.collection('medical_records')
            .doc(patientId)
            .collection('prescriptions')
            .orderBy('createdAt', 'desc')
            .get();

        prescriptionsSnap.docs.forEach(doc => {
            const data = doc.data();
            timeline.push({
                type: 'prescription',
                title: data.title || 'Receita',
                date: data.createdAt,
                icon: 'file-text',
                id: doc.id
            });
        });

        // Get notes
        const notesSnap = await db.collection('patients')
            .doc(patientId)
            .collection('notes')
            .orderBy('createdAt', 'desc')
            .get();

        notesSnap.docs.forEach(doc => {
            const data = doc.data();
            timeline.push({
                type: 'note',
                title: 'Observação',
                content: data.content,
                date: data.createdAt,
                icon: 'sticky-note',
                id: doc.id
            });
        });

        // Get anamnesis
        const anamnesisDoc = await db.collection('medical_records')
            .doc(patientId)
            .collection('anamnesis')
            .doc('main')
            .get();

        if (anamnesisDoc.exists) {
            const data = anamnesisDoc.data();
            timeline.push({
                type: 'anamnesis',
                title: 'Anamnese registrada',
                date: data?.createdAt || data?.updatedAt,
                icon: 'clipboard-list'
            });
        }

        // Sort by date descending
        timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.json(timeline);
    } catch (error: any) {
        console.error('Erro ao buscar timeline:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/patients/:id/notes - Listar notas do paciente
router.get('/:id/notes', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const snapshot = await db.collection('patients')
            .doc(req.params.id)
            .collection('notes')
            .orderBy('createdAt', 'desc')
            .get();

        const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(notes);
    } catch (error: any) {
        console.error('Erro ao buscar notas:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/patients/:id/notes - Adicionar nota
router.post('/:id/notes', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const now = new Date().toISOString();

        const note = {
            content: req.body.content,
            type: req.body.type || 'general', // general, alert, follow-up
            createdAt: now,
            createdBy: req.body.createdBy || 'system'
        };

        const docRef = await db.collection('patients')
            .doc(req.params.id)
            .collection('notes')
            .add(note);

        res.status(201).json({ id: docRef.id, ...note });
    } catch (error: any) {
        console.error('Erro ao criar nota:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/patients/:id/notes/:noteId - Remover nota
router.delete('/:id/notes/:noteId', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        await db.collection('patients')
            .doc(req.params.id)
            .collection('notes')
            .doc(req.params.noteId)
            .delete();

        res.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao remover nota:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/patients/:id/tags - Atualizar tags do paciente
router.put('/:id/tags', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const { tags } = req.body;

        await db.collection('patients')
            .doc(req.params.id)
            .update({
                tags,
                updatedAt: new Date().toISOString()
            });

        res.json({ success: true, tags });
    } catch (error: any) {
        console.error('Erro ao atualizar tags:', error);
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
            tags: req.body.tags || ['Novo'],
            status: 'active',
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
