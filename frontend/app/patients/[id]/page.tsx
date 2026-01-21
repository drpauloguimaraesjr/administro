'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Phone, Mail, Calendar, User, FileText, CreditCard, Pill, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientModal } from '@/components/patients/PatientModal';
import { AnamnesisForm } from '@/components/patients/AnamnesisForm';
import { EvolutionsList } from '@/components/patients/EvolutionsList';
import { PrescriptionsList } from '@/components/patients/PrescriptionsList';
import { DocumentsList } from '@/components/patients/DocumentsList';
import api from '@/lib/api';
import Link from 'next/link';

export default function PatientDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const patientId = params.id as string;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('perfil');

    const { data: patient, isLoading } = useQuery({
        queryKey: ['patient', patientId],
        queryFn: async () => {
            const res = await api.get(`/patients/${patientId}`);
            return res.data;
        },
    });

    const { data: appointments = [] } = useQuery({
        queryKey: ['patient-appointments', patientId],
        queryFn: async () => {
            const res = await api.get('/appointments');
            return res.data.filter((apt: any) => apt.patientId === patientId);
        },
        enabled: activeTab === 'historico',
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Paciente não encontrado</p>
            </div>
        );
    }

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return '-';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const tabs = [
        { id: 'perfil', label: 'Perfil', icon: User },
        { id: 'anamnese', label: 'Anamnese', icon: FileText },
        { id: 'evolucoes', label: 'Evoluções', icon: Calendar },
        { id: 'prescricoes', label: 'Prescrições', icon: Pill },
        { id: 'documentos', label: 'Documentos', icon: Upload },
        { id: 'historico', label: 'Consultas', icon: Calendar },
        { id: 'financeiro', label: 'Financeiro', icon: CreditCard },
    ];

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">{patient.name}</h1>
                            <p className="text-muted-foreground">
                                {calculateAge(patient.birthDate)} anos • {patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Feminino' : 'Outro'}
                                {patient.phone && ` • ${patient.phone}`}
                            </p>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                        </Button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 border-b overflow-x-auto pb-px">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-all whitespace-nowrap text-sm ${activeTab === tab.id
                                        ? 'border-teal-600 text-teal-600'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 min-h-[400px]">
                        {activeTab === 'perfil' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-4 text-lg">Dados Pessoais</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground">CPF</p>
                                            <p className="font-medium">{patient.cpf || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                                            <p className="font-medium">
                                                {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Gênero</p>
                                            <p className="font-medium">
                                                {patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Feminino' : 'Outro'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-4 text-lg">Contato</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            <p className="font-medium">{patient.phone || '-'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <p className="font-medium">{patient.email || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {patient.notes && (
                                    <div className="md:col-span-2">
                                        <h3 className="font-semibold mb-4 text-lg">Observações</h3>
                                        <p className="text-muted-foreground">{patient.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'anamnese' && (
                            <AnamnesisForm patientId={patientId} />
                        )}

                        {activeTab === 'evolucoes' && (
                            <EvolutionsList patientId={patientId} />
                        )}

                        {activeTab === 'prescricoes' && (
                            <PrescriptionsList patientId={patientId} patientName={patient.name} />
                        )}

                        {activeTab === 'documentos' && (
                            <DocumentsList patientId={patientId} />
                        )}

                        {activeTab === 'historico' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Histórico de Consultas</h3>
                                    <Link href="/agenda">
                                        <Button variant="outline" size="sm">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Agendar
                                        </Button>
                                    </Link>
                                </div>
                                {appointments.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Nenhuma consulta registrada</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {appointments.map((apt: any) => (
                                            <div key={apt.id} className="p-4 border rounded-lg flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">
                                                        {new Date(apt.date).toLocaleDateString('pt-BR')} às {apt.startTime}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {apt.type === 'first_visit' ? 'Primeira Consulta' :
                                                            apt.type === 'return' ? 'Retorno' : 'Avaliação'}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                                            apt.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                                                                'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                                    }`}>
                                                    {apt.status === 'confirmed' ? 'Confirmado' :
                                                        apt.status === 'pending' ? 'Pendente' :
                                                            apt.status === 'cancelled' ? 'Cancelado' : 'Concluído'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'financeiro' && (
                            <div className="text-center py-8 text-muted-foreground">
                                <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Financeiro em desenvolvimento</p>
                                <p className="text-sm">Em breve: Pagamentos vinculados a consultas</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <PatientModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                patient={patient}
            />
        </main>
    );
}
