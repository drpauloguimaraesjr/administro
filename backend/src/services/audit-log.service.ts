
import { db } from '../config/firebaseAdmin.js';
import { AuditLog } from '../shared/types/index.js';

const collection = db.collection('audit_logs');

export const AuditLogService = {
    async log(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
        try {
            const timestamp = new Date().toISOString();
            await collection.add({
                ...entry,
                timestamp
            });
        } catch (error) {
            console.error('Failed to write audit log:', error);
            // Non-blocking error, don't crash main flow
        }
    },

    async getByUser(userId: string, limit = 50): Promise<AuditLog[]> {
        try {
            const snapshot = await collection
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            return [];
        }
    }
};
