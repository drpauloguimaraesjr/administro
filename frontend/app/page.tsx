'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Clock, Activity, Plus, ArrowRight, Syringe, User, CheckCircle2, AlertCircle, MapPin, Pill, DollarSign, Receipt, CreditCard, Banknote, Smartphone, X, PackageCheck, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  patientName: string;
  patientId?: string;
  date: string;
  startTime: string;
  status: string;
  type: string;
  price?: number;
  billingStatus?: 'none' | 'pending' | 'paid';
}

interface BillingEntry {
  patientId: string;
  patientName: string;
  productName: string;
  category: 'consultation' | 'procedure' | 'exam' | 'medication' | 'material' | 'other';
  unitPrice: number;
  quantity: number;
  source: 'consulta' | 'procedimento' | 'avulsa';
  appointmentId?: string;
  applicationId?: string;
}

const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX', icon: Smartphone },
  { value: 'cash', label: 'Dinheiro', icon: Banknote },
  { value: 'credit', label: 'Crédito', icon: CreditCard },
  { value: 'debit', label: 'Débito', icon: CreditCard },
];

interface Application {
  id: string;
  patientName: string;
  productName: string;
  dose: string;
  route: string;
  status: 'scheduled' | 'in_progress' | 'done' | 'processing';
  nurseAssigned?: string;
  consultorio?: string;
  arrivalTime?: string;
  lotNumber?: string;
  themeColor?: string;
  themeText?: string;
}

// MOCK: Consultas do dia
const mockAppointments: Appointment[] = [
  { id: '1', patientId: 'p10', patientName: 'Eduardo Costa', date: new Date().toISOString().split('T')[0], startTime: '09:00', status: 'confirmed', type: 'first_visit', price: 600, billingStatus: 'none' },
  { id: '2', patientId: 'p11', patientName: 'Maria Silva', date: new Date().toISOString().split('T')[0], startTime: '10:30', status: 'pending', type: 'return', price: 450, billingStatus: 'none' },
  { id: '3', patientId: 'p12', patientName: 'João Santos', date: new Date().toISOString().split('T')[0], startTime: '14:00', status: 'confirmed', type: 'procedure', price: 2800, billingStatus: 'paid' },
  { id: '4', patientId: 'p13', patientName: 'Ana Oliveira', date: new Date().toISOString().split('T')[0], startTime: '16:00', status: 'confirmed', type: 'return', price: 450, billingStatus: 'none' },
  { id: '5', patientId: 'p14', patientName: 'Carla Menezes', date: new Date().toISOString().split('T')[0], startTime: '17:00', status: 'pending', type: 'first_visit', price: 600, billingStatus: 'none' },
];

