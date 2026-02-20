'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Image, Type, Eye, Trash2, Save, ArrowLeft, FileText, AlertTriangle, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DOCTOR_CONFIG, formatCRM } from '@/lib/doctor-config';
import api from '@/lib/api';
import Link from 'next/link';

interface PrescriptionSettings {
    headerImageUrl?: string | null;
    footerImageUrl?: string | null;
    watermark?: {
        enabled: boolean;
        type: 'image' | 'text';
        imageUrl?: string | null;
        text?: string;
        opacity: number;
        applyTo: 'simples' | 'controlada' | 'ambas';
    };
    margins?: {
        headerSpacing: number;
        footerSpacing: number;
    };
}

type TabId = 'header-footer' | 'watermark' | 'controlada';

export default function ReceituarioPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabId>('header-footer');
    const [localSettings, setLocalSettings] = useState<PrescriptionSettings>({});
    const [isDirty, setIsDirty] = useState(false);

    const headerInputRef = useRef<HTMLInputElement>(null);
    const footerInputRef = useRef<HTMLInputElement>(null);
    const watermarkInputRef = useRef<HTMLInputElement>(null);

    // Load settings
    const { data: savedSettings, isLoading } = useQuery({
        queryKey: ['prescription-settings'],
        queryFn: async () => {
            const res = await api.get('/settings/prescription');
            return res.data as PrescriptionSettings;
        },
    });

    useEffect(() => {
        if (savedSettings) {
            setLocalSettings(savedSettings);
        }
    }, [savedSettings]);

    // Save settings mutation
    const saveMutation = useMutation({
        mutationFn: async (data: PrescriptionSettings) => {
            const res = await api.put('/settings/prescription', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prescription-settings'] });
            setIsDirty(false);
        },
    });

    // Upload image mutation
    const uploadMutation = useMutation({
        mutationFn: async ({ image, type }: { image: string; type: string }) => {
            const res = await api.post('/settings/prescription/upload', { image, type });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prescription-settings'] });
        },
    });

    // Delete image mutation
    const deleteMutation = useMutation({
        mutationFn: async (type: string) => {
            const res = await api.delete(`/settings/prescription/image/${type}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prescription-settings'] });
        },
    });

    const handleFileUpload = useCallback((file: File, type: 'header' | 'footer' | 'watermark') => {
        if (file.size > 2 * 1024 * 1024) {
            alert('Imagem muito grande. Máximo: 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUri = e.target?.result as string;
            uploadMutation.mutate({ image: dataUri, type });

            if (type === 'header') {
                setLocalSettings(prev => ({ ...prev, headerImageUrl: dataUri }));
            } else if (type === 'footer') {
                setLocalSettings(prev => ({ ...prev, footerImageUrl: dataUri }));
            } else {
                setLocalSettings(prev => ({
                    ...prev,
                    watermark: { ...prev.watermark!, imageUrl: dataUri, enabled: true, type: 'image', opacity: prev.watermark?.opacity ?? 0.15, applyTo: prev.watermark?.applyTo ?? 'ambas' }
                }));
            }
        };
        reader.readAsDataURL(file);
    }, [uploadMutation]);

    const handleDeleteImage = (type: 'header' | 'footer' | 'watermark') => {
        deleteMutation.mutate(type);
        if (type === 'header') {
            setLocalSettings(prev => ({ ...prev, headerImageUrl: null }));
        } else if (type === 'footer') {
            setLocalSettings(prev => ({ ...prev, footerImageUrl: null }));
        } else {
            setLocalSettings(prev => ({
                ...prev,
                watermark: { ...prev.watermark!, imageUrl: null }
            }));
        }
    };

    const updateWatermark = (updates: Partial<PrescriptionSettings['watermark']>) => {
        setLocalSettings(prev => ({
            ...prev,
            watermark: {
                enabled: prev.watermark?.enabled ?? false,
                type: prev.watermark?.type ?? 'text',
                opacity: prev.watermark?.opacity ?? 0.15,
                applyTo: prev.watermark?.applyTo ?? 'ambas',
                ...prev.watermark,
                ...updates,
            }
        }));
        setIsDirty(true);
    };

    const updateMargins = (updates: Partial<PrescriptionSettings['margins']>) => {
        setLocalSettings(prev => ({
            ...prev,
            margins: {
                headerSpacing: prev.margins?.headerSpacing ?? 1,
                footerSpacing: prev.margins?.footerSpacing ?? 1,
                ...prev.margins,
                ...updates,
            }
        }));
        setIsDirty(true);
    };

    const handleSave = () => {
        saveMutation.mutate(localSettings);
    };

    const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
        { id: 'header-footer', label: 'Cabeçalho & Rodapé', icon: FileText },
        { id: 'watermark', label: 'Marca d\'Água', icon: Droplets },
        { id: 'controlada', label: 'Receita Controlada', icon: AlertTriangle },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border border-border border-t-primary animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/configuracoes">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-serif text-2xl font-bold text-foreground">Receituário</h1>
                        <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.1em]">
                            Configurações de impressão e layout
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={!isDirty || saveMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saveMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                            activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex gap-6">
                {/* Left: Controls */}
                <div className="w-[400px] shrink-0 space-y-6">
                    {activeTab === 'header-footer' && (
                        <>
                            {/* Header Upload */}
                            <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
                                <Label className="text-sm font-semibold">Imagem do Cabeçalho</Label>
                                <p className="text-xs text-muted-foreground">
                                    Upload de uma imagem pronta (criada no Canva, CorelDRAW, etc.). Formatos: PNG, JPG. Máximo: 2MB.
                                </p>

                                <input
                                    ref={headerInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, 'header');
                                    }}
                                />

                                {localSettings.headerImageUrl ? (
                                    <div className="relative group">
                                        <img
                                            src={localSettings.headerImageUrl}
                                            alt="Cabeçalho"
                                            className="w-full rounded border border-border"
                                        />
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => headerInputRef.current?.click()}
                                            >
                                                <Upload className="w-3 h-3 mr-1" />
                                                Trocar
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteImage('header')}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => headerInputRef.current?.click()}
                                        className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                                    >
                                        <Upload className="w-5 h-5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground font-medium">Clique para fazer upload do cabeçalho</span>
                                    </button>
                                )}
                            </div>

                            {/* Footer Upload */}
                            <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
                                <Label className="text-sm font-semibold">Imagem do Rodapé</Label>
                                <p className="text-xs text-muted-foreground">
                                    Opcional. Aparece na parte inferior da receita simples.
                                </p>

                                <input
                                    ref={footerInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, 'footer');
                                    }}
                                />

                                {localSettings.footerImageUrl ? (
                                    <div className="relative group">
                                        <img
                                            src={localSettings.footerImageUrl}
                                            alt="Rodapé"
                                            className="w-full rounded border border-border"
                                        />
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => footerInputRef.current?.click()}
                                            >
                                                <Upload className="w-3 h-3 mr-1" />
                                                Trocar
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteImage('footer')}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => footerInputRef.current?.click()}
                                        className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                                    >
                                        <Upload className="w-5 h-5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground font-medium">Clique para fazer upload do rodapé</span>
                                    </button>
                                )}
                            </div>

                            {/* Margins */}
                            <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
                                <Label className="text-sm font-semibold">Espaçamento</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Após cabeçalho (cm)</Label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            max="5"
                                            value={localSettings.margins?.headerSpacing ?? 1}
                                            onChange={(e) => updateMargins({ headerSpacing: parseFloat(e.target.value) || 0 })}
                                            className="h-8"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Antes do rodapé (cm)</Label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            max="5"
                                            value={localSettings.margins?.footerSpacing ?? 1}
                                            onChange={(e) => updateMargins({ footerSpacing: parseFloat(e.target.value) || 0 })}
                                            className="h-8"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'watermark' && (
                        <>
                            <div className="border border-border rounded-lg p-4 space-y-4 bg-card">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold">Marca d&apos;Água</Label>
                                    <Switch
                                        checked={localSettings.watermark?.enabled ?? false}
                                        onCheckedChange={(v) => updateWatermark({ enabled: v })}
                                    />
                                </div>

                                {localSettings.watermark?.enabled && (
                                    <>
                                        {/* Type selector */}
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Tipo</Label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateWatermark({ type: 'image' })}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${
                                                        localSettings.watermark?.type === 'image'
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-border text-muted-foreground hover:border-primary/50'
                                                    }`}
                                                >
                                                    <Image className="w-4 h-4" />
                                                    Imagem
                                                </button>
                                                <button
                                                    onClick={() => updateWatermark({ type: 'text' })}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${
                                                        localSettings.watermark?.type === 'text'
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-border text-muted-foreground hover:border-primary/50'
                                                    }`}
                                                >
                                                    <Type className="w-4 h-4" />
                                                    Texto
                                                </button>
                                            </div>
                                        </div>

                                        {/* Image Upload */}
                                        {localSettings.watermark?.type === 'image' && (
                                            <div className="space-y-2">
                                                <input
                                                    ref={watermarkInputRef}
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/webp"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileUpload(file, 'watermark');
                                                    }}
                                                />

                                                {localSettings.watermark?.imageUrl ? (
                                                    <div className="relative group">
                                                        <img
                                                            src={localSettings.watermark.imageUrl}
                                                            alt="Marca d'água"
                                                            className="w-full rounded border border-border"
                                                            style={{ opacity: localSettings.watermark.opacity }}
                                                        />
                                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => watermarkInputRef.current?.click()}
                                                            >
                                                                <Upload className="w-3 h-3 mr-1" />
                                                                Trocar
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDeleteImage('watermark')}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => watermarkInputRef.current?.click()}
                                                        className="w-full h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                                                    >
                                                        <Upload className="w-5 h-5 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">Upload imagem</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Text Input */}
                                        {localSettings.watermark?.type === 'text' && (
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground">Texto</Label>
                                                <Input
                                                    value={localSettings.watermark?.text ?? ''}
                                                    onChange={(e) => updateWatermark({ text: e.target.value })}
                                                    placeholder="Ex: Dr. Paulo Guimarães"
                                                    className="h-8"
                                                />
                                            </div>
                                        )}

                                        {/* Opacity */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs text-muted-foreground">Opacidade</Label>
                                                <span className="text-xs font-mono text-muted-foreground">
                                                    {Math.round((localSettings.watermark?.opacity ?? 0.15) * 100)}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="5"
                                                max="40"
                                                value={Math.round((localSettings.watermark?.opacity ?? 0.15) * 100)}
                                                onChange={(e) => updateWatermark({ opacity: parseInt(e.target.value) / 100 })}
                                                className="w-full accent-primary"
                                            />
                                        </div>

                                        {/* Apply To */}
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Aplicar em</Label>
                                            <Select
                                                value={localSettings.watermark?.applyTo ?? 'ambas'}
                                                onValueChange={(v: any) => updateWatermark({ applyTo: v })}
                                            >
                                                <SelectTrigger className="h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ambas">Ambas (Simples + Controlada)</SelectItem>
                                                    <SelectItem value="simples">Apenas Receita Simples</SelectItem>
                                                    <SelectItem value="controlada">Apenas Receita Controlada</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'controlada' && (
                        <div className="border border-border rounded-lg p-4 space-y-4 bg-card">
                            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <p className="text-xs">
                                    O modelo de Receituário de Controle Especial segue o padrão obrigatório da <strong>ANVISA</strong>.
                                    Não é possível alterar o layout.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">Dados do Emitente (automáticos)</Label>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-1 border-b border-border/50">
                                        <span className="text-muted-foreground">Nome</span>
                                        <span className="font-medium">{DOCTOR_CONFIG.name}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-border/50">
                                        <span className="text-muted-foreground">CRM</span>
                                        <span className="font-medium">{formatCRM(DOCTOR_CONFIG.crm, DOCTOR_CONFIG.uf)}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-border/50">
                                        <span className="text-muted-foreground">CPF</span>
                                        <span className="font-medium">{DOCTOR_CONFIG.cpf}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-border/50">
                                        <span className="text-muted-foreground">Telefone</span>
                                        <span className="font-medium">{DOCTOR_CONFIG.phone}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-border/50">
                                        <span className="text-muted-foreground">Endereço</span>
                                        <span className="font-medium text-right max-w-[60%]">{DOCTOR_CONFIG.fullAddress}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2">
                                    Estes dados são carregados de <code className="bg-muted px-1 rounded">doctor-config.ts</code>.
                                    Para alterar, edite o arquivo de configuração do médico.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Live Preview */}
                <div className="flex-1 bg-foreground/5 rounded-lg p-6 flex justify-center items-start overflow-auto">
                    <div className="bg-white shadow-xl w-[210mm] min-h-[297mm] relative" style={{ transform: 'scale(0.55)', transformOrigin: 'top center' }}>
                        {activeTab === 'controlada' ? (
                            // Controlled prescription preview
                            <div className="p-6 text-[11px] leading-tight">
                                <div className="border-2 border-black">
                                    <div className="bg-black text-white text-center py-1 font-bold text-sm">
                                        Receituário de Controle Especial
                                    </div>
                                    <div className="flex">
                                        <div className="flex-1 p-2 border-r border-black">
                                            <div className="font-bold text-center border-b border-black pb-1 mb-2">
                                                Identificação do Emitente
                                            </div>
                                            <table className="w-full">
                                                <tbody>
                                                    <tr>
                                                        <td className="font-semibold w-24">Nome Completo:</td>
                                                        <td colSpan={3}>{DOCTOR_CONFIG.name}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold">CRM:</td>
                                                        <td>{DOCTOR_CONFIG.crm}</td>
                                                        <td className="font-semibold w-10">UF:</td>
                                                        <td>{DOCTOR_CONFIG.uf}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold">Endereço:</td>
                                                        <td colSpan={3}>{DOCTOR_CONFIG.fullAddress}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold">Telefone:</td>
                                                        <td>{DOCTOR_CONFIG.phone}</td>
                                                        <td className="font-semibold">CPF:</td>
                                                        <td>{DOCTOR_CONFIG.cpf}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="w-32 flex flex-col justify-center items-center p-2">
                                            <div className="font-bold text-right">1ª VIA FARMÁCIA</div>
                                            <div className="font-bold text-right">2ª VIA PACIENTE</div>
                                        </div>
                                    </div>
                                    <div className="border-t-2 border-black">
                                        <div className="font-bold text-center border-b border-black py-1">
                                            Identificação do Paciente
                                        </div>
                                        <div className="p-2">
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                <div><span className="font-semibold">Paciente:</span> Nome do Paciente</div>
                                                <div></div>
                                                <div><span className="font-semibold">CPF:</span> 000.000.000-00</div>
                                                <div><span className="font-semibold">RG:</span></div>
                                                <div><span className="font-semibold">Sexo:</span> Masculino</div>
                                                <div><span className="font-semibold">Telefone:</span> (47) 9 0000-0000</div>
                                                <div><span className="font-semibold">Nascimento:</span> 01/01/1990</div>
                                                <div><span className="font-semibold">Idade:</span> 36 anos</div>
                                                <div className="col-span-2"><span className="font-semibold">Endereço:</span> Endereço do Paciente</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="text-center font-bold text-base border-b-2 border-black pb-1 mb-4">
                                        PRESCRIÇÃO
                                    </div>
                                    <div className="min-h-[250px] text-sm text-gray-400 italic">
                                        O conteúdo da prescrição aparecerá aqui...
                                    </div>
                                    <div className="text-center mt-8 pt-4">
                                        <div className="font-bold">{DOCTOR_CONFIG.shortName}</div>
                                        <div className="text-sm">{formatCRM(DOCTOR_CONFIG.crm, DOCTOR_CONFIG.uf)}</div>
                                    </div>
                                </div>

                                <div className="mt-12 border-2 border-black">
                                    <div className="flex">
                                        <div className="flex-1 border-r border-black p-3">
                                            <div className="font-bold text-center border-b border-black pb-1 mb-2">
                                                Identificação do Comprador
                                            </div>
                                            <div className="space-y-3">
                                                <div>Nome:</div>
                                                <div className="flex gap-8"><span>Identidade:</span><span>Órgão Emissor:</span></div>
                                                <div>Endereço:</div>
                                                <div>Telefone:</div>
                                            </div>
                                        </div>
                                        <div className="w-1/3 p-3">
                                            <div className="font-bold text-center border-b border-black pb-1 mb-2">
                                                Identificação do Fornecedor
                                            </div>
                                            <div className="h-20"></div>
                                            <div className="flex justify-between border-t border-black pt-2">
                                                <span>Assinatura do Farmacêutico</span>
                                                <span>Data</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Simple prescription preview
                            <div className="flex flex-col min-h-[297mm]">
                                {/* Header Image */}
                                {localSettings.headerImageUrl ? (
                                    <div style={{ marginBottom: `${localSettings.margins?.headerSpacing ?? 1}cm` }}>
                                        <img src={localSettings.headerImageUrl} alt="Cabeçalho" className="w-full" />
                                    </div>
                                ) : (
                                    <div className="h-24 border-b-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-sm">
                                        Cabeçalho (faça upload à esquerda)
                                    </div>
                                )}

                                {/* Content preview */}
                                <div className="flex-1 px-8 py-4">
                                    <p className="text-sm text-gray-600 mb-4">
                                        <strong>Para:</strong> Nome do Paciente
                                    </p>
                                    <p className="text-sm text-gray-400 italic">
                                        O conteúdo da prescrição aparecerá aqui...
                                    </p>

                                    {/* Watermark preview */}
                                    {localSettings.watermark?.enabled && (
                                        activeTab === 'watermark' || activeTab === 'header-footer'
                                    ) && (
                                        <div
                                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                            style={{ opacity: localSettings.watermark.opacity }}
                                        >
                                            {localSettings.watermark.type === 'image' && localSettings.watermark.imageUrl ? (
                                                <img
                                                    src={localSettings.watermark.imageUrl}
                                                    alt="Watermark"
                                                    className="max-w-[60%] max-h-[60%] object-contain"
                                                />
                                            ) : localSettings.watermark.type === 'text' && localSettings.watermark.text ? (
                                                <div
                                                    className="text-gray-400 font-serif text-6xl transform -rotate-45 select-none whitespace-nowrap"
                                                >
                                                    {localSettings.watermark.text}
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                </div>

                                {/* Footer Image */}
                                <div className="mt-auto" style={{ marginTop: `${localSettings.margins?.footerSpacing ?? 1}cm` }}>
                                    {localSettings.footerImageUrl ? (
                                        <img src={localSettings.footerImageUrl} alt="Rodapé" className="w-full" />
                                    ) : (
                                        <div className="h-16 border-t-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-sm">
                                            Rodapé (faça upload à esquerda)
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
