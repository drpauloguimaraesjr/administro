'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import api from '@/lib/api';

// Usar tipo do shared/types se disponível, mas redefinindo aqui para simplicidade do exemplo
interface Patient {
    id?: string;
    name: string;
    socialName?: string;
    cpf: string;
    rg?: string;
    birthDate: string;
    gender: string;

    // Contato
    email: string;
    phone: string;
    phoneAlternative?: string;
    phoneWork?: string;

    // Endereço
    address?: string;
    neighborhood?: string;
    zipCode?: string;
    city?: string;
    state?: string;
    region?: string;
    complement?: string;
    reference?: string;

    // Convênio
    insurance?: string;
    insuranceNumber?: string;
    cns?: string;

    // Complementares
    profession?: string;
    company?: string;
    civilStatus?: string;
    education?: string;
    religion?: string;
    referralSource?: string;
    referredById?: string;
    referredByName?: string;

    // Familiares
    fatherName?: string;
    motherName?: string;
    spouseName?: string;
    childrenCount?: number;

    notes?: string;
}

interface PatientModalProps {
    open: boolean;
    onClose: () => void;
    patient?: Patient | null;
}

export function PatientModal({ open, onClose, patient }: PatientModalProps) {
    const queryClient = useQueryClient();
    const isEditing = !!patient?.id;
    const [referralSource, setReferralSource] = useState('');
    const [referrerSearch, setReferrerSearch] = useState('');
    const [selectedReferrer, setSelectedReferrer] = useState<{ id: string; name: string } | null>(null);
    const [activeTab, setActiveTab] = useState('personal');

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Patient>({
        defaultValues: {
            name: '',
            cpf: '',
            birthDate: '',
            gender: 'M',
            phone: '',
            email: '',
            notes: '',
        },
    });

    // Search patients for referral dropdown
    const { data: referrerOptions = [] } = useQuery({
        queryKey: ['patients-for-referral', referrerSearch],
        queryFn: async () => {
            if (referrerSearch.length < 2) return [];
            const res = await api.get('/patients', { params: { search: referrerSearch } });
            return res.data.filter((p: Patient) => p.id !== patient?.id);
        },
        enabled: referralSource === 'indication' && referrerSearch.length >= 2,
    });

    useEffect(() => {
        if (patient) {
            reset({
                ...patient,
                // Garantir valores padrão para strings para evitar uncontrolled inputs
                socialName: patient.socialName || '',
                rg: patient.rg || '',
                phoneAlternative: patient.phoneAlternative || '',
                phoneWork: patient.phoneWork || '',
                address: patient.address || '',
                neighborhood: patient.neighborhood || '',
                zipCode: patient.zipCode || '',
                city: patient.city || '',
                state: patient.state || '',
                region: patient.region || '',
                complement: patient.complement || '',
                reference: patient.reference || '',
                insurance: patient.insurance || '',
                insuranceNumber: patient.insuranceNumber || '',
                cns: patient.cns || '',
                profession: patient.profession || '',
                company: patient.company || '',
                civilStatus: patient.civilStatus || '',
                education: patient.education || '',
                religion: patient.religion || '',
                fatherName: patient.fatherName || '',
                motherName: patient.motherName || '',
                spouseName: patient.spouseName || '',
                childrenCount: patient.childrenCount || 0,
            });
            setReferralSource(patient.referralSource || '');
            if (patient.referredById) {
                setSelectedReferrer({ id: patient.referredById, name: patient.referredByName || '' });
            }
        } else {
            reset({
                name: '', cpf: '', birthDate: '', gender: 'M', phone: '', email: '',
                socialName: '', rg: '', phoneAlternative: '', phoneWork: '',
                address: '', neighborhood: '', zipCode: '', city: '', state: '', region: '', complement: '', reference: '',
                insurance: '', insuranceNumber: '', cns: '',
                profession: '', company: '', civilStatus: '', education: '', religion: '',
                fatherName: '', motherName: '', spouseName: '', childrenCount: 0,
                notes: '',
            });
            setReferralSource('');
            setSelectedReferrer(null);
            setActiveTab('personal');
        }
    }, [patient, reset, open]);

    const fetchAddressByCep = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setValue('address', data.logradouro);
                    setValue('neighborhood', data.bairro);
                    setValue('city', data.localidade);
                    setValue('state', data.uf);
                }
            } catch (err) {
                console.error("Erro ao buscar CEP", err);
            }
        }
    };

    const createMutation = useMutation({
        mutationFn: (data: Patient) => api.post('/patients', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            onClose();
        },
        onError: (error) => {
            console.error('Erro ao criar paciente:', error);
            alert('Erro ao criar paciente.');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: Patient) => api.put(`/patients/${patient?.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            queryClient.invalidateQueries({ queryKey: ['patient', patient?.id] });
            onClose();
        },
        onError: (error) => {
            console.error('Erro ao atualizar paciente:', error);
            alert('Erro ao atualizar paciente.');
        }
    });

    const onSubmit = (data: Patient) => {
        const payload = {
            ...data,
            referralSource,
            referredById: selectedReferrer?.id || undefined,
            referredByName: selectedReferrer?.name || undefined,
        };

        if (isEditing) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle className="text-2xl font-semibold text-purple-900">
                        {isEditing ? 'Editar Paciente' : 'Novo Paciente'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 pt-2 bg-gray-50 border-b shrink-0">
                            <TabsList className="bg-transparent space-x-2">
                                <TabsTrigger value="personal" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Dados Pessoais</TabsTrigger>
                                <TabsTrigger value="address" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Endereço</TabsTrigger>
                                <TabsTrigger value="insurance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Convênio</TabsTrigger>
                                <TabsTrigger value="complementary" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Complementares</TabsTrigger>
                                <TabsTrigger value="family" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Familiares</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            <TabsContent value="personal" className="mt-0 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <Label htmlFor="name">Nome Completo *</Label>
                                        <Input id="name" {...register('name', { required: 'Nome é obrigatório' })} className="border-gray-300" />
                                        {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                                    </div>
                                    <div className="col-span-2">
                                        <Label htmlFor="socialName">Nome Social</Label>
                                        <Input id="socialName" {...register('socialName')} className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="cpf">CPF</Label>
                                        <Input id="cpf" {...register('cpf')} placeholder="000.000.000-00" className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="rg">RG</Label>
                                        <Input id="rg" {...register('rg')} className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                                        <Input id="birthDate" type="date" {...register('birthDate')} className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="gender">Sexo</Label>
                                        <select id="gender" {...register('gender')} className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white">
                                            <option value="M">Masculino</option>
                                            <option value="F">Feminino</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="phone">Celular *</Label>
                                        <Input id="phone" {...register('phone', { required: true })} className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="phoneAlternative">Telefone Residencial</Label>
                                        <Input id="phoneAlternative" {...register('phoneAlternative')} className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="phoneWork">Telefone Comercial</Label>
                                        <Input id="phoneWork" {...register('phoneWork')} className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" {...register('email')} className="border-gray-300" />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="address" className="mt-0 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <Label htmlFor="zipCode">CEP</Label>
                                            <Input
                                                id="zipCode"
                                                {...register('zipCode')}
                                                onBlur={(e) => fetchAddressByCep(e.target.value)}
                                                placeholder="00000-000"
                                                className="border-gray-300"
                                            />
                                        </div>
                                        <Button type="button" variant="outline" onClick={() => fetchAddressByCep(watch('zipCode') || '')}>Buscar</Button>
                                    </div>
                                    <div className="col-span-2">
                                        <Label htmlFor="address">Logradouro</Label>
                                        <Input id="address" {...register('address')} className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="neighborhood">Bairro</Label>
                                        <Input id="neighborhood" {...register('neighborhood')} className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="city">Cidade</Label>
                                        <Input id="city" {...register('city')} className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="state">Estado (UF)</Label>
                                        <Input id="state" {...register('state')} className="border-gray-300" maxLength={2} />
                                    </div>
                                    <div>
                                        <Label htmlFor="region">Região</Label>
                                        <Input id="region" {...register('region')} className="border-gray-300" />
                                    </div>
                                    <div className="col-span-2">
                                        <Label htmlFor="complement">Complemento</Label>
                                        <Input id="complement" {...register('complement')} className="border-gray-300" />
                                    </div>
                                    <div className="col-span-2">
                                        <Label htmlFor="reference">Ponto de Referência</Label>
                                        <Input id="reference" {...register('reference')} className="border-gray-300" />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="insurance" className="mt-0 space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="insurance">Convênio / Plano de Saúde</Label>
                                        <Input id="insurance" {...register('insurance')} placeholder="Ex: Unimed" className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="insuranceNumber">Número da Carteirinha / Matrícula</Label>
                                        <Input id="insuranceNumber" {...register('insuranceNumber')} className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="cns">CNS (Cartão Nacional de Saúde)</Label>
                                        <Input id="cns" {...register('cns')} className="border-gray-300" />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="complementary" className="mt-0 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="profession">Profissão</Label>
                                        <Input id="profession" {...register('profession')} className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="company">Empresa onde Trabalha</Label>
                                        <Input id="company" {...register('company')} className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="civilStatus">Estado Civil</Label>
                                        <select id="civilStatus" {...register('civilStatus')} className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white">
                                            <option value="">Selecione...</option>
                                            <option value="single">Solteiro(a)</option>
                                            <option value="married">Casado(a)</option>
                                            <option value="divorced">Divorciado(a)</option>
                                            <option value="widowed">Viúvo(a)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="education">Escolaridade</Label>
                                        <Input id="education" {...register('education')} className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="religion">Religião</Label>
                                        <Input id="religion" {...register('religion')} className="border-gray-300" />
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <div>
                                        <Label>Como nos conheceu?</Label>
                                        <select
                                            value={referralSource}
                                            onChange={(e) => setReferralSource(e.target.value)}
                                            className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="indication">Indicação de paciente</option>
                                            <option value="google">Google</option>
                                            <option value="instagram">Instagram</option>
                                            <option value="facebook">Facebook</option>
                                            <option value="friend">Amigo/Familiar</option>
                                            <option value="other">Outro</option>
                                        </select>
                                    </div>
                                    {referralSource === 'indication' && (
                                        <div>
                                            <Label>Quem indicou?</Label>
                                            {selectedReferrer ? (
                                                <div className="flex items-center justify-between p-2 border rounded-md bg-teal-50">
                                                    <span className="font-medium">{selectedReferrer.name}</span>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedReferrer(null)}>Alterar</Button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <Input
                                                        value={referrerSearch}
                                                        onChange={(e) => setReferrerSearch(e.target.value)}
                                                        placeholder="Buscar paciente que indicou..."
                                                    />
                                                    {referrerOptions.length > 0 && (
                                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                                                            {referrerOptions.map((p: Patient) => (
                                                                <button
                                                                    key={p.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedReferrer({ id: p.id!, name: p.name });
                                                                        setReferrerSearch('');
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 hover:bg-slate-100"
                                                                >
                                                                    {p.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="notes">Observações Gerais</Label>
                                    <textarea
                                        id="notes"
                                        {...register('notes')}
                                        className="w-full h-20 px-3 py-2 rounded-md border border-gray-300 bg-white resize-none"
                                        placeholder="Informações adicionais..."
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="family" className="mt-0 space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="fatherName">Nome do Pai</Label>
                                        <Input id="fatherName" {...register('fatherName')} className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="motherName">Nome da Mãe</Label>
                                        <Input id="motherName" {...register('motherName')} className="border-gray-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="spouseName">Nome do Cônjuge</Label>
                                        <Input id="spouseName" {...register('spouseName')} className="border-gray-300" />
                                    </div>
                                    <div className="w-1/3">
                                        <Label htmlFor="childrenCount">Número de Filhos</Label>
                                        <Input id="childrenCount" type="number" {...register('childrenCount')} className="border-gray-300" />
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
                        <Button type="button" variant="outline" onClick={onClose} className="border-gray-300">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white">
                            {isLoading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Cadastrar Paciente'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