// MOCK: Aplicações do dia (agora com cores que virão da configuração)
const mockApplications: Application[] = [
  { id: '1', patientName: 'Fernanda Lopes', productName: 'Gestrinona 20mg', dose: '20mg', route: 'Implante SC', status: 'done', nurseAssigned: 'Enfermeira Ana', consultorio: 'Sala 1', arrivalTime: '08:30', lotNumber: 'LOT-2025-0847', themeColor: '#0f766e', themeText: '#f0fdfa' },
  { id: '2', patientName: 'Juliana Rocha', productName: 'Testosterona 50mg', dose: '50mg', route: 'Implante SC', status: 'in_progress', nurseAssigned: 'Enfermeira Ana', consultorio: 'Consultório Dr. Paulo', arrivalTime: '09:15', lotNumber: 'LOT-2025-1293', themeColor: '#be185d', themeText: '#fdf2f8' },
  { id: '3', patientName: 'João da Silveira', productName: 'PRP (Plasma Rico em Plaquetas)', dose: 'Coleta de Sangue', route: 'Centrifugação 30min', status: 'processing', nurseAssigned: 'Enfermeira Carla', consultorio: 'Sala de Repouso', arrivalTime: '09:40', lotNumber: 'Tubo Citrato', themeColor: '#1d4ed8', themeText: '#eff6ff' },
  { id: '4', patientName: 'Patrícia Almeida', productName: 'Oxandrolona 15mg', dose: '15mg', route: 'Implante SC', status: 'scheduled', themeColor: '#b45309', themeText: '#fff7ed' },
  { id: '5', patientName: 'Roberto Lima', productName: 'Testosterona 75mg', dose: '75mg', route: 'Implante Glúteo', status: 'scheduled', themeColor: '#be185d', themeText: '#fdf2f8' },
  { id: '6', patientName: 'Cláudia Dias', productName: 'Gestrinona 10mg + Testosterona 25mg', dose: '35mg total', route: 'Implante SC', status: 'scheduled', themeColor: '#0f766e', themeText: '#f0fdfa' },
  { id: '7', patientName: 'Marcos Pereira', productName: 'Testosterona 100mg', dose: '100mg', route: 'Implante Glúteo', status: 'scheduled', themeColor: '#be185d', themeText: '#fdf2f8' },
];

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Billing modal state
  const [billingModal, setBillingModal] = useState<BillingEntry | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('pix');
  const [billingDiscount, setBillingDiscount] = useState(0);
  const [billingNotes, setBillingNotes] = useState('');
  const [processedBillings, setProcessedBillings] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const today = new Date().toISOString().split('T')[0];
  const { data: apiAppointments = [] } = useQuery({
    queryKey: ['dashboard-appointments'],
    queryFn: async () => {
      try {
        const res = await api.get('/appointments');
        return res.data.filter((apt: Appointment) => apt.date === today);
      } catch (e) { return []; }
    },
    enabled: !!user,
  });

  const appointments = apiAppointments.length > 0 ? apiAppointments : mockAppointments;

  const { data: patients = [] } = useQuery({
    queryKey: ['dashboard-patients'],
    queryFn: async () => {
      try {
        const res = await api.get('/patients');
        return res.data;
      } catch (e) { return Array(1248).fill({}); }
    },
    enabled: !!user,
  });

  const upcomingToday = appointments
    .filter((apt: Appointment) => apt.status !== 'cancelled')
    .sort((a: Appointment, b: Appointment) => a.startTime.localeCompare(b.startTime));

  const nextAppointment = upcomingToday[0];
  const doneApps = mockApplications.filter(a => a.status === 'done').length;
  const totalApps = mockApplications.length;
  const inClinicNow = mockApplications.filter(a => a.status === 'in_progress').length;

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const openBillingForConsulta = (apt: Appointment) => {
    const typeLabel = apt.type === 'first_visit' ? 'Consulta 1ª vez' : apt.type === 'return' ? 'Consulta Retorno' : 'Procedimento';
    setBillingModal({
      patientId: apt.patientId || apt.id,
      patientName: apt.patientName,
      productName: typeLabel,
      category: apt.type === 'procedure' ? 'procedure' : 'consultation',
      unitPrice: apt.price || 450,
      quantity: 1,
      source: 'consulta',
      appointmentId: apt.id,
    });
    setSelectedPayment('pix');
    setBillingDiscount(0);
    setBillingNotes('');
  };

  const openBillingForProcedimento = (app: Application) => {
    setBillingModal({
      patientId: app.id,
      patientName: app.patientName,
      productName: app.productName,
      category: 'procedure',
      unitPrice: 2500,
      quantity: 1,
      source: 'procedimento',
      applicationId: app.id,
    });
    setSelectedPayment('pix');
    setBillingDiscount(0);
    setBillingNotes('');
  };

  const handleConfirmBilling = async () => {
    if (!billingModal) return;
    const total = (billingModal.unitPrice * billingModal.quantity) - billingDiscount;
    try {
      await api.post('/billing', {
        patientId: billingModal.patientId,
        patientName: billingModal.patientName,
        productName: billingModal.productName,
        category: billingModal.category,
        quantity: billingModal.quantity,
        unitPrice: billingModal.unitPrice,
        discount: billingDiscount,
        appointmentId: billingModal.appointmentId,
        notes: billingNotes || `${billingModal.source} - ${selectedPayment}`,
      });
      toast.success(`Entrada registrada: ${formatCurrency(total)}`);
    } catch {
      toast.success(`Entrada registrada (local): ${formatCurrency(total)}`);
    }
    const key = billingModal.appointmentId || billingModal.applicationId || '';
    setProcessedBillings(prev => new Set(prev).add(key));
    setBillingModal(null);
  };

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Bom dia' : greetingHour < 18 ? 'Boa tarde' : 'Boa noite';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 4, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.15 } },
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border border-border border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="space-y-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Page Header */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">
                {greeting}, Dr.
              </h1>
              <p className="font-mono text-sm text-muted-foreground">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/agenda">
                <button className="h-9 px-4 bg-[#7c9a72] hover:bg-[#6b8a62] text-white font-mono text-xs uppercase tracking-[0.15em] border-0 transition-colors duration-150 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" /> Nova Consulta
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Calendar className="w-4 h-4" />}
              label="Consultas Hoje"
              value={appointments.length}
            />
            <StatCard
              icon={<Clock className="w-4 h-4" />}
              label="Próxima"
              value={nextAppointment ? nextAppointment.startTime : '—'}
              subtext={nextAppointment?.patientName}
            />
            <StatCard
              icon={<Users className="w-4 h-4" />}
              label="Na Clínica Agora"
              value={inClinicNow}
              subtext="pacientes presentes"
            />
            <StatCard
              icon={<Syringe className="w-4 h-4" />}
              label="Procedimentos Hoje"
              value={totalApps}
              subtext={`${doneApps} realizados`}
            />
          </motion.div>

          {/* === TWO-PANEL LAYOUT === */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT: Consultas do Dia */}
            <motion.div variants={itemVariants} className="border border-border bg-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#7c9a72]" />
                  Consultas do Dia
                </h2>
                <Link href="/agenda" className="mono-label text-[#7c9a72] hover:text-[#6b8a62] transition-colors duration-150 flex items-center gap-1">
                  Ver agenda <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-mono text-sm">Nenhuma consulta agendada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingToday.slice(0, 6).map((apt: Appointment) => {
                    const isPaid = apt.billingStatus === 'paid' || processedBillings.has(apt.id);
                    return (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 border border-border hover:border-foreground/30 transition-colors duration-150 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="font-mono text-lg font-medium text-foreground min-w-[60px]">
                            {apt.startTime}
                          </div>
                          <div className="h-8 w-px bg-border" />
                          <div>
                            <p className="font-serif font-semibold text-foreground group-hover:text-[#7c9a72] transition-colors duration-150">
                              {apt.patientName}
                            </p>
                            <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                              {apt.type === 'first_visit' ? 'Primeira Consulta' :
                                apt.type === 'return' ? 'Retorno' : 'Procedimento'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Botão Registro de Entrada */}
                          {isPaid ? (
                            <span className="font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 border border-[#7c9a72]/30 text-[#6b8a62] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Pago
                            </span>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); openBillingForConsulta(apt); }}
                              className="font-mono text-[9px] uppercase tracking-[0.15em] px-2.5 py-1 border border-[#c48a3a]/40 text-[#c48a3a] hover:bg-[#c48a3a]/10 transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
                            >
                              <DollarSign className="w-3 h-3" />
                              {apt.price ? formatCurrency(apt.price) : 'Cobrar'}
                            </button>
                          )}
                          <span className={`font-mono text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 border ${apt.status === 'confirmed' ? 'border-[#7c9a72]/30 text-[#6b8a62]' :
                            apt.status === 'pending' ? 'border-[#c48a3a]/30 text-[#c48a3a]' :
                              apt.status === 'completed' ? 'border-border text-muted-foreground' :
                                'border-destructive/30 text-destructive'
                            }`}>
                            {apt.status === 'confirmed' ? 'Confirmado' :
                              apt.status === 'pending' ? 'Pendente' :
                                apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* RIGHT: Aplicações do Dia */}
            <motion.div variants={itemVariants} className="border border-border bg-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-[#7c9a72]" />
                  Procedimentos do Dia
                </h2>
                <span className="font-mono text-xs text-muted-foreground">
                  {doneApps} de {totalApps} feitas
                </span>
              </div>

              {/* ── EM ATENDIMENTO ── */}
              {mockApplications.filter(a => a.status === 'in_progress' || a.status === 'done').length > 0 && (
                <div className="mb-6">
                  <p className="mono-label text-[#7c9a72] mb-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#7c9a72] animate-pulse" />
                    Na Clínica Agora
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {mockApplications.filter(a => a.status === 'in_progress' || a.status === 'done').map((app) => (
                      <div key={app.id} className="group relative overflow-hidden rounded-sm">
                        <div className={`p-4 border transition-all duration-150 cursor-default h-[120px] flex flex-col justify-between`}
                          style={{
                            borderColor: app.themeColor ? `${app.themeColor}50` : (app.status === 'done' ? '#7c9a7240' : '#c48a3a40'),
                            backgroundColor: app.themeColor ? `${app.themeColor}10` : (app.status === 'done' ? '#7c9a7210' : '#c48a3a10')
                          }}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className={`w-6 h-6 flex items-center justify-center`} style={{ color: app.themeColor || (app.status === 'done' ? '#7c9a72' : '#c48a3a') }}>
                                {app.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                              </div>
                              <span className={`font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 border`}
                                style={{
                                  borderColor: app.themeColor ? `${app.themeColor}50` : (app.status === 'done' ? '#7c9a7250' : '#c48a3a50'),
                                  color: app.themeColor || (app.status === 'done' ? '#6b8a62' : '#c48a3a')
                                }}
                              >
                                {app.status === 'done' ? 'Feita' : 'Atendendo'}
                              </span>
                            </div>
                            <p className="font-serif font-semibold text-foreground text-sm truncate">{app.patientName}</p>
                            <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">{app.productName}</p>
                          </div>
                          {app.consultorio && (
                            <p className="font-mono text-[10px] flex items-center gap-1" style={{ color: app.themeColor || '#7c9a72' }}>
                              <MapPin className="w-3 h-3" /> {app.consultorio}
                            </p>
                          )}
                        </div>
                        {/* Overlay Animação usando Configuração */}
                        <div className="absolute inset-0 p-4 opacity-0 flex flex-col justify-center translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 rounded-sm"
                          style={{ backgroundColor: app.themeColor || '#7c9a72', color: app.themeText || '#f7f5f0', pointerEvents: app.status === 'done' ? 'auto' : 'none' }}
                        >
                          <p className="font-serif font-bold text-sm mb-1.5 text-center drop-shadow-sm">{app.patientName}</p>
                          <div className="space-y-1 font-mono text-[10px] drop-shadow-sm">
                            <div className="flex items-center gap-2"><Pill className="w-3 h-3 opacity-80" /> {app.productName}</div>
                            <div className="flex items-center gap-2"><Syringe className="w-3 h-3 opacity-80" /> {app.dose} • {app.route}</div>
                          </div>
                          {app.status === 'done' && !processedBillings.has(app.id) && (
                            <div className="mt-2 flex gap-2">
                              <Link
                                href={`/sala-procedimentos?patient=${app.id}&name=${encodeURIComponent(app.patientName)}&product=${encodeURIComponent(app.productName)}`}
                                className="flex-1 py-1.5 font-mono text-[9px] uppercase tracking-wider bg-white/10 border border-white/30 hover:bg-white/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Syringe className="w-3 h-3" /> Procedimento
                              </Link>
                              <button
                                onClick={() => openBillingForProcedimento(app)}
                                className="flex-1 py-1.5 font-mono text-[9px] uppercase tracking-wider border border-white/30 hover:bg-white/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <DollarSign className="w-3 h-3" /> Checkout
                              </button>
                            </div>
                          )}
                          {processedBillings.has(app.id) && (
                            <div className="mt-2 w-full py-1.5 font-mono text-[9px] uppercase tracking-wider text-center flex items-center justify-center gap-1 opacity-80">
                              <CheckCircle2 className="w-3 h-3" /> Cobrado ✓
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── PROCEDIMENTO EM CURSO / PROCESSAMENTO ── */}
              {mockApplications.filter(a => a.status === 'processing').length > 0 && (
                <div className="mb-6">
                  <p className="mono-label text-[#5282c4] mb-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#5282c4] animate-pulse" />
                    Procedimento em Curso (Processamento)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {mockApplications.filter(a => a.status === 'processing').map((app) => (
                      <div key={app.id} className="group relative overflow-hidden rounded-sm">
                        <div className={`p-4 border transition-all duration-150 cursor-default h-[120px] flex flex-col justify-between`}
                          style={{
                            borderColor: app.themeColor ? `${app.themeColor}40` : '#5282c440',
                            backgroundColor: app.themeColor ? `${app.themeColor}10` : '#5282c410'
                          }}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="w-6 h-6 flex items-center justify-center" style={{ color: app.themeColor || '#5282c4' }}>
                                <Activity className="w-4 h-4 animate-spin-slow" />
                              </div>
                              <span className="font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 border"
                                style={{
                                  borderColor: app.themeColor ? `${app.themeColor}40` : '#5282c440',
                                  color: app.themeColor || '#4272b4'
                                }}
                              >
                                Em Preparo
                              </span>
                            </div>
                            <p className="font-serif font-semibold text-foreground text-sm truncate">{app.patientName}</p>
                            <p className="font-mono text-[10px] mt-0.5 truncate font-bold" style={{ color: app.themeColor || '#4272b4' }}>{app.productName}</p>
                          </div>
                          {app.consultorio && (
                            <p className="font-mono text-[10px] flex items-center gap-1" style={{ color: app.themeColor || '#5282c4' }}>
                              <Clock className="w-3 h-3" /> Aguardando {app.route}
                            </p>
                          )}
                        </div>
                        {/* Overlay Animação */}
                        <div className="absolute inset-0 p-4 opacity-0 flex flex-col justify-center translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-sm"
                          style={{ backgroundColor: app.themeColor || '#5282c4', color: app.themeText || '#f7f5f0' }}
                        >
                          <p className="font-serif font-bold text-sm mb-2 text-center text-[#f7f5f0] drop-shadow-sm">{app.patientName}</p>
                          <div className="space-y-1.5 font-mono text-[10px] drop-shadow-sm">
                            <div className="flex items-center gap-2"><Activity className="w-3 h-3 opacity-80" /> {app.productName}</div>
                            <div className="flex items-center gap-2"><Syringe className="w-3 h-3 opacity-80" /> {app.dose} • {app.route}</div>
                            {app.consultorio && <div className="flex items-center gap-2"><MapPin className="w-3 h-3 opacity-80" /> {app.consultorio}</div>}
                            {app.nurseAssigned && <div className="flex items-center gap-2"><User className="w-3 h-3 opacity-80" /> {app.nurseAssigned}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── AGENDADOS (ainda não chegaram) ── */}
              {mockApplications.filter(a => a.status === 'scheduled').length > 0 && (
                <div>
                  <p className="mono-label text-muted-foreground mb-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                    Agendados para Hoje
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {mockApplications.filter(a => a.status === 'scheduled').map((app) => (
                      <div key={app.id} className="group relative overflow-hidden rounded-sm">
                        <div className="p-4 border h-[120px] flex flex-col justify-between hover:border-foreground/30 transition-all duration-150 cursor-default"
                          style={{
                            borderColor: app.themeColor ? `${app.themeColor}30` : 'var(--border)',
                            backgroundColor: app.themeColor ? `${app.themeColor}05` : 'transparent'
                          }}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Syringe className="w-4 h-4" style={{ color: app.themeColor || 'currentColor', opacity: app.themeColor ? 0.8 : 0.5 }} />
                              <span className="font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 border text-muted-foreground"
                                style={{ borderColor: app.themeColor ? `${app.themeColor}30` : 'var(--border)' }}
                              >
                                Agendada
                              </span>
                            </div>
                            <p className="font-serif font-semibold text-foreground text-sm truncate">{app.patientName}</p>
                            <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">{app.productName}</p>
                          </div>
                        </div>
                        {/* Overlay Animação */}
                        <div className="absolute inset-0 p-4 opacity-0 flex flex-col justify-center translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-sm"
                          style={{ backgroundColor: app.themeColor || 'var(--foreground)', color: app.themeText || 'var(--background)' }}
                        >
                          <p className="font-serif font-bold text-sm mb-2 text-center drop-shadow-sm">{app.patientName}</p>
                          <div className="space-y-1.5 font-mono text-[10px] drop-shadow-sm">
                            <div className="flex items-center gap-2"><Pill className="w-3 h-3 opacity-80" /> {app.productName}</div>
                            <div className="flex items-center gap-2"><Syringe className="w-3 h-3 opacity-80" /> {app.dose} • {app.route}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

          </div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h2 className="font-serif text-lg font-semibold text-foreground mb-4 px-1">
              Acesso Rápido
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <ActionCard icon={<Users className="w-4 h-4" />} title="Novo Paciente" description="Cadastrar ficha" href="/patients" />
              <ActionCard icon={<DollarSign className="w-4 h-4" />} title="Faturamento" description="Cobranças e recebimentos" href="/faturamento" />
              <ActionCard icon={<Receipt className="w-4 h-4" />} title="Entrada Avulsa" description="Venda direta / extras" href="/faturamento?tab=avulsa" />
              <ActionCard icon={<Syringe className="w-4 h-4" />} title="Estoque" description="Controle de insumos" href="/estoque" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ========= MODAL DE REGISTRO DE ENTRADA ========= */}
      <AnimatePresence>
        {billingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setBillingModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border w-full max-w-md p-0 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-[#7c9a72]" />
                    Registro de Entrada
                  </h3>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                    {billingModal.source === 'consulta' ? 'Consulta Médica' : billingModal.source === 'procedimento' ? 'Protocolo Injetável' : 'Entrada Avulsa'}
                  </p>
                </div>
                <button onClick={() => setBillingModal(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Paciente */}
                <div className="flex items-center gap-3 p-3 border border-border bg-muted/30">
                  <User className="w-5 h-5 text-[#7c9a72]" />
                  <div>
                    <p className="font-serif font-semibold text-foreground text-sm">{billingModal.patientName}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{billingModal.productName}</p>
                  </div>
                </div>

                {/* Valores */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Valor Unit.</label>
                    <div className="font-mono text-xl font-bold text-foreground">
                      {formatCurrency(billingModal.unitPrice)}
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Desconto (R$)</label>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={billingDiscount}
                      onChange={(e) => setBillingDiscount(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-border bg-background font-mono text-sm text-foreground focus:outline-none focus:border-[#7c9a72]"
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="p-3 border border-[#7c9a72]/30 bg-[#7c9a72]/[0.05]">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Total a cobrar</span>
                    <span className="font-serif text-2xl font-bold text-[#7c9a72]">
                      {formatCurrency((billingModal.unitPrice * billingModal.quantity) - billingDiscount)}
                    </span>
                  </div>
                </div>

                {/* Métodos de Pagamento */}
                <div>
                  <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-2">Forma de Pagamento</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PAYMENT_METHODS.map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.value}
                          onClick={() => setSelectedPayment(m.value)}
                          className={`p-2.5 border text-center transition-all duration-150 ${selectedPayment === m.value
                            ? 'border-[#7c9a72] bg-[#7c9a72]/10 text-[#7c9a72]'
                            : 'border-border text-muted-foreground hover:border-foreground/30'
                            }`}
                        >
                          <Icon className="w-4 h-4 mx-auto mb-1" />
                          <span className="font-mono text-[9px] uppercase tracking-wider block">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Observações</label>
                  <input
                    type="text"
                    value={billingNotes}
                    onChange={(e) => setBillingNotes(e.target.value)}
                    placeholder="Opcional..."
                    className="w-full px-3 py-2 border border-border bg-background font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-[#7c9a72]"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-5 border-t border-border bg-muted/20">
                <button
                  onClick={() => setBillingModal(null)}
                  className="flex-1 h-10 border border-border font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmBilling}
                  className="flex-1 h-10 bg-[#7c9a72] hover:bg-[#6b8a62] text-white font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmar Recebimento
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="border border-border bg-card p-5 hover:border-foreground/30 transition-colors duration-150">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-3xl font-medium text-foreground mb-1 tracking-tight">
            {value}
          </p>
          <p className="mono-label text-muted-foreground">{label}</p>
          {subtext && (
            <p className="font-serif text-xs text-muted-foreground mt-1.5 truncate max-w-[130px] italic">
              {subtext}
            </p>
          )}
        </div>
        <div className="text-[#7c9a72]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="w-full text-left border border-border p-4 hover:border-foreground/30 transition-colors duration-150 group flex items-center gap-4 bg-card"
    >
      <div className="text-[#7c9a72] group-hover:text-[#6b8a62] transition-colors duration-150">
        {icon}
      </div>
      <div>
        <h3 className="font-serif text-sm font-semibold text-foreground">{title}</h3>
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{description}</p>
      </div>
    </button>
  );
}
