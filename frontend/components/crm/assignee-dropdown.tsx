'use client';

import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

// Equipe da clínica - depois virá do banco de dados
export const TEAM_MEMBERS = [
    { id: 'helenita', name: 'Helenita', role: 'Téc. Enfermagem', color: 'bg-pink-500' },
    { id: 'sandra', name: 'Sandra', role: 'Enfermeira', color: 'bg-primary/100' },
    { id: 'iraciele', name: 'Iraciele', role: 'Enfermeira', color: 'bg-primary/100' },
    { id: 'edilene', name: 'Edilene', role: 'Téc. Enfermagem', color: 'bg-primary/100' },
    { id: 'jeniffer', name: 'Jeniffer', role: 'Enfermagem', color: 'bg-orange-500' },
] as const;

export type TeamMemberId = typeof TEAM_MEMBERS[number]['id'] | null;

interface AssigneeDropdownProps {
    value: string | null | undefined;
    onChange: (memberId: string | null) => void;
    disabled?: boolean;
    compact?: boolean;
}

export function AssigneeDropdown({ value, onChange, disabled, compact }: AssigneeDropdownProps) {
    const currentMember = TEAM_MEMBERS.find(m => m.id === value);

    const handleChange = (newValue: string) => {
        if (newValue === 'none') {
            onChange(null);
        } else {
            onChange(newValue);
        }
    };

    return (
        <Select
            value={value || 'none'}
            onValueChange={handleChange}
            disabled={disabled}
        >
            <SelectTrigger
                className={`
                    ${compact ? 'h-6 text-[10px] px-1.5 py-0' : 'h-8 text-xs px-2'}
                    w-auto min-w-0 border-dashed bg-transparent hover:bg-muted transition-colors
                `}
                onClick={(e) => e.stopPropagation()}
            >
                <SelectValue>
                    {currentMember ? (
                        <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${currentMember.color}`} />
                            <span className="truncate max-w-[60px]">{currentMember.name}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-muted-foreground/70">
                            <User className="w-3 h-3" />
                            <span>Atribuir</span>
                        </div>
                    )}
                </SelectValue>
            </SelectTrigger>
            <SelectContent onClick={(e) => e.stopPropagation()}>
                <SelectItem value="none">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-3 h-3" />
                        </div>
                        <span>Ninguém</span>
                    </div>
                </SelectItem>
                {TEAM_MEMBERS.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                            <Avatar className={`w-5 h-5 ${member.color}`}>
                                <AvatarFallback className="text-[10px] text-white font-medium">
                                    {member.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{member.name}</span>
                                <span className="text-[10px] text-muted-foreground/70">{member.role}</span>
                            </div>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

// Badge para exibir quem está atribuído (versão compacta para o card)
export function AssigneeBadge({ memberId }: { memberId: string | null | undefined }) {
    if (!memberId) {
        return (
            <span className="text-[10px] text-muted-foreground/70 italic">
                Sem responsável
            </span>
        );
    }

    const member = TEAM_MEMBERS.find(m => m.id === memberId);
    if (!member) return null;

    return (
        <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${member.color}`} />
            <span className="text-[10px] font-medium text-muted-foreground">
                {member.name}
            </span>
        </div>
    );
}
