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

                    {/* Patients Grid */}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {patients.map((patient: any) => (
                                <motion.div
                                    key={patient.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-slate-200 dark:border-slate-700 hover:border-teal-500 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <Link href={`/patients/${patient.id}`} className="hover:underline">
                                            <h3 className="font-semibold text-lg">{patient.name}</h3>
                                        </Link>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(patient)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(patient)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p>CPF: {patient.cpf || '-'}</p>
                                        <p>Idade: {calculateAge(patient.birthDate)}</p>
                                        {patient.phone && (
                                            <p className="flex items-center gap-2">
                                                <Phone className="w-3 h-3" />
                                                {patient.phone}
                                            </p>
                                        )}
                                        {patient.email && (
                                            <p className="flex items-center gap-2">
                                                <Mail className="w-3 h-3" />
                                                {patient.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t">
                                        <Link href={`/patients/${patient.id}`}>
                                            <Button variant="outline" size="sm" className="w-full">
                                                Ver Detalhes
                                            </Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
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
