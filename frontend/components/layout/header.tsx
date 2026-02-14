'use client';

import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
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

export function Header() {
    const { user, logout } = useAuth();
    const greeting = useGreeting();
    const clock = useClock();

    return (
        <div className="flex flex-1 items-center justify-between">
            {/* Left — Serif Greeting */}
            <h2 className="font-serif text-xl font-semibold text-foreground tracking-tight">
                {greeting}, {user?.displayName?.split(' ')[0] || 'Dr.'}
            </h2>

            {/* Right — Mono Clock + Logout */}
            <div className="flex items-center gap-4">
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
