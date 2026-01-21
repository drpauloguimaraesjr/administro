/**
 * Serviço WhatsApp usando Baileys
 * Com persistência de sessão no Firestore
 */

import makeWASocket, {
  ConnectionState,
  DisconnectReason,
  WASocket,
  fetchLatestBaileysVersion,
  proto,
  makeCacheableSignalKeyStore,
  AuthenticationCreds,
  AuthenticationState,
  SignalDataTypeMap,
  initAuthCreds,
  BufferJSON,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { db } from '../config/firebaseAdmin.js';

type InternalConnectionState = 'open' | 'connecting' | 'close' | 'disconnected' | 'waiting_qr';

let socket: WASocket | null = null;
let qrCode: string | null = null;
let connectionState: InternalConnectionState = 'close';
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const SESSION_COLLECTION = 'whatsapp_session';

/**
 * Auth state que persiste no Firestore
 */
async function useFirestoreAuthState(): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
}> {

  const loadCreds = async (): Promise<AuthenticationCreds> => {
    try {
      const doc = await db.collection(SESSION_COLLECTION).doc('creds').get();
      if (doc.exists) {
        const data = doc.data();
        if (data?.creds) {
          console.log('✅ WhatsApp: Carregando credenciais do Firestore');
          return JSON.parse(data.creds, BufferJSON.reviver);
        }
      }
    } catch (error) {
      console.log('📝 WhatsApp: Criando novas credenciais');
    }
    return initAuthCreds();
  };

  const creds = await loadCreds();

  const saveCreds = async () => {
    try {
      await db.collection(SESSION_COLLECTION).doc('creds').set({
        creds: JSON.stringify(creds, BufferJSON.replacer),
        updatedAt: new Date(),
      });
      console.log('💾 WhatsApp: Credenciais salvas no Firestore');
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
    }
  };

  const keys = {
    get: async (type: keyof SignalDataTypeMap, ids: string[]) => {
      const result: { [id: string]: any } = {};
      try {
        for (const id of ids) {
          const docId = `${type}-${id}`.replace(/\//g, '_');
          const doc = await db.collection(SESSION_COLLECTION).doc(docId).get();
          if (doc.exists) {
            const data = doc.data();
            if (data?.value) {
              result[id] = JSON.parse(data.value, BufferJSON.reviver);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar keys:', error);
      }
      return result;
    },
    set: async (data: { [type: string]: { [id: string]: any } }) => {
      try {
        const batch = db.batch();
        for (const [type, entries] of Object.entries(data)) {
          for (const [id, value] of Object.entries(entries)) {
            const docId = `${type}-${id}`.replace(/\//g, '_');
            const ref = db.collection(SESSION_COLLECTION).doc(docId);
            if (value) {
              batch.set(ref, {
                type,
                id,
                value: JSON.stringify(value, BufferJSON.replacer),
                updatedAt: new Date(),
              });
            } else {
              batch.delete(ref);
            }
          }
        }
        await batch.commit();
      } catch (error) {
        console.error('Erro ao salvar keys:', error);
      }
    },
  };

  return {
    state: { creds, keys },
    saveCreds,
  };
}

/**
 * Limpa sessão do Firestore
 */
async function clearFirestoreSession() {
  try {
    const snapshot = await db.collection(SESSION_COLLECTION).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('🗑️ WhatsApp: Sessão limpa do Firestore');
  } catch (error) {
    console.error('Erro ao limpar sessão:', error);
  }
}

/**
 * Inicializa conexão WhatsApp com Baileys
 */
export async function initializeWhatsApp() {
  try {
    const { state, saveCreds } = await useFirestoreAuthState();
    const { version } = await fetchLatestBaileysVersion();

    socket = makeWASocket({
      version,
      printQRInTerminal: true,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      logger: pino({ level: 'silent' }),
      browser: ['CALYX', 'Chrome', '1.0.0'],
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
            const delay = Math.min(3000 * reconnectAttempts, 30000);
            console.log(`🔄 Reconectando em ${delay / 1000}s (Tentativa ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
            setTimeout(() => initializeWhatsApp(), delay);
          } else {
            console.error('❌ Máximo de tentativas de reconexão atingido.');
          }
        } else {
          console.log('🚪 Desconectado (Logout). Limpando sessão...');
          await clearFirestoreSession();
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

    let text = '';

    if (msgContent.conversation || msgContent.extendedTextMessage?.text) {
      text = msgContent.conversation || msgContent.extendedTextMessage?.text || '';
      await processTextMessage(from, text, pushName, messageId);
    } else if (msgContent.imageMessage) {
      await processMediaMessage(from, 'image', pushName, messageId, msgContent.imageMessage);
    } else if (msgContent.audioMessage) {
      await processMediaMessage(from, 'audio', pushName, messageId, msgContent.audioMessage);
    }

  } catch (error: any) {
    console.error('Erro ao processar mensagem:', error);
  }
}

async function processTextMessage(from: string, text: string, pushName: string, messageId?: string) {
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
  if (process.env.N8N_WEBHOOK_URL) {
    const axios = (await import('axios')).default;
    try {
      await axios.post(process.env.N8N_WEBHOOK_URL, {
        from,
        fromName: pushName,
        messageType: type,
        messageId,
        caption: mediaContent.caption || '',
      });
    } catch (e: any) {
      console.error('Erro ao enviar para N8N:', e.message);
    }
  }
}

/**
 * Formata número para padrão WhatsApp
 */
function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11 && cleaned.startsWith('55')) {
    cleaned = cleaned;
  } else if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = '55' + cleaned;
  }

  if (cleaned.length === 12 && cleaned.startsWith('55')) {
    const ddd = cleaned.substring(2, 4);
    const dddNum = parseInt(ddd, 10);
    if (dddNum >= 11 && dddNum <= 28) {
      cleaned = cleaned.substring(0, 4) + '9' + cleaned.substring(4);
    }
  }

  return cleaned + '@s.whatsapp.net';
}

/**
 * Envia mensagem de texto
 */
export async function sendMessage(to: string, message: string): Promise<boolean> {
  if (!socket || connectionState !== 'open') {
    console.error('WhatsApp não conectado');
    return false;
  }

  try {
    const jid = formatPhoneNumber(to);
    await socket.sendMessage(jid, { text: message });
    console.log(`✅ Mensagem enviada para ${to}`);
    return true;
  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error);
    return false;
  }
}

/**
 * Envia documento/PDF
 */
export async function sendDocument(to: string, url: string, filename: string): Promise<boolean> {
  if (!socket || connectionState !== 'open') {
    console.error('WhatsApp não conectado');
    return false;
  }

  try {
    const jid = formatPhoneNumber(to);
    await socket.sendMessage(jid, {
      document: { url },
      mimetype: 'application/pdf',
      fileName: filename,
    });
    console.log(`✅ Documento enviado para ${to}`);
    return true;
  } catch (error: any) {
    console.error('Erro ao enviar documento:', error);
    return false;
  }
}

/**
 * Retorna QR Code atual
 */
export function getQRCode(): string | null {
  return qrCode;
}

/**
 * Retorna status da conexão
 */
export function getConnectionStatus(): InternalConnectionState {
  return connectionState;
}

/**
 * Verifica se está conectado
 */
export function isConnected(): boolean {
  return connectionState === 'open';
}

/**
 * Desconecta WhatsApp
 */
export async function disconnect() {
  if (socket) {
    await socket.logout();
    socket = null;
  }
}
