/**
 * Script para criar paciente teste no portal
 * Uso: npx tsx scripts/create-test-patient.ts
 */

import 'dotenv/config';
import admin from 'firebase-admin';

// Inicializa Firebase
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
}

const db = admin.firestore();
const auth = admin.auth();

async function main() {
    const email = 'guimaraesjrpaulo@gmail.com';
    const password = '123456';
    const patientName = 'Paulo Guimarães Jr (Teste)';

    console.log('🔧 Criando paciente teste...');

    // 1. Cria documento do paciente no Firestore
    const patientRef = await db.collection('patients').add({
        name: patientName,
        email: email,
        phone: '(11) 99999-9999',
        cpf: '000.000.000-00',
        birthDate: '1985-01-15',
        address: 'Rua Teste, 123 - São Paulo/SP',
        tags: ['Teste'],
        status: 'active',
        portalEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    console.log(`✅ Paciente criado no Firestore: ${patientRef.id}`);

    // 2. Cria conta no Firebase Auth
    let userRecord;
    try {
        userRecord = await auth.createUser({
            email,
            password,
            displayName: patientName,
        });
        console.log(`✅ Conta Firebase Auth criada: ${userRecord.uid}`);
    } catch (err: any) {
        if (err.code === 'auth/email-already-exists') {
            console.log('⚠️ Email já existe no Auth, buscando...');
            userRecord = await auth.getUserByEmail(email);
            console.log(`✅ Usuário existente encontrado: ${userRecord.uid}`);
        } else {
            throw err;
        }
    }

    // 3. Seta custom claims: role=patient
    await auth.setCustomUserClaims(userRecord.uid, {
        role: 'patient',
        patientId: patientRef.id,
    });
    console.log(`✅ Custom claims setados: role=patient, patientId=${patientRef.id}`);

    // 4. Atualiza doc do paciente com dados do portal
    await patientRef.update({
        portalEnabled: true,
        portalEmail: email,
        firebaseUid: userRecord.uid,
        portalCreatedAt: new Date().toISOString(),
    });

    console.log('\n🎉 Paciente teste criado com sucesso!');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    console.log('🆔 Patient ID:', patientRef.id);
    console.log('🔗 Acesse: /portal/login');

    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Erro:', err);
    process.exit(1);
});
