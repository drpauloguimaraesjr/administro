/**
 * Rotas para receber mensagens do WhatsApp
 * Suporta: texto, áudio (transcrição), e imagens (via n8n)
 */

import { Router, Request, Response } from 'express';
import { db } from '../config/firebaseAdmin.js';
import { Transaction, TransactionStatus } from '../shared/types/index.js';
import axios from 'axios';
import FormData from 'form-data';

const router = Router();

/**
 * POST /api/whatsapp/message
 * Recebe mensagem do WhatsApp (texto ou áudio)
 */
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { from, fromName, messageType, text, audioUrl, messageId } = req.body;

    if (!from) {
      return res.status(400).json({ error: 'Campo "from" é obrigatório' });
    }

    let textToProcess = '';

    // Processa áudio se for mensagem de voz
    if (messageType === 'audio' && audioUrl) {
      try {
        // Transcreve áudio usando OpenAI Whisper
        const transcription = await transcribeAudio(audioUrl);
        textToProcess = transcription;
        console.log('✅ Áudio transcrito:', transcription);
      } catch (error: any) {
        console.error('❌ Erro ao transcrever áudio:', error);
        return res.status(500).json({
          error: 'Erro ao transcrever áudio',
          message: error.message,
        });
      }
    } else if (messageType === 'text' && text) {
      textToProcess = text;
    } else {
      return res.status(400).json({
        error: 'Tipo de mensagem não suportado ou dados faltando',
        received: { messageType, hasText: !!text, hasAudioUrl: !!audioUrl },
      });
    }

    // Processa o texto para extrair dados da transação
    const transactionData = await extractTransactionFromText(textToProcess, from, fromName);

    if (!transactionData) {
      // Se não conseguir extrair, envia mensagem de ajuda
      await sendWhatsAppMessage(
        from,
        '❓ Não consegui entender. Envie no formato:\n\n💰 R$ 50,00\n📝 Descrição\n🏷️ Categoria\n🏠 Casa ou Clínica\n\nOu envie uma imagem do comprovante!'
      );
      return res.json({
        success: false,
        message: 'Texto não pôde ser processado, mensagem de ajuda enviada',
      });
    }

    // Cria transação
    const transaction: Omit<Transaction, 'id'> = {
      amount: transactionData.amount,
      type: transactionData.type || 'expense',
      status: 'paid' as TransactionStatus,
      date: transactionData.date || new Date(),
      description: transactionData.description || 'Transação via WhatsApp',
      category: transactionData.category || 'Outros',
      contextId: transactionData.contextId || 'HOME',
      createdBy: from,
      createdByName: fromName || 'WhatsApp',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('transactions').add(transaction);

    console.log('✅ Transação criada via WhatsApp:', {
      id: docRef.id,
      amount: transaction.amount,
      type: transaction.type,
      source: messageType === 'audio' ? 'áudio' : 'texto',
    });

    // Envia confirmação
    await sendWhatsAppMessage(
      from,
      `✅ *Transação registrada!*\n\n💰 Valor: R$ ${transaction.amount.toFixed(2)}\n📅 Data: ${new Date(transaction.date).toLocaleDateString('pt-BR')}\n📝 Descrição: ${transaction.description}\n🏷️ Categoria: ${transaction.category}\n🏠 Contexto: ${transaction.contextId === 'HOME' ? 'Casa' : 'Clínica'}\n\n💡 Você pode editar esta transação no sistema.`
    );

    res.json({
      success: true,
      transactionId: docRef.id,
      transaction: {
        ...transaction,
        id: docRef.id,
      },
    });
  } catch (error: any) {
    console.error('❌ Erro ao processar mensagem WhatsApp:', error);
    res.status(500).json({
      error: 'Erro ao processar mensagem',
      message: error.message,
    });
  }
});

/**
 * Transcreve áudio usando OpenAI Whisper
 */
