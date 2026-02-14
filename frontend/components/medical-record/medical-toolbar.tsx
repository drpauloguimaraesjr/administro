'use client';

import {
    Flag, FileEdit, FlaskConical, ImageIcon, BarChart3,
    Video, Sparkles, Bot, LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';

interface ToolbarItemProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick?: () => void;
    active?: boolean;
    color?: string; // class to color icon
}

function ToolbarItem({ icon: Icon, label, onClick, active, color }: ToolbarItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center p-2 min-w-[80px] hover:bg-gray-100 rounded-lg transition-all group",
                active && "bg-primary-50"
            )}
        >
            <div className={cn("p-2 rounded-lg mb-1 group-hover:-translate-y-1 transition-transform", color || "text-gray-600")}>
                <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-gray-700 leading-tight text-center max-w-[90px]">
                {label}
            </span>
        </button>
    );
}

export function MedicalToolbar() {
    const router = useRouter();
    const params = useParams();

    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex items-center justify-center px-4 overflow-x-auto gap-2 md:pl-[240px]">
            <ToolbarItem icon={Flag} label="Finalizar Consulta" color="text-primary" />
            <ToolbarItem
                icon={FileEdit}
                label="Receituário"
                color="text-primary"
                onClick={() => params.id && router.push(`/patients/${params.id}/prescription`)}
            />
            <ToolbarItem icon={FlaskConical} label="Exames" color="text-primary" />
            <ToolbarItem icon={ImageIcon} label="Imagens" color="text-primary" />
            <ToolbarItem icon={BarChart3} label="Percentis" color="text-primary" />

            <div className="w-px h-10 bg-gray-200 mx-2" />

            <ToolbarItem icon={LayoutGrid} label="Todos Módulos" color="text-primary" />
            <ToolbarItem icon={Video} label="Telemedicina" color="text-primary" />
            <ToolbarItem icon={Sparkles} label="Evolução Inteligente" color="text-indigo-600" />
            <ToolbarItem icon={Bot} label="R1 I.A." color="text-purple-500" />
        </div>
    );
}
