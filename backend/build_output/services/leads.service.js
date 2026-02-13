import { db } from '../config/firebaseAdmin.js';
import { sendMessage, isConnected } from './whatsapp.js';
const collection = db.collection('leads');
export const LeadsService = {
    async getAll() {
        const snapshot = await collection.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async getById(id) {
        const doc = await collection.doc(id).get();
        if (!doc.exists)
            return null;
        return { id: doc.id, ...doc.data() };
    },
    async create(data) {
        const now = new Date().toISOString();
        const cleanData = {
            ...data,
            createdAt: now,
            updatedAt: now,
            stageHistory: [], // Inicia histórico vazio se não vier
            interactions: [] // Inicia interações vazias
        };
        // Auto-calculo inicial de score poderia vir aqui
        // cleanData.score = calculateScore(cleanData);
        const docRef = await collection.add(cleanData);
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    },
    async update(id, data) {
        const docRef = collection.doc(id);
        const doc = await docRef.get();
        if (!doc.exists)
            return null;
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };
        await docRef.update(updateData);
        const updated = await docRef.get();
        return { id: updated.id, ...updated.data() };
    },
    async delete(id) {
        await collection.doc(id).delete();
        return true;
    },
    async updateStage(id, newStage, userId) {
        const docRef = collection.doc(id);
        const doc = await docRef.get();
        if (!doc.exists)
            throw new Error('Lead not found');
        const leadData = doc.data();
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
                }
                else {
                    console.warn('⚠️ Automação falhou: WhatsApp não conectado.');
                }
            }
            // Trigger: Quando move para 'contacted' (exemplo de boas vindas)
            if (newStage === 'contacted' && oldStage === 'first_contact' && leadData.phone) {
                // Poderia enviar outra mensagem aqui
            }
        }
    },
    // Atribuir lead a um membro da equipe
    async assignTo(id, assignedTo) {
        const docRef = collection.doc(id);
        const doc = await docRef.get();
        if (!doc.exists)
            throw new Error('Lead not found');
        const updateData = {
            updatedAt: new Date().toISOString(),
        };
        if (assignedTo) {
            updateData.assignedTo = assignedTo;
            updateData.assignedAt = new Date().toISOString();
        }
        else {
            // Remove atribuição
            updateData.assignedTo = null;
            updateData.assignedAt = null;
        }
        await docRef.update(updateData);
        console.log(`✅ Lead ${id} atribuído para: ${assignedTo || 'ninguém'}`);
    }
};
//# sourceMappingURL=leads.service.js.map