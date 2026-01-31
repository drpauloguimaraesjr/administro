'use client';

import { cn } from '@/lib/utils';
import {
    calculatePatientScore,
    PatientScoreInput,
    PatientGrade,
    getGradeInfo
} from '@/lib/patient-scoring';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface PatientScoreBadgeProps {
    patient: PatientScoreInput;
    showScore?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function PatientScoreBadge({
    patient,
    showScore = true,
    size = 'md',
    className
}: PatientScoreBadgeProps) {
    const result = calculatePatientScore(patient);

    const sizeClasses = {
        sm: 'text-[10px] px-1.5 py-0.5',
        md: 'text-xs px-2 py-1',
        lg: 'text-sm px-3 py-1.5',
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge
                        variant="outline"
                        className={cn(
                            sizeClasses[size],
                            result.bgColor,
                            result.color,
                            result.borderColor,
                            'font-bold cursor-help',
                            className
                        )}
                    >
                        <span className="mr-1">{result.emoji}</span>
                        {result.grade}
                        {showScore && size !== 'sm' && (
                            <span className="ml-1 opacity-70">({result.score})</span>
                        )}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="p-3 max-w-xs">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{result.emoji}</span>
                            <div>
                                <p className="font-bold">Classificação: {result.grade}</p>
                                <p className="text-xs text-gray-500">{result.label} • {result.score} pontos</p>
                            </div>
                        </div>
                        <div className="text-xs text-gray-600">
                            <p>Score baseado em:</p>
                            <ul className="list-disc list-inside mt-1 space-y-0.5">
                                <li>Frequência de consultas</li>
                                <li>Tempo como paciente</li>
                                <li>Indicações</li>
                                <li>Histórico de pagamento</li>
                            </ul>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

interface PatientScoreCardProps {
    patient: PatientScoreInput;
    className?: string;
}

export function PatientScoreCard({ patient, className }: PatientScoreCardProps) {
    const result = calculatePatientScore(patient);

    return (
        <div className={cn(
            'p-4 rounded-lg border-2',
            result.bgColor,
            result.borderColor,
            className
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{result.emoji}</span>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={cn('text-2xl font-bold', result.color)}>
                                {result.grade}
                            </span>
                            <span className={cn('text-sm', result.color)}>
                                {result.label}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            {result.score} pontos
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-24">
                    <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                        <div
                            className={cn('h-full rounded-full transition-all',
                                result.score >= 80 ? 'bg-amber-500' :
                                    result.score >= 60 ? 'bg-yellow-500' :
                                        result.score >= 40 ? 'bg-slate-500' :
                                            result.score >= 20 ? 'bg-blue-500' : 'bg-red-500'
                            )}
                            style={{ width: `${result.score}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-center mt-1 text-gray-500">{result.score}/100</p>
                </div>
            </div>
        </div>
    );
}

// Componente inline compacto para listas
interface PatientGradeBadgeProps {
    grade: PatientGrade;
    size?: 'xs' | 'sm' | 'md';
    className?: string;
}

export function PatientGradeBadge({ grade, size = 'sm', className }: PatientGradeBadgeProps) {
    const info = getGradeInfo(grade);

    const sizeClasses = {
        xs: 'text-[9px] px-1 py-0',
        sm: 'text-[10px] px-1.5 py-0.5',
        md: 'text-xs px-2 py-1',
    };

    return (
        <Badge
            variant="outline"
            className={cn(
                sizeClasses[size],
                info.bgColor,
                info.color,
                info.borderColor,
                'font-bold',
                className
            )}
        >
            {info.emoji} {grade}
        </Badge>
    );
}
