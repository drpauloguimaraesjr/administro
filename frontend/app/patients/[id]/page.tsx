'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

// Components

import { MedicalToolbar } from '@/components/medical-record/medical-toolbar';
import { ImportantData } from '@/components/medical-record/important-data';
import { Timeline } from '@/components/medical-record/timeline';
import { RichEditor } from '@/components/medical-record/rich-editor';

export default function PatientProntuarioPage() {
    const params = useParams();
    const router = useRouter();
    const patientId = params.id as string;

    const { data: patient, isLoading } = useQuery({
        queryKey: ['patient', patientId],
        queryFn: async () => {
            const res = await api.get(`/patients/${patientId}`);
            return res.data;
        },
    });

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!patient) return <div>Paciente não encontrado</div>;

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return undefined;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 overflow-hidden relative">


            {/* Layout Principal Dividido */}
            <div className="flex flex-1 overflow-hidden pb-20"> {/* pb-20 para dar espaço à toolbar fixa */}

                {/* Coluna Esquerda: Histórico e Dados (35%) */}
                <div className="w-[35%] min-w-[350px] max-w-[500px] border-r border-gray-200 bg-white flex flex-col h-full overflow-hidden">
                    {/* Barra de Busca e Ações */}
                    <div className="p-4 border-b border-gray-100 space-y-3 bg-white z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input placeholder="Buscar no prontuário..." className="pl-9 bg-gray-50" />
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="w-full justify-between">
                                Ver Histórico
                            </Button>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Arquivos
                            </Button>
                        </div>
                    </div>

                    {/* Conteúdo Scrollável da Esquerda */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        <ImportantData />
                        <Timeline />
                    </div>
                </div>

                {/* Coluna Direita: Editor (65%) */}
                <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden relative">
                    {/* Header do Editor */}
                    <div className="h-12 border-b border-gray-200 bg-white flex items-center px-4 justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">Área Evolução</span>
                            <span className="text-xs text-gray-400">|</span>
                            <span className="text-sm text-gray-500">{new Date().toLocaleString('pt-BR')}</span>
                        </div>
                        {/* Dropdown ou opções extras aqui */}
                    </div>

                    {/* Editor */}
                    <div className="flex-1 p-4 overflow-hidden">
                        <RichEditor placeholder="Descreva a evolução do paciente..." />
                    </div>

                    {/* Barra de Ações do Editor (Salvar/Cancelar) */}
                    <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="marketing" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                            <label htmlFor="marketing" className="text-sm text-gray-600 cursor-pointer">Sugerir Campanhas de Marketing</label>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm">Cancelar</Button>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                Salvar no histórico
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar Inferior Fixa */}
            <MedicalToolbar />
        </div>
    );
}
