import { db } from '../config/firebaseAdmin.js';
const COLLECTION = 'whatsapp_queues';
export const WhatsAppQueuesService = {
    async getAll() {
        const snapshot = await db.collection(COLLECTION).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async getById(id) {
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists)
            return null;
        return { id: doc.id, ...doc.data() };
    },
    async create(data) {
        const docRef = db.collection(COLLECTION).doc();
        const now = new Date().toISOString();
        const queueData = {
            id: docRef.id,
            ...data,
            createdAt: now,
            isActive: true,
            priority: data.priority || 1,
            assignmentType: data.assignmentType || 'manual',
            assignedUsers: data.assignedUsers || []
        };
        await docRef.set(queueData);
        return queueData;
    },
    async update(id, data) {
        const docRef = db.collection(COLLECTION).doc(id);
        await docRef.update(data);
        const updated = await docRef.get();
        return { id: updated.id, ...updated.data() };
    },
    async delete(id) {
        await db.collection(COLLECTION).doc(id).delete();
    },
    /**
     * Inicializa as filas padrão (Seeds) se não existirem
     */
    async seedDefaults() {
        const snapshot = await db.collection(COLLECTION).get();
        if (!snapshot.empty)
            return;
        const DEFAULT_QUEUES = [
            {
                name: "🔥 Aquecimento",
                description: "Primeiros contatos e dúvidas gerais",
                icon: "🔥",
                color: "#FF6B6B",
                priority: 3,
                assignmentType: "least_busy",
                autoReply: {
                    enabled: true,
                    message: "Olá! Obrigado por entrar em contato. Em breve um de nossos atendentes irá responder. 😊",
                    delay: 5
                }
            },
            {
                name: "📅 Confirmação de Consulta",
                description: "Confirmar agendamentos marcados",
                icon: "📅",
                color: "#4ECDC4",
                priority: 4,
                assignmentType: "round_robin",
                autoReply: {
                    enabled: true,
                    message: "Olá! Estamos confirmando sua consulta. Por favor, aguarde.",
                    delay: 3
                }
            },
            {
                name: "🩺 Confirmação de Procedimentos",
                description: "Confirmar procedimentos agendados",
                icon: "🩺",
                color: "#95E1D3",
                priority: 4,
                assignmentType: "manual"
            },
            {
                name: "🚨 Intercorrências e Dúvidas",
                description: "Urgências e dúvidas médicas",
                icon: "🚨",
                color: "#F38181",
                priority: 5,
                assignmentType: "least_busy",
                autoReply: {
                    enabled: true,
                    message: "Recebemos sua mensagem de urgência. Um profissional irá atendê-lo em instantes.",
                    delay: 2
                }
            },
            {
                name: "💊 Elaboração de Receitas",
                description: "Solicitações de receitas médicas com IA",
                icon: "💊",
                color: "#AA96DA",
                priority: 3,
                assignmentType: "ai",
                aiConfig: {
                    enabled: true,
                    model: "gpt-4-turbo",
                    systemPrompt: `Você é um assistente médico especializado em elaborar receitas médicas.`,
                    autoGenerate: true,
                    requireApproval: true
                }
            }
        ];
        const batch = db.batch();
        for (const queue of DEFAULT_QUEUES) {
            const docRef = db.collection(COLLECTION).doc();
            batch.set(docRef, {
                id: docRef.id,
                ...queue,
                isActive: true,
                createdAt: new Date().toISOString(),
                assignedUsers: []
            });
        }
        await batch.commit();
        console.log('✅ Filas padrão criadas com sucesso!');
    }
};
//# sourceMappingURL=whatsapp-queues.service.js.map