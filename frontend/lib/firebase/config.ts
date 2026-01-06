/**
 * Configuração do Firebase Client SDK para uso no Frontend
 * Variáveis de ambiente devem ser configuradas no Vercel
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Validação de variáveis de ambiente
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Verifica se todas as variáveis estão definidas (apenas em desenvolvimento)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Variáveis de ambiente do Firebase não configuradas:', missingVars);
    console.warn('📝 Consulte SETUP.md para configuração');
  }
}

const firebaseConfig: FirebaseConfig = {
  apiKey: requiredEnvVars.apiKey || '',
  authDomain: requiredEnvVars.authDomain || '',
  projectId: requiredEnvVars.projectId || '',
  storageBucket: requiredEnvVars.storageBucket || '',
  messagingSenderId: requiredEnvVars.messagingSenderId || '',
  appId: requiredEnvVars.appId || '',
};

// Inicializa Firebase apenas uma vez (evita múltiplas inicializações)
function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!getApps().length) {
    // Valida se todas as variáveis estão configuradas antes de inicializar
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error('❌ Firebase não configurado: variáveis de ambiente faltando');
      return null;
    }
    return initializeApp(firebaseConfig);
  }
  
  return getApps()[0];
}

function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  const app = getFirebaseApp();
  if (!app) {
    console.error('❌ Firebase App não inicializado. Verifique as variáveis de ambiente.');
    return null;
  }
  try {
    return getAuth(app);
  } catch (error) {
    console.error('❌ Erro ao obter Firebase Auth:', error);
    return null;
  }
}

function getFirestoreDB(): Firestore | null {
  if (typeof window === 'undefined') return null;
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

function getFirebaseStorageInstance(): FirebaseStorage | null {
  if (typeof window === 'undefined') return null;
  const app = getFirebaseApp();
  return app ? getStorage(app) : null;
}

// Exporta as instâncias (podem ser null no servidor)
const app = getFirebaseApp();
const auth = getFirebaseAuth();
const db = getFirestoreDB();
const storage = getFirebaseStorageInstance();

// Validação em runtime
if (typeof window !== 'undefined' && !app) {
  console.error('❌ Firebase não inicializado. Verifique as variáveis de ambiente.');
}

export { app, auth, db, storage };
export default app as FirebaseApp | null;

