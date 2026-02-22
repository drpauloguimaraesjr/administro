'use client';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, FileDown, Send, Syringe, Check, X, Loader2, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface InjectableItem {
    name: string;
    route: string;
    dosage: string;
}

interface PostEmissionData {
    prescriptionId: string;
    prescriptionTitle: string;
    prescriptionContent: string;
    prescriptionType: 'simples' | 'controlada';
    patientId: string;
    patientName: string;
    patientPhone?: string;
    injectables: InjectableItem[];
    nursingOrdersCreated: number;
}

interface PostEmissionActionsModalProps {
    open: boolean;
    onClose: () => void;
    data: PostEmissionData | null;
    onPrint: () => void;
}

export function PostEmissionActionsModal({
    open,
    onClose,
    data,
    onPrint,
}: PostEmissionActionsModalProps) {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [whatsAppSent, setWhatsAppSent] = useState(false);

    if (!data) return null;

    const hasInjectables = data.injectables.length > 0;
    const hasPhone = !!data.patientPhone;

    const handleGeneratePdf = async () => {
        setIsGeneratingPdf(true);
        try {
            const res = await api.post(`/settings/prescriptions/${data.prescriptionId}/pdf`, {
                patientId: data.patientId,
                type: data.prescriptionType,
            }, { responseType: 'blob' });

            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);

            // Auto-download
            const link = document.createElement('a');
            link.href = url;
            link.download = `receita-${data.patientName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('PDF gerado com sucesso!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Erro ao gerar PDF. Tente novamente.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleSendWhatsApp = async () => {
        if (!hasPhone) {
            toast.error('Paciente não possui telefone cadastrado');
            return;
        }

        setIsSendingWhatsApp(true);
        try {
            // Unified endpoint: generates PDF, saves to Storage, sends via WhatsApp
            const res = await api.post('/whatsapp/send-document', {
                phone: data.patientPhone,
                patientId: data.patientId,
                prescriptionId: data.prescriptionId,
                prescriptionType: data.prescriptionType,
                patientName: data.patientName,
            });

            setWhatsAppSent(true);
            toast.success('Receita enviada por WhatsApp!');
        } catch (error: any) {
            console.error('Error sending WhatsApp:', error);
            const errorMsg = error.response?.data?.error || 'Erro ao enviar WhatsApp. Tente novamente.';
            toast.error(errorMsg);
        } finally {
            setIsSendingWhatsApp(false);
        }
    };

    const handleClose = () => {
        setPdfUrl(null);
        setWhatsAppSent(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-border px-6 py-4">
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                        Receita Finalizada
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                        {data.prescriptionTitle || 'Receita'} — {data.patientName}
                    </DialogDescription>
                </div>

                {/* Content */}
                <div className="px-6 py-4 space-y-4">

                    {/* Injectable Status */}
                    {hasInjectables && (
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium text-sm mb-1">
                                <Syringe className="w-4 h-4" />
                                {data.injectables.length} injetável(is) detectado(s)
                            </div>
                            <div className="space-y-1">
                                {data.injectables.map((item, i) => (
                                    <div key={i} className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-2">
                                        <span className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                            {item.route}
                                        </span>
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                            {data.nursingOrdersCreated > 0 && (
                                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    {data.nursingOrdersCreated} ordem(ns) de enfermagem criada(s)
                                </div>
                            )}
                        </div>
                    )}

                    {/* Prescription Type Badge */}
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            data.prescriptionType === 'controlada'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                        }`}>
                            {data.prescriptionType === 'controlada' ? '🔒 Controlada' : '📋 Simples'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            ID: {data.prescriptionId.substring(0, 8)}...
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        <Button
                            onClick={onPrint}
                            variant="outline"
                            className="w-full justify-start gap-3 h-12 text-left"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                <Printer className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <div className="font-medium text-sm">Imprimir Receita</div>
                                <div className="text-xs text-muted-foreground">Abre pré-visualização para impressão</div>
                            </div>
                        </Button>

                        <Button
                            onClick={handleGeneratePdf}
                            variant="outline"
                            className="w-full justify-start gap-3 h-12 text-left"
                            disabled={isGeneratingPdf}
                        >
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                                {isGeneratingPdf ? (
                                    <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
                                ) : pdfUrl ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                    <FileDown className="w-4 h-4 text-orange-600" />
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-sm">
                                    {pdfUrl ? 'PDF Gerado ✓' : isGeneratingPdf ? 'Gerando PDF...' : 'Gerar PDF'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {pdfUrl ? 'Clique para baixar novamente' : 'Download como arquivo PDF'}
                                </div>
                            </div>
                        </Button>

                        <Button
                            onClick={handleSendWhatsApp}
                            variant="outline"
                            className={`w-full justify-start gap-3 h-12 text-left ${!hasPhone ? 'opacity-50' : ''}`}
                            disabled={isSendingWhatsApp || !hasPhone}
                        >
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                {isSendingWhatsApp ? (
                                    <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                                ) : whatsAppSent ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                    <Send className="w-4 h-4 text-green-600" />
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-sm">
                                    {whatsAppSent ? 'WhatsApp Enviado ✓' : isSendingWhatsApp ? 'Enviando...' : 'Enviar por WhatsApp'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {!hasPhone
                                        ? 'Paciente sem telefone cadastrado'
                                        : whatsAppSent
                                            ? `Enviado para ${data.patientPhone}`
                                            : `Enviar PDF para ${data.patientPhone}`
                                    }
                                </div>
                            </div>
                        </Button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-border bg-muted/30 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={handleClose}>
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
