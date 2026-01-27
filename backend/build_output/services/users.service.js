import { db, auth } from '../config/firebaseAdmin.js';
import { ROLE_PERMISSIONS } from '../shared/types/index.js';
const collection = db.collection('users');
export const UsersService = {
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
        // 1. Criar usuário no Firebase Auth
        const userRecord = await auth.createUser({
            email: data.email,
            password: data.password || 'Mudar123!', // Senha temporária padrão
            displayName: data.name,
            disabled: false,
        });
        // 2. Definir permissões baseadas no cargo
        const permissions = ROLE_PERMISSIONS[data.role] || [];
        const userData = {
            ...data,
            permissions,
            // @ts-ignore - Removendo senha do objeto que vai pro Firestore
            password: undefined,
            id: userRecord.uid, // Usar mesmo ID do Auth
            isActive: true,
            lastLoginAt: undefined,
            createdAt: now,
            contexts: data.contexts || ['CLINIC'], // Default context
            hasAgenda: data.hasAgenda || false,
            canAnswerWhatsApp: data.canAnswerWhatsApp || false,
            whatsappQueues: data.whatsappQueues || []
        };
        // 3. Salvar no Firestore com o UID do Auth
        await collection.doc(userRecord.uid).set(userData);
        return { id: userRecord.uid, ...userData };
    },
    async update(id, data) {
        const docRef = collection.doc(id);
        const doc = await docRef.get();
        if (!doc.exists)
            return null;
        // Se mudou o cargo, atualiza permissões
        let permissions = doc.data()?.permissions;
        if (data.role && data.role !== doc.data()?.role) {
            permissions = ROLE_PERMISSIONS[data.role] || [];
        }
        const updateData = {
            ...data,
            permissions: permissions || doc.data()?.permissions,
            // Não permitir alterar id ou createdAt
            id: undefined,
            createdAt: undefined
        };
        // Remove undefined keys
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        // Atualizar Auth se mudou email ou nome
        if (data.email || data.name) {
            try {
                await auth.updateUser(id, {
                    email: data.email,
                    displayName: data.name
                });
            }
            catch (e) {
                console.error('Erro ao atualizar Auth:', e);
            }
        }
        await docRef.update(updateData);
        const updated = await docRef.get();
        return { id: updated.id, ...updated.data() };
    },
    async delete(id) {
        try {
            await auth.deleteUser(id);
            await collection.doc(id).delete();
            return true;
        }
        catch (error) {
            console.error('Erro ao deletar usuário:', error);
            throw error;
        }
    },
    async resetPassword(id) {
        const link = await auth.generatePasswordResetLink(id);
        // Em produção, aqui enviaria o email via SendGrid/Resend
        // Por enquanto retorna o link para teste
        return link;
    }
};
//# sourceMappingURL=users.service.js.map