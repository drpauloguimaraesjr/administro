'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Image, Type, Eye, Trash2, Save, ArrowLeft, FileText, AlertTriangle, Droplets, Sparkles, Maximize2, Phone, MapPin, Instagram, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DOCTOR_CONFIG, formatCRM } from '@/lib/doctor-config';
import api from '@/lib/api';
import Link from 'next/link';

// Decorative background effects catalog
const DECORATIVE_EFFECTS = [
    {
        id: 'none',
        name: 'Nenhum',
        icon: '✕',
        svg: '',
    },
    {
        id: 'dna-helix',
        name: 'DNA Helix',
        icon: '🧬',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="80" viewBox="0 0 60 80"><path d="M30 0Q45 20 30 40Q15 60 30 80" stroke="currentColor" fill="none" stroke-width="1.5" opacity="0.15"/><path d="M30 0Q15 20 30 40Q45 60 30 80" stroke="currentColor" fill="none" stroke-width="1.5" opacity="0.15"/><line x1="18" y1="10" x2="42" y2="10" stroke="currentColor" stroke-width="0.8" opacity="0.1"/><line x1="15" y1="20" x2="45" y2="20" stroke="currentColor" stroke-width="0.8" opacity="0.1"/><line x1="18" y1="30" x2="42" y2="30" stroke="currentColor" stroke-width="0.8" opacity="0.1"/><line x1="18" y1="50" x2="42" y2="50" stroke="currentColor" stroke-width="0.8" opacity="0.1"/><line x1="15" y1="60" x2="45" y2="60" stroke="currentColor" stroke-width="0.8" opacity="0.1"/><line x1="18" y1="70" x2="42" y2="70" stroke="currentColor" stroke-width="0.8" opacity="0.1"/></svg>`,
    },
    {
        id: 'clouds',
        name: 'Nuvens',
        icon: '☁️',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60"><ellipse cx="40" cy="35" rx="25" ry="15" fill="currentColor" opacity="0.06"/><ellipse cx="55" cy="28" rx="18" ry="12" fill="currentColor" opacity="0.05"/><ellipse cx="25" cy="30" rx="15" ry="10" fill="currentColor" opacity="0.04"/><ellipse cx="95" cy="45" rx="20" ry="12" fill="currentColor" opacity="0.05"/><ellipse cx="108" cy="40" rx="14" ry="9" fill="currentColor" opacity="0.04"/></svg>`,
    },
    {
        id: 'bamboo',
        name: 'Bambu',
        icon: '🎋',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="100" viewBox="0 0 80 100"><line x1="20" y1="0" x2="20" y2="100" stroke="currentColor" stroke-width="3" opacity="0.08"/><line x1="60" y1="0" x2="60" y2="100" stroke="currentColor" stroke-width="2.5" opacity="0.06"/><line x1="18" y1="25" x2="22" y2="25" stroke="currentColor" stroke-width="2" opacity="0.1"/><line x1="18" y1="50" x2="22" y2="50" stroke="currentColor" stroke-width="2" opacity="0.1"/><line x1="18" y1="75" x2="22" y2="75" stroke="currentColor" stroke-width="2" opacity="0.1"/><line x1="58" y1="20" x2="62" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.08"/><line x1="58" y1="55" x2="62" y2="55" stroke="currentColor" stroke-width="1.5" opacity="0.08"/><line x1="58" y1="85" x2="62" y2="85" stroke="currentColor" stroke-width="1.5" opacity="0.08"/><path d="M22 25Q35 15 35 25Q35 35 22 30" fill="currentColor" opacity="0.05"/><path d="M22 50Q38 40 35 50Q32 60 22 55" fill="currentColor" opacity="0.04"/></svg>`,
    },
    {
        id: 'caduceus',
        name: 'Caduceu',
        icon: '⚕️',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="80" viewBox="0 0 60 80"><line x1="30" y1="5" x2="30" y2="75" stroke="currentColor" stroke-width="2" opacity="0.08"/><path d="M30 15Q45 20 30 30Q15 40 30 50" stroke="currentColor" fill="none" stroke-width="1.5" opacity="0.06"/><path d="M30 15Q15 20 30 30Q45 40 30 50" stroke="currentColor" fill="none" stroke-width="1.5" opacity="0.06"/><circle cx="22" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1" opacity="0.07"/><circle cx="38" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1" opacity="0.07"/><line x1="25" y1="75" x2="35" y2="75" stroke="currentColor" stroke-width="2" opacity="0.08"/></svg>`,
    },
    {
        id: 'hexagons',
        name: 'Hexágonos',
        icon: '⬡',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="70" viewBox="0 0 80 70"><polygon points="40,5 65,17 65,42 40,54 15,42 15,17" fill="none" stroke="currentColor" stroke-width="1" opacity="0.06"/><polygon points="40,35 55,42 55,56 40,63 25,56 25,42" fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.04"/></svg>`,
    },
    {
        id: 'waves',
        name: 'Ondas',
        icon: '🌊',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"><path d="M0 20Q15 5 30 20Q45 35 60 20Q75 5 90 20Q105 35 120 20" stroke="currentColor" fill="none" stroke-width="1.5" opacity="0.06"/><path d="M0 30Q15 18 30 30Q45 42 60 30Q75 18 90 30Q105 42 120 30" stroke="currentColor" fill="none" stroke-width="1" opacity="0.04"/></svg>`,
    },
    {
        id: 'leaves',
        name: 'Folhas',
        icon: '🍃',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><path d="M40 10Q60 20 50 40Q40 60 20 50Q30 30 40 10Z" fill="currentColor" opacity="0.04"/><path d="M55 55Q70 45 65 60Q60 75 45 70Q50 60 55 55Z" fill="currentColor" opacity="0.03"/></svg>`,
    },
    {
        id: 'circles',
        name: 'Círculos',
        icon: '◎',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" stroke-width="1" opacity="0.05"/><circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.04"/><circle cx="40" cy="40" r="10" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.03"/></svg>`,
    },
];

