'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, Activity, Plus, ArrowRight, Syringe, User, CheckCircle2, AlertCircle, MapPin, Pill } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  startTime: string;
  status: string;
  type: string;
}

interface Application {
  id: string;
  patientName: string;
  productName: string;
  dose: string;
  route: string;
  status: 'scheduled' | 'in_progress' | 'done';
  nurseAssigned?: string;
  consultorio?: string;
  arrivalTime?: string;
  lotNumber?: string;
}

// MOCK: Consultas do dia
const mockAppointments: Appointment[] = [
  { id: '1', patientName: 'Eduardo Costa', date: new Date().toISOString().split('T')[0], startTime: '09:00', status: 'confirmed', type: 'first_visit' },
  { id: '2', patientName: 'Maria Silva', date: new Date().toISOString().split('T')[0], startTime: '10:30', status: 'pending', type: 'return' },
  { id: '3', patientName: 'João Santos', date: new Date().toISOString().split('T')[0], startTime: '14:00', status: 'confirmed', type: 'procedure' },
  { id: '4', patientName: 'Ana Oliveira', date: new Date().toISOString().split('T')[0], startTime: '16:00', status: 'confirmed', type: 'return' },
  { id: '5', patientName: 'Carla Menezes', date: new Date().toISOString().split('T')[0], startTime: '17:00', status: 'pending', type: 'first_visit' },
];

// MOCK: Aplicações do dia
const mockApplications: Application[] = [
  { id: '1', patientName: 'Fernanda Lopes', productName: 'Gestrinona 20mg', dose: '20mg', route: 'Implante SC', status: 'done', nurseAssigned: 'Enfermeira Ana', consultorio: 'Sala 1', arrivalTime: '08:30', lotNumber: 'LOT-2025-0847' },
  { id: '2', patientName: 'Juliana Rocha', productName: 'Testosterona 50mg', dose: '50mg', route: 'Implante SC', status: 'in_progress', nurseAssigned: 'Enfermeira Ana', consultorio: 'Consultório Dr. Paulo', arrivalTime: '09:15', lotNumber: 'LOT-2025-1293' },
  { id: '3', patientName: 'João da Silveira', productName: 'Testosterona 75mg + Oxandrolona 10mg', dose: '85mg total', route: 'Implante SC', status: 'in_progress', nurseAssigned: 'Enfermeira Carla', consultorio: 'Sala 2', arrivalTime: '09:40', lotNumber: 'LOT-2025-0991' },
  { id: '4', patientName: 'Patrícia Almeida', productName: 'Oxandrolona 15mg', dose: '15mg', route: 'Implante SC', status: 'scheduled' },
  { id: '5', patientName: 'Roberto Lima', productName: 'Testosterona 75mg', dose: '75mg', route: 'Implante Glúteo', status: 'scheduled' },
  { id: '6', patientName: 'Cláudia Dias', productName: 'Gestrinona 10mg + Testosterona 25mg', dose: '35mg total', route: 'Implante SC', status: 'scheduled' },
  { id: '7', patientName: 'Marcos Pereira', productName: 'Testosterona 100mg', dose: '100mg', route: 'Implante Glúteo', status: 'scheduled' },
];

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

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
              icon={<Syringe className="w-4 h-4" />}
              label="Aplicações Hoje"
              value={`${doneApps}/${totalApps}`}
              subtext="realizadas"
            />
            <StatCard
              icon={<Users className="w-4 h-4" />}
              label="Pacientes Ativos"
              value={patients.length || 1248}
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
                  {upcomingToday.slice(0, 6).map((apt: Appointment) => (
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
                  ))}
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
                      <div key={app.id} className="group relative">
                        <div className={`p-4 border transition-all duration-150 cursor-default ${app.status === 'done'
                            ? 'border-[#7c9a72]/30 bg-[#7c9a72]/[0.04]'
                            : 'border-[#c48a3a]/30 bg-[#c48a3a]/[0.04]'
                          }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className={`w-6 h-6 flex items-center justify-center ${app.status === 'done' ? 'text-[#7c9a72]' : 'text-[#c48a3a]'}`}>
                              {app.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            </div>
                            <span className={`font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 border ${app.status === 'done' ? 'border-[#7c9a72]/30 text-[#6b8a62]' : 'border-[#c48a3a]/30 text-[#c48a3a]'
                              }`}>
                              {app.status === 'done' ? 'Feita' : 'Atendendo'}
                            </span>
                          </div>
                          <p className="font-serif font-semibold text-foreground text-sm truncate">{app.patientName}</p>
                          <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">{app.productName}</p>
                          {app.consultorio && (
                            <p className="font-mono text-[10px] text-[#7c9a72] mt-2 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {app.consultorio}
                            </p>
                          )}
                        </div>
                        {/* Hover Tooltip */}
                        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-foreground text-background p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 shadow-xl">
                          <p className="font-serif font-bold text-sm mb-2">{app.patientName}</p>
                          <div className="space-y-1.5 font-mono text-[10px]">
                            <div className="flex items-center gap-2"><Pill className="w-3 h-3 opacity-60" /> {app.productName}</div>
                            <div className="flex items-center gap-2"><Syringe className="w-3 h-3 opacity-60" /> {app.dose} • {app.route}</div>
                            {app.consultorio && <div className="flex items-center gap-2"><MapPin className="w-3 h-3 opacity-60" /> {app.consultorio}</div>}
                            {app.nurseAssigned && <div className="flex items-center gap-2"><User className="w-3 h-3 opacity-60" /> {app.nurseAssigned}</div>}
                            {app.arrivalTime && <div className="flex items-center gap-2"><Clock className="w-3 h-3 opacity-60" /> Chegou às {app.arrivalTime}</div>}
                            {app.lotNumber && <div className="opacity-50 mt-1">Lote: {app.lotNumber}</div>}
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
                      <div key={app.id} className="group relative">
                        <div className="p-4 border border-border hover:border-foreground/30 transition-all duration-150 cursor-default">
                          <div className="flex items-center justify-between mb-2">
                            <Syringe className="w-4 h-4 text-muted-foreground/50" />
                            <span className="font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 border border-border text-muted-foreground">Agendada</span>
                          </div>
                          <p className="font-serif font-semibold text-foreground text-sm truncate">{app.patientName}</p>
                          <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">{app.productName}</p>
                        </div>
                        {/* Hover Tooltip */}
                        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-foreground text-background p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 shadow-xl">
                          <p className="font-serif font-bold text-sm mb-2">{app.patientName}</p>
                          <div className="space-y-1.5 font-mono text-[10px]">
                            <div className="flex items-center gap-2"><Pill className="w-3 h-3 opacity-60" /> {app.productName}</div>
                            <div className="flex items-center gap-2"><Syringe className="w-3 h-3 opacity-60" /> {app.dose} • {app.route}</div>
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
              <ActionCard icon={<Plus className="w-4 h-4" />} title="Financeiro" description="Entradas e saídas" href="/transactions" />
              <ActionCard icon={<Activity className="w-4 h-4" />} title="CRM" description="Leads e pipeline" href="/crm" />
              <ActionCard icon={<Syringe className="w-4 h-4" />} title="Estoque" description="Controle de insumos" href="/estoque" />
            </div>
          </motion.div>
        </motion.div>
      </div>
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
