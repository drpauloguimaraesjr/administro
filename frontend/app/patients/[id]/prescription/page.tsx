'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search, ArrowLeft, Printer, Copy, Plus, ArrowRightCircle, FileWarning,
    Save, Clock, History, Star, ZoomIn, ZoomOut, Moon, Sun, Sparkles, Loader2,
    BookMarked, StarOff, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

import { PatientHeader } from '@/components/medical-record/patient-header';
import { LegacyEditor, LegacyEditorRef } from '@/components/ui/legacy-editor';
import { PrintParameters, PrintParametersModal } from '@/components/prescription/PrintParametersModal';
import { PrescriptionPreviewModal, ForwardingInfo } from '@/components/prescription/PrescriptionPreviewModal';
import { FormulasPanel } from '@/components/prescription/FormulasPanel';
import { StockConfirmDialog, StockConfirmData } from '@/components/prescription/StockConfirmDialog';
import { PrescriptionFormula } from '@/types/prescription';
import { useStockMatch, StockMatchResult } from '@/hooks/useStockMatch';
import { toast } from 'sonner';

interface Prescription {
    id: string;
    title: string;
    content: string;
    type: 'simples' | 'controlada';
    createdAt: string;
    updatedAt: string;
}

interface PrescriptionTemplate {
    id: string;
    name: string;
    content: string;
    type: 'simples' | 'controlada';
    category: string;
    tags: string[];
    isFavorite: boolean;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
}

