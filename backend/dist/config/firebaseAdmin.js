/**
 * Configuração do Firebase Admin SDK
 */
import admin from 'firebase-admin';
// Inicializa Firebase Admin se ainda não foi inicializado
if (!admin.apps.length) {
    try {
        // Tenta usar variáveis de ambiente separadas primeiro
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        if (projectId && privateKey && clientEmail) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    privateKey,
                    clientEmail,
                }),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            });
            console.log('✅ Firebase Admin inicializado com variáveis separadas');
        }
        else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            // Fallback para JSON completo
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            });
            console.log('✅ Firebase Admin inicializado com JSON completo');
        }
        else {
            console.warn('⚠️ Firebase Admin não configurado - variáveis de ambiente faltando');
        }
    }
    catch (error) {
        console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
    }
}
export const db = admin.firestore();
export const storage = admin.storage();
export const auth = admin.auth();
export default admin;
//# sourceMappingURL=firebaseAdmin.js.map