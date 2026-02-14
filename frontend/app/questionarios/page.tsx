'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Send, Eye, ClipboardList, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';

interface Question {
    id: string;
    text: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'scale';
    required: boolean;
    options?: string[];
    order: number;
}

interface Section {
    id: string;
    title: string;
    order: number;
    questions: Question[];
}

interface Questionnaire {
    id?: string;
    title: string;
    description?: string;
    type: string;
    sections: Section[];
    isActive: boolean;
    responseCount: number;
}

interface QuestionnaireResponse {
    id: string;
    patientName: string;
    status: string;
    completedAt?: string;
    createdAt: string;
}

export default function QuestionariosPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | null>(null);
    const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('custom');
    const [sections, setSections] = useState<Section[]>([]);

    // Send form state
    const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
    const [patientSearch, setPatientSearch] = useState('');

    const { data: questionnaires = [], isLoading } = useQuery({
        queryKey: ['questionnaires'],
        queryFn: async () => {
            const res = await api.get('/questionnaires');
            return res.data;
        },
    });

    const { data: patients = [] } = useQuery({
        queryKey: ['patients-for-send', patientSearch],
        queryFn: async () => {
            const res = await api.get('/patients');
            return res.data;
        },
    });

    const { data: responses = [] } = useQuery({
        queryKey: ['questionnaire-responses', selectedQuestionnaire?.id],
        queryFn: async () => {
            if (!selectedQuestionnaire?.id) return [];
            const res = await api.get(`/questionnaires/${selectedQuestionnaire.id}/responses`);
            return res.data;
        },
        enabled: !!selectedQuestionnaire?.id && isViewModalOpen,
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<Questionnaire>) => api.post('/questionnaires', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
            closeModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Questionnaire>) =>
            api.put(`/questionnaires/${editingQuestionnaire?.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
            closeModal();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/questionnaires/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
        },
    });

    const sendMutation = useMutation({
        mutationFn: (data: { id: string; patientIds: string[]; channel: string }) =>
            api.post(`/questionnaires/${data.id}/send`, {
                patientIds: data.patientIds,
                channel: data.channel
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
            setIsSendModalOpen(false);
            setSelectedPatients([]);
        },
    });

    const openNewModal = () => {
        setEditingQuestionnaire(null);
        setTitle('');
        setDescription('');
        setType('custom');
        setSections([{
            id: crypto.randomUUID(),
            title: 'Seção 1',
            order: 0,
            questions: [],
        }]);
        setIsModalOpen(true);
    };

    const openEditModal = (q: Questionnaire) => {
        setEditingQuestionnaire(q);
        setTitle(q.title);
        setDescription(q.description || '');
        setType(q.type);
        setSections(q.sections || []);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingQuestionnaire(null);
    };

    const addSection = () => {
        setSections([...sections, {
            id: crypto.randomUUID(),
            title: `Seção ${sections.length + 1}`,
            order: sections.length,
            questions: [],
        }]);
    };

    const addQuestion = (sectionId: string) => {
        setSections(sections.map(s => {
            if (s.id === sectionId) {
                return {
                    ...s,
                    questions: [...s.questions, {
                        id: crypto.randomUUID(),
                        text: '',
                        type: 'text',
                        required: false,
                        order: s.questions.length,
                    }],
                };
            }
            return s;
        }));
    };

    const updateQuestion = (sectionId: string, questionId: string, field: string, value: any) => {
        setSections(sections.map(s => {
            if (s.id === sectionId) {
                return {
                    ...s,
                    questions: s.questions.map(q => {
                        if (q.id === questionId) {
                            return { ...q, [field]: value };
                        }
                        return q;
                    }),
                };
            }
            return s;
        }));
    };

    const removeQuestion = (sectionId: string, questionId: string) => {
        setSections(sections.map(s => {
            if (s.id === sectionId) {
                return {
                    ...s,
                    questions: s.questions.filter(q => q.id !== questionId),
                };
            }
            return s;
        }));
    };

    const handleSubmit = () => {
        const data = { title, description, type, sections };
        if (editingQuestionnaire) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const handleSend = () => {
        if (selectedQuestionnaire && selectedPatients.length > 0) {
            sendMutation.mutate({
                id: selectedQuestionnaire.id!,
                patientIds: selectedPatients,
                channel: 'whatsapp',
            });
        }
    };

    const typeLabels: { [key: string]: string } = {
        anamnesis: 'Anamnese',
        followup: 'Follow-up',
        satisfaction: 'Satisfação',
        screening: 'Triagem',
        custom: 'Personalizado',
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50">
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Questionários</h1>
                            <p className="text-muted-foreground">Crie e envie formulários para seus pacientes</p>
                        </div>
                        <Button onClick={openNewModal} className="bg-teal-600 hover:bg-teal-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Questionário
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-teal-100 rounded-lg">
                                    <ClipboardList className="w-6 h-6 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{questionnaires.length}</p>
                                    <p className="text-sm text-muted-foreground">Total de Questionários</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Send className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">
                                        {questionnaires.reduce((acc: number, q: Questionnaire) => acc + (q.responseCount || 0), 0)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Enviados</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{questionnaires.filter((q: Questionnaire) => q.isActive).length}</p>
                                    <p className="text-sm text-muted-foreground">Ativos</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Meus Questionários</h2>

                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                            </div>
                        ) : questionnaires.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum questionário criado ainda</p>
                                <Button onClick={openNewModal} variant="outline" className="mt-4">
                                    Criar Primeiro Questionário
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {questionnaires.map((q: Questionnaire) => (
                                    <div
                                        key={q.id}
                                        className="p-4 border rounded-lg flex justify-between items-center hover:border-teal-300 transition-colors"
                                    >
                                        <div>
                                            <h3 className="font-semibold">{q.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {typeLabels[q.type] || q.type} • {q.sections?.length || 0} seções •
                                                {q.sections?.reduce((acc, s) => acc + s.questions.length, 0) || 0} perguntas
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Enviado {q.responseCount || 0} vezes
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedQuestionnaire(q);
                                                    setIsViewModalOpen(true);
                                                }}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedQuestionnaire(q);
                                                    setIsSendModalOpen(true);
                                                }}
                                            >
                                                <Send className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => openEditModal(q)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm('Excluir este questionário?')) {
                                                        deleteMutation.mutate(q.id!);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={closeModal}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingQuestionnaire ? 'Editar Questionário' : 'Novo Questionário'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Título</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Anamnese Inicial"
                                />
                            </div>
                            <div>
                                <Label>Tipo</Label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                >
                                    <option value="anamnesis">Anamnese</option>
                                    <option value="followup">Follow-up</option>
                                    <option value="satisfaction">Satisfação</option>
                                    <option value="screening">Triagem</option>
                                    <option value="custom">Personalizado</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label>Descrição</Label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background resize-none"
                                placeholder="Descrição do questionário..."
                            />
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">Seções e Perguntas</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addSection}>
                                    <Plus className="w-4 h-4 mr-1" /> Seção
                                </Button>
                            </div>

                            {sections.map((section, sIndex) => (
                                <div key={section.id} className="mb-4 p-4 border rounded-lg bg-slate-50">
                                    <Input
                                        value={section.title}
                                        onChange={(e) => {
                                            setSections(sections.map((s, i) =>
                                                i === sIndex ? { ...s, title: e.target.value } : s
                                            ));
                                        }}
                                        placeholder="Título da seção"
                                        className="font-semibold mb-3"
                                    />

                                    {section.questions.map((question) => (
                                        <div key={question.id} className="mb-3 p-3 bg-white rounded border">
                                            <div className="flex gap-2 mb-2">
                                                <Input
                                                    value={question.text}
                                                    onChange={(e) => updateQuestion(section.id, question.id, 'text', e.target.value)}
                                                    placeholder="Texto da pergunta"
                                                    className="flex-1"
                                                />
                                                <select
                                                    value={question.type}
                                                    onChange={(e) => updateQuestion(section.id, question.id, 'type', e.target.value)}
                                                    className="w-32 h-10 px-2 rounded-md border border-input bg-background text-sm"
                                                >
                                                    <option value="text">Texto</option>
                                                    <option value="textarea">Texto Longo</option>
                                                    <option value="number">Número</option>
                                                    <option value="radio">Escolha Única</option>
                                                    <option value="checkbox">Múltipla Escolha</option>
                                                    <option value="scale">Escala 1-10</option>
                                                </select>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeQuestion(section.id, question.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={question.required}
                                                    onChange={(e) => updateQuestion(section.id, question.id, 'required', e.target.checked)}
                                                />
                                                Obrigatória
                                            </label>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addQuestion(section.id)}
                                        className="w-full"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Pergunta
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={closeModal}>Cancelar</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!title || createMutation.isPending || updateMutation.isPending}
                                className="bg-teal-600 hover:bg-teal-700"
                            >
                                {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Send Modal */}
            <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Enviar Questionário</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Enviando: <strong>{selectedQuestionnaire?.title}</strong>
                        </p>

                        <div>
                            <Label>Buscar pacientes</Label>
                            <Input
                                value={patientSearch}
                                onChange={(e) => setPatientSearch(e.target.value)}
                                placeholder="Buscar por nome..."
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto border rounded-lg">
                            {patients.map((p: any) => (
                                <label
                                    key={p.id}
                                    className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b last:border-b-0"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPatients.includes(p.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedPatients([...selectedPatients, p.id]);
                                            } else {
                                                setSelectedPatients(selectedPatients.filter(id => id !== p.id));
                                            }
                                        }}
                                    />
                                    <span>{p.name}</span>
                                    <span className="text-sm text-muted-foreground ml-auto">{p.phone}</span>
                                </label>
                            ))}
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {selectedPatients.length} paciente(s) selecionado(s)
                        </p>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsSendModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSend}
                                disabled={selectedPatients.length === 0 || sendMutation.isPending}
                                className="bg-teal-600 hover:bg-teal-700"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {sendMutation.isPending ? 'Enviando...' : 'Enviar via WhatsApp'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Responses Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Respostas - {selectedQuestionnaire?.title}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {responses.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhuma resposta ainda</p>
                            </div>
                        ) : (
                            responses.map((r: QuestionnaireResponse) => (
                                <div key={r.id} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{r.patientName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Enviado em: {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${r.status === 'completed'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {r.status === 'completed' ? 'Respondido' : 'Pendente'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
}
