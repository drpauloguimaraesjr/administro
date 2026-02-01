// Script para criar leads de teste no CRM
// Execute com: npx ts-node scripts/seed-leads.ts

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializa Firebase (usa as credenciais do ambiente)
const app = initializeApp();
const db = getFirestore(app);

const TEAM_MEMBERS = ['helenita', 'sandra', 'iraciele', 'edilene', 'jeniffer'];

const LEADS_SEED = [
    // LEAD FRIO - Pessoas perguntando sobre serviços
    {
        name: 'Maria Aparecida Silva',
        phone: '46999001001',
        email: 'maria.silva@email.com',
        source: 'whatsapp',
        stage: 'lead_frio',
        urgency: 'low',
        interest: 'Quer saber sobre preços de consulta',
        assignedTo: null,
        tags: ['novo'],
    },
    {
        name: 'João Carlos Pereira',
        phone: '46999002002',
        email: 'joao.pereira@email.com',
        source: 'instagram',
        stage: 'lead_frio',
        urgency: 'medium',
        interest: 'Perguntou sobre procedimentos estéticos',
        assignedTo: 'helenita',
        tags: ['estética'],
    },
    {
        name: 'Ana Paula Costa',
        phone: '46999003003',
        source: 'indication',
        stage: 'lead_frio',
        urgency: 'low',
        interest: 'Indicação da Maria Silva',
        assignedTo: null,
        referredBy: 'Maria Silva',
        tags: ['indicação'],
    },

    // MARCAÇÃO DE CONSULTA - Agendando
    {
        name: 'Roberto Fernandes',
        phone: '46999004004',
        email: 'roberto.f@email.com',
        source: 'whatsapp',
        stage: 'marcacao_consulta',
        urgency: 'high',
        interest: 'Quer consulta urgente - dor',
        assignedTo: 'sandra',
        tags: ['urgente'],
    },
    {
        name: 'Claudia Oliveira',
        phone: '46999005005',
        source: 'phone',
        stage: 'marcacao_consulta',
        urgency: 'medium',
        interest: 'Retorno - exames prontos',
        assignedTo: 'iraciele',
        tags: ['retorno'],
    },

    // CONFIRMAÇÃO DE CONSULTA - 24h antes
    {
        name: 'Fernando Lima',
        phone: '46999006006',
        email: 'fernando.lima@email.com',
        source: 'whatsapp',
        stage: 'confirmacao_consulta',
        urgency: 'medium',
        interest: 'Consulta amanhã 14h',
        assignedTo: 'edilene',
        tags: ['consulta'],
    },
    {
        name: 'Patricia Santos',
        phone: '46999007007',
        source: 'instagram',
        stage: 'confirmacao_consulta',
        urgency: 'low',
        interest: 'Consulta sexta 10h',
        assignedTo: 'helenita',
        tags: ['consulta'],
    },
    {
        name: 'Marcos Rodrigues',
        phone: '46999008008',
        source: 'website',
        stage: 'confirmacao_consulta',
        urgency: 'medium',
        interest: 'Primeira consulta - terça 16h',
        assignedTo: 'jeniffer',
        tags: ['primeira-consulta'],
    },

    // CONFIRMAÇÃO DE PROCEDIMENTO
    {
        name: 'Luciana Almeida',
        phone: '46999009009',
        email: 'luciana.a@email.com',
        source: 'whatsapp',
        stage: 'confirmacao_procedimento',
        urgency: 'high',
        interest: 'Procedimento segunda 8h - precisa jejum',
        assignedTo: 'sandra',
        estimatedValue: 1500,
        tags: ['procedimento', 'jejum'],
    },
    {
        name: 'Carlos Eduardo',
        phone: '46999010010',
        source: 'phone',
        stage: 'confirmacao_procedimento',
        urgency: 'medium',
        interest: 'Pequena cirurgia - quarta 14h',
        assignedTo: 'iraciele',
        estimatedValue: 3000,
        tags: ['cirurgia'],
    },

    // DÚVIDAS E INTERCORRÊNCIAS
    {
        name: 'Adriana Martins',
        phone: '46999011011',
        source: 'whatsapp',
        stage: 'duvidas_intercorrencias',
        urgency: 'high',
        interest: 'Dúvida pós-procedimento - inchaço',
        assignedTo: 'helenita',
        tags: ['pós-op', 'urgente'],
    },
    {
        name: 'Ricardo Souza',
        phone: '46999012012',
        source: 'whatsapp',
        stage: 'duvidas_intercorrencias',
        urgency: 'medium',
        interest: 'Pergunta sobre medicação',
        assignedTo: 'edilene',
        tags: ['medicação'],
    },

    // DR. PAULO - Chamados internos
    {
        name: 'Caso Complexo - Sra. Helena',
        phone: '46999013013',
        source: 'whatsapp',
        stage: 'dr_paulo',
        urgency: 'high',
        interest: 'Helenita precisa de orientação sobre caso',
        assignedTo: null,
        tags: ['chamado-interno', 'complexo'],
    },
    {
        name: 'Autorização Especial - Sr. Antônio',
        phone: '46999014014',
        source: 'phone',
        stage: 'dr_paulo',
        urgency: 'medium',
        interest: 'Sandra solicita autorização para desconto',
        assignedTo: null,
        tags: ['chamado-interno', 'financeiro'],
    },
];

async function seedLeads() {
    console.log('🌱 Iniciando seed de leads...\n');

    const collection = db.collection('leads');
    const now = new Date().toISOString();

    for (const leadData of LEADS_SEED) {
        const lead = {
            ...leadData,
            createdAt: now,
            updatedAt: now,
            stageUpdatedAt: now,
            stageHistory: [],
            interactions: [],
            score: Math.floor(Math.random() * 50) + 30, // Score entre 30-80
        };

        const docRef = await collection.add(lead);
        console.log(`✅ Criado: ${lead.name} (${lead.stage}) -> ${docRef.id}`);
    }

    console.log(`\n🎉 ${LEADS_SEED.length} leads criados com sucesso!`);
}

seedLeads().catch(console.error);
