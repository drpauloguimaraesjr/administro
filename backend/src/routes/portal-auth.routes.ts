/**
 * Rotas de autenticação do Portal do Paciente
 * Permite ao admin criar contas de paciente com role=patient
 */

import { Router, Request, Response } from 'express';
import { auth, db } from '../config/firebaseAdmin.js';

const router = Router();

/**
 * POST /api/portal/auth/create-patient-account
 * Cria conta Firebase Auth para paciente e vincula ao Firestore
 * Body: { patientId, email, password, displayName }
 */
router.post('/create-patient-account', async (req: Request, res: Response) => {
    try {
        if (!auth || !db) {
            return res.status(503).json({ error: 'Firebase não configurado' });
        }

        const { patientId, email, password, displayName } = req.body;

        if (!patientId || !email || !password) {
            return res.status(400).json({
                error: 'Campos obrigatórios: patientId, email, password',
            });
        }

        // Verifica se o paciente existe no Firestore
        const patientDoc = await db.collection('patients').doc(patientId).get();
        if (!patientDoc.exists) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }

        // Cria conta no Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: displayName || patientDoc.data()?.name || 'Paciente',
        });

        // Seta custom claims: role=patient + patientId
        await auth.setCustomUserClaims(userRecord.uid, {
            role: 'patient',
            patientId,
        });

        // Atualiza doc do paciente no Firestore
        await db.collection('patients').doc(patientId).update({
            portalEnabled: true,
            portalEmail: email,
            firebaseUid: userRecord.uid,
            portalCreatedAt: new Date().toISOString(),
        });

        console.log(`✅ Conta portal criada: ${email} → paciente ${patientId}`);

        res.status(201).json({
            success: true,
            uid: userRecord.uid,
            email: userRecord.email,
            patientId,
        });
    } catch (error: any) {
        console.error('❌ Erro ao criar conta do portal:', error);

        if (error.code === 'auth/email-already-exists') {
            return res.status(409).json({ error: 'Email já cadastrado' });
        }

        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/portal/auth/reset-password
 * Envia email de redefinição de senha para o paciente
 */
router.post('/reset-password', async (req: Request, res: Response) => {
    try {
        if (!auth) {
            return res.status(503).json({ error: 'Firebase não configurado' });
        }

        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email obrigatório' });
        }

        const link = await auth.generatePasswordResetLink(email);

        res.json({ success: true, message: 'Link de redefinição gerado', link });
    } catch (error: any) {
        console.error('❌ Erro ao gerar reset de senha:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
