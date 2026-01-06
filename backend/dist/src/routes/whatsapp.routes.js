/**
 * Rotas relacionadas ao WhatsApp
 * Adaptado do repositório Nutri-Buddy
 */
import { Router } from 'express';
import { WhatsAppService } from '../services/whatsapp.js';
import axios from 'axios';
import { downloadWhatsAppMedia, uploadMediaToFirebase } from '../services/mediaUpload.js';
const router = Router();
let whatsappService = null;
let currentQRCode = null;
let connectionState = 'disconnected';
// Inicializa o serviço WhatsApp
export function initializeWhatsApp() {
    if (!whatsappService) {
        whatsappService = new WhatsAppService('FinanceAdmin');
        // Callback para QR Code
        whatsappService.onQRCode((qr) => {
            currentQRCode = qr;
            console.log('📱 QR Code atualizado');
        });
        // Callback para mudanças de conexão
        whatsappService.onConnectionUpdate((state) => {
            connectionState = state;
            if (state === 'connected') {
                currentQRCode = null; // Limpa QR após conexão
            }
        });
        // Callback para mensagens recebidas
        whatsappService.onMessage(async (message) => {
            try {
                // Verifica whitelist se configurada
                const whitelist = process.env.WHATSAPP_WHITELIST?.split(',') || [];
                const fromNumber = message.from.replace('@s.whatsapp.net', '');
                if (whitelist.length > 0 && !whitelist.includes(fromNumber)) {
                    console.log('🚫 Número não autorizado:', fromNumber);
                    return;
                }
                // Envia mensagem com mídia para o n8n processar
                if (process.env.N8N_WEBHOOK_URL && message.mediaType && message.mediaType !== 'text') {
                    try {
                        // Baixa mídia se for imagem (comprovante)
                        if (whatsappService && message.mediaType === 'image') {
                            // Obtém o socket do serviço
                            const sock = whatsappService.getSocket();
                            if (sock) {
                                const mediaInfo = await downloadWhatsAppMedia(message.raw, sock);
                                if (mediaInfo) {
                                    // Faz upload para Firebase Storage
                                    const fromNumber = message.from.replace('@s.whatsapp.net', '');
                                    const mediaUrl = await uploadMediaToFirebase(mediaInfo.buffer, mediaInfo.fileName, mediaInfo.mimeType, fromNumber, message.id);
                                    // Envia para n8n processar
                                    await axios.post(process.env.N8N_WEBHOOK_URL, {
                                        messageId: message.id,
                                        from: message.from,
                                        fromName: message.fromName,
                                        timestamp: message.timestamp,
                                        text: message.text,
                                        mediaType: message.mediaType,
                                        mediaUrl: mediaUrl,
                                        fileName: mediaInfo.fileName,
                                        mimeType: mediaInfo.mimeType,
                                    }, {
                                        timeout: 10000, // 10 segundos de timeout
                                    });
                                    console.log('✅ Mensagem com mídia enviada para n8n:', message.id);
                                }
                            }
                        }
                        else {
                            // Para outros tipos de mídia ou apenas texto, envia informações básicas
                            await axios.post(process.env.N8N_WEBHOOK_URL, {
                                messageId: message.id,
                                from: message.from,
                                fromName: message.fromName,
                                timestamp: message.timestamp,
                                text: message.text,
                                mediaType: message.mediaType,
                            }, {
                                timeout: 10000,
                            });
                        }
                    }
                    catch (error) {
                        console.error('❌ Erro ao enviar mensagem para n8n:', error.message);
                        // Não interrompe o fluxo se falhar
                    }
                }
                // Marca mensagem como lida
                if (whatsappService) {
                    await whatsappService.markAsRead(message.from, message.id);
                }
            }
            catch (error) {
                console.error('Erro ao processar mensagem recebida:', error);
            }
        });
        // Inicia conexão
        whatsappService.connect().catch((error) => {
            console.error('Erro ao conectar WhatsApp:', error);
        });
    }
    return whatsappService;
}
// GET /api/whatsapp/qr - Retorna QR Code para conexão
router.get('/qr', (req, res) => {
    if (!whatsappService) {
        initializeWhatsApp();
    }
    if (currentQRCode) {
        res.json({
            qr: currentQRCode,
            status: 'waiting_scan',
            message: 'Escaneie o QR Code com seu WhatsApp',
        });
    }
    else if (connectionState === 'connected') {
        res.json({
            qr: null,
            status: 'connected',
            message: 'WhatsApp já está conectado',
            userInfo: whatsappService?.getUserInfo(),
        });
    }
    else {
        res.json({
            qr: null,
            status: connectionState,
            message: 'Aguarde o QR Code ser gerado...',
        });
    }
});
// GET /api/whatsapp/status - Retorna status da conexão
router.get('/status', (req, res) => {
    if (!whatsappService) {
        return res.json({
            connected: false,
            status: 'not_initialized',
            message: 'Serviço WhatsApp não inicializado',
        });
    }
    const isConnected = whatsappService.isConnected();
    const userInfo = whatsappService.getUserInfo();
    res.json({
        connected: isConnected,
        status: connectionState,
        userInfo: userInfo,
        hasQRCode: currentQRCode !== null,
    });
});
// POST /api/whatsapp/send - Envia mensagem de texto
router.post('/send', async (req, res) => {
    try {
        if (!whatsappService) {
            return res.status(400).json({
                error: 'WhatsApp não está inicializado',
            });
        }
        if (!whatsappService.isConnected()) {
            return res.status(400).json({
                error: 'WhatsApp não está conectado',
            });
        }
        const { to, text } = req.body;
        if (!to || !text) {
            return res.status(400).json({
                error: 'Campos "to" e "text" são obrigatórios',
            });
        }
        const result = await whatsappService.sendTextMessage(to, text);
        res.json({
            success: true,
            message: 'Mensagem enviada com sucesso',
            messageId: result?.key?.id,
        });
    }
    catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({
            error: 'Erro ao enviar mensagem',
            message: error.message,
        });
    }
});
// POST /api/whatsapp/send-image - Envia imagem
router.post('/send-image', async (req, res) => {
    try {
        if (!whatsappService || !whatsappService.isConnected()) {
            return res.status(400).json({
                error: 'WhatsApp não está conectado',
            });
        }
        const { to, imageUrl, caption } = req.body;
        if (!to || !imageUrl) {
            return res.status(400).json({
                error: 'Campos "to" e "imageUrl" são obrigatórios',
            });
        }
        const result = await whatsappService.sendImageMessage(to, imageUrl, caption);
        res.json({
            success: true,
            message: 'Imagem enviada com sucesso',
            messageId: result?.key?.id,
        });
    }
    catch (error) {
        console.error('Erro ao enviar imagem:', error);
        res.status(500).json({
            error: 'Erro ao enviar imagem',
            message: error.message,
        });
    }
});
// POST /api/whatsapp/disconnect - Desconecta WhatsApp
router.post('/disconnect', async (req, res) => {
    try {
        if (whatsappService) {
            await whatsappService.disconnect();
            whatsappService.deleteSession();
            whatsappService = null;
            currentQRCode = null;
            connectionState = 'disconnected';
            res.json({
                success: true,
                message: 'WhatsApp desconectado com sucesso',
            });
        }
        else {
            res.json({
                success: true,
                message: 'WhatsApp já estava desconectado',
            });
        }
    }
    catch (error) {
        console.error('Erro ao desconectar:', error);
        res.status(500).json({
            error: 'Erro ao desconectar',
            message: error.message,
        });
    }
});
export default router;
//# sourceMappingURL=whatsapp.routes.js.map