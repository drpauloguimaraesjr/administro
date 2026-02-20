// backend/src/routes/settings.routes.ts

import { Router, Request, Response } from 'express';
import { db, storage } from '../config/firebaseAdmin.js';

const router = Router();

const SETTINGS_DOC = 'settings/prescription';

// =====================
// Prescription Settings
// =====================

// GET /api/settings/prescription — Load saved config
router.get('/prescription', async (_req: Request, res: Response) => {
    try {
        const doc = await db.doc(SETTINGS_DOC).get();
        if (!doc.exists) {
            return res.json({});
        }
        res.json(doc.data());
    } catch (error: any) {
        console.error('Erro ao buscar configurações de receituário:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/settings/prescription — Save/update config
router.put('/prescription', async (req: Request, res: Response) => {
    try {
        const data = req.body;
        await db.doc(SETTINGS_DOC).set(
            { ...data, updatedAt: new Date().toISOString() },
            { merge: true }
        );
        const updated = await db.doc(SETTINGS_DOC).get();
        res.json(updated.data());
    } catch (error: any) {
        console.error('Erro ao salvar configurações de receituário:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/settings/prescription/upload — Upload image (header/footer/watermark)
router.post('/prescription/upload', async (req: Request, res: Response) => {
    try {
        const { image, type } = req.body; // image: base64 data URI, type: 'header' | 'footer' | 'watermark'

        if (!image || !type) {
            return res.status(400).json({ error: 'Campos obrigatórios: image (base64), type (header|footer|watermark)' });
        }

        if (!['header', 'footer', 'watermark'].includes(type)) {
            return res.status(400).json({ error: 'type deve ser: header, footer, ou watermark' });
        }

        // Extract Base64 data
        const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ error: 'Formato de imagem inválido. Envie como data URI base64.' });
        }

        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');

        // Max 2MB
        if (buffer.length > 2 * 1024 * 1024) {
            return res.status(400).json({ error: 'Imagem muito grande. Máximo: 2MB' });
        }

        const extension = mimeType.split('/')[1] || 'png';
        const fileName = `prescription/${type}_${Date.now()}.${extension}`;

        const bucket = storage.bucket();
        const file = bucket.file(fileName);

        await file.save(buffer, {
            metadata: { contentType: mimeType },
            public: true,
        });

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        // Save URL to settings
        const fieldMap: Record<string, string> = {
            header: 'headerImageUrl',
            footer: 'footerImageUrl',
            watermark: 'watermark.imageUrl',
        };

        if (type === 'watermark') {
            await db.doc(SETTINGS_DOC).set(
                { watermark: { imageUrl: publicUrl }, updatedAt: new Date().toISOString() },
                { merge: true }
            );
        } else {
            await db.doc(SETTINGS_DOC).set(
                { [fieldMap[type]]: publicUrl, updatedAt: new Date().toISOString() },
                { merge: true }
            );
        }

        res.json({ url: publicUrl, type });
    } catch (error: any) {
        console.error('Erro ao fazer upload de imagem:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/settings/prescription/image/:type — Remove uploaded image
router.delete('/prescription/image/:type', async (req: Request, res: Response) => {
    try {
        const { type } = req.params;

        if (!['header', 'footer', 'watermark'].includes(type)) {
            return res.status(400).json({ error: 'type deve ser: header, footer, ou watermark' });
        }

        const fieldMap: Record<string, string> = {
            header: 'headerImageUrl',
            footer: 'footerImageUrl',
        };

        if (type === 'watermark') {
            await db.doc(SETTINGS_DOC).set(
                { watermark: { imageUrl: null }, updatedAt: new Date().toISOString() },
                { merge: true }
            );
        } else {
            await db.doc(SETTINGS_DOC).set(
                { [fieldMap[type]]: null, updatedAt: new Date().toISOString() },
                { merge: true }
            );
        }

        res.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao remover imagem:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
