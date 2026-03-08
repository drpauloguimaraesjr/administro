'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Syringe, User, PackageCheck, DollarSign, ArrowLeft, Activity, Users, Search, CheckCircle2, ChevronRight, ShoppingCart, Info, Clock, Check, X, CreditCard, Banknote, Smartphone, Receipt } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

// MOCK DATA PARA ESTOQUE (Atualizado com vias de administração baseadas no feedback)
const MOCK_STOCK = [
  { id: '1', name: 'Gestrinona 20mg', type: 'hormone', route: 'Subcutâneo', isFastProcedure: false, price: 1500, stock: 45 },
  { id: '2', name: 'Testosterona 50mg', type: 'hormone', route: 'Subcutâneo', isFastProcedure: false, price: 1200, stock: 32 },
  { id: '3', name: 'Cipionato de Testosterona', type: 'injectable', route: 'Intramuscular', isFastProcedure: true, price: 250, stock: 120 },
  { id: '4', name: 'Enantato de Testosterona', type: 'injectable', route: 'Intramuscular', isFastProcedure: true, price: 280, stock: 85 },
  { id: '5', name: 'Seringa 3ml', type: 'material', route: null, isFastProcedure: false, price: 0, stock: 500 },
  { id: '6', name: 'Agulha 30x7', type: 'material', route: null, isFastProcedure: false, price: 0, stock: 500 },
  { id: '7', name: 'Trocater Descartável', type: 'material', route: null, isFastProcedure: false, price: 80, stock: 25 },
  { id: '8', name: 'Anestésico Local (Lidocaína)', type: 'medication', route: 'Intradérmico', isFastProcedure: true, price: 0, stock: 40 },
  { id: '9', name: 'Soro Fisiológico 500ml', type: 'medication', route: 'Endovenoso', isFastProcedure: false, price: 15, stock: 200 },
  { id: '10', name: 'Complexo B Injetável', type: 'injectable', route: 'Intramuscular', isFastProcedure: true, price: 150, stock: 60 }
];

// MOCK DATA PARA PACIENTES EM PROCESSO (Atualizado com dados de prescrição)
const MOCK_PATIENTS_IN_PROGRESS = [
  { id: '1', name: 'Fernanda Lopes', procedure: 'Implante SC', prescribedRoute: 'Subcutâneo', status: 'waiting_dispensation', time: '08:30', room: 'Sala 1', isDispensed: false },
  { id: '2', name: 'Juliana Rocha', procedure: 'Implante SC', prescribedRoute: 'Subcutâneo', status: 'waiting_dispensation', time: '09:15', room: 'Consultório Dr. Paulo', isDispensed: false },
  { id: '4', name: 'Patrícia Almeida', procedure: 'Aplicação IM', prescribedRoute: 'Intramuscular', status: 'ready_for_application', time: '10:00', room: 'Sala 2', isDispensed: false }
];

// MOCK DATA PARA PROCEDIMENTOS REALIZADOS
const MOCK_DONE_TODAY = [
  { id: 'a1', name: 'Marcos Silva', procedure: 'Implante Gestrinona', time: '07:45', checkedOut: true },
  { id: 'a2', name: 'Ana Beatriz', procedure: 'Aplicação Cipionato', time: '08:10', checkedOut: true }
];

const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX', icon: Smartphone },
  { value: 'cash', label: 'Dinheiro', icon: Banknote },
  { value: 'credit', label: 'Crédito', icon: CreditCard },
  { value: 'debit', label: 'Débito', icon: CreditCard },
];

