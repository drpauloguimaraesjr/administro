'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Plus, Pill, FileCheck, ClipboardList,
    Search, Filter, Trash2, Printer, Mail, MessageCircle,
    PenTool, Loader2, Download, Eye, Check, X, Clock,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    getDocuments, getSignatureQueue, signDocumentsBatch,
    deleteDocument, sendDocument, createDocument,
    DocumentType, ReceitaData, AtestadoData, EvolucaoData, MedicamentoData
} from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Signature Queue Badge Component
function SignatureQueueBadge({ count, onClick }: { count: number; onClick: () => void }) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
            <PenTool className="h-4 w-4" />
            <span className="font-medium">Assinar</span>
            {count > 0 && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md"
                >
                    {count}
                </motion.span>
            )}
        </motion.button>
    );
}

// Document Type Icons
const typeIcons: Record<DocumentType, any> = {
    receita: Pill,
    atestado: FileCheck,
    evolucao: ClipboardList,
};

const typeLabels: Record<DocumentType, string> = {
    receita: 'Receita',
    atestado: 'Atestado',
    evolucao: 'Evolução',
};

const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'Rascunho', color: 'bg-slate-100 text-slate-600' },
    pending_signature: { label: 'Aguardando Assinatura', color: 'bg-amber-100 text-amber-700' },
    signed: { label: 'Assinado', color: 'bg-green-100 text-green-700' },
    sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-700' },
};

// Default doctor/clinic data (should come from settings later)
const defaultDoctorData = {
    medico_nome: "Dr. Paulo Guimarães Jr.",
    medico_crm: "12345-SP",
    medico_especialidade: "Gastroenterologia",
    clinica_nome: "Clínica Calyx",
    clinica_endereco: "Rua Exemplo, 123 - São Paulo/SP",
    clinica_telefone: "(11) 99999-9999",
    cidade: "São Paulo",
};

