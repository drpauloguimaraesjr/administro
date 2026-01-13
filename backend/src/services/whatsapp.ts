/**
 * Serviço WhatsApp usando Baileys
 * Implementação Robusta baseada no Nutri-Buddy (com Fix 9-dígitos e Backoff)
 */

import makeWASocket, {
  ConnectionState,
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  fetchLatestBaileysVersion,
  proto,
  makeCacheableSignalKeyStore,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { db } from '../config/firebaseAdmin.js';
import path from 'path';
import fs from 'fs';

type InternalConnectionState = 'open' | 'connecting' | 'close' | 'disconnected' | 'waiting_qr';

let socket: WASocket | null = null;
let qrCode: string | null = null;
let connectionState: InternalConnectionState = 'close';
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Caminho para auth info
const AUTH_FOLDER = path.resolve('auth_info_baileys');

/**
 * Inicializa conexão WhatsApp com Baileys
 */
export async function initializeWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    const { version } = await fetchLatestBaileysVersion();

    socket = makeWASocket({
      version,
      printQRInTerminal: true,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      logger: pino({ level: 'silent' }),
      browser: ['Administrador de Contas', 'Chrome', '1.0.0'],
      generateHighQualityLinkPreview: true,
    });

    // Salva credenciais quando mudarem
    socket.ev.on('creds.update', saveCreds);

    // Gerenciamento de Conexão
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrCode = qr;
        console.log('📱 QR Code gerado! Escaneie com o WhatsApp.');

        await updateFirestoreStatus('waiting_qr', qr);
        connectionState = 'connecting';
      }

      if (connection === 'close') {
        const error = (lastDisconnect?.error as Boom);
        const shouldReconnect = error?.output?.statusCode !== DisconnectReason.loggedOut;

        console.log(`❌ Conexão fechada: ${error?.message || 'Desconhecido'}. Reconectar? ${shouldReconnect}`);

        connectionState = 'close';
        await updateFirestoreStatus('disconnected', null);

        if (shouldReconnect) {
          reconnectAttempts++;
          if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
            const delay = Math.min(3000 * reconnectAttempts, 30000); // Backoff: 3s, 6s... max 30s
            console.log(`🔄 Reconectando em ${delay / 1000}s (Tentativa ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
            setTimeout(() => initializeWhatsApp(), delay);
          } else {
            console.error('❌ Máximo de tentativas de reconexão atingido.');
          }
        } else {
          // Logout real, limpa tudo
          console.log('🚪 Desconectado (Logout). Limpando sessão...');
          try {
            if (fs.existsSync(AUTH_FOLDER)) {
              fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
            }
          } catch (e) { console.error('Erro ao limpar pasta auth:', e); }
          reconnectAttempts = 0;
        }
      } else if (connection === 'open') {
        console.log('✅ WhatsApp conectado com sucesso!');
        connectionState = 'open';
        qrCode = null;
        reconnectAttempts = 0;

        await updateFirestoreStatus('connected', null);
      }
    });

    // Recebe mensagens
    socket.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const message of messages) {
        if (!message.key.fromMe && message.message) {
          await handleIncomingMessage(message);
        }
      }
    });

    console.log('🚀 WhatsApp Baileys inicializado');
  } catch (error: any) {
    console.error('❌ Erro ao inicializar WhatsApp:', error);
    // Tenta recuperar se for erro fatal
    setTimeout(() => initializeWhatsApp(), 10000);
  }
}

async function updateFirestoreStatus(status: string, qr: string | null) {
  try {
    await db.collection('whatsapp_status').doc('connection').set({
      status,
      qrCode: qr,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erro ao atualizar status no Firestore:', error);
  }
}

/**
 * Processa mensagens recebidas
 */
async function handleIncomingMessage(message: proto.IWebMessageInfo) {
  try {
    const from = message.key.remoteJid;
    if (!from || from.includes('@g.us') || from.includes('status@broadcast')) return;

    const messageId = message.key.id || undefined;
    const pushName = message.pushName || 'Usuário';
    const msgContent = message.message;

    if (!msgContent) return;

    // Detecta tipo
    let messageType = 'unknown';
    let text = '';
    let mediaUrl = '';

    if (msgContent.conversation || msgContent.extendedTextMessage?.text) {
      messageType = 'text';
      text = msgContent.conversation || msgContent.extendedTextMessage?.text || '';
      await processTextMessage(from, text, pushName, messageId);
    } else if (msgContent.imageMessage) {
      messageType = 'image';
      // TODO: Implementar upload de mídia real se necessário. 
      // Por enquanto, passamos a URL interna se disponível ou notificamos o n8n para baixar se possível.
      // O Baileys não expõe URL pública direta sem download.
      // Enviamos 'image' para o fluxo tentar tratar ou pedir reenvio.
      await processMediaMessage(from, 'image', pushName, messageId, msgContent.imageMessage);
    } else if (msgContent.audioMessage) {
      messageType = 'audio';
      await processMediaMessage(from, 'audio', pushName, messageId, msgContent.audioMessage);
    }

  } catch (error: any) {
    console.error('Erro ao processar mensagem:', error);
  }
}

async function processTextMessage(from: string, text: string, pushName: string, messageId?: string) {
  // Reutiliza a lógica de chamar a rota interna via axios para manter consistência com o router existente
  const axios = (await import('axios')).default;
  const backendUrl = `http://localhost:${process.env.PORT || 3001}`;

  try {
    await axios.post(`${backendUrl}/api/whatsapp/message`, {
      from,
      fromName: pushName,
      messageType: 'text',
      text,
      messageId,
    });
  } catch (e: any) {
    console.error('Erro ao chamar API interna de mensagem:', e.message);
  }
}

async function processMediaMessage(from: string, type: string, pushName: string, messageId: string | undefined | null, mediaContent: any) {
  // Se tivermos N8N configurado, enviamos para ele
  if (process.env.N8N_WEBHOOK_URL) {
    const axios = (await import('axios')).default;
    // Nota: Sem o download/upload real, o N8N pode ter dificuldade com a mídia.
    // Mas vamos enviar a notificação.
    try {
      await axios.post(process.env.N8N_WEBHOOK_URL, {
        from,
        fromName: pushName,
        mediaType: type,
        messageId,
        // Passamos o objeto de mídia bruto caso o N8N saiba lidar ou para debug
        mediaContent
      });
    } catch (e: any) {
      console.error(`Erro ao enviar mídia para N8N:`, e.message);
    }
  }
}


/**
 * Envia mensagem de texto via WhatsApp (Com correção para números BR 9 dígitos)
 */
export async function sendTextMessage(to: string, message: string): Promise<boolean> {
  try {
    if (!socket || connectionState !== 'open') {
      console.error('WhatsApp não está conectado');
      return false;
    }

    // Formatação inteligente de número BR
    let targetJid = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
    const possibleJids = [targetJid];

    // Se for número brasileiro (55)
    if (to.startsWith('55') || to.startsWith('55')) {
      const cleanNum = to.replace(/\D/g, ''); // Garante só números
      if (cleanNum.startsWith('55')) {
        const ddd = cleanNum.substring(2, 4);
        const number = cleanNum.substring(4);

        if (number.length === 9 && number.startsWith('9')) {
          // Tem 9 e começa com 9: adicionar versão SEM o 9
          possibleJids.push(`55${ddd}${number.substring(1)}@s.whatsapp.net`);
        } else if (number.length === 8) {
          // Tem 8: adicionar versão COM o 9
          possibleJids.push(`55${ddd}9${number}@s.whatsapp.net`);
        }
      }
    }

    // Tenta enviar para os JIDs possíveis
    for (const jid of possibleJids) {
      try {
        const result = await socket.onWhatsApp(jid);
        if (result && Array.isArray(result) && result[0]?.exists) {
          await socket.sendMessage(result[0].jid, { text: message });
          console.log(`✅ Mensagem enviada para ${result[0].jid}`);
          return true;
        }
      } catch (e) {
        console.warn(`Falha ao verificar/enviar para ${jid}`, e);
      }
    }

    // Se chegou aqui, tenta enviar para o original mesmo assim (fallback)
    await socket.sendMessage(targetJid, { text: message });
    return true;

  } catch (error: any) {
    console.error('❌ Erro ao enviar mensagem:', error);
    return false;
  }
}

/**
 * Envia mensagem de Imagem
 */
export async function sendImageMessage(to: string, imageUrl: string, caption?: string): Promise<boolean> {
  // Implementação simplificada mantendo a original
  if (!socket || connectionState !== 'open') return false;
  const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
  try {
    await socket.sendMessage(jid, { image: { url: imageUrl }, caption });
    return true;
  } catch (e) {
    console.error('Erro ao enviar imagem:', e);
    return false;
  }
}

export function getQRCode(): string | null {
  return qrCode;
}

export function getConnectionState(): InternalConnectionState {
  return connectionState;
}

export function isConnected(): boolean {
  return connectionState === 'open' && socket !== null;
}