async function transcribeAudio(audioUrl: string): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY não configurada');
  }

  // Baixa o áudio
  const audioResponse = await axios.get(audioUrl, {
    responseType: 'stream',
  });

  // Usa FormData para enviar para OpenAI
  const form = new FormData();
  form.append('file', audioResponse.data, {
    filename: 'audio.ogg',
    contentType: 'audio/ogg',
  });
  form.append('model', 'whisper-1');
  form.append('language', 'pt');

  // Chama API do OpenAI Whisper
  const transcriptionResponse = await axios.post(
    'https://api.openai.com/v1/audio/transcriptions',
    form,
    {
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        ...form.getHeaders(),
      },
    }
  );

  return transcriptionResponse.data.text;
}

/**
 * Extrai dados de transação de um texto
 * Formato esperado:
 * - "R$ 50,00" ou "50 reais" ou "50"
 * - Descrição opcional
 * - Categoria opcional
 * - Contexto: "casa" ou "clínica"
 */
async function extractTransactionFromText(
  text: string,
  from: string,
  fromName?: string
): Promise<{
  amount: number;
  type: 'income' | 'expense';
  date?: Date;
  description?: string;
  category?: string;
  contextId?: 'HOME' | 'CLINIC';
} | null> {
  // Normaliza texto
  const normalizedText = text.toLowerCase().trim();

  // Extrai valor usando regex
  const amountMatch = normalizedText.match(
    /(?:r\$\s*)?(\d+(?:[.,]\d{2})?)|(\d+)\s*(?:reais?|rs?)/i
  );
  if (!amountMatch) {
    return null; // Não encontrou valor
  }

  const amountStr = amountMatch[1] || amountMatch[2];
  const amount = parseFloat(amountStr.replace(',', '.'));

  if (isNaN(amount) || amount <= 0) {
    return null;
  }

  // Detecta tipo (receita ou despesa)
  const isIncome =
    normalizedText.includes('recebi') ||
    normalizedText.includes('ganhei') ||
    normalizedText.includes('entrada') ||
    normalizedText.includes('salário') ||
    normalizedText.includes('salario') ||
    normalizedText.includes('receita');
  const type: 'income' | 'expense' = isIncome ? 'income' : 'expense';

  // Extrai descrição (tenta pegar texto após o valor)
  let description = '';
  const descMatch = text.match(/(?:r\$\s*\d+(?:[.,]\d{2})?|\d+\s*(?:reais?|rs?))\s*(.+?)(?:\n|$)/i);
  if (descMatch && descMatch[1]) {
    description = descMatch[1].trim();
  }

  // Detecta categoria
  let category = 'Outros';
  const categories = {
    alimentação: ['comida', 'alimento', 'supermercado', 'mercado', 'padaria', 'restaurante'],
    transporte: ['combustível', 'combustivel', 'gasolina', 'uber', 'taxi', 'ônibus', 'onibus'],
    saúde: ['farmácia', 'farmacia', 'remédio', 'remedio', 'médico', 'medico', 'hospital', 'clínica', 'clinica'],
    moradia: ['aluguel', 'condomínio', 'condominio', 'luz', 'água', 'agua', 'internet'],
    educação: ['curso', 'escola', 'faculdade', 'livro'],
    lazer: ['cinema', 'show', 'viagem', 'hotel'],
  };

  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => normalizedText.includes(keyword))) {
      category = cat.charAt(0).toUpperCase() + cat.slice(1);
      break;
    }
  }

  // Detecta contexto
  let contextId: 'HOME' | 'CLINIC' = 'HOME';
  if (
    normalizedText.includes('clínica') ||
    normalizedText.includes('clinica') ||
    normalizedText.includes('consultório') ||
    normalizedText.includes('consultorio')
  ) {
    contextId = 'CLINIC';
  }

  // Extrai data se mencionada
  let date: Date | undefined;
  const dateMatch = normalizedText.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    const year = dateMatch[3] ? parseInt(dateMatch[3]) : new Date().getFullYear();
    date = new Date(year, month, day);
  }

  return {
    amount,
    type,
    date,
    description: description || undefined,
    category,
    contextId,
  };
}

