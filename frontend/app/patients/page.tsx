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

        const headers = ['Nome', 'CPF', 'Nascimento', 'Gênero', 'Telefone', 'Email', 'Criado em', 'Endereço', 'Convênio', 'MedX ID'];

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

        const csvContent = [
            headers.join(','),
            ...rows.map((r: any[]) => r.join(','))
        ].join('\n');

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
        <main className="min-h-screen bg-background">
            <div className="px-4 py-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-6"
                >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-foreground">
                                Pacientes
                            </h1>
                            <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.1em] mt-1">
                                Gerencie seus pacientes
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleExportCSV}
                                variant="outline"
                                title="Exportar CSV"
                            >
                                <FileDown className="w-4 h-4 mr-2" />
                                Exportar
                            </Button>
                            <Button
                                onClick={handleMedxSync}
                                variant="outline"
                                disabled={isSyncing}
                                className="border-primary text-primary hover:bg-primary/10"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                                {isSyncing ? 'Sincronizando...' : 'Sincronizar MedX'}
                            </Button>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
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

                    {/* Patients List */}
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border border-border border-t-primary animate-spin mx-auto mb-4"></div>
                            <p className="font-mono text-sm text-muted-foreground">Carregando pacientes...</p>
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
                        <div className="border border-border bg-card overflow-hidden">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted border-b border-border mono-label">
                                <div className="col-span-4">Paciente</div>
                                <div className="col-span-5 text-center">Relacionamento</div>
                                <div className="col-span-2 text-center">Score</div>
                                <div className="col-span-1 text-right">Ações</div>
                            </div>

                            {/* Patient Rows */}
                            <div className="divide-y divide-border/50">
                                {patients.map((patient: any) => (
                                    <motion.div
                                        key={patient.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/50 transition-colors duration-150 items-center"
                                    >
                                        {/* Col 1: Patient Data */}
                                        <div className="col-span-4">
                                            <Link href={`/patients/${patient.id}`} className="group">
                                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-150">
                                                    {patient.name}
                                                </h3>
                                            </Link>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 font-mono text-xs text-muted-foreground">
                                                <span>CPF: {patient.cpf || '-'}</span>
                                                <span>{calculateAge(patient.birthDate)}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-3 mt-2 font-mono text-xs text-muted-foreground/70">
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
                                                {patient.city && (
                                                    <span className="flex items-center gap-1">
                                                        📍 {patient.city}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Col 2: Relationship Info */}
                                        <div className="col-span-5">
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                <div className="bg-muted/50 p-2 border border-border/50">
                                                    <p className="mono-label">Desde</p>
                                                    <p className="font-mono text-sm font-semibold text-foreground">
                                                        {patient.createdAt
                                                            ? new Date(patient.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
                                                            : '-'
                                                        }
                                                    </p>
                                                </div>

                                                <div className="bg-muted/50 p-2 border border-border/50">
                                                    <p className="mono-label">Indicado por</p>
                                                    <p className="font-mono text-sm font-semibold text-foreground truncate" title={patient.referredBy || '-'}>
                                                        {patient.referredBy || '-'}
                                                    </p>
                                                </div>

                                                <div className="bg-muted/50 p-2 border border-border/50">
                                                    <p className="mono-label">Indicou</p>
                                                    <p className="font-mono text-sm font-semibold text-primary">
                                                        {patient.referralsCount || 0} pessoas
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Col 3: Score */}
                                        <div className="col-span-2 text-center">
                                            {patient.grade ? (
                                                <div className="inline-flex flex-col items-center">
                                                    <span className={`
                                                        font-mono text-lg font-bold px-3 py-1 border
                                                        ${patient.grade === 'AAA' ? 'border-primary text-primary' : ''}
                                                        ${patient.grade === 'AA' ? 'border-primary/60 text-primary/80' : ''}
                                                        ${patient.grade === 'A' ? 'border-border text-muted-foreground' : ''}
                                                        ${patient.grade === 'B' ? 'border-border text-muted-foreground' : ''}
                                                        ${patient.grade === 'C' ? 'border-destructive/50 text-destructive' : ''}
                                                    `}>
                                                        {patient.grade}
                                                    </span>
                                                    <span className="font-mono text-[10px] text-muted-foreground mt-1">
                                                        {patient.score || 0} pts
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="font-mono text-xs text-muted-foreground">-</span>
                                            )}
                                        </div>

                                        {/* Col 4: Actions */}
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
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-3 bg-muted border-t border-border">
                                <p className="font-mono text-xs text-muted-foreground">
                                    Total: <span className="font-semibold text-foreground">{patients.length}</span> pacientes
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