export default function DocumentsPage() {
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    const [documentType, setDocumentType] = useState<DocumentType>('receita');
    const [documents, setDocuments] = useState<any[]>([]);
    const [signatureQueue, setSignatureQueue] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [birdIdCode, setBirdIdCode] = useState('');
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [isSigning, setIsSigning] = useState(false);
    const [pdfPreview, setPdfPreview] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Form states for Receita
    const [pacienteNome, setPacienteNome] = useState('');
    const [pacienteCpf, setPacienteCpf] = useState('');
    const [medicamentos, setMedicamentos] = useState<MedicamentoData[]>([
        { nome: '', posologia: '' }
    ]);

    // Form states for Atestado
    const [diasAfastamento, setDiasAfastamento] = useState(1);
    const [cid, setCid] = useState('');
    const [motivo, setMotivo] = useState('');

    // Form states for Evolução
    const [queixaPrincipal, setQueixaPrincipal] = useState('');
    const [historiaDoencaAtual, setHistoriaDoencaAtual] = useState('');
    const [exameFisico, setExameFisico] = useState('');
    const [hipoteseDiagnostica, setHipoteseDiagnostica] = useState('');
    const [conduta, setConduta] = useState('');

    // Load documents and queue on mount
    useEffect(() => {
        loadDocuments();
        loadSignatureQueue();
    }, []);

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const data = await getDocuments();
            setDocuments(data.documents || []);
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSignatureQueue = async () => {
        try {
            const data = await getSignatureQueue();
            setSignatureQueue(data.items || []);
        } catch (error) {
            console.error('Error loading signature queue:', error);
        }
    };

    const handleAddMedicamento = () => {
        setMedicamentos([...medicamentos, { nome: '', posologia: '' }]);
    };

    const handleRemoveMedicamento = (index: number) => {
        setMedicamentos(medicamentos.filter((_, i) => i !== index));
    };

    const handleMedicamentoChange = (index: number, field: 'nome' | 'posologia', value: string) => {
        const updated = [...medicamentos];
        updated[index][field] = value;
        setMedicamentos(updated);
    };

    const resetForm = () => {
        setPacienteNome('');
        setPacienteCpf('');
        setMedicamentos([{ nome: '', posologia: '' }]);
        setDiasAfastamento(1);
        setCid('');
        setMotivo('');
        setQueixaPrincipal('');
        setHistoriaDoencaAtual('');
        setExameFisico('');
        setHipoteseDiagnostica('');
        setConduta('');
    };

    const handleCreateDocument = async (addToQueue = true) => {
        if (!pacienteNome) {
            toast.error('Nome do paciente é obrigatório');
            return;
        }

        setIsCreating(true);
        try {
            const now = new Date();
            const dataFormatada = format(now, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
            const horaFormatada = format(now, 'HH:mm');

            let docData: ReceitaData | AtestadoData | EvolucaoData;

            if (documentType === 'receita') {
                if (medicamentos.every(m => !m.nome)) {
                    toast.error('Adicione pelo menos um medicamento');
                    setIsCreating(false);
                    return;
                }
                docData = {
                    ...defaultDoctorData,
                    paciente_nome: pacienteNome,
                    paciente_cpf: pacienteCpf,
                    medicamentos: medicamentos.filter(m => m.nome),
                    data: dataFormatada,
                } as ReceitaData;
            } else if (documentType === 'atestado') {
                docData = {
                    ...defaultDoctorData,
                    paciente_nome: pacienteNome,
                    paciente_cpf: pacienteCpf,
                    dias_afastamento: diasAfastamento,
                    cid,
                    motivo,
                    data_inicio: format(now, 'dd/MM/yyyy'),
                    data: dataFormatada,
                } as AtestadoData;
            } else {
                docData = {
                    ...defaultDoctorData,
                    paciente_nome: pacienteNome,
                    paciente_cpf: pacienteCpf,
                    data_atendimento: format(now, 'dd/MM/yyyy'),
                    hora_atendimento: horaFormatada,
                    tipo_atendimento: 'Consulta',
                    queixa_principal: queixaPrincipal,
                    historia_doenca_atual: historiaDoencaAtual,
                    exame_fisico: exameFisico,
                    hipotese_diagnostica: hipoteseDiagnostica,
                    conduta,
                } as EvolucaoData;
            }

            const result = await createDocument(documentType, docData, addToQueue);

            toast.success(addToQueue
                ? '📄 Documento criado e adicionado à fila de assinaturas!'
                : '📄 Documento criado como rascunho!');

            // Show PDF preview
            if (result.pdfBase64) {
                setPdfPreview(`data:application/pdf;base64,${result.pdfBase64}`);
            }

            resetForm();
            loadDocuments();
            loadSignatureQueue();

        } catch (error: any) {
            console.error('Error creating document:', error);
            toast.error(error.response?.data?.error || 'Erro ao criar documento');
        } finally {
            setIsCreating(false);
        }
    };

    const handleSignBatch = async () => {
        if (selectedDocs.length === 0) {
            toast.error('Selecione pelo menos um documento');
            return;
        }
        if (!birdIdCode) {
            toast.error('Código BirdID é obrigatório');
            return;
        }

        setIsSigning(true);
        try {
            const result = await signDocumentsBatch(selectedDocs, birdIdCode);
            toast.success(result.message);
            setShowSignatureModal(false);
            setBirdIdCode('');
            setSelectedDocs([]);
            loadDocuments();
            loadSignatureQueue();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Erro ao assinar documentos');
        } finally {
            setIsSigning(false);
        }
    };

    const handleDeleteDocument = async (id: string) => {
        if (!confirm('Excluir este documento permanentemente?')) return;
        try {
            await deleteDocument(id);
            toast.success('Documento excluído');
            loadDocuments();
            loadSignatureQueue();
        } catch (error) {
            toast.error('Erro ao excluir documento');
        }
    };

    const handleSendDocument = async (id: string, via: 'whatsapp' | 'email') => {
        const recipient = prompt(via === 'whatsapp'
            ? 'Digite o número do WhatsApp (ex: 5511999999999):'
            : 'Digite o email:');
        if (!recipient) return;

        try {
            await sendDocument(id, via, recipient);
            toast.success(`Documento enviado via ${via === 'whatsapp' ? 'WhatsApp' : 'Email'}!`);
            loadDocuments();
        } catch (error) {
            toast.error('Erro ao enviar documento');
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="container mx-auto py-8 px-4 max-w-[1600px]">
            {/* Header */}
            <header className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                            <FileText className="h-8 w-8 text-purple-600" />
                            Documentos Médicos
                        </h1>
                        <p className="text-slate-500">Receitas, Atestados e Prontuários com Typst + ICP-Brasil</p>
                    </div>
                    <SignatureQueueBadge
                        count={signatureQueue.length}
                        onClick={() => setShowSignatureModal(true)}
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'new'
                                ? 'border-purple-600 text-purple-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Plus className="inline-block h-4 w-4 mr-2" />Novo Documento
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'history'
                                ? 'border-purple-600 text-purple-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Clock className="inline-block h-4 w-4 mr-2" />Histórico
                    </button>
                </div>
            </header>

            {/* New Document Tab */}
            {activeTab === 'new' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form */}
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Criar Documento
                            </CardTitle>
                            <CardDescription>Selecione o tipo e preencha os dados</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Document Type Selection */}
                            <div className="grid grid-cols-3 gap-2">
                                {(['receita', 'atestado', 'evolucao'] as DocumentType[]).map((type) => {
                                    const Icon = typeIcons[type];
                                    return (
                                        <button
                                            key={type}
                                            onClick={() => setDocumentType(type)}
                                            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${documentType === type
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <Icon className="h-6 w-6" />
                                            <span className="text-sm font-medium">{typeLabels[type]}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Patient Info */}
                            <div className="space-y-3">
                                <div>
                                    <Label>Nome do Paciente *</Label>
                                    <Input
                                        value={pacienteNome}
                                        onChange={(e) => setPacienteNome(e.target.value)}
                                        placeholder="Nome completo do paciente"
                                    />
                                </div>
                                <div>
                                    <Label>CPF (opcional)</Label>
                                    <Input
                                        value={pacienteCpf}
                                        onChange={(e) => setPacienteCpf(e.target.value)}
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                            </div>

                            {/* Type-specific fields */}
                            {documentType === 'receita' && (
                                <div className="space-y-3">
                                    <Label className="flex items-center justify-between">
                                        Medicamentos
                                        <Button variant="ghost" size="sm" onClick={handleAddMedicamento}>
                                            <Plus className="h-4 w-4 mr-1" /> Adicionar
                                        </Button>
                                    </Label>
                                    {medicamentos.map((med, index) => (
                                        <div key={index} className="flex gap-2">
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    value={med.nome}
                                                    onChange={(e) => handleMedicamentoChange(index, 'nome', e.target.value)}
                                                    placeholder="Medicamento (ex: Omeprazol 20mg)"
                                                />
                                                <Input
                                                    value={med.posologia}
                                                    onChange={(e) => handleMedicamentoChange(index, 'posologia', e.target.value)}
                                                    placeholder="Posologia (ex: Tomar 1cp em jejum)"
                                                />
                                            </div>
                                            {medicamentos.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveMedicamento(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {documentType === 'atestado' && (
                                <div className="space-y-3">
                                    <div>
                                        <Label>Dias de Afastamento</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={diasAfastamento}
                                            onChange={(e) => setDiasAfastamento(parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    <div>
                                        <Label>CID-10 (opcional)</Label>
                                        <Input
                                            value={cid}
                                            onChange={(e) => setCid(e.target.value)}
                                            placeholder="Ex: K29"
                                        />
                                    </div>
                                    <div>
                                        <Label>Motivo (opcional)</Label>
                                        <Input
                                            value={motivo}
                                            onChange={(e) => setMotivo(e.target.value)}
                                            placeholder="Ex: tratamento médico"
                                        />
                                    </div>
                                </div>
                            )}

                            {documentType === 'evolucao' && (
                                <div className="space-y-3">
                                    <div>
                                        <Label>Queixa Principal</Label>
                                        <Textarea
                                            value={queixaPrincipal}
                                            onChange={(e) => setQueixaPrincipal(e.target.value)}
                                            placeholder="Queixa principal do paciente"
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <Label>História da Doença Atual</Label>
                                        <Textarea
                                            value={historiaDoencaAtual}
                                            onChange={(e) => setHistoriaDoencaAtual(e.target.value)}
                                            placeholder="Descrição da evolução..."
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <Label>Exame Físico</Label>
                                        <Textarea
                                            value={exameFisico}
                                            onChange={(e) => setExameFisico(e.target.value)}
                                            placeholder="Achados do exame físico..."
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <Label>Hipótese Diagnóstica</Label>
                                        <Input
                                            value={hipoteseDiagnostica}
                                            onChange={(e) => setHipoteseDiagnostica(e.target.value)}
                                            placeholder="Diagnóstico(s)..."
                                        />
                                    </div>
                                    <div>
                                        <Label>Conduta</Label>
                                        <Textarea
                                            value={conduta}
                                            onChange={(e) => setConduta(e.target.value)}
                                            placeholder="Conduta terapêutica..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-4">
                                <Button
                                    onClick={() => handleCreateDocument(true)}
                                    disabled={isCreating}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600"
                                >
                                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PenTool className="h-4 w-4 mr-2" />}
                                    Criar & Adicionar à Fila
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleCreateDocument(false)}
                                    disabled={isCreating}
                                >
                                    Salvar Rascunho
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5" />
                                Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pdfPreview ? (
                                <div className="space-y-4">
                                    <iframe
                                        src={pdfPreview}
                                        className="w-full h-[500px] border rounded-lg"
                                        title="PDF Preview"
                                    />
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => window.open(pdfPreview, '_blank')}>
                                            <Download className="h-4 w-4 mr-2" /> Download
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setPdfPreview(null)}>
                                            <X className="h-4 w-4 mr-2" /> Fechar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[500px] flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                                    <div className="text-center text-slate-400">
                                        <FileText className="h-12 w-12 mx-auto mb-2" />
                                        <p>O preview aparecerá aqui após criar o documento</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar por paciente ou descrição..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="draft">Rascunhos</SelectItem>
                                <SelectItem value="pending_signature">Aguardando Assinatura</SelectItem>
                                <SelectItem value="signed">Assinados</SelectItem>
                                <SelectItem value="sent">Enviados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Documents Grid */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-600">Nenhum documento encontrado</h3>
                            <p className="text-slate-400 mt-1">Crie seu primeiro documento na aba "Novo Documento"</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredDocuments.map((doc) => {
                                const Icon = typeIcons[doc.type as DocumentType] || FileText;
                                const status = statusLabels[doc.status] || statusLabels.draft;

                                return (
                                    <Card key={doc.id} className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-5 w-5 text-purple-600" />
                                                    <CardTitle className="text-base">{doc.patientName}</CardTitle>
                                                </div>
                                                <Badge className={status.color}>{status.label}</Badge>
                                            </div>
                                            <CardDescription className="text-xs">
                                                {doc.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-2">
                                            <div className="flex gap-1 flex-wrap">
                                                <Button variant="ghost" size="sm" className="h-8 px-2">
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 px-2">
                                                    <Printer className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2"
                                                    onClick={() => handleSendDocument(doc.id, 'whatsapp')}
                                                >
                                                    <MessageCircle className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2"
                                                    onClick={() => handleSendDocument(doc.id, 'email')}
                                                >
                                                    <Mail className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 text-red-500 hover:text-red-700"
                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Signature Queue Modal */}
            <Dialog open={showSignatureModal} onOpenChange={setShowSignatureModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PenTool className="h-5 w-5" />
                            Fila de Assinaturas ({signatureQueue.length} documentos)
                        </DialogTitle>
                        <DialogDescription>
                            Selecione os documentos e insira seu código BirdID para assinar em lote
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[300px]">
                        <div className="space-y-2">
                            {signatureQueue.map((doc) => {
                                const Icon = typeIcons[doc.type as DocumentType] || FileText;
                                const isSelected = selectedDocs.includes(doc.documentId);

                                return (
                                    <div
                                        key={doc.documentId}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedDocs(selectedDocs.filter(id => id !== doc.documentId));
                                            } else {
                                                setSelectedDocs([...selectedDocs, doc.documentId]);
                                            }
                                        }}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'border-purple-500 bg-purple-500' : 'border-slate-300'
                                                }`}>
                                                {isSelected && <Check className="h-3 w-3 text-white" />}
                                            </div>
                                            <Icon className="h-4 w-4 text-purple-600" />
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{doc.patientName}</p>
                                                <p className="text-xs text-slate-500">{doc.description}</p>
                                            </div>
                                            <Badge variant="outline">{typeLabels[doc.type as DocumentType]}</Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>

                    <div className="space-y-4 pt-4 border-t">
                        <div>
                            <Label>Código BirdID</Label>
                            <Input
                                type="password"
                                value={birdIdCode}
                                onChange={(e) => setBirdIdCode(e.target.value)}
                                placeholder="Digite seu código BirdID"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (selectedDocs.length === signatureQueue.length) {
                                        setSelectedDocs([]);
                                    } else {
                                        setSelectedDocs(signatureQueue.map(d => d.documentId));
                                    }
                                }}
                            >
                                {selectedDocs.length === signatureQueue.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSignatureModal(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSignBatch}
                            disabled={isSigning || selectedDocs.length === 0 || !birdIdCode}
                            className="bg-gradient-to-r from-amber-500 to-orange-500"
                        >
                            {isSigning ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <PenTool className="h-4 w-4 mr-2" />
                            )}
                            Assinar {selectedDocs.length} Documento(s)
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
