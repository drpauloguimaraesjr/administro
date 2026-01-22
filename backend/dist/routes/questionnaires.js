import express from 'express';
import { db } from '../config/firebaseAdmin.js';
const router = express.Router();
// GET all questionnaires
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('questionnaires').orderBy('createdAt', 'desc').get();
        const questionnaires = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.json(questionnaires);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET single questionnaire
router.get('/:id', async (req, res) => {
    try {
        const doc = await db.collection('questionnaires').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Questionário não encontrado' });
        }
        res.json({ id: doc.id, ...doc.data() });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// CREATE questionnaire
router.post('/', async (req, res) => {
    try {
        const data = {
            ...req.body,
            isActive: true,
            responseCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const docRef = await db.collection('questionnaires').add(data);
        res.status(201).json({ id: docRef.id, ...data });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// UPDATE questionnaire
router.put('/:id', async (req, res) => {
    try {
        const docRef = db.collection('questionnaires').doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Questionário não encontrado' });
        }
        await docRef.update({
            ...req.body,
            updatedAt: new Date().toISOString(),
        });
        res.json({ id: req.params.id, ...req.body });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// DELETE questionnaire
router.delete('/:id', async (req, res) => {
    try {
        await db.collection('questionnaires').doc(req.params.id).delete();
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// SEND questionnaire to patient(s)
router.post('/:id/send', async (req, res) => {
    try {
        const { patientIds, channel, customMessage } = req.body;
        const questionnaireDoc = await db.collection('questionnaires').doc(req.params.id).get();
        if (!questionnaireDoc.exists) {
            return res.status(404).json({ error: 'Questionário não encontrado' });
        }
        const responseIds = [];
        for (const patientId of patientIds) {
            const patientDoc = await db.collection('patients').doc(patientId).get();
            const patientData = patientDoc.data();
            const response = {
                questionnaireId: req.params.id,
                patientId,
                patientName: patientData?.name || '',
                answers: [],
                status: 'pending',
                sentVia: channel || 'link',
                sentAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            };
            const responseRef = await db.collection('questionnaire_responses').add(response);
            responseIds.push(responseRef.id);
            // Send via WhatsApp if configured
            if (channel === 'whatsapp' && patientData?.phone) {
                const whatsappService = await import('../services/whatsapp.js');
                const message = customMessage ||
                    `Olá ${patientData.name}! Por favor, responda o questionário: ${questionnaireDoc.data()?.title}.\n\nLink: ${process.env.FRONTEND_URL}/responder/${responseRef.id}`;
                await whatsappService.sendMessage(patientData.phone, message);
            }
        }
        // Update response count
        await db.collection('questionnaires').doc(req.params.id).update({
            responseCount: (questionnaireDoc.data()?.responseCount || 0) + patientIds.length,
        });
        res.json({ success: true, responseIds });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET responses for a questionnaire
router.get('/:id/responses', async (req, res) => {
    try {
        const snapshot = await db.collection('questionnaire_responses')
            .where('questionnaireId', '==', req.params.id)
            .orderBy('createdAt', 'desc')
            .get();
        const responses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.json(responses);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET response by ID (for patient filling)
router.get('/responses/:responseId', async (req, res) => {
    try {
        const doc = await db.collection('questionnaire_responses').doc(req.params.responseId).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Resposta não encontrada' });
        }
        const responseData = doc.data();
        const questionnaireDoc = await db.collection('questionnaires').doc(responseData.questionnaireId).get();
        res.json({
            response: { id: doc.id, ...responseData },
            questionnaire: { id: questionnaireDoc.id, ...questionnaireDoc.data() },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// SUBMIT response (patient)
router.post('/responses/:responseId/submit', async (req, res) => {
    try {
        const { answers } = req.body;
        await db.collection('questionnaire_responses').doc(req.params.responseId).update({
            answers,
            status: 'completed',
            completedAt: new Date().toISOString(),
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET patient's questionnaire responses
router.get('/patient/:patientId', async (req, res) => {
    try {
        const snapshot = await db.collection('questionnaire_responses')
            .where('patientId', '==', req.params.patientId)
            .orderBy('createdAt', 'desc')
            .get();
        const responses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.json(responses);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=questionnaires.js.map