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
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { User, MapPin, HeartPulse, FileText, Users, TrendingUp, Tag, Activity } from 'lucide-react';

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

    // CRM
    crmStatus?: 'LEAD' | 'CONTACTED' | 'SCHEDULED' | 'ACTIVE' | 'MAINTENANCE' | 'ARCHIVED';
    crmTemperature?: 'COLD' | 'WARM' | 'HOT';
    tags?: string; // stored as comma visible string for simplicity in form, handled as array in backend if needed

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
            crmStatus: 'LEAD',
            crmTemperature: 'COLD',
            tags: ''
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
                crmStatus: patient.crmStatus || 'LEAD',
                crmTemperature: patient.crmTemperature || 'COLD',
                tags: patient.tags || ''
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
                crmStatus: 'LEAD',
                crmTemperature: 'COLD',
                tags: ''
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
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white">
                <DialogHeader className="px-6 py-4 border-b shrink-0 bg-white z-10">
                    <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        {isEditing ? <User className="h-6 w-6 text-purple-600" /> : <User className="h-6 w-6 text-green-600" />}
                        {isEditing ? 'Editar Perfil do Paciente' : 'Novo Cadastro de Paciente'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 pt-2 bg-slate-50 border-b shrink-0 overflow-x-auto">
                            <TabsList className="bg-transparent space-x-1 h-12">
                                <TabsTrigger value="personal" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none h-full px-4">
                                    <User className="h-4 w-4" /> Pessoal
                                </TabsTrigger>
                                <TabsTrigger value="crm" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none h-full px-4 text-purple-700 font-medium">
                                    <TrendingUp className="h-4 w-4" /> CRM & Funil
                                </TabsTrigger>
                                <TabsTrigger value="address" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none h-full px-4">
                                    <MapPin className="h-4 w-4" /> Endereço
                                </TabsTrigger>
                                <TabsTrigger value="insurance" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none h-full px-4">
                                    <HeartPulse className="h-4 w-4" /> Convênio
                                </TabsTrigger>
                                <TabsTrigger value="complementary" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none h-full px-4">
                                    <FileText className="h-4 w-4" /> Complementar
                                </TabsTrigger>
                                <TabsTrigger value="family" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none h-full px-4">
                                    <Users className="h-4 w-4" /> Família
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                            {/* --- TAB: CRM & FUNIL (NEW) --- */}
                            <TabsContent value="crm" className="mt-0 space-y-6">
                                <div className="bg-white p-6 rounded-lg border border-purple-100 shadow-sm">
                                    <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                                        <Activity className="h-5 w-5" /> Status no Funil
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="crmStatus" className="text-base">Fase Atual</Label>
                                            <select
                                                id="crmStatus"
                                                {...register('crmStatus')}
                                                className="w-full h-12 px-3 mt-1 rounded-md border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="LEAD">🐣 Lead (Novo Contato)</option>
                                                <option value="CONTACTED">💬 Em Contato / Qualificação</option>
                                                <option value="SCHEDULED">📅 Agendado</option>
                                                <option value="ACTIVE">✅ Paciente Ativo</option>
                                                <option value="MAINTENANCE">🔄 Manutenção / Acompanhamento</option>
                                                <option value="ARCHIVED">📂 Arquivado / Inativo</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">Define em que etapa da jornada este paciente se encontra.</p>
                                        </div>
                                        <div>
                                            <Label htmlFor="crmTemperature" className="text-base">Temperatura do Lead</Label>
                                            <div className="flex gap-4 mt-2">
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input type="radio" value="COLD" {...register('crmTemperature')} className="hidden peer" />
                                                    <div className="px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700 peer-checked:bg-blue-500 peer-checked:text-white transition-all flex items-center gap-1">
                                                        ❄️ Frio
                                                    </div>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input type="radio" value="WARM" {...register('crmTemperature')} className="hidden peer" />
                                                    <div className="px-4 py-2 rounded-full border border-orange-200 bg-orange-50 text-orange-700 peer-checked:bg-orange-500 peer-checked:text-white transition-all flex items-center gap-1">
                                                        ☕ Morno
                                                    </div>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input type="radio" value="HOT" {...register('crmTemperature')} className="hidden peer" />
                                                    <div className="px-4 py-2 rounded-full border border-red-200 bg-red-50 text-red-700 peer-checked:bg-red-500 peer-checked:text-white transition-all flex items-center gap-1">
                                                        🔥 Quente
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Tag className="h-5 w-5" /> Segmentação e Origem
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="tags">Tags (Categorias)</Label>
                                            <Input
                                                id="tags"
                                                {...register('tags')}
                                                placeholder="Ex: VIP, Diabético, Estética, Nutrologia..."
                                                className="mt-1"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Separe por vírgulas.</p>
                                        </div>
                                        <div>
                                            <Label>Origem (Como chegou até nós?)</Label>
                                            <select
                                                value={referralSource}
                                                onChange={(e) => setReferralSource(e.target.value)}
                                                className="w-full h-10 px-3 mt-1 rounded-md border border-gray-300 bg-white"
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="indication">Indicação de Paciente</option>
                                                <option value="google">Google Ads / Busca</option>
                                                <option value="instagram">Instagram</option>
                                                <option value="facebook">Facebook</option>
                                                <option value="doctor_referral">Indicação Médica</option>
                                                <option value="friend">Amigo/Familiar</option>
                                                <option value="other">Outro</option>
                                            </select>
                                        </div>
                                        {referralSource === 'indication' && (
                                            <div className="col-span-2 bg-teal-50 p-4 rounded-md border border-teal-100">
                                                <Label className="text-teal-800">Quem indicou esse paciente?</Label>
                                                {selectedReferrer ? (
                                                    <div className="flex items-center justify-between p-2 mt-2 bg-white border rounded-md shadow-sm">
                                                        <span className="font-medium text-teal-900">{selectedReferrer.name}</span>
                                                        <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedReferrer(null)} className="text-red-500 hover:text-red-700">Remover</Button>
                                                    </div>
                                                ) : (
                                                    <div className="relative mt-2">
                                                        <Input
                                                            value={referrerSearch}
                                                            onChange={(e) => setReferrerSearch(e.target.value)}
                                                            placeholder="Digite o nome para buscar..."
                                                            className="bg-white"
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
                                                                        className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm"
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
                                </div>
                            </TabsContent>

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
                                        <Label htmlFor="phone">Celular (WhatsApp) *</Label>
                                        <Input id="phone" {...register('phone', { required: true })} className="border-gray-300" placeholder="(00) 00000-0000" />
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
                                <div className="mt-4">
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
                        <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white shadow-md">
                            {isLoading ? 'Salvando...' : isEditing ? 'Salvar Edição' : 'Concluir Cadastro'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
