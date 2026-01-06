/**
 * Configuração do Firebase Admin SDK para uso no Backend
 * Requer service account JSON ou variáveis de ambiente
 */
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
// Inicializa Firebase Admin apenas uma vez
if (!admin.apps.length) {
    try {
        // Opção 1: Usar variáveis separadas (RECOMENDADO para Railway - mais fácil de gerenciar)
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            const serviceAccount = {
                type: 'service_account',
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Converte \n para quebras de linha reais
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
            };
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            });
        }
        // Opção 2: Usar JSON completo em uma variável (compatibilidade)
        else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            });
        }
        // Opção 3: Usar arquivo de service account (desenvolvimento local)
        else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            const serviceAccount = JSON.parse(readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            });
        }
        // Opção 4: Usar Application Default Credentials (GCP)
        else {
            admin.initializeApp({
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            });
        }
        console.log('✅ Firebase Admin inicializado com sucesso');
    }
    catch (error) {
        console.error('❌ Erro ao inicializar Firebase Admin:', error);
        // Não lança erro para permitir que o servidor inicie mesmo sem Firebase
        // (útil durante desenvolvimento inicial)
    }
}
// Usar 'any' temporariamente para evitar problemas de tipo com Node16
export const db = admin.firestore();
export const storage = admin.storage();
export const auth = admin.auth();
export default admin;
//# sourceMappingURL=firebaseAdmin.js.map