// lib/patient-scoring.ts
// Sistema de classificação de pacientes por score (AAA, AA, A, B, C)

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
    // Dados do paciente
    createdAt?: string;
    lastVisit?: string;
    appointmentsCount?: number;
    referralsCount?: number;
    hasPaymentDelay?: boolean;
    whatsappEngaged?: boolean;
    proceduresCount?: number;
    tags?: string[];
    totalSpent?: number;
}

// Configuração de pontos
const SCORE_CONFIG = {
    // Frequência de consultas nos últimos 12 meses
    appointmentPoints: 10, // +10 pts por consulta
    maxAppointmentPoints: 40, // máximo de 40 pts

    // Tempo como paciente
    yearlyLoyaltyPoints: 5, // +5 pts por ano
    maxLoyaltyPoints: 20, // máximo de 20 pts

    // Indicações
    referralPoints: 15, // +15 pts por indicação
    maxReferralPoints: 30, // máximo de 30 pts

    // Pagamento em dia
    paymentOnTimePoints: 10, // +10 pts

    // Engajamento WhatsApp
    whatsappEngagementPoints: 5, // +5 pts

    // Procedimentos realizados
    procedurePoints: 5, // +5 pts por procedimento
    maxProcedurePoints: 20, // máximo de 20 pts

    // Inatividade (penalidade)
    inactivityPenalty: -10, // -10 pts a cada 90 dias sem consulta

    // Valor gasto
    spendingTiers: [
        { min: 10000, points: 15 },
        { min: 5000, points: 10 },
        { min: 2000, points: 5 },
    ],
};

// Classificação por faixas
const GRADE_CONFIG: Record<PatientGrade, { min: number; max: number; label: string; emoji: string; color: string; bgColor: string; borderColor: string }> = {
    'AAA': { min: 80, max: 100, label: 'VIP', emoji: '🥇', color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-300' },
    'AA': { min: 60, max: 79, label: 'Ouro', emoji: '🥈', color: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' },
    'A': { min: 40, max: 59, label: 'Prata', emoji: '🥉', color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-300' },
    'B': { min: 20, max: 39, label: 'Regular', emoji: '⭐', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
    'C': { min: 0, max: 19, label: 'Atenção', emoji: '⚠️', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-300' },
};

/**
 * Calcula o score de um paciente baseado em múltiplos fatores
 */
export function calculatePatientScore(input: PatientScoreInput): PatientScoreResult {
    let score = 0;
    const now = new Date();

    // 1. Frequência de consultas
    if (input.appointmentsCount) {
        const appointmentPts = Math.min(
            input.appointmentsCount * SCORE_CONFIG.appointmentPoints,
            SCORE_CONFIG.maxAppointmentPoints
        );
        score += appointmentPts;
    }

    // 2. Tempo como paciente (lealdade)
    if (input.createdAt) {
        const createdDate = new Date(input.createdAt);
        const yearsAsPatient = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        const loyaltyPts = Math.min(
            Math.floor(yearsAsPatient) * SCORE_CONFIG.yearlyLoyaltyPoints,
            SCORE_CONFIG.maxLoyaltyPoints
        );
        score += loyaltyPts;
    }

    // 3. Indicações
    if (input.referralsCount) {
        const referralPts = Math.min(
            input.referralsCount * SCORE_CONFIG.referralPoints,
            SCORE_CONFIG.maxReferralPoints
        );
        score += referralPts;
    }

    // 4. Pagamento em dia
    if (!input.hasPaymentDelay) {
        score += SCORE_CONFIG.paymentOnTimePoints;
    }

    // 5. Engajamento WhatsApp
    if (input.whatsappEngaged) {
        score += SCORE_CONFIG.whatsappEngagementPoints;
    }

    // 6. Procedimentos realizados
    if (input.proceduresCount) {
        const procedurePts = Math.min(
            input.proceduresCount * SCORE_CONFIG.procedurePoints,
            SCORE_CONFIG.maxProcedurePoints
        );
        score += procedurePts;
    }

    // 7. Inatividade (penalidade)
    if (input.lastVisit) {
        const lastVisitDate = new Date(input.lastVisit);
        const daysSinceVisit = (now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24);
        const inactivePeriods = Math.floor(daysSinceVisit / 90);
        score += inactivePeriods * SCORE_CONFIG.inactivityPenalty;
    }

    // 8. Valor gasto
    if (input.totalSpent) {
        for (const tier of SCORE_CONFIG.spendingTiers) {
            if (input.totalSpent >= tier.min) {
                score += tier.points;
                break;
            }
        }
    }

    // 9. Bônus por tags especiais
    if (input.tags?.includes('Indicação')) {
        score += 5;
    }

    // Garantir que o score fique entre 0 e 100
    score = Math.max(0, Math.min(100, score));

    // Determinar o grade
    const grade = getGradeFromScore(score);
    const gradeConfig = GRADE_CONFIG[grade];

    return {
        score: Math.round(score),
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
export function getAllGrades(): Array<PatientGrade & { config: typeof GRADE_CONFIG[PatientGrade] }> {
    return Object.entries(GRADE_CONFIG).map(([grade, config]) => ({
        grade: grade as PatientGrade,
        ...config,
    })) as any;
}
