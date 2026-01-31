'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Phone, Mail, Edit, Trash2, User, RefreshCw, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PatientModal } from '@/components/patients/PatientModal';
import api from '@/lib/api';
import Link from 'next/link';

interface Patient {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    gender: string;
    phone: string;
    email?: string;
    createdAt: string;
}

export default function PatientsPage() {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const queryClient = useQueryClient();

    const { data: patients = [], isLoading } = useQuery({
        queryKey: ['patients', search],
        queryFn: async () => {
            const res = await api.get('/patients', { params: { search } });
            return res.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/patients/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
        },
    });

    const handleMedxSync = async () => {
        try {
            setIsSyncing(true);
            const res = await api.post('/medx/sync');
            const { total, imported, skipped } = res.data.details;
            alert(`Sincronização concluída!\n\nTotal lido: ${total}\n✅ Importados: ${imported}\n⏭️ Pulados (já existiam): ${skipped}`);
            queryClient.invalidateQueries({ queryKey: ['patients'] });
        } catch (error: any) {
            console.error('❌ Erro na sincronização:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido';
            alert(`Falha ao sincronizar com MedX: ${errorMessage}. Verifique o console para mais detalhes.`);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleExportCSV = () => {
        if (!patients || patients.length === 0) {
            alert('Não há pacientes para exportar.');
            return;
        }

        // Definir cabeçalho
        const headers = ['Nome', 'CPF', 'Nascimento', 'Gênero', 'Telefone', 'Email', 'Criado em', 'Endereço', 'Convênio', 'MedX ID'];

        // Mapear linhas
        const rows = patients.map((p: any) => [
            `"${p.name || ''}"`,
            `"${p.cpf || ''}"`,
            `"${p.birthDate || ''}"`,
            `"${p.gender || ''}"`,
            `"${p.phone || ''}"`,
            `"${p.email || ''}"`,
            `"${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}"`,
            `"${p.address || ''}"`,
            `"${p.insurance || ''}"`,
            `"${p.medxId || ''}"`
        ]);

        // Juntar tudo em uma string CSV
        const csvContent = [
            headers.join(','),
            ...rows.map((r: any[]) => r.join(','))
        ].join('\n');

        // Criar Blob e link de download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `pacientes_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEdit = (patient: Patient) => {
        setEditingPatient(patient);
        setIsModalOpen(true);
    };

    const handleDelete = (patient: Patient) => {
        if (confirm(`Deseja realmente excluir ${patient.name}?`)) {
            deleteMutation.mutate(patient.id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPatient(null);
    };

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return '-';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return `${age} anos`;
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                                Pacientes
                            </h1>
                            <p className="text-muted-foreground">
                                Gerencie seus pacientes
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleExportCSV}
                                variant="outline"
                                className="border-gray-300 text-gray-600 hover:bg-gray-100"
                                title="Exportar CSV"
                            >
                                <FileDown className="w-4 h-4 mr-2" />
                                Exportar
                            </Button>
                            <Button
                                onClick={handleMedxSync}
                                variant="outline"
                                disabled={isSyncing}
                                className="border-teal-600 text-teal-600 hover:bg-teal-50"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                                {isSyncing ? 'Sincronizando...' : 'Sincronizar MedX'}
                            </Button>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-teal-600 hover:bg-teal-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Novo Paciente
                            </Button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Buscar por nome, CPF ou telefone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Patients List - Layout Vertical */}
                    {isLoading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Carregando pacientes...
                        </div>
                    ) : patients.length === 0 ? (
                        <div className="text-center py-12">
                            <User className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">Nenhum paciente encontrado</p>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                variant="outline"
                                className="mt-4"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Cadastrar primeiro paciente
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                            {/* Header da lista */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <div className="col-span-4">Paciente</div>
                                <div className="col-span-5 text-center">Relacionamento</div>
                                <div className="col-span-2 text-center">Score</div>
                                <div className="col-span-1 text-right">Ações</div>
                            </div>

                            {/* Lista de pacientes */}
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {patients.map((patient: any) => (
                                    <motion.div
                                        key={patient.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors items-center"
                                    >
                                        {/* Coluna 1: Dados do Paciente */}
                                        <div className="col-span-4">
                                            <Link href={`/patients/${patient.id}`} className="group">
                                                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                                                    {patient.name}
                                                </h3>
                                            </Link>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                                                <span>CPF: {patient.cpf || '-'}</span>
                                                <span>{calculateAge(patient.birthDate)}</span>
                                            </div>
                                            <div className="flex gap-3 mt-2 text-xs text-slate-400">
                                                {patient.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {patient.phone}
                                                    </span>
                                                )}
                                                {patient.email && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {patient.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Coluna 2: Informações de Relacionamento */}
                                        <div className="col-span-5">
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                {/* Desde */}
                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                                                    <p className="text-[10px] uppercase text-slate-400 font-medium">Desde</p>
                                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                        {patient.createdAt
                                                            ? new Date(patient.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
                                                            : '-'
                                                        }
                                                    </p>
                                                </div>

                                                {/* Indicado por */}
                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                                                    <p className="text-[10px] uppercase text-slate-400 font-medium">Indicado por</p>
                                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate" title={patient.referredBy || '-'}>
                                                        {patient.referredBy || '-'}
                                                    </p>
                                                </div>

                                                {/* Indicações feitas */}
                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                                                    <p className="text-[10px] uppercase text-slate-400 font-medium">Indicou</p>
                                                    <p className="text-sm font-semibold text-teal-600">
                                                        {patient.referralsCount || 0} pessoas
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Coluna 3: Score */}
                                        <div className="col-span-2 text-center">
                                            {patient.grade ? (
                                                <div className="inline-flex flex-col items-center">
                                                    <span className={`
                                                        text-lg font-bold px-3 py-1 rounded-full
                                                        ${patient.grade === 'AAA' ? 'bg-amber-100 text-amber-700' : ''}
                                                        ${patient.grade === 'AA' ? 'bg-yellow-100 text-yellow-700' : ''}
                                                        ${patient.grade === 'A' ? 'bg-slate-100 text-slate-600' : ''}
                                                        ${patient.grade === 'B' ? 'bg-blue-100 text-blue-700' : ''}
                                                        ${patient.grade === 'C' ? 'bg-red-100 text-red-700' : ''}
                                                    `}>
                                                        {patient.grade}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 mt-1">
                                                        {patient.score || 0} pts
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </div>

                                        {/* Coluna 4: Ações */}
                                        <div className="col-span-1 flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(patient)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(patient)}
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Footer com contagem */}
                            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-sm text-slate-500">
                                    Total: <span className="font-semibold text-slate-700">{patients.length}</span> pacientes
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Modal */}
            <PatientModal
                open={isModalOpen}
                onClose={handleCloseModal}
                patient={editingPatient as any}
            />
        </main>
    );
}
