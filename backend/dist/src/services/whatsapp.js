/**
 * Serviço WhatsApp usando Baileys
 * Adaptado do repositório Nutri-Buddy
 */
import makeWASocket, { DisconnectReason, useMultiFileAuthState, makeCacheableSignalKeyStore, } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class WhatsAppService {
    constructor(instanceName = 'FinanceAdmin') {
        this.sock = null;
        // Pasta onde salva a sessão (auth_info)
        // Ajustado para funcionar com ESM modules
        this.authFolder = path.join(process.cwd(), 'backend', 'sessions', instanceName);
        // Cria pasta se não existir
        if (!fs.existsSync(this.authFolder)) {
            fs.mkdirSync(this.authFolder, { recursive: true });
        }
    }
    /**
     * Inicia conexão com WhatsApp
     */
    async connect() {
        const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);
        this.sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            printQRInTerminal: true, // Mostra QR no terminal
            logger: pino({ level: 'silent' }), // 'debug' para ver logs, 'silent' para silenciar
            browser: ['FinanceAdmin', 'Chrome', '110.0.0'], // Como aparece no WhatsApp
            generateHighQualityLinkPreview: true,
        });
        // ========== EVENTOS ==========
        // 1. Atualização de conexão
        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            // QR Code gerado
            if (qr) {
                console.log('📱 QR Code gerado! Escaneie com WhatsApp.');
                if (this.qrCodeCallback) {
                    this.qrCodeCallback(qr);
                }
            }
            // Estado da conexão
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('❌ Conexão fechada. Reconectar?', shouldReconnect);
                if (this.connectionCallback) {
                    this.connectionCallback('disconnected');
                }
                if (shouldReconnect) {
                    console.log('🔄 Reconectando...');
                    setTimeout(() => this.connect(), 3000); // Aguarda 3s antes de reconectar
                }
                else {
                    console.log('🚪 Desconectado (logout)');
                    this.deleteSession();
                }
            }
            else if (connection === 'open') {
                console.log('✅ WhatsApp conectado!');
                if (this.connectionCallback) {
                    this.connectionCallback('connected');
                }
                // Pega informações do usuário
                const info = this.sock?.user;
                console.log('📱 Número conectado:', info?.id);
            }
            else if (connection === 'connecting') {
                console.log('🔄 Conectando ao WhatsApp...');
                if (this.connectionCallback) {
                    this.connectionCallback('connecting');
                }
            }
        });
        // 2. Salvar credenciais quando atualizar
        this.sock.ev.on('creds.update', saveCreds);
        // 3. MENSAGENS RECEBIDAS (O MAIS IMPORTANTE!)
        this.sock.ev.on('messages.upsert', async (m) => {
            const message = m.messages[0];
            if (!message.message)
                return; // Ignora mensagens vazias
            if (message.key.fromMe)
                return; // Ignora mensagens enviadas por você
            console.log('📩 Mensagem recebida de:', message.pushName || 'Desconhecido');
            // Processa a mensagem
            await this.handleIncomingMessage(message);
        });
        // 4. Atualização de mensagens (lida, entregue, etc)
        this.sock.ev.on('messages.update', (updates) => {
            // console.log('📝 Mensagens atualizadas:', updates);
        });
        console.log('🎯 WhatsApp Service inicializado e aguardando eventos...');
    }
    /**
     * Processa mensagem recebida
     */
    async handleIncomingMessage(message) {
        try {
            const remoteJid = message.key.remoteJid;
            const messageId = message.key.id;
            const timestamp = message.messageTimestamp;
            // Extrai texto da mensagem
            const text = this.getMessageText(message);
            // Extrai tipo de mídia se houver
            const mediaType = this.getMediaType(message);
            // Dados formatados
            const formattedMessage = {
                id: messageId,
                from: remoteJid,
                fromName: message.pushName || 'Desconhecido',
                timestamp: timestamp * 1000, // Converte para milliseconds
                text: text,
                mediaType: mediaType,
                isGroup: remoteJid.includes('@g.us'),
                raw: message, // Mensagem completa para debug
            };
            console.log('✉️ Mensagem processada:', {
                de: formattedMessage.fromName,
                numero: formattedMessage.from,
                texto: formattedMessage.text,
            });
            // WEBHOOK: Chama seu callback personalizado
            if (this.messageCallback) {
                await this.messageCallback(formattedMessage);
            }
        }
        catch (error) {
            console.error('❌ Erro ao processar mensagem:', error);
        }
    }
    /**
     * Extrai texto da mensagem
     */
    getMessageText(message) {
        const msg = message.message;
        if (!msg)
            return null;
        // Texto simples
        if (msg.conversation)
            return msg.conversation;
        // Texto com mídia
        if (msg.extendedTextMessage?.text)
            return msg.extendedTextMessage.text;
        if (msg.imageMessage?.caption)
            return msg.imageMessage.caption;
        if (msg.videoMessage?.caption)
            return msg.videoMessage.caption;
        return null;
    }
    /**
     * Identifica tipo de mídia
     */
    getMediaType(message) {
        const msg = message.message;
        if (!msg)
            return null;
        if (msg.imageMessage)
            return 'image';
        if (msg.videoMessage)
            return 'video';
        if (msg.audioMessage)
            return 'audio';
        if (msg.documentMessage)
            return 'document';
        if (msg.stickerMessage)
            return 'sticker';
        return 'text';
    }
    /**
     * Envia mensagem de texto
     */
    async sendTextMessage(to, text) {
        if (!this.sock) {
            throw new Error('WhatsApp não está conectado');
        }
        // Formata número se necessário
        const jid = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
        const result = await this.sock.sendMessage(jid, {
            text: text,
        });
        console.log('✅ Mensagem enviada para:', to);
        return result;
    }
    /**
     * Envia imagem
     */
    async sendImageMessage(to, imageUrl, caption) {
        if (!this.sock) {
            throw new Error('WhatsApp não está conectado');
        }
        const jid = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
        const result = await this.sock.sendMessage(jid, {
            image: { url: imageUrl },
            caption: caption,
        });
        console.log('✅ Imagem enviada para:', to);
        return result;
    }
    /**
     * Envia arquivo
     */
    async sendDocumentMessage(to, documentUrl, fileName, mimeType) {
        if (!this.sock) {
            throw new Error('WhatsApp não está conectado');
        }
        const jid = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
        const result = await this.sock.sendMessage(jid, {
            document: { url: documentUrl },
            fileName: fileName,
            mimetype: mimeType,
        });
        console.log('✅ Documento enviado para:', to, '- Arquivo:', fileName);
        return result;
    }
    /**
     * Marca mensagem como lida
     */
    async markAsRead(jid, messageId) {
        if (!this.sock)
            return;
        try {
            await this.sock.readMessages([
                {
                    remoteJid: jid,
                    id: messageId,
                    fromMe: false,
                },
            ]);
        }
        catch (error) {
            console.error('Erro ao marcar como lida:', error);
        }
    }
    /**
     * Verifica se está conectado
     */
    isConnected() {
        return this.sock !== null && this.sock.user !== undefined;
    }
    /**
     * Retorna o socket para uso externo (para download de mídia)
     */
    getSocket() {
        return this.sock;
    }
    /**
     * Pega informações do usuário conectado
     */
    getUserInfo() {
        if (!this.sock || !this.sock.user) {
            return null;
        }
        return {
            id: this.sock.user.id,
            name: this.sock.user.name,
        };
    }
    /**
     * Deleta sessão (logout)
     */
    deleteSession() {
        if (fs.existsSync(this.authFolder)) {
            fs.rmSync(this.authFolder, { recursive: true, force: true });
            console.log('🗑️ Sessão deletada');
        }
    }
    /**
     * Desconecta
     */
    async disconnect() {
        if (this.sock) {
            await this.sock.logout();
            this.sock = null;
            console.log('👋 WhatsApp desconectado');
        }
    }
    /**
     * Callback quando QR code é gerado
     */
    onQRCode(callback) {
        this.qrCodeCallback = callback;
    }
    /**
     * Callback quando mensagem chega
     */
    onMessage(callback) {
        this.messageCallback = callback;
    }
    /**
     * Callback quando conexão muda
     */
    onConnectionUpdate(callback) {
        this.connectionCallback = callback;
    }
}
//# sourceMappingURL=whatsapp.js.map