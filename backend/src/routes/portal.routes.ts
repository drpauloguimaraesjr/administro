/**
 * Rotas do Portal do Paciente
 * Todas protegidas pelo middleware verifyPatientToken
 * O patientId vem do token (não da URL)
 */

import { Router, Request, Response } from 'express';
import { verifyPatientToken, PortalRequest } from '../middleware/portal.middleware.js';
import { db, storage } from '../config/firebaseAdmin.js';
import multer from 'multer';

const router = Router();

// Multer para upload de arquivos (in-memory)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas PDF e imagens são permitidos'));
        }
    },
});

// Aplica middleware de autenticação em todas as rotas
router.use(verifyPatientToken);

// =====================
// Dados do Paciente
// =====================

/**
 * GET /api/portal/me — Dados básicos do paciente
 */
router.get('/me', async (req: Request, res: Response) => {
    try {
        if (!db) return res.status(503).json({ error: 'Firebase não configurado' });

        const { patientId } = req as PortalRequest;
        const doc = await db.collection('patients').doc(patientId).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }

        const data = doc.data()!;

        // Retorna apenas dados que o paciente pode ver (sem score, tags, notas)
        res.json({
            id: doc.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            cpf: data.cpf,
            birthDate: data.birthDate,
            address: data.address,
        });
    } catch (error: any) {
        console.error('Erro ao buscar dados do paciente:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// Prescrições
// =====================

/**
 * GET /api/portal/prescriptions — Lista prescrições do paciente
 */
router.get('/prescriptions', async (req: Request, res: Response) => {
    try {
        if (!db) return res.status(503).json({ error: 'Firebase não configurado' });

        const { patientId } = req as PortalRequest;

        const snapshot = await db
            .collection('medical_records')
            .doc(patientId)
            .collection('prescriptions')
            .orderBy('createdAt', 'desc')
            .get();

        const prescriptions = snapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            type: doc.data().type,
            status: doc.data().status,
            createdAt: doc.data().createdAt,
            updatedAt: doc.data().updatedAt,
        }));

        res.json(prescriptions);
    } catch (error: any) {
        console.error('Erro ao buscar prescrições:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/portal/prescriptions/:id/pdf — Download PDF de prescrição
 */
router.get('/prescriptions/:id/pdf', async (req: Request, res: Response) => {
    try {
        if (!db) return res.status(503).json({ error: 'Firebase não configurado' });

        const { patientId } = req as PortalRequest;
        const prescriptionId = req.params.id;

        // Importa serviço de PDF dinamicamente
        const { generatePrescriptionPdf } = await import('../services/prescription-pdf.service.js');

        const pdfBytes = await generatePrescriptionPdf(patientId, prescriptionId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="prescricao-${prescriptionId}.pdf"`);
        res.send(Buffer.from(pdfBytes));
    } catch (error: any) {
        console.error('Erro ao gerar PDF da prescrição:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// Aplicações (Medicamentos Injetáveis)
// =====================

/**
 * GET /api/portal/applications — Lista aplicações do paciente
 */
router.get('/applications', async (req: Request, res: Response) => {
    try {
        if (!db) return res.status(503).json({ error: 'Firebase não configurado' });

        const { patientId } = req as PortalRequest;

        const snapshot = await db
            .collection('applications')
            .where('patientId', '==', patientId)
            .orderBy('createdAt', 'desc')
            .get();

        const applications = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                productName: data.productName,
                productDetails: data.productDetails,
                quantity: data.quantity,
                unit: data.unit,
                route: data.route,
                status: data.status,
                priority: data.priority,
                scheduledFor: data.scheduledFor,
                administeredAt: data.administeredAt,
                administeredBy: data.administeredBy,
                applicationSite: data.applicationSite,
                batchNumber: data.batchNumber,
                batchExpiration: data.batchExpiration,
                manufacturer: data.manufacturer,
                administrationNotes: data.administrationNotes,
                createdAt: data.createdAt,
            };
        });

        res.json(applications);
    } catch (error: any) {
        console.error('Erro ao buscar aplicações:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// Consultas (Appointments)
// =====================

/**
 * GET /api/portal/appointments — Consultas do paciente
 */
router.get('/appointments', async (req: Request, res: Response) => {
    try {
        if (!db) return res.status(503).json({ error: 'Firebase não configurado' });

        const { patientId } = req as PortalRequest;

        const snapshot = await db
            .collection('appointments')
            .where('patientId', '==', patientId)
            .orderBy('date', 'desc')
            .get();

        const appointments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                duration: data.duration,
                type: data.type,
                status: data.status,
                notes: data.notes,
            };
        });

        res.json(appointments);
    } catch (error: any) {
        console.error('Erro ao buscar consultas:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// Documentos
// =====================

/**
 * GET /api/portal/documents — Lista documentos do paciente
 */
router.get('/documents', async (req: Request, res: Response) => {
    try {
        if (!db) return res.status(503).json({ error: 'Firebase não configurado' });

        const { patientId } = req as PortalRequest;

        const snapshot = await db
            .collection('medical_records')
            .doc(patientId)
            .collection('documents')
            .orderBy('createdAt', 'desc')
            .get();

        const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.json(documents);
    } catch (error: any) {
        console.error('Erro ao buscar documentos:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// Timeline
// =====================

/**
 * GET /api/portal/timeline — Timeline de consultas e eventos
 */
router.get('/timeline', async (req: Request, res: Response) => {
    try {
        if (!db) return res.status(503).json({ error: 'Firebase não configurado' });

        const { patientId } = req as PortalRequest;
        const timeline: any[] = [];

        // Evoluções
        const evolSnap = await db.collection('medical_records')
            .doc(patientId)
            .collection('evolutions')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        evolSnap.docs.forEach(doc => {
            const data = doc.data();
            timeline.push({
                type: 'evolution',
                title: 'Evolução Clínica',
                date: data.createdAt,
                doctor: data.doctor || data.createdBy,
            });
        });

        // Prescrições
        const prescSnap = await db.collection('medical_records')
            .doc(patientId)
            .collection('prescriptions')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        prescSnap.docs.forEach(doc => {
            const data = doc.data();
            timeline.push({
                type: 'prescription',
                title: data.title || 'Prescrição',
                date: data.createdAt,
                prescriptionType: data.type,
            });
        });

        // Aplicações
        const appSnap = await db.collection('applications')
            .where('patientId', '==', patientId)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        appSnap.docs.forEach(doc => {
            const data = doc.data();
            timeline.push({
                type: 'application',
                title: `Aplicação: ${data.productName}`,
                date: data.administeredAt || data.createdAt,
                status: data.status,
            });
        });

        // Ordena por data decrescente
        timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.json(timeline);
    } catch (error: any) {
        console.error('Erro ao buscar timeline:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================
// Exames (Upload pelo paciente)
// =====================

/**
 * GET /api/portal/exams — Lista exames enviados pelo paciente
 */
router.get('/exams', async (req: Request, res: Response) => {
    try {
        if (!db) return res.status(503).json({ error: 'Firebase não configurado' });

        const { patientId } = req as PortalRequest;

        const snapshot = await db
            .collection('patients')
            .doc(patientId)
            .collection('exams')
            .orderBy('uploadedAt', 'desc')
            .get();

        const exams = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.json(exams);
    } catch (error: any) {
        console.error('Erro ao buscar exames:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/portal/exams/upload — Upload de PDF de exame
 */
router.post('/exams/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!db || !storage) {
            return res.status(503).json({ error: 'Firebase não configurado' });
        }

        const { patientId } = req as PortalRequest;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'Arquivo não fornecido' });
        }

        const { title, description, examDate } = req.body;

        // Upload para Firebase Storage
        const bucket = storage.bucket();
        const fileName = `patient-exams/${patientId}/${Date.now()}-${file.originalname}`;
        const fileRef = bucket.file(fileName);

        await fileRef.save(file.buffer, {
            contentType: file.mimetype,
            metadata: {
                cacheControl: 'private, max-age=31536000',
                metadata: { patientId, originalName: file.originalname },
            },
        });

        // Gera URL assinada (válida por 7 dias)
        const [url] = await fileRef.getSignedUrl({
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });

        // Salva metadados no Firestore
        const examData = {
            title: title || file.originalname,
            description: description || '',
            examDate: examDate || new Date().toISOString().split('T')[0],
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            storagePath: fileName,
            downloadUrl: url,
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'patient',
        };

        const docRef = await db
            .collection('patients')
            .doc(patientId)
            .collection('exams')
            .add(examData);

        console.log(`📄 Exame enviado: ${file.originalname} → paciente ${patientId}`);

        res.status(201).json({
            id: docRef.id,
            ...examData,
        });
    } catch (error: any) {
        console.error('Erro ao fazer upload de exame:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
