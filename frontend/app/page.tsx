'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, Activity, Plus, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch today's appointments
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

  // Fetch all patients count
  const { data: patients = [] } = useQuery({
    queryKey: ['dashboard-patients'],
    queryFn: async () => {
      try {
        const res = await api.get('/patients');
        return res.data;
      } catch (e) { return Array(1248).fill({}); } // Mock count
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
    // Mock logic: simply take the first one if mock
    return true;
  }) || upcomingToday[0];

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-secondary/30 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <motion.h1
                className="text-3xl font-bold text-gray-900 tracking-tight"
                whileHover={{ scale: 1.01 }}
              >
                Olá, Dr. Paulo
              </motion.h1>
              <p className="text-gray-500">
                Aqui está o resumo do seu dia.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/agenda">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  <Plus className="w-4 h-4 mr-2" /> Nova Consulta
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<Calendar className="w-5 h-5" />}
              label="Consultas Hoje"
              value={appointments.length}
              color="teal"
            />
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              label="Próxima Consulta"
              value={nextAppointment ? nextAppointment.startTime : '-'}
              subtext={nextAppointment?.patientName}
              color="blue"
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Pacientes Ativos"
              value={patients.length || 1248}
              color="emerald"
            />
            <StatCard
              icon={<Activity className="w-5 h-5" />}
              label="Taxa de Faltas"
              value="2%"
              color="purple"
            />
          </motion.div>

          {/* Today's Schedule & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Schedule (Takes 2 columns) */}
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Agenda de Hoje
                </h2>
                <Link href="/agenda" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1">
                  Ver completa <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhuma consulta agendada para hoje</p>
                  <Link href="/agenda">
                    <Button variant="outline" className="mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      Agendar Consulta
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingToday.slice(0, 5).map((apt: Appointment) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-emerald-100 transition-all group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="text-center bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg font-bold min-w-[70px]">
                          {apt.startTime}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{apt.patientName}</p>
                          <p className="text-sm text-gray-500">
                            {apt.type === 'first_visit' ? 'Primeira Consulta' :
                              apt.type === 'return' ? 'Retorno' : 'Avaliação'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${apt.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                        apt.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                          apt.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-red-50 text-red-700 border-red-100'
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

            {/* Quick Actions (Takes 1 column) */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 px-1">Acesso Rápido</h2>

              <ActionCard
                icon={<Users className="w-5 h-5" />}
                title="Novo Paciente"
                description="Cadastrar ficha completa"
                href="/patients"
                color="emerald"
              />
              <ActionCard
                icon={<Plus className="w-5 h-5" />}
                title="Financeiro"
                description="Registrar entrada/saída"
                href="/transactions"
                color="blue"
              />
              <ActionCard
                icon={<Activity className="w-5 h-5" />}
                title="CRM"
                description="Gerenciar leads e pipeline"
                href="/crm"
                color="purple"
              />
            </motion.div>

        </motion.div>
      </motion.div>
    </div>
    </div >
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
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1 truncate max-w-[120px]">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
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
    teal: 'bg-teal-50 text-teal-600 group-hover:bg-teal-100',
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
  };

  return (
    <motion.button
      onClick={() => router.push(href)}
      className="bg-white rounded-xl shadow-sm p-5 text-left border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all w-full group flex items-center gap-4"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`p-3 rounded-lg transition-colors ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </motion.button>
  );
}
