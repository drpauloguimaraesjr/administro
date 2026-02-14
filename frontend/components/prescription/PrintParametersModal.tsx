'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface PrintParametersModalProps {
    open: boolean;
    onClose: () => void;
    onGenerate: (params: PrintParameters) => void;
    doctorName?: string;
    patientName?: string;
    type?: 'simples' | 'controlada';
}

export interface PrintParameters {
    // Shared
    prescriber: string;
    showDate: boolean;
    date: string;
    showStamp: boolean;
    qrCode: boolean;
    type: 'simples' | 'controlada';

    // Simples only
    showHeaderFooter?: boolean;
    headerType?: string;
    stampAllPages?: boolean;
    showPatientName?: boolean;
    showCPF?: boolean;
    showAddress?: boolean;
    showPhone?: boolean;
    showPageNumber?: boolean;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    paperType?: string;
    orientation?: string;

    // Controlada only
    twoCopiesPerPage?: boolean; // "Gerar receita na mesma folha"
}

export function PrintParametersModal({ open, onClose, onGenerate, doctorName = 'Dr. Paulo Guimarães Jr.', type = 'simples' }: PrintParametersModalProps) {
    const today = new Date().toISOString().split('T')[0];

    const [params, setParams] = useState<PrintParameters>({
        type: type,
        prescriber: doctorName,
        showDate: true,
        date: today,
        showStamp: true,
        qrCode: true,
        // Defaults for simples
        showHeaderFooter: true,
        headerType: 'Padrão',
        stampAllPages: true,
        showPatientName: true,
        showCPF: false,
        showAddress: false,
        showPhone: false,
        showPageNumber: true,
        marginTop: '1.0',
        marginBottom: '1.0',
        marginLeft: '1.0',
        marginRight: '1.0',
        paperType: 'A4',
        orientation: 'Retrato',
        // Defaults for controlada
        twoCopiesPerPage: false
    });

    useEffect(() => {
        setParams(prev => ({ ...prev, type }));
    }, [type]);

    const updateParam = (key: keyof PrintParameters, value: any) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Parâmetros da Impressão - {type === 'controlada' ? 'Controle Especial' : 'Simples'}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {type === 'simples' ? (
                        <>
                            {/* ... Existing Simples Form ... */}
                            {/* Row 1 */}
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <Label>Responsável pela receita</Label>
                                <Select value={params.prescriber} onValueChange={(v) => updateParam('prescriber', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={doctorName}>{doctorName}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div className="flex items-center justify-between">
                                    <Label>Exibir Cabeçalho e Rodapé</Label>
                                    <Switch checked={params.showHeaderFooter} onCheckedChange={(v) => updateParam('showHeaderFooter', v)} />
                                </div>
                                <Select value={params.headerType} onValueChange={(v) => updateParam('headerType', v)} disabled={!params.showHeaderFooter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Padrão">Padrão</SelectItem>
                                        <SelectItem value="Simples">Simples</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Row 3 */}
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div className="flex items-center justify-between">
                                    <Label>Exibir data</Label>
                                    <Switch checked={params.showDate} onCheckedChange={(v) => updateParam('showDate', v)} />
                                </div>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={params.date}
                                        onChange={(e) => updateParam('date', e.target.value)}
                                        disabled={!params.showDate}
                                    />
                                </div>
                            </div>

                            {/* Row 4 */}
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div className="flex items-center justify-between">
                                    <Label>Exibir carimbo do médico</Label>
                                    <Switch checked={params.showStamp} onCheckedChange={(v) => updateParam('showStamp', v)} />
                                </div>
                                <div className="flex items-center justify-between px-2">
                                    <Label className="text-gray-500 text-sm">Carimbo em todas as páginas</Label>
                                    <Switch checked={params.stampAllPages} onCheckedChange={(v) => updateParam('stampAllPages', v)} disabled={!params.showStamp} />
                                </div>
                            </div>

                            {/* Row 5 - Patient Info */}
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div className="flex items-center justify-between">
                                    <Label>Exibir nome do paciente</Label>
                                    <Switch checked={params.showPatientName} onCheckedChange={(v) => updateParam('showPatientName', v)} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className={!params.showCPF ? "text-gray-400" : ""}>Exibir CPF</Label>
                                    <Switch checked={params.showCPF} onCheckedChange={(v) => updateParam('showCPF', v)} />
                                </div>
                            </div>

                            {/* Row 6 */}
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div className="flex items-center justify-between">
                                    <Label className={!params.showAddress ? "text-gray-400" : ""}>Exibir endereço</Label>
                                    <Switch checked={params.showAddress} onCheckedChange={(v) => updateParam('showAddress', v)} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className={!params.showPhone ? "text-gray-400" : ""}>Exibir telefone</Label>
                                    <Switch checked={params.showPhone} onCheckedChange={(v) => updateParam('showPhone', v)} />
                                </div>
                            </div>

                            {/* Row 7 */}
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div className="flex items-center justify-between">
                                    <Label>Exibir nº de páginas</Label>
                                    <Switch checked={params.showPageNumber} onCheckedChange={(v) => updateParam('showPageNumber', v)} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Autenticação digital (QR Code)</Label>
                                    <Switch checked={params.qrCode} onCheckedChange={(v) => updateParam('qrCode', v)} />
                                </div>
                            </div>

                            <div className="border-t my-2"></div>

                            {/* Margins */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-gray-500">Margem Superior</Label>
                                        <div className="flex items-center gap-1">
                                            <Input value={params.marginTop} onChange={(e) => updateParam('marginTop', e.target.value)} className="h-8" />
                                            <span className="text-xs text-gray-500">cm</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-gray-500">Margem Inferior</Label>
                                        <div className="flex items-center gap-1">
                                            <Input value={params.marginBottom} onChange={(e) => updateParam('marginBottom', e.target.value)} className="h-8" />
                                            <span className="text-xs text-gray-500">cm</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-gray-500">Margem Esquerda</Label>
                                        <div className="flex items-center gap-1">
                                            <Input value={params.marginLeft} onChange={(e) => updateParam('marginLeft', e.target.value)} className="h-8" />
                                            <span className="text-xs text-gray-500">cm</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-gray-500">Margem Direita</Label>
                                        <div className="flex items-center gap-1">
                                            <Input value={params.marginRight} onChange={(e) => updateParam('marginRight', e.target.value)} className="h-8" />
                                            <span className="text-xs text-gray-500">cm</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Paper */}
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="space-y-1">
                                    <Label>Tipo de Papel</Label>
                                    <Select value={params.paperType} onValueChange={(v) => updateParam('paperType', v)}>
                                        <SelectTrigger className="h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A4">A4</SelectItem>
                                            <SelectItem value="Letter">Carta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Orientação do Papel</Label>
                                    <Select value={params.orientation} onValueChange={(v) => updateParam('orientation', v)}>
                                        <SelectTrigger className="h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Retrato">Retrato</SelectItem>
                                            <SelectItem value="Paisagem">Paisagem</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* CONTROLADA FORM (Simplified per user image) */}
                            {/* Exibir Carimbo + Doctor Select */}
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div className="flex items-center justify-between">
                                    <Label>Exibir Carimbo</Label>
                                    <Switch checked={params.showStamp} onCheckedChange={(v) => updateParam('showStamp', v)} />
                                </div>
                                <Select value={params.prescriber} onValueChange={(v) => updateParam('prescriber', v)} disabled={!params.showStamp}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={doctorName}>{doctorName}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Autenticação Digital */}
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <Label>Autenticação digital (QR Code)</Label>
                                <div className="flex justify-end">
                                    <Switch checked={params.qrCode} onCheckedChange={(v) => updateParam('qrCode', v)} />
                                </div>
                            </div>

                            {/* Exibir Data */}
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div className="flex items-center justify-between">
                                    <Label>Exibir Data</Label>
                                    <Switch checked={params.showDate} onCheckedChange={(v) => updateParam('showDate', v)} />
                                </div>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={params.date}
                                        onChange={(e) => updateParam('date', e.target.value)}
                                        disabled={!params.showDate}
                                    />
                                </div>
                            </div>

                            {/* Gerar receita na mesma folha */}
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <Label>Gerar receita na mesma folha</Label>
                                <div className="flex justify-end">
                                    <Switch checked={params.twoCopiesPerPage} onCheckedChange={(v) => updateParam('twoCopiesPerPage', v)} />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={() => onGenerate(params)} className="w-full bg-primary hover:bg-purple-700">
                        Gerar Prévia de Impressão
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