/**
 * Envia mensagem via WhatsApp
 */
async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
  try {
    // Tenta usar Baileys primeiro
    const { sendMessage } = await import('../services/whatsapp.js');
    const sent = await sendMessage(to, message);

    if (sent) {
      return;
    }
  } catch (error: any) {
    console.warn('⚠️ Baileys não disponível, tentando webhook externo');
  }

  // Fallback para webhook externo
  const whatsappWebhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  if (!whatsappWebhookUrl) {
    console.warn('⚠️ WHATSAPP_WEBHOOK_URL não configurada, não foi possível enviar mensagem');
    return;
  }

  try {
    await axios.post(`${whatsappWebhookUrl}/send`, {
      to,
      message,
    });
  } catch (error: any) {
    console.error('❌ Erro ao enviar mensagem WhatsApp:', error.message);
    // Não lança erro para não quebrar o fluxo principal
  }
}

/**
 * GET /api/whatsapp/qr
 * Obtém QR Code para conexão WhatsApp
 */
router.get('/qr', (req: Request, res: Response) => {
  try {
    const { getQRCode } = require('../services/whatsapp.js');
    const qr = getQRCode();

    if (!qr) {
      return res.status(404).json({
        error: 'QR Code não disponível',
        message: 'Aguarde alguns segundos ou verifique se o WhatsApp já está conectado',
      });
    }

    res.json({
      success: true,
      qrCode: qr,
      message: 'Escaneie este QR Code com o WhatsApp',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Erro ao obter QR Code',
      message: error.message,
    });
  }
});

/**
 * GET /api/whatsapp/status
 * Obtém status da conexão WhatsApp
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const { getConnectionState, isConnected } = require('../services/whatsapp.js');
    const state = getConnectionState();
    const connected = isConnected();

    // Busca status do Firestore também
    let firestoreStatus: any = null;
    try {
      const statusDoc = await db.collection('whatsapp_status').doc('connection').get();
      if (statusDoc.exists) {
        firestoreStatus = statusDoc.data();
      }
    } catch (error) {
      // Ignora erro do Firestore
    }

    res.json({
      success: true,
      connected,
      state,
      qrCode: firestoreStatus?.qrCode || null,
      updatedAt: firestoreStatus?.updatedAt || null,
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Erro ao obter status',
      message: error.message,
    });
  }
});

/**
 * POST /api/whatsapp/send-document
 * Generates prescription PDF and sends it as a WhatsApp document
 */
router.post('/send-document', async (req: Request, res: Response) => {
  try {
    const { phone, patientId, prescriptionId, prescriptionType, patientName } = req.body;

    if (!phone || !patientId || !prescriptionId) {
      return res.status(400).json({
        error: 'Campos obrigatórios: phone, patientId, prescriptionId',
      });
    }

    // Generate PDF
    const { generatePrescriptionPdf, savePdfToStorage } = await import('../services/prescription-pdf.service.js');
    const pdfBytes = await generatePrescriptionPdf(patientId, prescriptionId, prescriptionType || 'simples');

    // Save to Storage
    const storageUrl = await savePdfToStorage(patientId, prescriptionId, pdfBytes);

    // Send via WhatsApp
    const { sendDocument } = await import('../services/whatsapp.js');
    const filename = `Receita - ${patientName || 'Paciente'}.pdf`;
    const sent = await sendDocument(phone, storageUrl, filename);

    if (!sent) {
      return res.status(503).json({
        error: 'WhatsApp não conectado. Verifique a conexão.',
        storageUrl,
      });
    }

    res.json({
      success: true,
      storageUrl,
      message: `Receita enviada para ${phone}`,
    });
  } catch (error: any) {
    console.error('❌ Erro ao enviar documento WhatsApp:', error);
    res.status(500).json({
      error: 'Erro ao enviar documento',
      message: error.message,
    });
  }
});

export default router;

