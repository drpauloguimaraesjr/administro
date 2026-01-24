'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, MessageSquare, ListCheck, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';

// Mock Data
const MOCK_PLAYBOOKS = [
    { id: 1, name: 'Triagem Comercial', department: 'Comercial', steps: 4 },
    { id: 2, name: 'Agendamento de Consulta', department: 'Recepção', steps: 3 },
    { id: 3, name: 'Pós-Consulta', department: 'Médico', steps: 5 },
];

export default function PlaybooksConfigPage() {
    const [isCreating, setIsCreating] = useState(false);

    if (isCreating) {
        return <PlaybookEditor onCancel={() => setIsCreating(false)} />;
    }

    return (
        <div className="container mx-auto max-w-5xl py-8 px-6">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/configuracoes">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Playbooks de Atendimento</h1>
                    <p className="text-slate-500">Crie roteiros guiados para padronizar o atendimento da sua equipe.</p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="ml-auto bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Playbook
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_PLAYBOOKS.map((pb) => (
                    <Card key={pb.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-200 hover:border-teal-200 hover:-translate-y-1">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-teal-50 rounded-xl group-hover:bg-teal-100 transition-colors">
                                    <ListCheck className="w-6 h-6 text-teal-600" />
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-teal-700 transition-colors">
                                {pb.name}
                            </h3>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                                    {pb.department}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pt-3 border-t border-slate-100">
                                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                                {pb.steps} passos configurados
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function PlaybookEditor({ onCancel }: { onCancel: () => void }) {
    const [steps, setSteps] = useState([{ id: 1, type: 'message', content: '' }]);

    const addStep = () => setSteps([...steps, { id: Date.now(), type: 'message', content: '' }]);

    return (
        <div className="container mx-auto max-w-4xl py-8 px-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-800">Novo Playbook</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Playbook
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Configurações Básicas */}
                <div className="col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Informações</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Nome do Playbook</label>
                                <Input placeholder="Ex: Triagem Inicial" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Departamento</label>
                                <select className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm">
                                    <option>Recepção</option>
                                    <option>Comercial</option>
                                    <option>Médico</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Editor de Passos */}
                <div className="col-span-2 space-y-4">
                    {steps.map((step, index) => (
                        <Card key={step.id} className="relative group border-l-4 border-l-teal-500">
                            <CardContent className="pt-6">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <select className="h-8 text-xs border-none bg-slate-50 rounded px-2 font-medium text-slate-600 w-fit">
                                            <option value="message">Enviar Mensagem</option>
                                            <option value="capture">Capturar Dado</option>
                                            <option value="note">Nota Interna</option>
                                        </select>
                                        <textarea
                                            className="w-full text-sm p-3 rounded-md border border-slate-200 focus:ring-1 focus:ring-teal-500 min-h-[80px]"
                                            placeholder="Digite o texto da mensagem ou instrução..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button variant="outline" className="w-full border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-teal-600" onClick={addStep}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Passo
                    </Button>
                </div>
            </div>
        </div>
    );
}
