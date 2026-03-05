import { Request, Response, Router } from 'express';
import { zApiService } from '../services/zapi.service';
import { aiService } from '../services/ai.service';
import admin from 'firebase-admin';

const db = admin.firestore();
const router = Router();

// ============================================
// WEBHOOK Z-API (Recebe as mensagens)
// Deve ser cadastrado no painel Z-API apontando p/ /webhooks/zapi
// ============================================

/**
 * Endpoint que o Z-API vai POSTAR toda vez que receber um WhatsApp.
 * Ele diz quem mandou, texto recebido, e em "instanceId" diz qual funcionario está logado.
 */
router.post('/zapi/receive', async (req: Request, res: Response) => {
    // Retorna rapido pro ZAPI nao dar timeout
    res.status(200).send({ status: 'received' });

    try {
        const body = req.body;

        // Se for status de conexão ou recibo de leitura, ignora (só queremos msg d texto)
        if (!body.isGroup && body.text && !body.fromMe) {
            console.log(`💬 Nova mensagem Z-API no ${body.instanceId} de ${body.phone}:`, body.text.message);

            const phone = body.phone;
            const message = body.text.message;
            const instanceId = body.instanceId;
            const participantName = body.participantName || 'Paciente';

            // 1) Salva a mensagem no Firestore (historico CRM)
            await db.collection('crm_chats').add({
                phone,
                sender: participantName,
                text: message,
                timestamp: new Date(),
                direction: 'inbound',
                instanceId: instanceId, // Sabemos pra qual funcionario foi
            });

            // 2) Puxa as ultimas mensagens desse numero pra dar contexto pra IA
            const snapshot = await db.collection('crm_chats')
                .where('phone', '==', phone)
                .orderBy('timestamp', 'desc')
                .limit(5)
                .get();

            let history: any[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                history.push({
                    role: data.direction === 'inbound' ? 'user' : 'assistant',
                    content: data.text,
                });
            });

            // Ordena cronologicamente pro GPT entender a ordem correta do assunto
            history.reverse();

            // 3) Monta os arrays de mensagens
            const messages = [
                { role: 'system', content: aiService.getBasePrompt('Sua Clínica - Atendimento AI') },
                ...history,
            ];

            // 4) Chama o OpenRouter
            const aiResponse = await aiService.generateResponse(messages as any);

            // 5) Responde pro Z-API (mandando de volta pro Zap do paciente)
            // Aqui vamos usar a variavel vazia pra enviar pela mesma instancia que recebeu
            if (aiResponse) {
                await zApiService.sendMessage(phone, aiResponse, undefined, undefined);

                // 6) Salva nossa resposta no historico tb
                await db.collection('crm_chats').add({
                    phone,
                    sender: 'Atendimento Virtual (IA)',
                    text: aiResponse,
                    timestamp: new Date(),
                    direction: 'outbound',
                    instanceId: instanceId,
                });
            }
        }
    } catch (error) {
        console.error('API /zapi/receive error:', error);
    }
});

// Endpoint pra dashboard (ver se ta logado)
router.get('/zapi/status', async (req: Request, res: Response) => {
    try {
        const result = await zApiService.getStatus();
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint pra dashboard (escanear QR)
router.get('/zapi/qr', async (req: Request, res: Response) => {
    try {
        const qr = await zApiService.getQrCode();
        res.status(200).json({ qr });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