interface PrescriptionSettings {
    headerImageUrl?: string | null;
    footerImageUrl?: string | null;
    watermark?: {
        enabled: boolean;
        type: 'image' | 'text';
        imageUrl?: string | null;
        text?: string;
        opacity: number;
        scale?: number;
        effect?: string;
        applyTo: 'simples' | 'controlada' | 'ambas';
    };
    margins?: {
        headerSpacing: number;
        footerSpacing: number;
    };
    footerInfo?: {
        address?: string;
        phone?: string;
        showWhatsAppIcon?: boolean;
        instagramDoctor?: string;
        instagramClinic?: string;
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
                scale: prev.watermark?.scale ?? 60,
                applyTo: prev.watermark?.applyTo ?? 'ambas',
                ...prev.watermark,
                ...updates,
            }
        }));
        setIsDirty(true);
    };

    const updateFooterInfo = (updates: Partial<NonNullable<PrescriptionSettings['footerInfo']>>) => {
        setLocalSettings(prev => ({
            ...prev,
            footerInfo: {
                ...prev.footerInfo,
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

                            {/* Footer Contact Info */}
                            <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
                                <Label className="text-sm font-semibold">Informações de Contato (Rodapé)</Label>
                                <p className="text-xs text-muted-foreground">
                                    Aparecerão no rodapé da receita, abaixo da imagem de rodapé (se houver).
                                </p>

                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> Endereço da Clínica
                                        </Label>
                                        <Input
                                            value={localSettings.footerInfo?.address ?? ''}
                                            onChange={(e) => updateFooterInfo({ address: e.target.value })}
                                            placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF"
                                            className="h-8"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> Telefone / WhatsApp
                                        </Label>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                value={localSettings.footerInfo?.phone ?? ''}
                                                onChange={(e) => updateFooterInfo({ phone: e.target.value })}
                                                placeholder="(47) 99999-9999"
                                                className="h-8 flex-1"
                                            />
                                            <div className="flex items-center gap-1.5">
                                                <Switch
                                                    checked={localSettings.footerInfo?.showWhatsAppIcon ?? true}
                                                    onCheckedChange={(v) => updateFooterInfo({ showWhatsAppIcon: v })}
                                                />
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                    {localSettings.footerInfo?.showWhatsAppIcon !== false ? '📱 WhatsApp' : 'Sem ícone'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Instagram className="w-3 h-3" /> Instagram Médico
                                            </Label>
                                            <Input
                                                value={localSettings.footerInfo?.instagramDoctor ?? ''}
                                                onChange={(e) => updateFooterInfo({ instagramDoctor: e.target.value })}
                                                placeholder="@dr.exemplo"
                                                className="h-8"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Instagram className="w-3 h-3" /> Instagram Clínica
                                            </Label>
                                            <Input
                                                value={localSettings.footerInfo?.instagramClinic ?? ''}
                                                onChange={(e) => updateFooterInfo({ instagramClinic: e.target.value })}
                                                placeholder="@clinica.exemplo"
                                                className="h-8"
                                            />
                                        </div>
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

                                        {/* Scale */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Maximize2 className="w-3 h-3" /> Tamanho
                                                </Label>
                                                <span className="text-xs font-mono text-muted-foreground">
                                                    {localSettings.watermark?.scale ?? 60}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="20"
                                                max="100"
                                                value={localSettings.watermark?.scale ?? 60}
                                                onChange={(e) => updateWatermark({ scale: parseInt(e.target.value) })}
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

                                        {/* Decorative Effects */}
                                        <div className="space-y-2 pt-2 border-t border-border/50">
                                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" /> Efeito Decorativo
                                            </Label>
                                            <p className="text-[10px] text-muted-foreground/60">
                                                Padrões sutis que preenchem o fundo além da marca d&apos;água
                                            </p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {DECORATIVE_EFFECTS.map((effect) => (
                                                    <button
                                                        key={effect.id}
                                                        onClick={() => updateWatermark({ effect: effect.id })}
                                                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs transition-all ${
                                                            (localSettings.watermark?.effect ?? 'none') === effect.id
                                                                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
                                                                : 'border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
                                                        }`}
                                                    >
                                                        <span className="text-base">{effect.icon}</span>
                                                        <span className="text-[10px] leading-tight">{effect.name}</span>
                                                    </button>
                                                ))}
                                            </div>
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

                                    {/* Decorative effect pattern */}
                                    {localSettings.watermark?.enabled &&
                                        localSettings.watermark?.effect &&
                                        localSettings.watermark.effect !== 'none' && (
                                        <div
                                            className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
                                            style={{
                                                opacity: localSettings.watermark.opacity * 1.5,
                                                backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                                                    DECORATIVE_EFFECTS.find(e => e.id === localSettings.watermark?.effect)?.svg?.replace(/currentColor/g, '%23999') || ''
                                                )}")`,
                                                backgroundRepeat: 'repeat',
                                                backgroundSize: `${(localSettings.watermark.scale ?? 60) * 1.5}px`,
                                            }}
                                        />
                                    )}

                                    {/* Watermark preview */}
                                    {localSettings.watermark?.enabled && (
                                        activeTab === 'watermark' || activeTab === 'header-footer'
                                    ) && (
                                        <div
                                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]"
                                            style={{ opacity: localSettings.watermark.opacity }}
                                        >
                                            {localSettings.watermark.type === 'image' && localSettings.watermark.imageUrl ? (
                                                <img
                                                    src={localSettings.watermark.imageUrl}
                                                    alt="Watermark"
                                                    style={{
                                                        maxWidth: `${localSettings.watermark.scale ?? 60}%`,
                                                        maxHeight: `${localSettings.watermark.scale ?? 60}%`,
                                                    }}
                                                    className="object-contain"
                                                />
                                            ) : localSettings.watermark.type === 'text' && localSettings.watermark.text ? (
                                                <div
                                                    className="text-gray-400 font-serif transform -rotate-45 select-none whitespace-nowrap"
                                                    style={{ fontSize: `${Math.max(24, (localSettings.watermark.scale ?? 60) * 0.9)}px` }}
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

                                    {/* Footer Contact Info Bar */}
                                    {(localSettings.footerInfo?.address || localSettings.footerInfo?.phone || localSettings.footerInfo?.instagramDoctor || localSettings.footerInfo?.instagramClinic) && (
                                        <div className="mt-2 pt-2 border-t border-gray-200 px-4">
                                            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[9px] text-gray-500">
                                                {localSettings.footerInfo.address && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-2.5 h-2.5" />
                                                        {localSettings.footerInfo.address}
                                                    </span>
                                                )}
                                                {localSettings.footerInfo.phone && (
                                                    <span className="flex items-center gap-1">
                                                        {localSettings.footerInfo.showWhatsAppIcon !== false ? (
                                                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                                                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.215l-.29-.175-3.01.79.79-3.01-.175-.29A8 8 0 1112 20z"/>
                                                            </svg>
                                                        ) : (
                                                            <Phone className="w-2.5 h-2.5" />
                                                        )}
                                                        {localSettings.footerInfo.phone}
                                                    </span>
                                                )}
                                                {localSettings.footerInfo.instagramDoctor && (
                                                    <span className="flex items-center gap-1">
                                                        <Instagram className="w-2.5 h-2.5" />
                                                        {localSettings.footerInfo.instagramDoctor}
                                                    </span>
                                                )}
                                                {localSettings.footerInfo.instagramClinic && (
                                                    <span className="flex items-center gap-1">
                                                        <Instagram className="w-2.5 h-2.5" />
                                                        {localSettings.footerInfo.instagramClinic}
                                                    </span>
                                                )}
                                            </div>
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