export default function ProcedureRoom() {
  const searchParams = useSearchParams();
  const preSelectedPatientId = searchParams?.get('patient');
  
  const [activeTab, setActiveTab] = useState<'in_progress' | 'done'>('in_progress');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  
  // Dispensation State
  const [dispensationItems, setDispensationItems] = useState<Array<{item: any, quantity: number}>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Checkout/Billing State
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('pix');
  const [billingDiscount, setBillingDiscount] = useState(0);
  
  // Lists State
  const [patientsInProgress, setPatientsInProgress] = useState(MOCK_PATIENTS_IN_PROGRESS);
  const [doneToday, setDoneToday] = useState(MOCK_DONE_TODAY);

  useEffect(() => {
    if (preSelectedPatientId) {
      const p = patientsInProgress.find(p => p.id === preSelectedPatientId);
      if (p) {
        setSelectedPatient(p);
        
        // Se vier com parâmetros pré-definidos do Dashboard, podemos pré-popular
        const productName = searchParams?.get('product');
        if (productName) {
          const item = MOCK_STOCK.find(s => productName.toLowerCase().includes(s.name.toLowerCase()) || 
                                           s.name.toLowerCase().includes(productName.toLowerCase().split(' ')[0]));
          if (item) {
            setDispensationItems([{ item, quantity: 1 }]);
          }
        }
      }
    }
  }, [preSelectedPatientId]);

  const filteredStock = MOCK_STOCK.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItemToDispensation = (item: any) => {
    setDispensationItems(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeItemFromDispensation = (itemId: string) => {
    setDispensationItems(prev => prev.filter(i => i.item.id !== itemId));
  };

  const isFastProcedure = () => {
    if (dispensationItems.length === 0) return false;
    // Se há pelo menos um item IM ou Intradérmico na lista E a prescrição bater
    const hasFastItem = dispensationItems.some(i => i.item.isFastProcedure || i.item.route === 'Intramuscular' || i.item.route === 'Intradérmico');
    const hasFastPrescription = selectedPatient?.prescribedRoute === 'Intramuscular' || selectedPatient?.prescribedRoute === 'Intradérmico';
    
    // Na regra de negócio real, o banco cruzaria as vias. Aqui simulamos que se for IM/ID, é fast.
    return hasFastItem || hasFastPrescription;
  };

  const handleConfirmDispensation = () => {
    if (dispensationItems.length === 0) {
      toast.error('Selecione pelo menos um item para dispensar.');
      return;
    }

    if (isFastProcedure()) {
      // Regra de Negócio: Se tem Intramuscular/Intradérmico, abre direto o Checkout
      toast.info('Aplicação rápida detectada (IM/ID). Abrindo Checkout automático.');
      setShowCheckout(true);
    } else {
      // Regra de Negócio: Procedimento longo (ex: Soro), envia para a fila de "Em Andamento" e mantem lá
      toast.success('Dispensação confirmada. Paciente segue em observação/procedimento no seu card de Em Curso.');
      
      // Atualiza o status do paciente localmente
      setPatientsInProgress(prev => 
        prev.map(p => p.id === selectedPatient.id ? { ...p, status: 'in_procedure', isDispensed: true } : p)
      );
      
      setSelectedPatient(null);
      setDispensationItems([]);
    }
  };

  const handleConfirmCheckout = () => {
    if (!selectedPatient) return;
    
    // Calcula totais
    const total = dispensationItems.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0) - billingDiscount;
    
    toast.success(`Pagamento e Check-out confirmados: R$ ${total.toFixed(2)}`);
    
    // Remove do Em Curso e joga para Finalizados
    setPatientsInProgress(prev => prev.filter(p => p.id !== selectedPatient.id));
    setDoneToday(prev => [{
      id: selectedPatient.id,
      name: selectedPatient.name,
      procedure: dispensationItems.map(i => i.item.name).join(' + '),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' }),
      checkedOut: true
    }, ...prev]);
    
    setShowCheckout(false);
    setSelectedPatient(null);
    setDispensationItems([]);
  };

  const totalPrice = dispensationItems.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);

  return (
    <div className="min-h-screen pb-10">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="h-10 w-10 border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                <Syringe className="w-7 h-7 text-[#7c9a72]" />
                Sala de Procedimentos
              </h1>
              <p className="font-mono text-sm text-muted-foreground mt-1">
                Gestão de medicações, dispensação e check-out
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LADO ESQUERDO: Lista de Pacientes */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex flex-col border border-border bg-card">
              <div className="flex border-b border-border">
                <button
                  onClick={() => setActiveTab('in_progress')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${activeTab === 'in_progress' ? 'bg-muted/50 text-foreground border-b-2 border-[#7c9a72]' : 'text-muted-foreground hover:bg-muted/20'}`}
                >
                  <Activity className="w-4 h-4" /> Em Curso
                  <span className="bg-background px-1.5 py-0.5 text-[9px] border border-border rounded">{patientsInProgress.length}</span>
                </button>
                <button
                  onClick={() => setActiveTab('done')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${activeTab === 'done' ? 'bg-muted/50 text-foreground border-b-2 border-[#7c9a72]' : 'text-muted-foreground hover:bg-muted/20'}`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Realizados
                  <span className="bg-background px-1.5 py-0.5 text-[9px] border border-border rounded">{doneToday.length}</span>
                </button>
              </div>

              <div className="p-4 max-h-[600px] overflow-y-auto">
                {activeTab === 'in_progress' ? (
                  <div className="space-y-3">
                    {patientsInProgress.map(patient => (
                      <button
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`w-full text-left p-4 border transition-colors flex justify-between items-center group
                          ${selectedPatient?.id === patient.id 
                            ? 'border-[#7c9a72] bg-[#7c9a72]/5' 
                            : 'border-border bg-background hover:border-[#7c9a72]/50'
                          }`}
                      >
                        <div>
                          <p className="font-serif font-bold text-foreground group-hover:text-[#7c9a72] transition-colors">{patient.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground bg-muted/50 px-1 py-0.5">
                              {patient.time}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {patient.procedure} ({patient.prescribedRoute})
                            </span>
                            {patient.isDispensed && (
                               <span className="font-mono text-[9px] uppercase tracking-wider bg-[#5282c4]/10 text-[#5282c4] px-1 py-0.5 border border-[#5282c4]/20">
                                 Dispensado
                               </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${selectedPatient?.id === patient.id ? 'text-[#7c9a72]' : 'text-muted-foreground opacity-50'}`} />
                      </button>
                    ))}
                    {patientsInProgress.length === 0 && (
                      <p className="text-center font-mono text-sm text-muted-foreground py-10">Nenhum paciente aguardando.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {doneToday.map(patient => (
                      <div key={patient.id} className="w-full text-left p-4 border border-border/50 bg-background/50 flex justify-between items-center opacity-70">
                        <div>
                          <p className="font-serif font-semibold text-foreground line-through decoration-muted-foreground/30">{patient.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                              {patient.time}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {patient.procedure}
                            </span>
                          </div>
                        </div>
                        <Check className="w-4 h-4 text-[#7c9a72]" />
                      </div>
                    ))}
                    {doneToday.length === 0 && (
                      <p className="text-center font-mono text-sm text-muted-foreground py-10">Nenhum procedimento finalizado hoje.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LADO DIREITO: Painel de Dispensação / Ação */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!selectedPatient ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border border-border border-dashed bg-card/50 flex flex-col items-center justify-center py-32 h-full min-h-[500px]"
                >
                  <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="font-serif text-xl text-muted-foreground">Selecione um Paciente</p>
                  <p className="font-mono text-sm text-muted-foreground/60 mt-2 text-center max-w-sm">
                    Escolha um paciente na fila à esquerda para iniciar a dispensação de materiais e evolução.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={selectedPatient.id}
                  className="border border-border bg-card overflow-hidden"
                >
                  {/* Paciente Header */}
                  <div className="bg-[#7c9a72]/5 p-6 border-b border-[#7c9a72]/20 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider bg-[#7c9a72] text-white px-2 py-0.5 flex items-center gap-1">
                          <Activity className="w-3 h-3" /> Preparação
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-wider border border-[#7c9a72]/30 text-[#6b8a62] px-2 py-0.5">
                          {selectedPatient.room}
                        </span>
                      </div>
                      <h2 className="font-serif text-3xl font-bold text-foreground">{selectedPatient.name}</h2>
                      <p className="font-mono text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Syringe className="w-4 h-4" /> {selectedPatient.procedure}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Coluna 1: Estoque para Seleção */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-muted/30 p-3 border border-border">
                        <h3 className="font-serif font-semibold flex items-center gap-2 text-foreground">
                          <PackageCheck className="w-4 h-4 text-[#7c9a72]" /> 
                          Estoque Disponível
                        </h3>
                      </div>
                      
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input 
                          type="text" 
                          placeholder="Buscar medicamento ou material..." 
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full border border-border bg-background pl-9 pr-4 py-2 font-mono text-sm focus:outline-none focus:border-[#7c9a72] transition-colors"
                        />
                      </div>

                      <div className="border border-border max-h-[300px] overflow-y-auto bg-background">
                        {filteredStock.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <div>
                              <p className="font-mono font-bold text-sm text-foreground flex items-center gap-1.5">
                                {item.name}
                                {item.isFastProcedure && (
                                  <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] uppercase tracking-wider px-1.5 py-0.5 border border-blue-500/20 rounded-sm" title="Aplicação Rápida / Intramuscular / Intradérmica">
                                    {(item.route === 'Intramuscular' || item.route === 'Intradérmico') ? item.route.substring(0, 2).toUpperCase() : 'FAST'}
                                  </span>
                                )}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                Estoque: {item.stock} un | R$ {item.price.toFixed(2)} {item.route && `| Via: ${item.route}`}
                              </p>
                            </div>
                            <button 
                              onClick={() => addItemToDispensation(item)}
                              className="h-8 w-8 flex items-center justify-center bg-[#7c9a72]/10 text-[#7c9a72] hover:bg-[#7c9a72] hover:text-white transition-colors border border-[#7c9a72]/30"
                            >
                              +
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coluna 2: Carrinho de Dispensação */}
                    <div className="space-y-4 flex flex-col h-full">
                      <div className="flex justify-between items-center bg-muted/30 p-3 border border-border">
                        <h3 className="font-serif font-semibold flex items-center gap-2 text-foreground">
                          <ShoppingCart className="w-4 h-4 text-[#7c9a72]" /> 
                          Itens da Dispensação
                        </h3>
                        {dispensationItems.length > 0 && (
                          <span className="font-mono text-[10px] bg-foreground text-background px-2 py-0.5">
                            {dispensationItems.reduce((a, b) => a + b.quantity, 0)} ITENS
                          </span>
                        )}
                      </div>

                      <div className="flex-1 border border-border bg-background min-h-[250px] flex flex-col">
                        {dispensationItems.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50 p-6">
                            <ShoppingCart className="w-8 h-8 mb-3" />
                            <p className="font-mono text-xs text-center">Nenhum item selecionado para este procedimento.</p>
                          </div>
                        ) : (
                          <div className="overflow-y-auto p-2 space-y-2">
                            {dispensationItems.map(({item, quantity}) => (
                              <div key={item.id} className="flex items-center justify-between p-3 border border-[#7c9a72]/30 bg-[#7c9a72]/5">
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <p className="font-mono font-bold text-sm text-foreground">{item.name}</p>
                                    <p className="font-mono text-xs text-foreground font-semibold">R$ {(item.price * quantity).toFixed(2)}</p>
                                  </div>
                                  <div className="flex items-center justify-between mt-2">
                                    <p className="font-mono text-[10px] text-muted-foreground uppercase">Qtd: {quantity}</p>
                                    <button 
                                      onClick={() => removeItemFromDispensation(item.id)}
                                      className="font-mono text-[9px] uppercase tracking-wider text-destructive hover:underline"
                                    >
                                      Remover
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Regra de Negócio Aviso */}
                      {isFastProcedure() && (
                        <div className="bg-blue-500/10 border border-blue-500/30 p-3 flex gap-3 text-blue-700/80 dark:text-blue-400">
                          <Info className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-mono font-bold text-[10px] uppercase tracking-wider mb-0.5">Aplicação Rápida Detectada</p>
                            <p className="font-mono text-[10px]">A prescrição e os itens (Ex: Intramuscular / Intradérmico) redirecionarão automaticamente para o Checkout Financeiro após finalizar.</p>
                          </div>
                        </div>
                      )}

                      {/* Botão Ação */}
                      <button 
                        onClick={handleConfirmDispensation}
                        disabled={dispensationItems.length === 0}
                        className={`w-full py-4 font-mono font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2
                          ${dispensationItems.length === 0 
                            ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                            : 'bg-[#7c9a72] text-white hover:bg-[#6b8a62] shadow-sm'
                          }`}
                      >
                        {isFastProcedure() ? (
                          <><DollarSign className="w-4 h-4" /> Confirmar e Fazer Checkout</>
                        ) : (
                          <><PackageCheck className="w-4 h-4" /> Finalizar Dispensação</>
                        )}
                      </button>

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ========= MODAL CHECKOUT ========= */}
      <AnimatePresence>
        {showCheckout && selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -10, opacity: 0 }}
              className="bg-card border border-border w-full max-w-lg shadow-2xl overflow-hidden"
            >
              {/* Header Modal */}
              <div className="bg-[#7c9a72] text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Checkout Financeiro
                  </h3>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#7c9a72] bg-white px-2 py-0.5 mt-2 inline-block font-bold">
                    Aplicação Rápida / IM
                  </p>
                </div>
                <button onClick={() => setShowCheckout(false)} className="text-white/70 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Info Paciente */}
                <div className="flex border border-border bg-background p-4 items-center gap-4">
                  <div className="h-12 w-12 bg-muted flex items-center justify-center rounded-full border border-border">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-serif font-bold text-lg text-foreground">{selectedPatient.name}</p>
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{selectedPatient.procedure}</p>
                  </div>
                </div>

                {/* Resumo Valores */}
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Resumo dos Custos</label>
                  <div className="border border-border bg-muted/20 p-4 space-y-3">
                    {dispensationItems.map((i, idx) => (
                      <div key={idx} className="flex justify-between font-mono text-sm">
                        <span className="text-muted-foreground">{i.quantity}x {i.item.name}</span>
                        <span className="text-foreground">R$ {(i.item.price * i.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs uppercase text-muted-foreground">Subtotal</span>
                      <span className="font-mono font-bold">R$ {totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-mono text-xs uppercase text-[#c48a3a]">Desconto (R$)</span>
                      <input 
                        type="number" 
                        min="0"
                        value={billingDiscount}
                        onChange={e => setBillingDiscount(Number(e.target.value) || 0)}
                        className="w-24 text-right border-b border-border bg-transparent focus:border-[#c48a3a] outline-none font-mono text-sm text-[#c48a3a]"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-[#7c9a72]/10 border border-[#7c9a72]/30 p-4 flex justify-between items-center mt-2">
                    <span className="font-mono font-bold uppercase tracking-wider text-[#7c9a72]">Total a Pagar</span>
                    <span className="font-serif text-3xl font-bold text-[#7c9a72]">
                      R$ {(Math.max(0, totalPrice - billingDiscount)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Metodos */}
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-2">Forma de Pagamento</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PAYMENT_METHODS.map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.value}
                          onClick={() => setSelectedPayment(m.value)}
                          className={`p-3 border text-center transition-all duration-150 ${
                            selectedPayment === m.value 
                              ? 'border-[#7c9a72] bg-[#7c9a72]/10 text-[#7c9a72]' 
                              : 'border-border text-muted-foreground hover:border-foreground/30 bg-card'
                          }`}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-1.5" />
                          <span className="font-mono text-[9px] uppercase tracking-wider block">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Ações */}
              <div className="p-4 border-t border-border bg-muted/50 flex gap-3">
                 <button 
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 py-3 font-mono text-xs uppercase tracking-wider border border-border text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmCheckout}
                  className="flex-[2] py-3 font-mono text-xs uppercase tracking-wider bg-[#7c9a72] text-white hover:bg-[#6b8a62] transition-colors flex justify-center items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirmar Pagamento
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
