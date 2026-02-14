'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, DollarSign, Smartphone, Calendar, Users, 
    Share2, ClipboardList, Target, Settings, Brain, Activity,
    Pin, PinOff
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils';

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [isPinned, setIsPinned] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const isExpanded = isPinned || isHovered;

    const navItems = [
        { href: '/knowledge', label: 'Cérebro (IA)', icon: Brain },
        { href: '/intercurrences', label: 'Alertas', icon: Activity },
        { href: '/', label: 'Dashboard', icon: Home },
        { href: '/agenda', label: 'Agenda', icon: Calendar },
        { href: '/patients', label: 'Pacientes', icon: Users },
        { href: '/indicacoes', label: 'Indicações', icon: Share2 },
        { href: '/questionarios', label: 'Questionários', icon: ClipboardList },
        { href: '/transactions', label: 'Financeiro', icon: DollarSign },
        { href: '/whatsapp', label: 'WhatsApp', icon: Smartphone },
        { href: '/configuracoes', label: 'Configurações', icon: Settings },
        { href: '/crm', label: 'CRM', icon: Target },
    ];

    const handleMouseEnter = useCallback(() => {
        if (!isPinned) setIsHovered(true);
    }, [isPinned]);

    const handleMouseLeave = useCallback(() => {
        if (!isPinned) setIsHovered(false);
    }, [isPinned]);

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "flex flex-col h-full bg-[#1a1a1a] border-r border-[#333] relative z-50",
                "transition-[width] duration-150",
                isExpanded ? "w-[220px]" : "w-[56px]"
            )}
        >
            {/* Brand */}
            <div className={cn(
                "h-14 flex items-center border-b border-[#333] overflow-hidden",
                isExpanded ? "px-4 justify-between" : "px-0 justify-center"
            )}>
                <Link href="/" className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 bg-[#7c9a72] flex items-center justify-center text-white font-mono text-[10px] font-medium tracking-wider shrink-0">
                        CX
                    </div>
                    {isExpanded && (
                        <span className="font-serif text-lg font-bold text-[#f5f0eb] tracking-tight animate-fade-in">
                            CALYX
                        </span>
                    )}
                </Link>

                {/* Pin Button */}
                {isExpanded && (
                    <button
                        onClick={() => setIsPinned(!isPinned)}
                        className="text-[#918a82] hover:text-[#f5f0eb] transition-colors duration-150 p-1 animate-fade-in"
                        title={isPinned ? 'Desafixar sidebar' : 'Fixar sidebar'}
                    >
                        {isPinned ? (
                            <PinOff className="w-3.5 h-3.5" />
                        ) : (
                            <Pin className="w-3.5 h-3.5" />
                        )}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
                {isExpanded && (
                    <div className="mb-3 px-4 mono-label text-[#918a82] animate-fade-in">
                        Menu
                    </div>
                )}

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={!isExpanded ? item.label : undefined}
                            className={cn(
                                "flex items-center gap-3 relative transition-colors duration-150",
                                isExpanded ? "px-4 py-2.5" : "px-0 py-2.5 justify-center",
                                isActive
                                    ? "text-[#f5f0eb]"
                                    : "text-[#918a82] hover:text-[#d4cec8] hover:bg-[#292929]"
                            )}
                        >
                            {/* Active Indicator — vertical sage bar */}
                            {isActive && (
                                <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-[#7c9a72]" />
                            )}

                            <Icon className={cn(
                                "w-[18px] h-[18px] shrink-0 transition-colors duration-150",
                                isActive ? "text-[#7c9a72]" : ""
                            )} />

                            {isExpanded && (
                                <span className="text-[13px] font-mono font-normal tracking-wide whitespace-nowrap animate-fade-in">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="border-t border-[#333] overflow-hidden">
                <div className={cn(
                    "flex items-center gap-3 py-3",
                    isExpanded ? "px-4" : "justify-center px-0"
                )}>
                    <div className="w-8 h-8 bg-[#292929] border border-[#333] flex items-center justify-center text-[11px] text-[#d4cec8] font-mono font-medium shrink-0">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'D'}
                    </div>

                    {isExpanded && (
                        <div className="overflow-hidden min-w-0 animate-fade-in">
                            <p className="text-[13px] font-serif font-medium text-[#f5f0eb] truncate">
                                {user?.displayName || 'Dr. Usuario'}
                            </p>
                            <p className="text-[10px] font-mono text-[#918a82] truncate tracking-wide">
                                {user?.email || 'admin@calyx.med'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
