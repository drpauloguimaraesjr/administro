'use client';

import React, { useState } from 'react';
import {
    Home,
    Calendar as CalendarIcon,
    Users,
    Settings,
    Bell,
    MessageSquare,
    FileText,
    Search,
    LayoutGrid,
    Stethoscope,
    Briefcase,
    Play,
    User,
    Clock,
    ChevronLeft,
    ChevronRight,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock Data
const patients = [
    {
        id: 1,
        name: 'Lorena Cidral Cota Pereira',
        type: 'Paciente Antigo/Reagendado',
        prontuario: '5014',
        time: '10:00 até 11:00',
        color: 'bg-purple-100 border-purple-500',
        status_icons: ['user', 'stethoscope', 'dollar', 'calendar']
    },
    {
        id: 2,
        name: 'Thiago Feliphe Pereira',
        type: 'Paciente Antigo/Reagendado',
        prontuario: '4899',
        phone: '99746-8332, 99937-8408',
        time: '11:00 até 12:00',
        color: 'bg-purple-100 border-purple-500',
        status_icons: ['user', 'stethoscope', 'dollar', 'calendar']
    },
    {
        id: 3,
        name: 'Irineu Machado Junior',
        type: 'Paciente Antigo/Reagendado',
        prontuario: '3814',
        phone: '47 9 9918-8494',
        time: '12:00 até 13:00',
        color: 'bg-purple-100 border-purple-500',
        status_icons: ['user', 'stethoscope', 'dollar', 'calendar']
    },
    {
        id: 4,
        name: 'Livia da Cunha',
        type: 'Encaixe / PRP',
        details: 'P/DR - Jocelia da Silva Conrado - ON LINE - FAZER AS COISAS DELA',
        time: '13:00 até 13:30',
        color: 'bg-orange-100 border-orange-500',
        status_icons: []
    },
    {
        id: 5,
        name: 'Isadora Petris',
        type: 'Paciente Primeira Vez',
        prontuario: '3427',
        phone: '47 9176-2188 Erwino',
        details: 'EXAMES PRNTOS EM 26/0...',
        time: '14:00 até 15:00',
        color: 'bg-purple-100 border-purple-500',
        status_icons: ['user', 'stethoscope', 'dollar', 'calendar']
    },
    {
        id: 6,
        name: 'Samuel Gontaro Tateishi',
        type: 'Paciente Antigo/Reagendado',
        prontuario: '6129',
        phone: '47-999237353',
        time: '15:00 até 16:00',
        color: 'bg-purple-100 border-purple-500',
        status_icons: ['user', 'stethoscope', 'dollar', 'calendar']
    }
];

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('agenda');

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
            {/* Sidebar - Replicating the purple visual from the print */}
            <aside className="w-16 bg-[#6A1B9A] flex flex-col items-center py-4 gap-6 text-white shrink-0 shadow-lg z-10">
                <div className="p-2 rounded-lg bg-white/10 cursor-pointer hover:bg-white/20 transition-colors">
                    <Home className="w-6 h-6" />
                </div>
                <div className="p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                    <User className="w-6 h-6" />
                </div>
                <div className="p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                    <CalendarIcon className="w-6 h-6" />
                </div>
                <div className="p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                    <LayoutGrid className="w-6 h-6" />
                </div>
                <div className="p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                    <Stethoscope className="w-6 h-6" />
                </div>
                <div className="p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                    <Briefcase className="w-6 h-6" />
                </div>
                <div className="p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                    <FileText className="w-6 h-6 opacity-70" />
                </div>
                <div className="mt-auto p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                    <Settings className="w-6 h-6" />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex gap-4 p-4 overflow-hidden">

                {/* Left Column: Calendar & Notes */}
                <div className="w-72 flex flex-col gap-4 shrink-0">
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between text-[#8E24AA] mb-4 font-medium">
                                <ChevronLeft className="w-4 h-4 cursor-pointer" />
                                <span>janeiro 2026</span>
                                <ChevronRight className="w-4 h-4 cursor-pointer" />
                            </div>
                            <div className="grid grid-cols-7 text-center text-xs gap-y-3 mb-2">
                                <span className="text-gray-400">D</span>
                                <span className="text-gray-400">S</span>
                                <span className="text-gray-400">T</span>
                                <span className="text-gray-400">Q</span>
                                <span className="text-gray-400">Q</span>
                                <span className="text-gray-400">S</span>
                                <span className="text-gray-400">S</span>

                                {/* Mock Calendar Days */}
                                {/* Previous month filler */}
                                <span className="text-red-300">28</span>
                                <span className="text-red-300">29</span>
                                <span className="text-red-300">30</span>
                                <span className="text-red-300">31</span>

                                {/* Current month */}
                                <span className="text-gray-700">1</span>
                                <span className="text-gray-700">2</span>
                                <span className="text-red-500">3</span>

                                <span className="text-red-500">4</span>
                                <span className="text-gray-700">5</span>
                                <span className="text-gray-700">6</span>
                                <span className="text-gray-700">7</span>
                                <span className="text-gray-700">8</span>
                                <span className="text-gray-700">9</span>
                                <span className="text-red-500">10</span>

                                <span className="text-red-500">11</span>
                                <span className="text-gray-700">12</span>
                                <span className="text-gray-700">13</span>
                                <span className="text-gray-700">14</span>
                                <span className="text-gray-700">15</span>
                                <span className="text-gray-700">16</span>
                                <span className="text-red-500">17</span>

                                <span className="text-red-500">18</span>
                                <span className="text-gray-700">19</span>
                                <span className="text-gray-700">20</span>
                                <span className="bg-[#8E24AA] text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">21</span>
                                <span className="text-gray-700">22</span>
                                <span className="text-gray-700">23</span>
                                <span className="text-red-500">24</span>

                                <span className="text-red-500">25</span>
                                <span className="text-gray-700">26</span>
                                <span className="text-gray-700">27</span>
                                <span className="text-gray-700">28</span>
                                <span className="text-gray-700">29</span>
                                <span className="text-gray-700">30</span>
                                <span className="text-red-500">31</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex-1 flex flex-col border-none shadow-sm overflow-hidden">
                        <CardHeader className="p-4 py-3 bg-gray-50 border-b">
                            <CardTitle className="text-sm font-medium text-gray-700">Notas</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-4 bg-white relative">
                            {/* Empty state or list of notes */}
                            <div className="absolute inset-x-0 bottom-0">
                                <Button className="w-full rounded-none bg-[#9C27B0] hover:bg-[#7B1FA2] h-10">
                                    Ver cadastro de notas
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Middle Column: Schedule - Main Content */}
                <div className="flex-1 flex flex-col min-w-[500px]">
                    {/* Tabs */}
                    <div className="flex rounded-t-lg overflow-hidden bg-white shadow-sm mb-4">
                        <button
                            onClick={() => setActiveTab('agenda')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'agenda'
                                    ? 'bg-[#9C27B0] text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Ver agenda 21/01/2026
                        </button>
                        <button
                            onClick={() => setActiveTab('atendidos')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'atendidos'
                                    ? 'bg-[#9C27B0] text-white'
                                    : 'bg-white text-[#9C27B0] hover:bg-gray-50'
                                }`}
                        >
                            Ver pacientes atendidos
                        </button>
                    </div>

                    {/* List of Patients */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                        {patients.map((patient) => (
                            <Card key={patient.id} className={`border-l-4 shadow-sm ${patient.color}`}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                                <User className="w-6 h-6 text-slate-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-sm">{patient.name} <span className="font-normal text-gray-500">({patient.type})</span></h3>

                                                <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                                                    {patient.prontuario && <p>Nº prontuário {patient.prontuario}</p>}
                                                    {patient.phone && <p>{patient.phone}</p>}
                                                    {patient.details && <p className="font-medium text-blue-600 truncate max-w-[400px]">{patient.details}</p>}
                                                </div>

                                                {/* Status Icons */}
                                                <div className="flex gap-2 mt-2">
                                                    {/* Using static circles to mimic icons from print if specific icons unavailable */}
                                                    <div className="w-6 h-6 rounded-full border border-yellow-400 flex items-center justify-center text-yellow-500" title="Check-in"><User className="w-3 h-3" /></div>
                                                    <div className="w-6 h-6 rounded-full border border-red-400 flex items-center justify-center text-red-500" title="Médico"><Stethoscope className="w-3 h-3" /></div>
                                                    <div className="w-6 h-6 rounded-full border border-blue-400 flex items-center justify-center text-blue-500" title="Financeiro"><div className="text-[10px] font-bold">$</div></div>
                                                    <div className="w-6 h-6 rounded-full border border-green-400 flex items-center justify-center text-green-500" title="Agendamento"><CalendarIcon className="w-3 h-3" /></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {patient.time}
                                            </div>
                                            <Button className="bg-[#9C27B0] hover:bg-[#7B1FA2] text-white h-8 text-xs px-4 rounded-md shadow-sm transition-all hover:scale-105 active:scale-95">
                                                <Play className="w-3 h-3 mr-1 fill-current" />
                                                Iniciar consulta
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right Column: Notifications & Ads */}
                <div className="w-80 flex flex-col gap-4 shrink-0">
                    <Card className="flex-1 border-none shadow-sm">
                        <CardHeader className="p-4 py-3 border-b">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-sm font-medium text-gray-700">Notificações</CardTitle>
                                <div className="flex gap-2">
                                    {/* Icons for notifications actions */}
                                    <Bell className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="text-center text-gray-400 text-sm mt-10">
                                Nenhuma notificação recente
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="h-auto bg-gray-900 text-white border-none shadow-md overflow-hidden relative group">
                        {/* Ad Mockup */}
                        <div className="absolute top-2 right-2 text-[10px] text-gray-500 uppercase tracking-wider">Patrocinado</div>
                        <CardContent className="p-6 relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-lg">MEDBOT</h4>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            </div>
                            <h3 className="font-bold text-xl mb-2 leading-tight">Pare de perder pacientes por falta de resposta.</h3>
                            <p className="text-xs text-gray-300 mb-4">Automatize o WhatsApp, agilize o atendimento e mantenha tudo sincronizado.</p>
                            <Button className="w-full bg-[#D500F9] hover:bg-[#AA00FF] text-white font-bold text-xs">
                                NÃO QUERO MAIS PERDER PACIENTES
                            </Button>
                        </CardContent>
                        {/* Decorative background element */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#D500F9] opacity-20 rounded-full blur-2xl group-hover:opacity-30 transition-opacity"></div>

                        {/* Chat floating icon simulation */}
                        <div className="absolute bottom-4 right-4 w-10 h-10 bg-[#4A148C] rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
