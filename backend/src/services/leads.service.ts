
import { db } from '../config/firebaseAdmin.js';
import { Lead } from '../shared/types/index.js';
import { sendMessage, isConnected } from './whatsapp.js';

const collection = db.collection('leads');

export const LeadsService = {
    async getAll(): Promise<Lead[]> {
        const snapshot = await collection.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
    },

    async getById(id: string): Promise<Lead | null> {
        const doc = await collection.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as Lead;
    },

    async create(data: Omit<Lead, 'id'>): Promise<Lead> {
        const now = new Date().toISOString();
        const cleanData = {
            ...data,
            createdAt: now,
            updatedAt: now,
            stageHistory: [], // Inicia histórico vazio se não vier
            interactions: []  // Inicia interações vazias
        };

        // Auto-calculo inicial de score poderia vir aqui
        // cleanData.score = calculateScore(cleanData);

        const docRef = await collection.add(cleanData);
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() } as Lead;
    },

    async update(id: string, data: Partial<Lead>): Promise<Lead | null> {
        const docRef = collection.doc(id);
        const doc = await docRef.get();
        if (!doc.exists) return null;

        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };

        await docRef.update(updateData);
        const updated = await docRef.get();
        return { id: updated.id, ...updated.data() } as Lead;
    },

    async delete(id: string): Promise<boolean> {
        await collection.doc(id).delete();
        return true;
    },

    async updateStage(id: string, newStage: string, userId: string): Promise<void> {
        const docRef = collection.doc(id);
        const doc = await docRef.get();
        if (!doc.exists) throw new Error('Lead not found');

        const leadData = doc.data() as Lead;
        const oldStage = leadData.stage;

        if (oldStage !== newStage) {
            await docRef.update({
                stage: newStage,
                stageUpdatedAt: new Date().toISOString(),
            });

            // --- AUTOMATIONS ---
            // Trigger: Quando move para 'scheduled'
            if (newStage === 'scheduled' && leadData.phone) {
                if (isConnected()) {
                    const message = `Olá ${leadData.name || ''}, confirmamos que seu agendamento foi iniciado. Em breve enviaremos os detalhes!`;
                    console.log(`🤖 Automação: Enviando mensagem para ${leadData.phone}`);
                    await sendMessage(leadData.phone, message);
                } else {
                    console.warn('⚠️ Automação falhou: WhatsApp não conectado.');
                }
            }

            // Trigger: Quando move para 'contacted' (exemplo de boas vindas)
            if (newStage === 'contacted' && oldStage === 'new' && leadData.phone) {
                // Poderia enviar outra mensagem aqui
            }
        }
    }
};
