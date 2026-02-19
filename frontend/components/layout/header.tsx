'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { LogOut, User, Calendar, Clock, FileText, Activity } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function useGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
}

function useClock(): string {
    const [time, setTime] = useState('');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setTime(
                now.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                })
            );
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, []);

    return time;
}

function calculateAge(birthDate: string): number | null {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function formatPatientSince(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

export function Header() {
    const { user, logout } = useAuth();
    const greeting = useGreeting();
    const clock = useClock();
    const pathname = usePathname();

    // Detect patient route: /patients/[id] or /patients/[id]/prescription etc.
    const patientId = useMemo(() => {
        const match = pathname.match(/\/patients\/([^/]+)/);
        return match ? match[1] : null;
    }, [pathname]);

    // Fetch patient data when on a patient route
    const { data: patient } = useQuery({
        queryKey: ['patient-header', patientId],
        queryFn: async () => {
            const res = await api.get(`/patients/${patientId}`);
            return res.data;
        },
        enabled: !!patientId,
        staleTime: 60_000,
    });

    const isPatientPage = !!patientId && !!patient;

    return (
        <div className="flex flex-1 items-center justify-between">
            {/* Left — Patient Info or Greeting */}
            {isPatientPage ? (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                    <div className="flex flex-col">
                        <h2 className="font-serif text-lg font-semibold text-foreground tracking-tight leading-tight">
                            {patient.name}
                        </h2>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {patient.birthDate && (
                                <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {calculateAge(patient.birthDate)} anos
                                </span>
                            )}
                            {patient.createdAt && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Paciente desde {formatPatientSince(patient.createdAt)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <h2 className="font-serif text-xl font-semibold text-foreground tracking-tight">
                    {greeting}, {user?.displayName?.split(' ')[0] || 'Dr.'}
                </h2>
            )}

            {/* Right — Patient Actions + Mono Clock + Logout */}
            <div className="flex items-center gap-4">
                {isPatientPage && (
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" title="Histórico" className="h-8 w-8">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Exames" className="h-8 w-8">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Sinais Vitais" className="h-8 w-8">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <div className="h-4 w-px bg-border" />
                    </div>
                )}

                <span className="mono-label text-muted-foreground">
                    {clock}
                </span>

                <div className="h-4 w-px bg-border" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground font-mono text-xs uppercase tracking-widest h-8 px-2"
                        >
                            Menu
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="font-mono text-xs uppercase tracking-wider">
                            Conta
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="font-mono text-xs">
                            Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem className="font-mono text-xs">
                            Configurações
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer font-mono text-xs"
                            onClick={logout}
                        >
                            <LogOut className="w-3.5 h-3.5 mr-2" />
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

