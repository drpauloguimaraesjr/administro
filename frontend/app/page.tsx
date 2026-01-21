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

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch today's appointments
  const today = new Date().toISOString().split('T')[0];
  const { data: appointments = [] } = useQuery({
    queryKey: ['dashboard-appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments');
      return res.data.filter((apt: Appointment) => apt.date === today);
    },
    enabled: !!user,
  });

  // Fetch all patients count
  const { data: patients = [] } = useQuery({
    queryKey: ['dashboard-patients'],
    queryFn: async () => {
      const res = await api.get('/patients');
      return res.data;
    },
    enabled: !!user,
  });

  // Find next appointment
  const now = new Date();
  const upcomingToday = appointments
    .filter((apt: Appointment) => apt.status !== 'cancelled')
    .sort((a: Appointment, b: Appointment) => a.startTime.localeCompare(b.startTime));

  const nextAppointment = upcomingToday.find((apt: Appointment) => {
    const [hours, minutes] = apt.startTime.split(':').map(Number);
    const aptTime = new Date(today);
    aptTime.setHours(hours, minutes);
    return aptTime > now;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center space-y-2">
            <motion.h1
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.02 }}
            >
              CALYX
            </motion.h1>
            <p className="text-muted-foreground">
              Prontuário Eletrônico e Gestão Médica
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Calendar className="w-6 h-6" />}
              label="Consultas Hoje"
              value={appointments.length}
              color="teal"
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              label="Próxima Consulta"
              value={nextAppointment ? nextAppointment.startTime : '-'}
              subtext={nextAppointment?.patientName}
              color="blue"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="Pacientes Ativos"
              value={patients.length}
              color="emerald"
            />
            <StatCard
              icon={<Activity className="w-6 h-6" />}
              label="Confirmadas"
              value={appointments.filter((a: Appointment) => a.status === 'confirmed').length}
              color="purple"
            />
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard
              icon={<Calendar className="w-6 h-6" />}
              title="Nova Consulta"
              description="Agendar atendimento"
              href="/agenda"
              color="teal"
            />
            <ActionCard
              icon={<Users className="w-6 h-6" />}
              title="Novo Paciente"
              description="Cadastrar paciente"
              href="/patients"
              color="emerald"
            />
            <ActionCard
              icon={<Plus className="w-6 h-6" />}
              title="Registrar Pagamento"
              description="Controle financeiro"
              href="/transactions"
              color="blue"
            />
          </motion.div>

          {/* Today's Schedule */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Agenda de Hoje</h2>
              <Link href="/agenda" className="text-teal-600 hover:underline flex items-center gap-1">
                Ver completa <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma consulta agendada para hoje</p>
                <Link href="/agenda">
                  <button className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                    Agendar Consulta
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingToday.slice(0, 5).map((apt: Appointment) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-teal-600">{apt.startTime}</p>
                      </div>
                      <div>
                        <p className="font-medium">{apt.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.type === 'first_visit' ? 'Primeira Consulta' :
                            apt.type === 'return' ? 'Retorno' : 'Avaliação'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          apt.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
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
        </motion.div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  };

  return (
    <motion.div
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-slate-200 dark:border-slate-700"
      whileHover={{ y: -2 }}
    >
      <div className={`p-3 rounded-lg w-fit mb-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {subtext && <p className="text-xs text-muted-foreground truncate">{subtext}</p>}
    </motion.div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  const router = useRouter();
  const colorClasses: Record<string, string> = {
    teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  };

  return (
    <motion.button
      onClick={() => router.push(href)}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-left border border-slate-200 dark:border-slate-700 hover:border-teal-500 transition-all w-full"
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`p-3 rounded-lg w-fit mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.button>
  );
}
