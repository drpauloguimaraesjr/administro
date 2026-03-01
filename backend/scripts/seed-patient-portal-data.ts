/**
 * Seed dados realistas para o paciente teste do portal
 * Uso: npx tsx scripts/seed-patient-portal-data.ts
 */

import 'dotenv/config';
import admin from 'firebase-admin';

if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
}

const db = admin.firestore();

const PATIENT_ID = '3H4M5DLfckF2dHuTebJ3';

async function main() {
    console.log('🔧 Inserindo dados de teste para o portal do paciente...\n');

    // === CONSULTAS (appointments) ===
    const appointments = [
        {
            patientId: PATIENT_ID,
            patientName: 'Paulo Guimarães Jr (Teste)',
            date: '2025-08-15',
            startTime: '09:00',
            endTime: '09:30',
            duration: 30,
            type: 'first_visit',
            status: 'completed',
            notes: 'Primeira consulta - avaliação hormonal completa',
            whatsappSent: true,
            reminderSent: true,
            createdAt: '2025-08-10T10:00:00Z',
            updatedAt: '2025-08-15T09:35:00Z',
        },
        {
            patientId: PATIENT_ID,
            patientName: 'Paulo Guimarães Jr (Teste)',
            date: '2025-09-20',
            startTime: '10:00',
            endTime: '10:30',
            duration: 30,
            type: 'return',
            status: 'completed',
            notes: 'Retorno - resultados de exames laboratoriais',
            whatsappSent: true,
            reminderSent: true,
            createdAt: '2025-09-15T08:00:00Z',
            updatedAt: '2025-09-20T10:35:00Z',
        },
        {
            patientId: PATIENT_ID,
            patientName: 'Paulo Guimarães Jr (Teste)',
            date: '2025-11-10',
            startTime: '14:00',
            endTime: '14:45',
            duration: 45,
            type: 'return',
            status: 'completed',
            notes: 'Implantação de pellets hormonais',
            whatsappSent: true,
            reminderSent: true,
            createdAt: '2025-11-01T12:00:00Z',
            updatedAt: '2025-11-10T14:50:00Z',
        },
        {
            patientId: PATIENT_ID,
            patientName: 'Paulo Guimarães Jr (Teste)',
            date: '2026-02-15',
            startTime: '09:30',
            endTime: '10:00',
            duration: 30,
            type: 'return',
            status: 'completed',
            notes: 'Retorno pós-implante - avaliar dosagem',
            whatsappSent: true,
            reminderSent: true,
            createdAt: '2026-02-10T09:00:00Z',
            updatedAt: '2026-02-15T10:05:00Z',
        },
        {
            patientId: PATIENT_ID,
            patientName: 'Paulo Guimarães Jr (Teste)',
            date: '2026-05-10',
            startTime: '11:00',
            endTime: '11:45',
            duration: 45,
            type: 'return',
            status: 'confirmed',
            notes: 'Reimplantação de pellets - 6 meses',
            whatsappSent: false,
            reminderSent: false,
            createdAt: '2026-02-15T10:10:00Z',
            updatedAt: '2026-02-15T10:10:00Z',
        },
    ];

    for (const appt of appointments) {
        const ref = await db.collection('appointments').add(appt);
        console.log(`📅 Consulta: ${appt.date} (${appt.type}) → ${ref.id}`);
    }

    // === APLICAÇÕES / IMPLANTES HORMONAIS ===
    const applications = [
        {
            patientId: PATIENT_ID,
            patientName: 'Paulo Guimarães Jr (Teste)',
            productName: 'Testosterona Cipionato',
            productDetails: 'Implante subcutâneo - Pellet 200mg',
            quantity: 6,
            unit: 'pellets',
            route: 'SC (Subcutâneo)',
            status: 'administered',
            priority: 'routine',
            purchaseConfirmed: true,
            purchaseConfirmedAt: '2025-11-08T14:00:00Z',
            purchaseConfirmedBy: 'Paciente',
            batchNumber: 'TC-2025-0847',
            batchExpiration: '2026-11-30',
            manufacturer: 'Sterling Pharma Solutions',
            administeredBy: 'Dr. Paulo Guimarães',
            administeredAt: '2025-11-10T14:15:00Z',
            applicationSite: 'Região glútea superior D',
            administrationNotes: 'Implantação sob anestesia local. Sem intercorrências.',
            prescribedBy: 'Dr. Paulo Guimarães',
            createdAt: '2025-11-05T09:00:00Z',
            updatedAt: '2025-11-10T14:20:00Z',
        },
        {
            patientId: PATIENT_ID,
            patientName: 'Paulo Guimarães Jr (Teste)',
            productName: 'Gestrinona',
            productDetails: 'Implante subcutâneo - Pellet 75mg',
            quantity: 2,
            unit: 'pellets',
            route: 'SC (Subcutâneo)',
            status: 'administered',
            priority: 'routine',
            purchaseConfirmed: true,
            purchaseConfirmedAt: '2025-11-08T14:00:00Z',
            purchaseConfirmedBy: 'Paciente',
            batchNumber: 'GN-2025-0312',
            batchExpiration: '2026-08-15',
            manufacturer: 'Elmeco Implants',
            administeredBy: 'Dr. Paulo Guimarães',
            administeredAt: '2025-11-10T14:25:00Z',
            applicationSite: 'Região glútea superior E',
            administrationNotes: 'Implantação conjunta com testosterona.',
            prescribedBy: 'Dr. Paulo Guimarães',
            createdAt: '2025-11-05T09:00:00Z',
            updatedAt: '2025-11-10T14:30:00Z',
        },
        {
            patientId: PATIENT_ID,
            patientName: 'Paulo Guimarães Jr (Teste)',
            productName: 'Oxandrolona',
            productDetails: 'Implante subcutâneo - Pellet 40mg',
            quantity: 4,
            unit: 'pellets',
            route: 'SC (Subcutâneo)',
            status: 'administered',
            priority: 'routine',
            purchaseConfirmed: true,
            purchaseConfirmedAt: '2025-11-08T14:00:00Z',
            purchaseConfirmedBy: 'Paciente',
            batchNumber: 'OX-2025-0589',
            batchExpiration: '2027-01-20',
            manufacturer: 'BioIdentical Solutions',
            administeredBy: 'Dr. Paulo Guimarães',
            administeredAt: '2025-11-10T14:30:00Z',
            applicationSite: 'Região glútea superior D',
            administrationNotes: 'Complemento do protocolo hormonal.',
            prescribedBy: 'Dr. Paulo Guimarães',
            createdAt: '2025-11-05T09:00:00Z',
            updatedAt: '2025-11-10T14:35:00Z',
        },
        {
            patientId: PATIENT_ID,
            patientName: 'Paulo Guimarães Jr (Teste)',
            productName: 'Testosterona Cipionato',
            productDetails: 'Reimplante - Pellet 200mg',
            quantity: 6,
            unit: 'pellets',
            route: 'SC (Subcutâneo)',
            status: 'scheduled',
            priority: 'routine',
            purchaseConfirmed: false,
            scheduledFor: '2026-05-10T11:00:00Z',
            prescribedBy: 'Dr. Paulo Guimarães',
            createdAt: '2026-02-15T10:10:00Z',
            updatedAt: '2026-02-15T10:10:00Z',
        },
    ];

    for (const app of applications) {
        const ref = await db.collection('applications').add(app);
        console.log(`💉 Aplicação: ${app.productName} (${app.status}) → ${ref.id}`);
    }

    // === PRESCRIÇÕES ===
    const prescriptions = [
        {
            title: 'Protocolo Hormonal - Implantes Subcutâneos',
            type: 'controlada',
            status: 'finalized',
            content: '<p>Testosterona Cipionato 200mg x6 pellets SC<br>Gestrinona 75mg x2 pellets SC<br>Oxandrolona 40mg x4 pellets SC</p>',
            createdAt: '2025-11-05T09:00:00Z',
            updatedAt: '2025-11-10T14:50:00Z',
        },
        {
            title: 'Exames Laboratoriais - Controle Hormonal',
            type: 'simples',
            status: 'finalized',
            content: '<p>Testosterona Total e Livre<br>SHBG<br>Estradiol<br>PSA Total<br>Hemograma Completo<br>Perfil Lipídico<br>TGO/TGP<br>Creatinina</p>',
            createdAt: '2026-02-15T10:00:00Z',
            updatedAt: '2026-02-15T10:00:00Z',
        },
    ];

    for (const rx of prescriptions) {
        const ref = await db.collection('medical_records').doc(PATIENT_ID).collection('prescriptions').add(rx);
        console.log(`💊 Prescrição: ${rx.title} → ${ref.id}`);
    }

    console.log('\n🎉 Dados de teste inseridos com sucesso!');
    console.log(`📊 ${appointments.length} consultas, ${applications.length} aplicações, ${prescriptions.length} prescrições`);

    process.exit(0);
}

main().catch(err => { console.error('❌', err); process.exit(1); });
