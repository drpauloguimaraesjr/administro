'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowLeft, Printer, Copy, Plus, ArrowRightCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import api from '@/lib/api';

import { PatientHeader } from '@/components/medical-record/patient-header';
import { RichEditor } from '@/components/medical-record/rich-editor';

export default function PrescriptionPage() {
    const params = useParams();
    const router = useRouter();
    const patientId = params.id as string;

    const { data: patient } = useQuery({
        queryKey: ['patient', patientId],
        queryFn: async () => {
            const res = await api.get(`/patients/${patientId}`);
            return res.data;
        },
    });

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return undefined;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    if (!patient) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 overflow-hidden relative">
            <PatientHeader
                name={patient.name}
                age={calculateAge(patient.birthDate)}
                gender={patient.gender === 'M' ? 'Masculino' : 'Feminino'}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Esquerda: Editor (60%) */}
                <div className="flex-1 flex flex-col h-full p-4 gap-4 overflow-hidden relative">
                    <div className="flex gap-2">
                        <Input placeholder="Nome da Receita (ex: Antibióticos)" className="bg-white" />
                    </div>
                    <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-2 border-b bg-gray-50 text-xs text-gray-500 font-medium">
                            Receituário Simples
                        </div>
                        <div className="h-full">
                            <RichEditor placeholder="Digite a prescrição..." />
                        </div>
                    </div>
                    {/* Footer Actions */}
                    <div className="h-16 bg-white border-t -mx-4 -mb-4 px-4 flex items-center justify-between">
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <Printer className="w-4 h-4 mr-2" /> Imprimir
                            </Button>
                            <Button className="bg-purple-600 hover:bg-purple-700">
                                <Copy className="w-4 h-4 mr-2" /> Salvar e Finalizar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Direita: Presets (40%) */}
                <div className="w-[400px] border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
                    <div className="p-2 bg-purple-50 border-b border-purple-100">
                        <Tabs defaultValue="meus_docs" className="w-full">
                            <TabsList className="w-full grid grid-cols-3 h-8 bg-purple-100/50">
                                <TabsTrigger value="meus_docs" className="text-xs">Meus Docs</TabsTrigger>
                                <TabsTrigger value="farmacias" className="text-xs">Farmácias</TabsTrigger>
                                <TabsTrigger value="injetaveis" className="text-xs">Injetáveis</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="p-3 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input placeholder="Buscar fórmulas..." className="pl-9 h-9 text-sm" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        <p className="text-xs font-semibold text-gray-500 px-2 py-1 uppercase">Todas as Minhas Fórmulas</p>
                        {['Amoxicilina 500mg', 'Dipirona 1g', 'Nimesulida', 'Prednisolona (Xarope)', 'Azitromicina 3 dias'].map((item) => (
                            <button key={item} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex justify-between items-center group transition-colors">
                                <span className="text-sm text-gray-700 font-medium">{item}</span>
                                <ArrowRightCircle className="w-4 h-4 text-gray-300 group-hover:text-purple-600" />
                            </button>
                        ))}
                    </div>

                    <div className="p-3 border-t bg-gray-50 flex justify-center">
                        <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                            <Plus className="w-4 h-4 mr-2" /> Nova Fórmula
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
