/**
 * Serviço WhatsApp usando Baileys
 * Baseado na implementação do Nutri-Buddy
 */

import makeWASocket, {
  ConnectionState,
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  fetchLatestBaileysVersion,
  proto,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { db } from '../config/firebaseAdmin.js';

let socket: WASocket | null = null;
let qrCode: string | null = null;
let connectionState: ConnectionState = 'close';

/**
 * Inicializa conexão WhatsApp com Baileys
 */
export async function initializeWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    socket = makeWASocket({
      version,
      printQRInTerminal: true,
      auth: state,
      logger: pino({ level: 'silent' }),
      browser: ['Administrador de Contas', 'Chrome', '1.0.0'],
    });

    // Salva credenciais quando mudarem
    socket.ev.on('creds.update', saveCreds);

    // Gera QR Code
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrCode = qr;
        console.log('📱 QR Code gerado! Escaneie com o WhatsApp:');
        console.log(qr);
        
        // Salva QR no Firestore para acesso via API
        try {
          await db.collection('whatsapp_status').doc('connection').set({
            qrCode: qr,
            status: 'waiting_qr',
            updatedAt: new Date(),
          });
        } catch (error) {
          console.error('Erro ao salvar QR no Firestore:', error);
        }
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('Conexão fechada devido a', lastDisconnect?.error, ', reconectando:', shouldReconnect);
        
        connectionState = 'close';
        
        // Atualiza status no Firestore
        try {
          await db.collection('whatsapp_status').doc('connection').set({
            status: 'disconnected',
            qrCode: null,
            updatedAt: new Date(),
          });
        } catch (error) {
          console.error('Erro ao atualizar status:', error);
        }

        if (shouldReconnect) {
          initializeWhatsApp();
        }
      } else if (connection === 'open') {
        console.log('✅ WhatsApp conectado!');
        connectionState = 'open';
        qrCode = null;
        
        // Atualiza status no Firestore
        try {
          await db.collection('whatsapp_status').doc('connection').set({
            status: 'connected',
            qrCode: null,
            updatedAt: new Date(),
          });
        } catch (error) {
          console.error('Erro ao atualizar status:', error);
        }
      }

      connectionState = connection || 'close';
    });

    // Recebe mensagens
    socket.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const message of messages) {
        await handleIncomingMessage(message);
      }
    });

    console.log('🚀 WhatsApp Baileys inicializado');
  } catch (error: any) {
    console.error('❌ Erro ao inicializar WhatsApp:', error);
    throw error;
  }
}

/**
 * Processa mensagens recebidas
 */
async function handleIncomingMessage(message: proto.IWebMessageInfo) {
  try {
    if (!message.message) return;

    const messageType = Object.keys(message.message)[0];
    const from = message.key.remoteJid;
    const messageId = message.key.id;
    const pushName = message.pushName || 'Usuário';

    if (!from) return;

    // Processa mensagem de texto
    if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
      const text = message.message.conversation || message.message.extendedTextMessage?.text || '';
      
      // Envia para rota de processamento
      await processTextMessage(from, text, pushName, messageId);
    }

    // Processa mensagem de imagem
    if (messageType === 'imageMessage') {
      const imageUrl = message.message.imageMessage?.url;
      if (imageUrl) {
        await processImageMessage(from, imageUrl, pushName, messageId);
      }
    }

    // Processa mensagem de áudio
    if (messageType === 'audioMessage') {
      const audioUrl = message.message.audioMessage?.url;
      if (audioUrl) {
        await processAudioMessage(from, audioUrl, pushName, messageId);
      }
    }
  } catch (error: any) {
    console.error('Erro ao processar mensagem:', error);
  }
}

/**
 * Processa mensagem de texto
 */
async function processTextMessage(from: string, text: string, pushName: string, messageId?: string) {
  try {
    // Chama endpoint interno para processar
    const axios = (await import('axios')).default;
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    await axios.post(`${backendUrl}/api/whatsapp/message`, {
      from,
      fromName: pushName,
      messageType: 'text',
      text,
      messageId,
    });
  } catch (error: any) {
    console.error('Erro ao processar texto:', error);
  }
}

/**
 * Processa mensagem de imagem
 */
async function processImageMessage(from: string, imageUrl: string, pushName: string, messageId?: string) {
  try {
    // Baixa a imagem e envia para n8n ou processa diretamente
    const axios = (await import('axios')).default;
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (n8nWebhookUrl) {
      // Envia para n8n processar
      await axios.post(n8nWebhookUrl, {
        from,
        fromName: pushName,
        mediaUrl: imageUrl,
        messageId,
      });
    } else {
      // Processa diretamente (se implementado)
      console.log('Imagem recebida, mas N8N_WEBHOOK_URL não configurado');
    }
  } catch (error: any) {
    console.error('Erro ao processar imagem:', error);
  }
}

/**
 * Processa mensagem de áudio
 */
async function processAudioMessage(from: string, audioUrl: string, pushName: string, messageId?: string) {
  try {
    const axios = (await import('axios')).default;
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    await axios.post(`${backendUrl}/api/whatsapp/message`, {
      from,
      fromName: pushName,
      messageType: 'audio',
      audioUrl,
      messageId,
    });
  } catch (error: any) {
    console.error('Erro ao processar áudio:', error);
  }
}

/**
 * Envia mensagem de texto via WhatsApp
 */
export async function sendTextMessage(to: string, message: string): Promise<boolean> {
  try {
    if (!socket || connectionState !== 'open') {
      console.error('WhatsApp não está conectado');
      return false;
    }

    // Formata número (adiciona @s.whatsapp.net se necessário)
    const formattedNumber = to.includes('@') ? to : `${to}@s.whatsapp.net`;

    await socket.sendMessage(formattedNumber, { text: message });
    console.log(`✅ Mensagem enviada para ${formattedNumber}`);
    return true;
  } catch (error: any) {
    console.error('❌ Erro ao enviar mensagem:', error);
    return false;
  }
}

/**
 * Envia imagem via WhatsApp
 */
export async function sendImageMessage(to: string, imageUrl: string, caption?: string): Promise<boolean> {
  try {
    if (!socket || connectionState !== 'open') {
      console.error('WhatsApp não está conectado');
      return false;
    }

    const formattedNumber = to.includes('@') ? to : `${to}@s.whatsapp.net`;

    // Baixa a imagem
    const axios = (await import('axios')).default;
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data);

    await socket.sendMessage(formattedNumber, {
      image: imageBuffer,
      caption: caption || '',
    });

    console.log(`✅ Imagem enviada para ${formattedNumber}`);
    return true;
  } catch (error: any) {
    console.error('❌ Erro ao enviar imagem:', error);
    return false;
  }
}

/**
 * Obtém QR Code atual
 */
export function getQRCode(): string | null {
  return qrCode;
}

/**
 * Obtém status da conexão
 */
export function getConnectionState(): ConnectionState {
  return connectionState;
}

/**
 * Verifica se está conectado
 */
export function isConnected(): boolean {
  return connectionState === 'open' && socket !== null;
}

