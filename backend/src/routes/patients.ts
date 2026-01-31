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
            // Grade distribution
            gradeAAA: patients.filter((p: any) => p.grade === 'AAA' || (p.score || 0) >= 80).length,
            gradeAA: patients.filter((p: any) => p.grade === 'AA' || ((p.score || 0) >= 60 && (p.score || 0) < 80)).length,
            gradeA: patients.filter((p: any) => p.grade === 'A' || ((p.score || 0) >= 40 && (p.score || 0) < 60)).length,
            gradeB: patients.filter((p: any) => p.grade === 'B' || ((p.score || 0) >= 20 && (p.score || 0) < 40)).length,
            gradeC: patients.filter((p: any) => p.grade === 'C' || (p.score || 0) < 20).length,
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

// PUT /api/patients/:id/score - Atualizar score do paciente
router.put('/:id/score', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const { score, grade } = req.body;

        // Validate score range
        const validScore = Math.max(0, Math.min(100, score || 0));

        // Calculate grade from score if not provided
        let calculatedGrade = grade;
        if (!calculatedGrade) {
            if (validScore >= 80) calculatedGrade = 'AAA';
            else if (validScore >= 60) calculatedGrade = 'AA';
            else if (validScore >= 40) calculatedGrade = 'A';
            else if (validScore >= 20) calculatedGrade = 'B';
            else calculatedGrade = 'C';
        }

        await db.collection('patients')
            .doc(req.params.id)
            .update({
                score: validScore,
                grade: calculatedGrade,
                scoreUpdatedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

        res.json({ success: true, score: validScore, grade: calculatedGrade });
    } catch (error: any) {
        console.error('Erro ao atualizar score:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/patients/:id/calculate-score - Calcular score automaticamente
router.post('/:id/calculate-score', async (req: Request, res: Response) => {
    try {
        const db = getFirestore();
        const patientId = req.params.id;

        // Get patient data
        const patientDoc = await db.collection('patients').doc(patientId).get();
        if (!patientDoc.exists) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }

        const patient = patientDoc.data() as any;
        const now = new Date();
        let score = 0;

        // ============================================
        // SCORE BASEADO EM VALOR DE NEGÓCIO
        // ============================================

        // 1. TOTAL GASTO NA CLÍNICA (até 35 pontos) - PRINCIPAL
        const totalSpent = patient.totalSpent || 0;
        const spendingTiers = [
            { min: 50000, points: 35 },
            { min: 30000, points: 30 },
            { min: 20000, points: 25 },
            { min: 10000, points: 20 },
            { min: 5000, points: 15 },
            { min: 2000, points: 10 },
            { min: 1000, points: 5 },
        ];
        let spendingPoints = 0;
        for (const tier of spendingTiers) {
            if (totalSpent >= tier.min) {
                spendingPoints = tier.points;
                break;
            }
        }
        score += spendingPoints;

        // 2. TICKET MÉDIO (até 15 pontos)
        const averageTicket = patient.averageTicket || 0;
        const ticketTiers = [
            { min: 5000, points: 15 },
            { min: 3000, points: 12 },
            { min: 2000, points: 10 },
            { min: 1000, points: 7 },
            { min: 500, points: 5 },
        ];
        let ticketPoints = 0;
        for (const tier of ticketTiers) {
            if (averageTicket >= tier.min) {
                ticketPoints = tier.points;
                break;
            }
        }
        score += ticketPoints;

        // 3. MEMBROS DA FAMÍLIA NA CLÍNICA (até 20 pontos)
        const familyMembersCount = patient.familyMembersCount || 0;
        const familyPoints = Math.min(familyMembersCount * 5, 20);
        score += familyPoints;

        // 4. INDICAÇÕES (até 15 pontos)
        const referralsCount = patient.referralsCount || 0;
        const referralPoints = Math.min(referralsCount * 3, 15);
        score += referralPoints;

        // 5. TEMPO COMO PACIENTE (até 15 pontos)
        let loyaltyPoints = 0;
        if (patient.createdAt) {
            const createdDate = new Date(patient.createdAt);
            const yearsAsPatient = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
            loyaltyPoints = Math.min(Math.floor(yearsAsPatient) * 3, 15);
        }
        score += loyaltyPoints;

        // Ensure score is between 0 and 100
        score = Math.max(0, Math.min(100, Math.round(score)));

        // Calculate grade
        let grade: string;
        if (score >= 80) grade = 'AAA';
        else if (score >= 60) grade = 'AA';
        else if (score >= 40) grade = 'A';
        else if (score >= 20) grade = 'B';
        else grade = 'C';

        // Update patient
        await db.collection('patients').doc(patientId).update({
            score,
            grade,
            scoreUpdatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        res.json({
            success: true,
            score,
            grade,
            breakdown: {
                totalSpent: { value: totalSpent, points: spendingPoints, maxPoints: 35 },
                averageTicket: { value: averageTicket, points: ticketPoints, maxPoints: 15 },
                familyMembers: { count: familyMembersCount, points: familyPoints, maxPoints: 20 },
                referrals: { count: referralsCount, points: referralPoints, maxPoints: 15 },
                loyalty: { years: loyaltyPoints / 3, points: loyaltyPoints, maxPoints: 15 },
            }
        });
    } catch (error: any) {
        console.error('Erro ao calcular score:', error);
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
            score: 30, // Score inicial para novos pacientes
            grade: 'B', // Grade inicial
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
