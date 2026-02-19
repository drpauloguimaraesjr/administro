'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, Activity, Plus, ArrowRight } from 'lucide-react';
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

interface Patient {
  id: string;
  name: string;
}

// MOCK DATA FOR PRESENTATION
const mockAppointments: Appointment[] = [
  { id: '1', patientName: 'Eduardo Costa', date: new Date().toISOString().split('T')[0], startTime: '09:00', status: 'confirmed', type: 'first_visit' },
  { id: '2', patientName: 'Maria Silva', date: new Date().toISOString().split('T')[0], startTime: '10:30', status: 'pending', type: 'return' },
  { id: '3', patientName: 'João Santos', date: new Date().toISOString().split('T')[0], startTime: '14:00', status: 'confirmed', type: 'procedure' },
  { id: '4', patientName: 'Ana Oliveira', date: new Date().toISOString().split('T')[0], startTime: '16:00', status: 'confirmed', type: 'return' },
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
                Dashboard
              </h1>
              <p className="font-mono text-sm text-muted-foreground">
                Resumo do seu dia.
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
              label="Pacientes Ativos"
              value={patients.length || 1248}
            />
            <StatCard
              icon={<Activity className="w-4 h-4" />}
              label="Taxa de Faltas"
              value="2%"
            />
          </motion.div>

          {/* Today's Schedule & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Schedule (2 columns) */}
            <motion.div variants={itemVariants} className="lg:col-span-2 border border-border bg-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#7c9a72]" />
                  Agenda de Hoje
                </h2>
                <Link href="/agenda" className="mono-label text-[#7c9a72] hover:text-[#6b8a62] transition-colors duration-150 flex items-center gap-1">
                  Ver completa <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-mono text-sm">Nenhuma consulta agendada</p>
                  <Link href="/agenda">
                    <button className="mt-4 px-4 py-2 border border-border text-foreground font-mono text-xs uppercase tracking-[0.15em] hover:border-foreground/40 transition-colors duration-150">
                      Agendar Consulta
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingToday.slice(0, 5).map((apt: Appointment) => (
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
                      <span className={`font-mono text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 border ${
                        apt.status === 'confirmed' ? 'border-[#7c9a72]/30 text-[#6b8a62]' :
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

            {/* Quick Actions (1 column) */}
            <motion.div variants={itemVariants} className="space-y-3">
              <h2 className="font-serif text-lg font-semibold text-foreground mb-4 px-1">
                Acesso Rápido
              </h2>

              <ActionCard
                icon={<Users className="w-4 h-4" />}
                title="Novo Paciente"
                description="Cadastrar ficha completa"
                href="/patients"
              />
              <ActionCard
                icon={<Plus className="w-4 h-4" />}
                title="Financeiro"
                description="Registrar entrada/saída"
                href="/transactions"
              />
              <ActionCard
                icon={<Activity className="w-4 h-4" />}
                title="CRM"
                description="Gerenciar leads e pipeline"
                href="/crm"
              />
            </motion.div>

          </div>
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
