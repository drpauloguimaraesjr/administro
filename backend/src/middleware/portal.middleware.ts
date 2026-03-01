/**
 * Middleware de autenticação do Portal do Paciente
 * Verifica token Firebase e custom claims role=patient
 */

import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebaseAdmin.js';

export interface PortalRequest extends Request {
    patientId: string;
    patientUid: string;
}

export async function verifyPatientToken(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Token não fornecido' });
            return;
        }

        if (!auth) {
            res.status(503).json({ error: 'Serviço de autenticação indisponível' });
            return;
        }

        const token = authHeader.split('Bearer ')[1];
        const decoded = await auth.verifyIdToken(token);

        // Verifica se é um paciente
        if (decoded.role !== 'patient' || !decoded.patientId) {
            res.status(403).json({ error: 'Acesso restrito a pacientes' });
            return;
        }

        // Anexa dados ao request
        (req as PortalRequest).patientId = decoded.patientId;
        (req as PortalRequest).patientUid = decoded.uid;

        next();
    } catch (error: any) {
        console.error('❌ Erro na autenticação do portal:', error.message);

        if (error.code === 'auth/id-token-expired') {
            res.status(401).json({ error: 'Token expirado' });
        } else {
            res.status(401).json({ error: 'Token inválido' });
        }
    }
}
