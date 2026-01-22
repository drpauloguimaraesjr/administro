'use client';

import { UserCircle, FileText, Activity, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PatientHeaderProps {
    name: string;
    age?: number; // or birthDate
    gender?: string;
}

export function PatientHeader({ name, age, gender }: PatientHeaderProps) {
    return (
        <div className="bg-white border-b border-gray-200 h-14 flex items-center px-6 justify-between shrink-0">
            <div className="flex items-center gap-3">
                <UserCircle className="w-8 h-8 text-gray-400" />
                <div className="flex items-baseline gap-2">
                    <h1 className="text-lg font-bold text-gray-900">{name}</h1>
                    {age && <span className="text-sm text-gray-500">{age} anos</span>}
                    {gender && <span className="text-sm text-gray-500">• {gender}</span>}
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" title="Histórico">
                    <Clock className="w-5 h-5 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon" title="Exames">
                    <FileText className="w-5 h-5 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon" title="Sinais Vitais">
                    <Activity className="w-5 h-5 text-gray-500" />
                </Button>
            </div>
        </div>
    );
}
