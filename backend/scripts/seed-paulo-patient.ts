import 'dotenv/config';
import { db, auth } from '../src/config/firebaseAdmin.js';

async function seedPauloPatient() {
    console.log('Iniciando cadastro do paciente Paulo...');

    const email = 'guimaraesjrpaulo@gmail.com';
    let userRecord;
    let patientId = '';

    // 1. Verificar se usuário existe no Auth
    try {
        userRecord = await auth.getUserByEmail(email);
        console.log(`Usuário encontrado no Auth: ${userRecord.uid}`);
    } catch (e: any) {
        if (e.code === 'auth/user-not-found') {
            console.log('Usuário não encontrado no Auth, criando...');
            userRecord = await auth.createUser({
                email,
                password: 'password123', // Senha padrão caso não exista
                displayName: 'Paulo Coelho Guimarães Jr.',
            });
            console.log(`Usuário criado no Auth com sucesso: ${userRecord.uid}`);
        } else {
            console.error('Erro ao buscar usuário no Auth:', e);
            throw e;
        }
    }

    // 2. Procurar se já existe na collection patients usando o email
    const patientsSnapshot = await db.collection('patients').where('email', '==', email).get();

    if (patientsSnapshot.empty) {
        console.log('Paciente não encontrado na coleção, criando...');
        const newPatient = {
            name: 'Paulo Coelho Guimarães Jr.',
            gender: 'Masculino',
            birthDate: '1986-07-25',
            cpf: '02389696147',
            phone: '5547992567770',
            email: email,
            address: 'Rua Henrique Meyer',
            prontuario: '132',
            tags: ['Premium', 'VIP'],
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const docRef = await db.collection('patients').add(newPatient);
        patientId = docRef.id;
        console.log(`Criado na coleção patients com ID: ${patientId}`);
    } else {
        patientId = patientsSnapshot.docs[0].id;
        console.log(`Paciente já existe na coleção patients com ID: ${patientId}, atualizando dados...`);
        await db.collection('patients').doc(patientId).update({
            name: 'Paulo Coelho Guimarães Jr.',
            gender: 'Masculino',
            birthDate: '1986-07-25',
            cpf: '02389696147',
            phone: '5547992567770',
            address: 'Rua Henrique Meyer',
            prontuario: '132',
        });
    }

    // 3. Atualizar Custom Claims do usuário
    console.log('Atualizando custom claims para permitir login no portal...');
    await auth.setCustomUserClaims(userRecord.uid, {
        role: 'patient',
        patientId: patientId,
        isPatient: true
    });

    // 4. Inserir dados mockados de Evoluções, Anamnese e Avaliações Físicas
    console.log(`Inserindo dados clínicos e físicos para o paciente ${patientId}...`);

    // Anamnese
    await db.collection('medical_records').doc(patientId).collection('anamnesis').doc('main').set({
        queixaPrincipal: 'Otimização metabólica, ganho de massa magra e perda de percentual de gordura. Relato de cansaço extremo ao fim do dia.',
        historicoPatologico: 'Hipertenso controlado (Losartana 50mg/dia). Sem cirurgias prévias. Genética familiar para DCV.',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
    });

    // Removendo avaliações ou evoluções antigas para evitar duplicação (simplificadamente)
    const evolutionsSnap = await db.collection('medical_records').doc(patientId).collection('evolutions').get();
    for (const doc of evolutionsSnap.docs) { await doc.ref.delete(); }

    const assessmentsSnap = await db.collection('medical_records').doc(patientId).collection('assessments').get();
    for (const doc of assessmentsSnap.docs) { await doc.ref.delete(); }

    // Evoluções
    await db.collection('medical_records').doc(patientId).collection('evolutions').add({
        content: '<p>Paciente apresenta evolução muito satisfatória no último mês. <strong>Adesão de 90%</strong> ao protocolo nutrológico.</p><p>Metabolismo acelerado após ajuste de suplementação.</p>',
        date: new Date().toISOString(),
        doctor: 'Dr. Paulo Guimarães',
        createdBy: 'system'
    });

    await db.collection('medical_records').doc(patientId).collection('evolutions').add({
        content: '<p>Início de acompanhamento focado na longevidade e performance esportiva.</p><p>Foram solicitados exames laboratoriais amplos.</p>',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        doctor: 'Dr. Paulo Guimarães',
        createdBy: 'system'
    });

    // Avaliações Físicas
    await db.collection('medical_records').doc(patientId).collection('assessments').add({
        type: 'bioimpedance',
        date: new Date().toISOString(),
        metrics: {
            weight: 86.4,
            bodyFat: 15.2,
            muscleMass: 42.1,
            visceralFat: 6,
            metabolicAge: 35,
            hydration: 60.1
        }
    });

    await db.collection('medical_records').doc(patientId).collection('assessments').add({
        type: 'calorimetry',
        date: new Date().toISOString(),
        metrics: {
            basalMetabolicRate: 2150,
            totalExpenditure: 3150,
            respiratoryQuotient: 0.85
        }
    });

    console.log('✅ Paciente cadastrado com todos os dados preenchidos!');
    process.exit(0);
}

seedPauloPatient().catch(e => {
    console.error('Erro geral no script:', e);
    process.exit(1);
});
