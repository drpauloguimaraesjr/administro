// lib/patient-scoring.ts
// Sistema de classificação de pacientes por score (AAA, AA, A, B, C)
// FOCO: Valor de negócio (gasto, ticket médio, família, indicações, tempo)

export type PatientGrade = 'AAA' | 'AA' | 'A' | 'B' | 'C';

export interface PatientScoreResult {
    score: number;
    grade: PatientGrade;
    label: string;
    emoji: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

export interface PatientScoreInput {
    // Dados financeiros (PRINCIPAL)
    totalSpent?: number; // Total gasto na clínica (R$)
    averageTicket?: number; // Ticket médio por consulta/procedimento

    // Família e relacionamento
    familyMembersCount?: number; // Quantidade de familiares na clínica
    referralsCount?: number; // Quantidade de indicações feitas

    // Tempo e fidelidade
    createdAt?: string; // Data de cadastro
    lastVisit?: string; // Última visita

    // Extras
    appointmentsCount?: number;
    proceduresCount?: number;
    tags?: string[];
}

// Configuração de pontos baseada em VALOR DE NEGÓCIO
const SCORE_CONFIG = {
    // 1. TOTAL GASTO NA CLÍNICA (até 35 pontos) - PRINCIPAL
    spending: {
        tiers: [
            { min: 50000, points: 35 },  // R$ 50k+ = 35 pts
            { min: 30000, points: 30 },  // R$ 30k+ = 30 pts
            { min: 20000, points: 25 },  // R$ 20k+ = 25 pts
            { min: 10000, points: 20 },  // R$ 10k+ = 20 pts
            { min: 5000, points: 15 },   // R$ 5k+  = 15 pts
            { min: 2000, points: 10 },   // R$ 2k+  = 10 pts
            { min: 1000, points: 5 },    // R$ 1k+  = 5 pts
            { min: 0, points: 0 },
        ],
    },

    // 2. TICKET MÉDIO (até 15 pontos)
    averageTicket: {
        tiers: [
            { min: 5000, points: 15 },  // R$ 5k+ = 15 pts
            { min: 3000, points: 12 },  // R$ 3k+ = 12 pts
            { min: 2000, points: 10 },  // R$ 2k+ = 10 pts
            { min: 1000, points: 7 },   // R$ 1k+ = 7 pts
            { min: 500, points: 5 },    // R$ 500+ = 5 pts
            { min: 0, points: 0 },
        ],
    },

    // 3. MEMBROS DA FAMÍLIA NA CLÍNICA (até 20 pontos)
    familyMembers: {
        pointsPerMember: 5,  // +5 pts por familiar
        maxPoints: 20,        // máximo 20 pts (4 familiares)
    },

    // 4. INDICAÇÕES (até 15 pontos)
    referrals: {
        pointsPerReferral: 3, // +3 pts por indicação
        maxPoints: 15,        // máximo 15 pts (5 indicações)
    },

    // 5. TEMPO COMO PACIENTE (até 15 pontos)
    loyalty: {
        pointsPerYear: 3,    // +3 pts por ano
        maxPoints: 15,       // máximo 15 pts (5 anos)
    },
};

// Total máximo possível: 35 + 15 + 20 + 15 + 15 = 100 pontos

// Classificação por faixas
const GRADE_CONFIG: Record<PatientGrade, { min: number; max: number; label: string; emoji: string; color: string; bgColor: string; borderColor: string }> = {
    'AAA': { min: 80, max: 100, label: 'VIP', emoji: '🥇', color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-300' },
    'AA': { min: 60, max: 79, label: 'Ouro', emoji: '🥈', color: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' },
    'A': { min: 40, max: 59, label: 'Prata', emoji: '🥉', color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-300' },
    'B': { min: 20, max: 39, label: 'Regular', emoji: '⭐', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
    'C': { min: 0, max: 19, label: 'Atenção', emoji: '⚠️', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-300' },
};

/**
 * Calcula o score de um paciente baseado em VALOR DE NEGÓCIO
 */
export function calculatePatientScore(input: PatientScoreInput): PatientScoreResult {
    let score = 0;
    const now = new Date();

    // 1. TOTAL GASTO NA CLÍNICA (peso 35% - principal critério)
    if (input.totalSpent !== undefined) {
        for (const tier of SCORE_CONFIG.spending.tiers) {
            if (input.totalSpent >= tier.min) {
                score += tier.points;
                break;
            }
        }
    }

    // 2. TICKET MÉDIO (peso 15%)
    if (input.averageTicket !== undefined) {
        for (const tier of SCORE_CONFIG.averageTicket.tiers) {
            if (input.averageTicket >= tier.min) {
                score += tier.points;
                break;
            }
        }
    }

    // 3. MEMBROS DA FAMÍLIA NA CLÍNICA (peso 20%)
    if (input.familyMembersCount) {
        const familyPts = Math.min(
            input.familyMembersCount * SCORE_CONFIG.familyMembers.pointsPerMember,
            SCORE_CONFIG.familyMembers.maxPoints
        );
        score += familyPts;
    }

    // 4. INDICAÇÕES (peso 15%)
    if (input.referralsCount) {
        const referralPts = Math.min(
            input.referralsCount * SCORE_CONFIG.referrals.pointsPerReferral,
            SCORE_CONFIG.referrals.maxPoints
        );
        score += referralPts;
    }

    // 5. TEMPO COMO PACIENTE (peso 15%)
    if (input.createdAt) {
        const createdDate = new Date(input.createdAt);
        const yearsAsPatient = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        const loyaltyPts = Math.min(
            Math.floor(yearsAsPatient) * SCORE_CONFIG.loyalty.pointsPerYear,
            SCORE_CONFIG.loyalty.maxPoints
        );
        score += loyaltyPts;
    }

    // Garantir que o score fique entre 0 e 100
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Determinar o grade
    const grade = getGradeFromScore(score);
    const gradeConfig = GRADE_CONFIG[grade];

    return {
        score,
        grade,
        label: gradeConfig.label,
        emoji: gradeConfig.emoji,
        color: gradeConfig.color,
        bgColor: gradeConfig.bgColor,
        borderColor: gradeConfig.borderColor,
    };
}

/**
 * Determina o grade (AAA, AA, A, B, C) baseado no score
 */
export function getGradeFromScore(score: number): PatientGrade {
    if (score >= 80) return 'AAA';
    if (score >= 60) return 'AA';
    if (score >= 40) return 'A';
    if (score >= 20) return 'B';
    return 'C';
}

/**
 * Retorna as informações de estilo do grade
 */
export function getGradeInfo(grade: PatientGrade) {
    return GRADE_CONFIG[grade];
}

/**
 * Lista todos os grades disponíveis
 */
export function getAllGrades() {
    return Object.entries(GRADE_CONFIG).map(([grade, config]) => ({
        grade: grade as PatientGrade,
        ...config,
    }));
}

/**
 * Calcula breakdown detalhado do score
 */
export function getScoreBreakdown(input: PatientScoreInput) {
    const now = new Date();

    let spendingPoints = 0;
    if (input.totalSpent !== undefined) {
        for (const tier of SCORE_CONFIG.spending.tiers) {
            if (input.totalSpent >= tier.min) {
                spendingPoints = tier.points;
                break;
            }
        }
    }

    let ticketPoints = 0;
    if (input.averageTicket !== undefined) {
        for (const tier of SCORE_CONFIG.averageTicket.tiers) {
            if (input.averageTicket >= tier.min) {
                ticketPoints = tier.points;
                break;
            }
        }
    }

    const familyPoints = input.familyMembersCount
        ? Math.min(input.familyMembersCount * SCORE_CONFIG.familyMembers.pointsPerMember, SCORE_CONFIG.familyMembers.maxPoints)
        : 0;

    const referralPoints = input.referralsCount
        ? Math.min(input.referralsCount * SCORE_CONFIG.referrals.pointsPerReferral, SCORE_CONFIG.referrals.maxPoints)
        : 0;

    let loyaltyPoints = 0;
    if (input.createdAt) {
        const createdDate = new Date(input.createdAt);
        const yearsAsPatient = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        loyaltyPoints = Math.min(Math.floor(yearsAsPatient) * SCORE_CONFIG.loyalty.pointsPerYear, SCORE_CONFIG.loyalty.maxPoints);
    }

    return {
        totalSpent: { points: spendingPoints, maxPoints: 35, value: input.totalSpent || 0 },
        averageTicket: { points: ticketPoints, maxPoints: 15, value: input.averageTicket || 0 },
        familyMembers: { points: familyPoints, maxPoints: 20, count: input.familyMembersCount || 0 },
        referrals: { points: referralPoints, maxPoints: 15, count: input.referralsCount || 0 },
        loyalty: { points: loyaltyPoints, maxPoints: 15, years: input.createdAt ? Math.floor((now.getTime() - new Date(input.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 0 },
    };
}
