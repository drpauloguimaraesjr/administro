/**
 * Serviço para upload de mídia para Firebase Storage
 */
import { storage } from '../config/firebaseAdmin.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import axios from 'axios';
import pino from 'pino';
/**
 * Baixa mídia de uma mensagem do WhatsApp
 */
export async function downloadWhatsAppMedia(message, sock) {
    try {
        const msg = message.message;
        if (!msg)
            return null;
        let mediaType = null;
        let fileName = '';
        let mimeType = '';
        // Identifica tipo de mídia
        if (msg.imageMessage) {
            mediaType = 'imageMessage';
            fileName = msg.imageMessage.mimetype?.split('/')[1]
                ? `image.${msg.imageMessage.mimetype.split('/')[1]}`
                : 'image.jpg';
            mimeType = msg.imageMessage.mimetype || 'image/jpeg';
        }
        else if (msg.videoMessage) {
            mediaType = 'videoMessage';
            fileName = msg.videoMessage.mimetype?.split('/')[1]
                ? `video.${msg.videoMessage.mimetype.split('/')[1]}`
                : 'video.mp4';
            mimeType = msg.videoMessage.mimetype || 'video/mp4';
        }
        else if (msg.documentMessage) {
            mediaType = 'documentMessage';
            fileName = msg.documentMessage.fileName || 'document.pdf';
            mimeType = msg.documentMessage.mimetype || 'application/pdf';
        }
        else {
            return null; // Não é uma mídia suportada
        }
        // Baixa a mídia usando Baileys
        const logger = pino({ level: 'silent' });
        const buffer = await downloadMediaMessage(message, 'buffer', {}, {
            logger: logger,
            reuploadRequest: sock?.updateMediaMessage,
        });
        return {
            buffer,
            mimeType,
            fileName,
        };
    }
    catch (error) {
        console.error('❌ Erro ao baixar mídia do WhatsApp:', error);
        return null;
    }
}
/**
 * Faz upload da mídia para Firebase Storage
 */
export async function uploadMediaToFirebase(buffer, fileName, mimeType, userId, messageId) {
    try {
        const bucket = storage.bucket();
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `receipts/${userId}/${timestamp}_${messageId}_${sanitizedFileName}`;
        const file = bucket.file(filePath);
        // Upload do arquivo
        await file.save(buffer, {
            metadata: {
                contentType: mimeType,
                metadata: {
                    uploadedAt: new Date().toISOString(),
                    messageId: messageId,
                },
            },
            public: false, // Arquivo privado
        });
        // Gera URL assinada válida por 1 ano
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 ano
        });
        // Retorna URL pública do Firebase Storage
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${Date.now()}`;
        // Ou use a URL assinada (mais segura)
        return signedUrl;
    }
    catch (error) {
        console.error('❌ Erro ao fazer upload para Firebase Storage:', error);
        throw error;
    }
}
/**
 * Baixa mídia de uma URL e retorna buffer
 */
export async function downloadMediaFromUrl(url) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
        });
        return Buffer.from(response.data);
    }
    catch (error) {
        console.error('❌ Erro ao baixar mídia da URL:', error);
        throw error;
    }
}
//# sourceMappingURL=mediaUpload.js.map