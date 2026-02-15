'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Phone, Mail, MessageCircle, MapPin,
  Edit2, Trash2, ChevronRight, Send, Package, Clock,
  CheckCircle2, XCircle, Users, RefreshCw, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Partner {
  id: string;
  name: string;
  type: 'farmácia' | 'fornecedor' | 'laboratório';
  contactName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  integrationMethod: 'email' | 'whatsapp' | 'manual';
  specialties?: string[];
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PartnerForwarding {
  id: string;
  partnerId: string;
  partnerName: string;
  patientId: string;
  patientName: string;
  prescriptionId: string;
  formulaName: string;
  formulaDetails: string;
  status: 'pending' | 'sent' | 'confirmed' | 'delivered' | 'cancelled';
  sentAt?: string;
  sentMethod?: string;
  createdAt: string;
}

type Tab = 'partners' | 'forwardings';

const TYPE_CONFIG = {
  'farmácia': { label: 'Farmácia', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'fornecedor': { label: 'Fornecedor', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'laboratório': { label: 'Laboratório', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
};

const FWD_STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
  sent: { label: 'Enviado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Send },
  confirmed: { label: 'Confirmado', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  delivered: { label: 'Entregue', color: 'bg-[#7c9a72]/20 text-[#a8c49e] border-[#7c9a72]/30', icon: Package },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
};

const INTEGRATION_ICONS = {
  email: Mail,
  whatsapp: MessageCircle,
  manual: Users,
};

const emptyPartner: {
  name: string;
  type: 'farmácia' | 'fornecedor' | 'laboratório';
  contactName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  integrationMethod: 'email' | 'whatsapp' | 'manual';
  specialties: string[];
  notes: string;
} = {
  name: '',
  type: 'farmácia',
  contactName: '',
  email: '',
  phone: '',
  whatsapp: '',
  address: '',
  integrationMethod: 'manual',
  specialties: [],
  notes: '',
};

export default function ParceirosPage() {
  const [tab, setTab] = useState<Tab>('partners');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState(emptyPartner);
  const [specialtyInput, setSpecialtyInput] = useState('');
  const queryClient = useQueryClient();

  const { data: partners, isLoading: loadingPartners } = useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const response = await api.get('/partners');
      return response.data as Partner[];
    },
  });

  const { data: forwardings, isLoading: loadingForwardings } = useQuery({
    queryKey: ['partner-forwardings'],
    queryFn: async () => {
      const response = await api.get('/partners/forwardings/all');
      return response.data as PartnerForwarding[];
    },
    enabled: tab === 'forwardings',
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof emptyPartner) => {
      const response = await api.post('/partners', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Parceiro cadastrado!');
      closeDialog();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao criar parceiro'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof emptyPartner> }) => {
      const response = await api.put(`/partners/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Parceiro atualizado!');
      closeDialog();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao atualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/partners/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Parceiro removido');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao remover'),
  });

  const updateFwdStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.put(`/partners/forwardings/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-forwardings'] });
      toast.success('Status atualizado');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao atualizar'),
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPartner(null);
    setFormData(emptyPartner);
    setSpecialtyInput('');
  };

  const openCreate = () => {
    setFormData(emptyPartner);
    setEditingPartner(null);
    setIsDialogOpen(true);
  };

  const openEdit = (partner: Partner) => {
    setFormData({
      name: partner.name,
      type: partner.type,
      contactName: partner.contactName || '',
      email: partner.email || '',
      phone: partner.phone || '',
      whatsapp: partner.whatsapp || '',
      address: partner.address || '',
      integrationMethod: partner.integrationMethod,
      specialties: partner.specialties || [],
      notes: partner.notes || '',
    });
    setEditingPartner(partner);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (editingPartner) {
      updateMutation.mutate({ id: editingPartner.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const addSpecialty = () => {
    if (specialtyInput.trim() && !formData.specialties.includes(specialtyInput.trim())) {
      setFormData(f => ({ ...f, specialties: [...f.specialties, specialtyInput.trim()] }));
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (s: string) => {
    setFormData(f => ({ ...f, specialties: f.specialties.filter(x => x !== s) }));
  };

  const activePartners = partners?.filter(p => p.isActive) || [];
  const inactivePartners = partners?.filter(p => !p.isActive) || [];

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#f5f0eb] flex items-center gap-3">
              <Building2 className="w-8 h-8 text-[#7c9a72]" />
              Parceiros
            </h1>
            <p className="text-[#918a82] mt-1 font-mono text-sm tracking-wide">
              Farmácias, fornecedores e encaminhamentos
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-[#7c9a72] hover:bg-[#6b8962] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Parceiro
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('partners')}
            className={`px-4 py-2 rounded-md text-sm font-mono tracking-wide transition-all ${
              tab === 'partners'
                ? 'bg-[#7c9a72]/20 text-[#a8c49e] border border-[#7c9a72]/40'
                : 'bg-[#1a1a1a] text-[#918a82] border border-[#333] hover:border-[#444]'
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Parceiros ({partners?.length || 0})
          </button>
          <button
            onClick={() => setTab('forwardings')}
            className={`px-4 py-2 rounded-md text-sm font-mono tracking-wide transition-all ${
              tab === 'forwardings'
                ? 'bg-[#7c9a72]/20 text-[#a8c49e] border border-[#7c9a72]/40'
                : 'bg-[#1a1a1a] text-[#918a82] border border-[#333] hover:border-[#444]'
            }`}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Encaminhamentos ({forwardings?.length || 0})
          </button>
        </div>

        {/* Partners Tab */}
        {tab === 'partners' && (
          <>
            {loadingPartners ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-6 h-6 animate-spin text-[#7c9a72]" />
                <span className="ml-3 text-[#918a82] font-mono text-sm">Carregando...</span>
              </div>
            ) : activePartners.length === 0 && inactivePartners.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <Building2 className="w-12 h-12 text-[#333] mx-auto mb-4" />
                <p className="text-[#918a82] font-mono text-sm">Nenhum parceiro cadastrado</p>
                <p className="text-[#555] font-mono text-xs mt-1">Cadastre farmácias e fornecedores para encaminhamento</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {activePartners.map((partner, i) => {
                    const typeConfig = TYPE_CONFIG[partner.type];
                    const IntegrationIcon = INTEGRATION_ICONS[partner.integrationMethod];

                    return (
                      <motion.div
                        key={partner.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <Card className="bg-[#1a1a1a] border-[#333] hover:border-[#444] transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              {/* Icon */}
                              <div className="p-3 rounded-lg bg-[#292929] shrink-0">
                                <Building2 className="w-5 h-5 text-[#7c9a72]" />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[#f5f0eb] font-medium">{partner.name}</span>
                                  <Badge className={`${typeConfig.color} border text-[10px] font-mono uppercase tracking-wider`}>
                                    {typeConfig.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-[#918a82] text-xs font-mono flex-wrap">
                                  {partner.contactName && (
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />{partner.contactName}
                                    </span>
                                  )}
                                  {partner.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />{partner.phone}
                                    </span>
                                  )}
                                  {partner.email && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />{partner.email}
                                    </span>
                                  )}
                                  {partner.whatsapp && (
                                    <span className="flex items-center gap-1">
                                      <MessageCircle className="w-3 h-3" />{partner.whatsapp}
                                    </span>
                                  )}
                                </div>
                                {partner.specialties && partner.specialties.length > 0 && (
                                  <div className="flex gap-1.5 mt-2 flex-wrap">
                                    {partner.specialties.map(s => (
                                      <span key={s} className="px-2 py-0.5 bg-[#292929] text-[#918a82] text-[10px] font-mono rounded">
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Integration */}
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="p-1.5 rounded bg-[#292929]" title={`Integração: ${partner.integrationMethod}`}>
                                  <IntegrationIcon className="w-4 h-4 text-[#918a82]" />
                                </div>

                                {/* Actions */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEdit(partner)}
                                  className="text-[#918a82] hover:text-[#f5f0eb] hover:bg-[#292929]"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    if (confirm(`Remover "${partner.name}"?`)) {
                                      deleteMutation.mutate(partner.id);
                                    }
                                  }}
                                  className="text-[#918a82] hover:text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* Forwardings Tab */}
        {tab === 'forwardings' && (
          <>
            {loadingForwardings ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-6 h-6 animate-spin text-[#7c9a72]" />
                <span className="ml-3 text-[#918a82] font-mono text-sm">Carregando...</span>
              </div>
            ) : !forwardings || forwardings.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <Send className="w-12 h-12 text-[#333] mx-auto mb-4" />
                <p className="text-[#918a82] font-mono text-sm">Nenhum encaminhamento registrado</p>
                <p className="text-[#555] font-mono text-xs mt-1">Encaminhamentos são criados ao pular o estoque no receituário</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {forwardings.map((fwd, i) => {
                  const statusCfg = FWD_STATUS_CONFIG[fwd.status];
                  const StatusIcon = statusCfg.icon;

                  return (
                    <motion.div
                      key={fwd.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card className="bg-[#1a1a1a] border-[#333] hover:border-[#444] transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {/* Status dot */}
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              fwd.status === 'pending' ? 'bg-amber-400' :
                              fwd.status === 'sent' ? 'bg-blue-400' :
                              fwd.status === 'confirmed' ? 'bg-emerald-400' :
                              fwd.status === 'delivered' ? 'bg-[#7c9a72]' : 'bg-red-400'
                            }`} />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[#f5f0eb] font-medium text-sm">{fwd.patientName}</span>
                                <ChevronRight className="w-3 h-3 text-[#555]" />
                                <span className="text-[#918a82] text-sm">{fwd.partnerName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[#918a82] text-xs font-mono">
                                <Package className="w-3 h-3 shrink-0" />
                                <span className="truncate">{fwd.formulaName}</span>
                              </div>
                            </div>

                            <Badge className={`${statusCfg.color} border text-[10px] font-mono uppercase tracking-wider shrink-0`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusCfg.label}
                            </Badge>

                            {/* Quick status actions */}
                            <div className="flex gap-1 shrink-0">
                              {fwd.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateFwdStatusMutation.mutate({ id: fwd.id, status: 'sent' })}
                                  className="text-blue-400 hover:bg-blue-500/10 text-xs font-mono"
                                  title="Marcar como enviado"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              {fwd.status === 'sent' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateFwdStatusMutation.mutate({ id: fwd.id, status: 'confirmed' })}
                                  className="text-emerald-400 hover:bg-emerald-500/10 text-xs font-mono"
                                  title="Confirmar recebimento"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              {fwd.status === 'confirmed' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateFwdStatusMutation.mutate({ id: fwd.id, status: 'delivered' })}
                                  className="text-[#a8c49e] hover:bg-[#7c9a72]/10 text-xs font-mono"
                                  title="Marcar como entregue"
                                >
                                  <Package className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>

                            <span className="text-[#555] text-xs font-mono shrink-0">
                              {new Date(fwd.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={() => closeDialog()}>
        <DialogContent className="bg-[#1a1a1a] border-[#333] text-[#f5f0eb] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#f5f0eb] font-mono">
              {editingPartner ? 'Editar Parceiro' : 'Novo Parceiro'}
            </DialogTitle>
            <DialogDescription className="text-[#918a82]">
              Cadastre farmácias, fornecedores ou laboratórios
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div>
              <label className="text-[10px] font-mono text-[#555] uppercase tracking-wider block mb-1">Nome *</label>
              <Input
                value={formData.name}
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Farmácia Manipulados Central"
                className="bg-[#292929] border-[#333] text-[#f5f0eb] placeholder:text-[#555]"
              />
            </div>

            {/* Type + Integration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-[#555] uppercase tracking-wider block mb-1">Tipo *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData(f => ({ ...f, type: e.target.value as any }))}
                  className="w-full bg-[#292929] border border-[#333] text-[#f5f0eb] rounded-md px-3 py-2 text-sm"
                >
                  <option value="farmácia">Farmácia</option>
                  <option value="fornecedor">Fornecedor</option>
                  <option value="laboratório">Laboratório</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#555] uppercase tracking-wider block mb-1">Integração</label>
                <select
                  value={formData.integrationMethod}
                  onChange={e => setFormData(f => ({ ...f, integrationMethod: e.target.value as any }))}
                  className="w-full bg-[#292929] border border-[#333] text-[#f5f0eb] rounded-md px-3 py-2 text-sm"
                >
                  <option value="manual">Manual</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">E-mail</option>
                </select>
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-[#555] uppercase tracking-wider block mb-1">Contato</label>
                <Input
                  value={formData.contactName}
                  onChange={e => setFormData(f => ({ ...f, contactName: e.target.value }))}
                  placeholder="Nome do responsável"
                  className="bg-[#292929] border-[#333] text-[#f5f0eb] placeholder:text-[#555]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#555] uppercase tracking-wider block mb-1">Telefone</label>
                <Input
                  value={formData.phone}
                  onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                  placeholder="(11) 99999-0000"
                  className="bg-[#292929] border-[#333] text-[#f5f0eb] placeholder:text-[#555]"
                />
              </div>
            </div>

            {/* Email + WhatsApp */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-[#555] uppercase tracking-wider block mb-1">E-mail</label>
                <Input
                  value={formData.email}
                  onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  placeholder="contato@farmacia.com"
                  className="bg-[#292929] border-[#333] text-[#f5f0eb] placeholder:text-[#555]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#555] uppercase tracking-wider block mb-1">WhatsApp</label>
                <Input
                  value={formData.whatsapp}
                  onChange={e => setFormData(f => ({ ...f, whatsapp: e.target.value }))}
                  placeholder="5511999990000"
                  className="bg-[#292929] border-[#333] text-[#f5f0eb] placeholder:text-[#555]"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-[10px] font-mono text-[#555] uppercase tracking-wider block mb-1">Endereço</label>
              <Input
                value={formData.address}
                onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                placeholder="Av. Paulista, 1000 - São Paulo"
                className="bg-[#292929] border-[#333] text-[#f5f0eb] placeholder:text-[#555]"
              />
            </div>

            {/* Specialties */}
            <div>
              <label className="text-[10px] font-mono text-[#555] uppercase tracking-wider block mb-1">Especialidades</label>
              <div className="flex gap-2">
                <Input
                  value={specialtyInput}
                  onChange={e => setSpecialtyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                  placeholder="Ex: manipulados, oncológicos..."
                  className="bg-[#292929] border-[#333] text-[#f5f0eb] placeholder:text-[#555]"
                />
                <Button onClick={addSpecialty} variant="outline" className="border-[#333] text-[#918a82] shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.specialties.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {formData.specialties.map(s => (
                    <button
                      key={s}
                      onClick={() => removeSpecialty(s)}
                      className="px-2 py-0.5 bg-[#292929] text-[#918a82] text-[10px] font-mono rounded hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      {s} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] font-mono text-[#555] uppercase tracking-wider block mb-1">Observações</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                placeholder="Notas adicionais..."
                rows={2}
                className="w-full bg-[#292929] border border-[#333] text-[#f5f0eb] placeholder:text-[#555] rounded-md px-3 py-2 text-sm resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} className="border-[#333] text-[#918a82]">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-[#7c9a72] hover:bg-[#6b8962] text-white"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingPartner ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
