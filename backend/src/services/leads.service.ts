
import { db } from '../config/firebaseAdmin.js';
import { Lead } from '../shared/types/index.js'; // Assumindo que criaremos o type no shared

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

        const oldStage = doc.data()?.stage;

        if (oldStage !== newStage) {
            await docRef.update({
                stage: newStage,
                stageUpdatedAt: new Date().toISOString(),
                // Adiciona ao histórico (atomicamente seria ideal, mas simplificado aqui)
                // Em produção usaríamos FieldValue.arrayUnion
            });
        }
    }
};