export default function PrescriptionPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const patientId = params.id as string;
    const editorRef = useRef<LegacyEditorRef>(null);

    // Modal states
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [printParams, setPrintParams] = useState<PrintParameters | null>(null);
    const [editorContent, setEditorContent] = useState('');
    const [prescriptionType, setPrescriptionType] = useState<'simples' | 'controlada'>('simples');

    // New states for enhanced features
    const [prescriptionTitle, setPrescriptionTitle] = useState('');
    const [currentPrescriptionId, setCurrentPrescriptionId] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [charCount, setCharCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
    const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateCategory, setTemplateCategory] = useState('geral');

    // Stock integration states
    const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
    const [stockMatchResult, setStockMatchResult] = useState<StockMatchResult | null>(null);
    const [pendingFormula, setPendingFormula] = useState<PrescriptionFormula | null>(null);
    const [isCheckingStock, setIsCheckingStock] = useState(false);
    const { checkMatch, registerUsage, isLoading: isStockLoading } = useStockMatch();

    // Forwarding tracking for print extension
    const [forwardingStatus, setForwardingStatus] = useState<ForwardingInfo>({});

    // Fetch patient data
    const { data: patient } = useQuery({
        queryKey: ['patient', patientId],
        queryFn: async () => {
            const res = await api.get(`/patients/${patientId}`);
            return res.data;
        },
    });

    // Fetch prescription history
    const { data: prescriptionHistory = [] } = useQuery<Prescription[]>({
        queryKey: ['prescriptions', patientId],
        queryFn: async () => {
            const res = await api.get(`/medical-records/${patientId}/prescriptions`);
            return res.data;
        },
    });

    // Fetch templates
    const { data: templates = [], refetch: refetchTemplates } = useQuery<PrescriptionTemplate[]>({
        queryKey: ['prescription-templates'],
        queryFn: async () => {
            const res = await api.get('/medical-records/templates');
            return res.data;
        },
    });

    // Save template mutation
    const saveTemplateMutation = useMutation({
        mutationFn: async (data: { name: string; content: string; type: string; category: string }) => {
            return api.post('/medical-records/templates', data);
        },
        onSuccess: () => {
            toast.success('Template salvo com sucesso!');
            refetchTemplates();
            setIsSaveTemplateOpen(false);
            setTemplateName('');
        },
    });

    // Toggle favorite mutation
    const toggleFavoriteMutation = useMutation({
        mutationFn: async (templateId: string) => {
            return api.put(`/medical-records/templates/${templateId}/favorite`);
        },
        onSuccess: () => {
            refetchTemplates();
        },
    });

    // Delete template mutation
    const deleteTemplateMutation = useMutation({
        mutationFn: async (templateId: string) => {
            return api.delete(`/medical-records/templates/${templateId}`);
        },
        onSuccess: () => {
            toast.success('Template removido!');
            refetchTemplates();
        },
    });

    // Save prescription mutation
    const savePrescription = useMutation({
        mutationFn: async (data: { title: string; content: string; type: string }) => {
            if (currentPrescriptionId) {
                return api.put(`/medical-records/${patientId}/prescriptions/${currentPrescriptionId}`, data);
            } else {
                return api.post(`/medical-records/${patientId}/prescriptions`, data);
            }
        },
        onSuccess: (res) => {
            if (!currentPrescriptionId) {
                setCurrentPrescriptionId(res.data.id);
            }
            setLastSaved(new Date());
            queryClient.invalidateQueries({ queryKey: ['prescriptions', patientId] });
        },
    });

    // Generate title with AI
    const generateTitle = async (content: string) => {
        if (!content || content.length < 20) return;

        setIsGeneratingTitle(true);
        try {
            const res = await api.post('/medical-records/prescriptions/generate-title', { content });
            if (res.data.title) {
                setPrescriptionTitle(res.data.title);
                toast.success('Título gerado automaticamente!');
            }
        } catch (error) {
            console.error('Erro ao gerar título:', error);
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    // Auto-save functionality (every 30 seconds) — skip when already saving
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (editorRef.current && !isSaving) {
                const content = editorRef.current.getHTML();
                if (content && content.length > 10) {
                    handleAutoSave(content);
                }
            }
        }, 30000); // 30 seconds

        return () => clearInterval(autoSaveInterval);
    }, [currentPrescriptionId, prescriptionTitle, isSaving]);

    const handleAutoSave = async (content: string) => {
        if (!content || content.length < 10) return;

        setIsSaving(true);
        try {
            await savePrescription.mutateAsync({
                title: prescriptionTitle || 'Rascunho',
                content,
                type: prescriptionType,
            });
        } catch (error) {
            console.error('Erro no auto-save:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Update character and word count
    const updateCounts = useCallback((html: string) => {
        const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        setCharCount(text.length);
        setWordCount(text ? text.split(' ').filter(w => w.length > 0).length : 0);
    }, []);

    // Handle editor content change
    const handleEditorChange = (html: string) => {
        setEditorContent(html);
        updateCounts(html);
    };

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return undefined;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // Insert formula text into editor
    const insertFormulaIntoEditor = (formula: PrescriptionFormula, stockInfo?: { batchNumber?: string; quantity?: number }) => {
        if (editorRef.current) {
            const via = formula.usage ? formula.usage.split(/[, ]/)[0] : '';
            
            // Add stock info if available
            const stockNote = stockInfo?.batchNumber 
                ? `<p><em style="color: #666; font-size: 11px">📦 Estoque: Lote ${stockInfo.batchNumber} (${stockInfo.quantity || 1} un)</em></p>`
                : '';

            const text = `
            <p><strong><span style="font-size: 14px">USO INJETÁVEL</span></strong></p>
            <p></p>
            <p><strong>${formula.name} ${formula.dosage || ''}</strong> - 1 amp ${via} a cada 30 dias.</p>
            <p></p>
            <p>${formula.description || ''}</p>
            <p></p>
            <p><strong>Posologia:</strong> ${formula.dosage || '-'}</p>
            <p><strong>Fornecedor:</strong> ${formula.supplier || '-'}</p>
            <p><strong>Uso:</strong> ${formula.usage || ''} ${formula.presentation || ''}</p>
            ${stockNote}
            <p>────────────────────────────────</p>
            <p></p>
            `;

            editorRef.current.insertContent(text);
        }
    };

    // Helper: detect if formula is injectable
    const detectInjectable = (formula: PrescriptionFormula) => {
        const injectableRoutes = ['im', 'ev', 'sc', 'id', 'intramuscular', 'endovenosa', 'subcutânea', 'intradérmica', 'intravenosa', 'iv'];
        const usageLower = (formula.usage || '').toLowerCase();
        const isInjectable = injectableRoutes.some(r => usageLower.includes(r));
        if (!isInjectable) return null;
        const routeMatch = usageLower.match(/\b(im|ev|sc|id|iv)\b/i);
        return routeMatch ? routeMatch[1].toUpperCase() : 'IM';
    };

    // Helper: create application order for injectable
    const createApplicationOrder = async (
        formula: PrescriptionFormula,
        adminRoute: string,
        options?: { batchNumber?: string; batchExpiration?: string; manufacturer?: string; hasPurchased?: boolean }
    ) => {
        try {
            await api.post('/applications', {
                prescriptionId: currentPrescriptionId || undefined,
                patientId,
                patientName: patient?.name || 'Paciente',
                productName: formula.name,
                productDetails: formula.dosage || '',
                quantity: 1,
                unit: 'amp',
                route: adminRoute,
                priority: 'routine',
                prescribedBy: 'Médico',
            });

            // If patient already purchased (has stock), confirm purchase automatically
            if (options?.hasPurchased && options.batchNumber) {
                // The order was just created — get it to confirm purchase
                const ordersRes = await api.get('/applications', { params: { patientId, status: 'prescribed' } });
                const latestOrder = ordersRes.data?.[0];
                if (latestOrder) {
                    await api.put(`/applications/${latestOrder.id}/purchase`, {
                        confirmedBy: 'Prescrição automática',
                        batchNumber: options.batchNumber,
                        batchExpiration: options.batchExpiration,
                        manufacturer: options.manufacturer,
                    });
                }
            }

            // Track for print forwarding extension
            setForwardingStatus(prev => ({
                ...prev,
                nursing: {
                    sent: true,
                    sentAt: new Date().toISOString(),
                    orderCount: (prev.nursing?.orderCount || 0) + 1,
                    routes: [...(prev.nursing?.routes || []), adminRoute],
                }
            }));

            return true;
        } catch (error) {
            console.error('Error creating application order:', error);
            return false;
        }
    };

    // Handle formula selection - check stock first
    const handleSelectFormula = async (formula: PrescriptionFormula) => {
        // Store the formula for later use
        setPendingFormula(formula);
        setIsCheckingStock(true);

        try {
            // Check if this formula matches something in stock
            const match = await checkMatch(formula.name);
            
            if (match && match.found && match.hasStock && match.product && match.suggestedBatch) {
                // Found in stock - show confirmation dialog
                setStockMatchResult(match);
                setIsStockDialogOpen(true);
            } else {
                // Not found in stock — insert formula
                insertFormulaIntoEditor(formula);

                // If injectable, create application order (status: waiting_purchase)
                const adminRoute = detectInjectable(formula);
                if (adminRoute && patient) {
                    const created = await createApplicationOrder(formula, adminRoute);
                    toast.success(`${formula.name} adicionado!`, {
                        description: created
                            ? `💉 Ordem de aplicação ${adminRoute} gerada — aguardando compra pelo paciente`
                            : undefined,
                    });
                } else {
                    toast.success(`${formula.name} adicionado!`);
                }
            }
        } catch (error) {
            console.error('Error checking stock:', error);
            insertFormulaIntoEditor(formula);
            toast.success(`${formula.name} adicionado!`);
        } finally {
            setIsCheckingStock(false);
        }
    };

    // Handle stock confirmation
    const handleStockConfirm = async (data: StockConfirmData) => {
        if (!pendingFormula || !patient || !currentPrescriptionId) {
            // If no prescription ID yet, just insert and note it
            if (pendingFormula) {
                insertFormulaIntoEditor(pendingFormula, {
                    batchNumber: stockMatchResult?.suggestedBatch?.batchNumber,
                    quantity: data.quantity,
                });
                toast.success(`${pendingFormula.name} adicionado! (Salve a receita para registrar no estoque)`);
            }
            setIsStockDialogOpen(false);
            setPendingFormula(null);
            setStockMatchResult(null);
            return;
        }

        try {
            // Register the stock usage
            await registerUsage(
                data.productId,
                data.quantity,
                patientId,
                patient.name,
                currentPrescriptionId
            );

            // Insert formula with stock info
            insertFormulaIntoEditor(pendingFormula, {
                batchNumber: stockMatchResult?.suggestedBatch?.batchNumber,
                quantity: data.quantity,
            });

            // Detect if injectable and create application order
            const adminRoute = detectInjectable(pendingFormula);

            if (adminRoute) {
                const created = await createApplicationOrder(pendingFormula, adminRoute, {
                    hasPurchased: true,
                    batchNumber: stockMatchResult?.suggestedBatch?.batchNumber,
                    batchExpiration: stockMatchResult?.suggestedBatch?.expirationDate,
                    manufacturer: (stockMatchResult?.product as any)?.manufacturer,
                });

                toast.success(`${pendingFormula.name} adicionado e registrado no estoque!`, {
                    description: created
                        ? `💉 Ordem de aplicação ${adminRoute} gerada para a enfermagem`
                        : '⚠️ Ordem de aplicação não foi gerada (erro de conexão)',
                });
            } else {
                toast.success(`${pendingFormula.name} adicionado e registrado no estoque!`, {
                    description: data.generateBilling 
                        ? `Cobrança de R$ ${(data.quantity * data.unitPrice).toFixed(2)} gerada`
                        : undefined,
                });
            }

            // TODO: If generateBilling is true, create billing item
            if (data.generateBilling) {
                // Future: api.post('/billing/items', { ... })
                console.log('TODO: Generate billing item', data);
            }

        } catch (error: any) {
            console.error('Error registering stock usage:', error);
            toast.error('Erro ao registrar no estoque', {
                description: error.message || 'Tente novamente',
            });
            // Still insert the formula even if stock registration fails
            insertFormulaIntoEditor(pendingFormula);
        } finally {
            setIsStockDialogOpen(false);
            setPendingFormula(null);
            setStockMatchResult(null);
        }
    };

    // Handle skipping stock registration
    const handleStockSkip = async () => {
        if (pendingFormula) {
            insertFormulaIntoEditor(pendingFormula);

            // If injectable, still create application order (waiting_purchase)
            const adminRoute = detectInjectable(pendingFormula);
            if (adminRoute && patient) {
                const created = await createApplicationOrder(pendingFormula, adminRoute);
                toast.success(`${pendingFormula.name} adicionado!`, {
                    description: created
                        ? `💉 Ordem de aplicação ${adminRoute} gerada — aguardando compra pelo paciente`
                        : undefined,
                });
            } else {
                toast.success(`${pendingFormula.name} adicionado!`);
            }
        }
        setIsStockDialogOpen(false);
        setPendingFormula(null);
        setStockMatchResult(null);
    };

    const handleOpenPrintParams = (type: 'simples' | 'controlada') => {
        setPrescriptionType(type);
        if (editorRef.current) {
            setEditorContent(editorRef.current.getHTML());
        }
        setIsPrintModalOpen(true);
    };

    const handleGeneratePreview = (params: PrintParameters) => {
        setPrintParams(params);
        setIsPrintModalOpen(false);
        setIsPreviewModalOpen(true);
    };

    const handleLoadPrescription = (prescription: Prescription) => {
        setCurrentPrescriptionId(prescription.id);
        setPrescriptionTitle(prescription.title);
        setPrescriptionType(prescription.type);
        if (editorRef.current) {
            editorRef.current.setContent(prescription.content);
        }
        setIsHistoryOpen(false);
        toast.success('Receita carregada!');
    };

    const handleNewPrescription = () => {
        setCurrentPrescriptionId(null);
        setPrescriptionTitle('');
        setLastSaved(null);
        if (editorRef.current) {
            editorRef.current.setContent('');
        }
        toast.info('Nova receita iniciada');
    };

    const handleManualSave = async () => {
        if (!editorRef.current) return;

        const content = editorRef.current.getHTML();
        if (!content || content.length < 10) {
            toast.error('Digite algo antes de salvar');
            return;
        }

        setIsSaving(true);
        try {
            await savePrescription.mutateAsync({
                title: prescriptionTitle || 'Receita sem título',
                content,
                type: prescriptionType,
            });
            toast.success('Receita salva com sucesso!');
        } catch (error) {
            toast.error('Erro ao salvar receita');
        } finally {
            setIsSaving(false);
        }
    };

    // Parse injectable items from prescription HTML content
    const parseInjectablesFromText = (html: string): Array<{ name: string; route: string; dosage: string }> => {
        // Strip HTML tags to get plain text
        const text = html.replace(/<[^>]*>/g, '\n').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
        const items: Array<{ name: string; route: string; dosage: string }> = [];

        // Strategy 1: Detect "USO INJETÁVEL" blocks (from formula panel insertion)
        const injectableBlockRegex = /USO INJET[AÁ]VEL[^]*?(?=USO INJET[AÁ]VEL|────|$)/gi;
        const blocks = text.match(injectableBlockRegex) || [];

        for (const block of blocks) {
            // Extract medication name — usually the first bold/strong line after "USO INJETÁVEL"
            const nameMatch = block.match(/(?:USO INJET[AÁ]VEL\s+)([A-ZÀ-Ú][A-Za-zÀ-ú0-9\s\-\+\.]+?)(?:\s*[-–]\s*\d|\s+\d+\s*(?:mg|mcg|ml|ui|amp))/i);
            const name = nameMatch ? nameMatch[1].trim() : '';

            // Extract route
            const routeMatch = block.match(/\b(IM|EV|SC|ID|IV)\b/i);
            const route = routeMatch ? routeMatch[1].toUpperCase() : 'IM';

            // Extract dosage
            const dosageMatch = block.match(/(?:Posologia:\s*)([^\n]+)/i);
            const dosage = dosageMatch ? dosageMatch[1].trim() : '';

            if (name) {
                items.push({ name, route, dosage });
            }
        }

        // Strategy 2: Fallback — detect lines with injectable route keywords even without "USO INJETÁVEL" header
        if (items.length === 0) {
            const lines = text.split(/\n|\.(?=\s)/);
            for (const line of lines) {
                const routeMatch = line.match(/\b(IM|EV|SC|ID|IV|intramuscular|endovenosa|subcutânea|intradérmica|intravenosa)\b/i);
                if (routeMatch) {
                    // Try to extract a medication name from the same line
                    const medMatch = line.match(/([A-ZÀ-Ú][A-Za-zÀ-ú0-9\s\-\+\.]+?)(?:\s*[-–]\s*\d|\s+\d+\s*(?:mg|mcg|ml|ui|amp)|\s+[-–]\s+\d|\s+via\b)/i);
                    if (medMatch) {
                        const routeAbbrev = routeMatch[1].length <= 2
                            ? routeMatch[1].toUpperCase()
                            : routeMatch[1].substring(0, 2).toUpperCase();
                        items.push({
                            name: medMatch[1].trim(),
                            route: routeAbbrev,
                            dosage: '',
                        });
                    }
                }
            }
        }

        // Deduplicate by name
        const seen = new Set<string>();
        return items.filter(item => {
            const key = item.name.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    // Save first, then open print modal — prevents freeze from fire-and-forget async
    const handleSaveAndFinalize = async () => {
        if (!editorRef.current) return;

        const content = editorRef.current.getHTML();
        if (!content || content.length < 10) {
            toast.error('Digite algo antes de salvar');
            return;
        }

        setIsSaving(true);
        try {
            const saveResult = await savePrescription.mutateAsync({
                title: prescriptionTitle || 'Receita sem título',
                content,
                type: prescriptionType,
            });
            toast.success('Receita salva!');

            // Parse content for injectables that may not have been captured by formula selection
            if (patient) {
                const detectedItems = parseInjectablesFromText(content);
                const alreadyTracked = forwardingStatus?.nursing?.routes?.length || 0;

                if (detectedItems.length > alreadyTracked) {
                    // There are injectables in the text not yet tracked — create orders for the extras
                    const newItems = detectedItems.slice(alreadyTracked);
                    let created = 0;

                    for (const item of newItems) {
                        const success = await createApplicationOrder(
                            { name: item.name, dosage: item.dosage, usage: item.route } as PrescriptionFormula,
                            item.route,
                        );
                        if (success) created++;
                    }

                    if (created > 0) {
                        toast.success(`${created} ordem(ns) de injetável detectada(s) no texto`, {
                            description: `💉 ${newItems.map(i => `${i.name} (${i.route})`).join(', ')}`,
                        });
                    }
                }
            }

            // Only open print after save succeeds
            handleOpenPrintParams('simples');
        } catch (error) {
            toast.error('Erro ao salvar receita. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    // Template handlers
    const handleLoadTemplate = async (template: PrescriptionTemplate) => {
        if (editorRef.current) {
            editorRef.current.setContent(template.content);
            setPrescriptionTitle(template.name);
            setPrescriptionType(template.type);

            // Increment usage count
            try {
                await api.put(`/medical-records/templates/${template.id}/use`);
                refetchTemplates();
            } catch (error) {
                console.error('Erro ao registrar uso:', error);
            }

            setIsTemplatesOpen(false);
            toast.success(`Template "${template.name}" carregado!`);
        }
    };

    const handleSaveAsTemplate = async () => {
        if (!editorRef.current) return;

        const content = editorRef.current.getHTML();
        if (!content || content.length < 10) {
            toast.error('Digite algo antes de salvar como template');
            return;
        }

        if (!templateName.trim()) {
            toast.error('Digite um nome para o template');
            return;
        }

        await saveTemplateMutation.mutateAsync({
            name: templateName.trim(),
            content,
            type: prescriptionType,
            category: templateCategory,
        });
    };

    // Separate templates into favorites and regular
    const favoriteTemplates = templates.filter(t => t.isFavorite);
    const regularTemplates = templates.filter(t => !t.isFavorite);

    if (!patient) return null;

    return (
        <div className={`flex flex-col h-[calc(100vh-64px)] overflow-hidden relative ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
            <PatientHeader
                name={patient.name}
                age={calculateAge(patient.birthDate)}
                gender={patient.gender === 'M' ? 'Masculino' : 'Feminino'}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Left Side: Editor (60%) */}
                <div className="flex-1 flex flex-col h-full p-4 gap-3 overflow-hidden relative">
                    {/* Title Bar with Controls */}
                    <div className="flex gap-2 items-center">
                        <div className="flex-1 relative">
                            <Input
                                placeholder="Nome da Receita (ex: Vitamina B12 Injetável)"
                                className={`bg-white pr-10 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : ''}`}
                                value={prescriptionTitle}
                                onChange={(e) => setPrescriptionTitle(e.target.value)}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                onClick={() => {
                                    if (editorRef.current) {
                                        generateTitle(editorRef.current.getHTML());
                                    }
                                }}
                                disabled={isGeneratingTitle}
                                title="Gerar título com IA"
                            >
                                {isGeneratingTitle ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                ) : (
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                )}
                            </Button>
                        </div>

                        {/* Quick Actions */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNewPrescription}
                            className={isDarkMode ? 'border-slate-700 text-slate-300' : ''}
                        >
                            <Plus className="w-4 h-4 mr-1" /> Nova
                        </Button>

                        <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-700 text-slate-300' : ''}>
                                    <History className="w-4 h-4 mr-1" /> Histórico
                                    {prescriptionHistory.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                                            {prescriptionHistory.length}
                                        </Badge>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="w-[400px]">
                                <SheetHeader>
                                    <SheetTitle>Receitas Anteriores</SheetTitle>
                                </SheetHeader>
                                <ScrollArea className="h-[calc(100vh-120px)] mt-4">
                                    <div className="space-y-2 pr-4">
                                        {prescriptionHistory.length === 0 ? (
                                            <p className="text-center text-gray-500 py-8">
                                                Nenhuma receita anterior
                                            </p>
                                        ) : (
                                            prescriptionHistory.map((rx) => (
                                                <div
                                                    key={rx.id}
                                                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                    onClick={() => handleLoadPrescription(rx)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="font-medium text-sm">{rx.title}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(rx.createdAt).toLocaleDateString('pt-BR', {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                        <Badge variant={rx.type === 'controlada' ? 'destructive' : 'secondary'}>
                                                            {rx.type === 'controlada' ? 'Controlada' : 'Simples'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </SheetContent>
                        </Sheet>

                        {/* Templates Sheet */}
                        <Sheet open={isTemplatesOpen} onOpenChange={setIsTemplatesOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className={isDarkMode ? 'border-slate-700 text-slate-300' : ''}>
                                    <BookMarked className="w-4 h-4 mr-1" /> Templates
                                    {templates.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                                            {templates.length}
                                        </Badge>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="w-[450px]">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center justify-between">
                                        <span>Templates de Receita</span>
                                        <Dialog open={isSaveTemplateOpen} onOpenChange={setIsSaveTemplateOpen}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="outline">
                                                    <Plus className="w-4 h-4 mr-1" /> Salvar Atual
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Salvar como Template</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Nome do Template</Label>
                                                        <Input
                                                            placeholder="Ex: Vitamina B12 Injetável"
                                                            value={templateName}
                                                            onChange={(e) => setTemplateName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Categoria</Label>
                                                        <select
                                                            className="w-full border rounded-md px-3 py-2"
                                                            value={templateCategory}
                                                            onChange={(e) => setTemplateCategory(e.target.value)}
                                                        >
                                                            <option value="geral">Geral</option>
                                                            <option value="vitaminas">Vitaminas</option>
                                                            <option value="antibioticos">Antibióticos</option>
                                                            <option value="analgesicos">Analgésicos</option>
                                                            <option value="hormonios">Hormônios</option>
                                                            <option value="outros">Outros</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsSaveTemplateOpen(false)}>
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        onClick={handleSaveAsTemplate}
                                                        disabled={saveTemplateMutation.isPending}
                                                    >
                                                        {saveTemplateMutation.isPending ? (
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <Save className="w-4 h-4 mr-2" />
                                                        )}
                                                        Salvar Template
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </SheetTitle>
                                </SheetHeader>
                                <ScrollArea className="h-[calc(100vh-120px)] mt-4">
                                    <div className="space-y-4 pr-4">
                                        {/* Favorites Section */}
                                        {favoriteTemplates.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-medium text-amber-600 mb-2 flex items-center">
                                                    <Star className="w-4 h-4 mr-1 fill-amber-500" /> Favoritos
                                                </h3>
                                                <div className="space-y-2">
                                                    {favoriteTemplates.map((template) => (
                                                        <div
                                                            key={template.id}
                                                            className="p-3 border rounded-lg hover:bg-amber-50 transition-colors border-amber-200 bg-amber-50/50"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div
                                                                    className="flex-1 cursor-pointer"
                                                                    onClick={() => handleLoadTemplate(template)}
                                                                >
                                                                    <p className="font-medium text-sm">{template.name}</p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {template.category}
                                                                        </Badge>
                                                                        <span className="text-xs text-gray-500">
                                                                            {template.usageCount}x usado
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 w-7 p-0"
                                                                        onClick={() => toggleFavoriteMutation.mutate(template.id)}
                                                                    >
                                                                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                                                                        onClick={() => deleteTemplateMutation.mutate(template.id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Regular Templates */}
                                        <div>
                                            {favoriteTemplates.length > 0 && (
                                                <h3 className="text-sm font-medium text-gray-500 mb-2">Todos</h3>
                                            )}
                                            <div className="space-y-2">
                                                {templates.length === 0 ? (
                                                    <p className="text-center text-gray-500 py-8">
                                                        Nenhum template salvo.<br />
                                                        <span className="text-sm">Clique em &quot;Salvar Atual&quot; para criar um.</span>
                                                    </p>
                                                ) : (
                                                    regularTemplates.map((template) => (
                                                        <div
                                                            key={template.id}
                                                            className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div
                                                                    className="flex-1 cursor-pointer"
                                                                    onClick={() => handleLoadTemplate(template)}
                                                                >
                                                                    <p className="font-medium text-sm">{template.name}</p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {template.category}
                                                                        </Badge>
                                                                        <span className="text-xs text-gray-500">
                                                                            {template.usageCount}x usado
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 w-7 p-0"
                                                                        onClick={() => toggleFavoriteMutation.mutate(template.id)}
                                                                    >
                                                                        <StarOff className="w-4 h-4 text-gray-400" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                                                                        onClick={() => deleteTemplateMutation.mutate(template.id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Status Bar */}
                    <div className={`flex items-center justify-between text-xs px-2 py-1.5 rounded ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
                        <div className="flex items-center gap-4">
                            <span>{charCount} caracteres</span>
                            <span>{wordCount} palavras</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Zoom Controls */}
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                                >
                                    <ZoomOut className="w-3 h-3" />
                                </Button>
                                <span className="w-10 text-center">{zoomLevel}%</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                                >
                                    <ZoomIn className="w-3 h-3" />
                                </Button>
                            </div>

                            <div className="w-px h-4 bg-gray-300"></div>

                            {/* Dark Mode Toggle */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => setIsDarkMode(!isDarkMode)}
                            >
                                {isDarkMode ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                            </Button>

                            <div className="w-px h-4 bg-gray-300"></div>

                            {/* Auto-save Status */}
                            <div className="flex items-center gap-1">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span>Salvando...</span>
                                    </>
                                ) : lastSaved ? (
                                    <>
                                        <Clock className="w-3 h-3 text-green-500" />
                                        <span>Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </>
                                ) : (
                                    <span className="text-amber-500">Não salvo</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Editor Container */}
                    <div
                        className={`flex-1 rounded-lg border overflow-hidden shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
                    >
                        <div className="h-full" style={{ width: `${10000 / zoomLevel}%`, height: `${10000 / zoomLevel}%` }}>
                            <LegacyEditor
                                ref={editorRef}
                                placeholder="Digite a prescrição..."
                                onChange={handleEditorChange}
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className={`h-16 border-t -mx-4 -mb-4 px-4 flex items-center justify-between ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" onClick={() => router.back()}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleManualSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Salvar
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                onClick={() => handleOpenPrintParams('controlada')}
                            >
                                <FileWarning className="w-4 h-4 mr-2" /> Controle Especial
                            </Button>
                            <Button variant="outline" onClick={() => handleOpenPrintParams('simples')}>
                                <Printer className="w-4 h-4 mr-2" /> Imprimir Simples
                            </Button>
                            <Button
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={handleSaveAndFinalize}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Copy className="w-4 h-4 mr-2" />
                                )}
                                Salvar e Finalizar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Formulas (40%) */}
                <FormulasPanel onSelectFormula={handleSelectFormula} />
            </div>

            {/* Modals */}
            <PrintParametersModal
                open={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                onGenerate={handleGeneratePreview}
                doctorName="Dr. Paulo Guimarães Jr."
                patientName={patient.name}
                type={prescriptionType}
            />

            {printParams && (
                <PrescriptionPreviewModal
                    open={isPreviewModalOpen}
                    onClose={() => setIsPreviewModalOpen(false)}
                    content={editorContent}
                    params={printParams}
                    patient={{
                        name: patient.name,
                        cpf: patient.cpf,
                        rg: patient.rg,
                        gender: patient.gender === 'M' ? 'Masculino' : 'Feminino',
                        phone: patient.phone,
                        birthDate: patient.birthDate,
                        address: patient.address ? `${patient.address}, ${patient.city || ''} - ${patient.state || ''}` : '',
                        email: patient.email,
                    }}
                    type={prescriptionType}
                    forwardingStatus={forwardingStatus}
                />
            )}

            {/* Stock Confirmation Dialog */}
            {stockMatchResult && pendingFormula && (
                <StockConfirmDialog
                    open={isStockDialogOpen}
                    onClose={() => {
                        setIsStockDialogOpen(false);
                        setPendingFormula(null);
                        setStockMatchResult(null);
                    }}
                    onConfirm={handleStockConfirm}
                    onSkip={handleStockSkip}
                    matchResult={stockMatchResult}
                    formulaName={pendingFormula.name}
                    isLoading={isStockLoading}
                />
            )}
        </div>
    );
}
