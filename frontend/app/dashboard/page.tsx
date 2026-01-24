import React, { useState } from 'react';
import {
    Calendar as CalendarIcon,
    Bell,
    MessageSquare,
    Stethoscope,
    User,
    Clock,
    ChevronLeft,
    ChevronRight,
    Play
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
        color: 'bg-teal-50 border-teal-500',
        status_icons: ['user', 'stethoscope', 'dollar', 'calendar']
    },
    {
        id: 2,
        name: 'Thiago Feliphe Pereira',
        type: 'Paciente Antigo/Reagendado',
        prontuario: '4899',
        phone: '99746-8332, 99937-8408',
        time: '11:00 até 12:00',
        color: 'bg-teal-50 border-teal-500',
        status_icons: ['user', 'stethoscope', 'dollar', 'calendar']
    },
    {
        id: 3,
        name: 'Irineu Machado Junior',
        type: 'Paciente Antigo/Reagendado',
        prontuario: '3814',
        phone: '47 9 9918-8494',
        time: '12:00 até 13:00',
        color: 'bg-teal-50 border-teal-500',
        status_icons: ['user', 'stethoscope', 'dollar', 'calendar']
    },
    {
        id: 4,
        name: 'Livia da Cunha',
        type: 'Encaixe / PRP',
        details: 'P/DR - Jocelia da Silva Conrado - ON LINE',
        time: '13:00 até 13:30',
        color: 'bg-amber-50 border-amber-500',
        status_icons: []
    },
    {
        id: 5,
        name: 'Isadora Petris',
        type: 'Paciente Primeira Vez',
        prontuario: '3427',
        phone: '47 9176-2188 Erwino',
        details: 'EXAMES PRONTOS',
        time: '14:00 até 15:00',
        color: 'bg-teal-50 border-teal-500',
        status_icons: ['user', 'stethoscope', 'dollar', 'calendar']
    },
    {
        id: 6,
        name: 'Samuel Gontaro Tateishi',
        type: 'Paciente Antigo/Reagendado',
        prontuario: '6129',
        phone: '47-999237353',
        time: '15:00 até 16:00',
        color: 'bg-teal-50 border-teal-500',
        status_icons: ['user', 'stethoscope', 'dollar', 'calendar']
    }
];

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('agenda');

    return (
        <div className="h-full flex flex-col md:flex-row gap-6 p-2">

            {/* Left Column: Calendar & Notes */}
            <div className="w-full md:w-80 flex flex-col gap-6 shrink-0">
                <Card className="border-none shadow-sm card-hover-effect">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-teal-700 mb-4 font-bold tracking-tight">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-teal-50"><ChevronLeft className="w-4 h-4" /></Button>
                            <span className="uppercase text-sm">janeiro 2026</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-teal-50"><ChevronRight className="w-4 h-4" /></Button>
                        </div>
                        <div className="grid grid-cols-7 text-center text-xs gap-y-3 mb-2 font-medium">
                            <span className="text-gray-400">D</span>
                            <span className="text-gray-400">S</span>
                            <span className="text-gray-400">T</span>
                            <span className="text-gray-400">Q</span>
                            <span className="text-gray-400">Q</span>
                            <span className="text-gray-400">S</span>
                            <span className="text-gray-400">S</span>

                            {/* Mock Calendar Days */}
                            <span className="text-gray-300">28</span>
                            <span className="text-gray-300">29</span>
                            <span className="text-gray-300">30</span>
                            <span className="text-gray-300">31</span>

                            <span className="text-slate-700">1</span>
                            <span className="text-slate-700">2</span>
                            <span className="text-teal-600 font-bold">3</span>

                            <span className="text-teal-600 font-bold">4</span>
                            <span className="text-slate-700">5</span>
                            <span className="text-slate-700">6</span>
                            <span className="text-slate-700">7</span>
                            <span className="text-slate-700">8</span>
                            <span className="text-slate-700">9</span>
                            <span className="text-teal-600 font-bold">10</span>

                            <span className="text-teal-600 font-bold">11</span>
                            <span className="text-slate-700">12</span>
                            <span className="text-slate-700">13</span>
                            <span className="text-slate-700">14</span>
                            <span className="text-slate-700">15</span>
                            <span className="text-slate-700">16</span>
                            <span className="text-teal-600 font-bold">17</span>

                            <span className="text-teal-600 font-bold">18</span>
                            <span className="text-slate-700">19</span>
                            <span className="text-slate-700">20</span>
                            <span className="bg-teal-600 text-white rounded-full w-7 h-7 flex items-center justify-center mx-auto shadow-md">21</span>
                            <span className="text-slate-700">22</span>
                            <span className="text-slate-700">23</span>
                            <span className="text-teal-600 font-bold">24</span>

                            <span className="text-teal-600 font-bold">25</span>
                            <span className="text-slate-700">26</span>
                            <span className="text-slate-700">27</span>
                            <span className="text-slate-700">28</span>
                            <span className="text-slate-700">29</span>
                            <span className="text-slate-700">30</span>
                            <span className="text-teal-600 font-bold">31</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex-1 flex flex-col border-none shadow-sm overflow-hidden card-hover-effect min-h-[200px]">
                    <CardHeader className="p-4 py-3 bg-slate-50 border-b border-slate-100">
                        <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">Notas Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-4 bg-white relative">
                        <p className="text-xs text-gray-400 italic">Nenhuma nota pendente.</p>
                        <div className="absolute inset-x-0 bottom-0">
                            <Button className="w-full rounded-none bg-teal-600 hover:bg-teal-700 h-10 text-xs uppercase tracking-widest font-bold">
                                + Nova Nota
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Middle Column: Schedule - Main Content */}
            <div className="flex-1 flex flex-col min-w-[300px]">
                {/* Tabs */}
                <div className="flex rounded-md overflow-hidden bg-slate-100/50 p-1 mb-4 gap-1">
                    <button
                        onClick={() => setActiveTab('agenda')}
                        className={`flex-1 py-2 text-sm font-bold rounded flex items-center justify-center transition-all ${activeTab === 'agenda'
                            ? 'bg-white text-teal-700 shadow-sm'
                            : 'text-slate-500 hover:bg-slate-200/50'
                            }`}
                    >
                        Agenda de Hoje (21/01)
                    </button>
                    <button
                        onClick={() => setActiveTab('atendidos')}
                        className={`flex-1 py-2 text-sm font-bold rounded flex items-center justify-center transition-all ${activeTab === 'atendidos'
                            ? 'bg-white text-teal-700 shadow-sm'
                            : 'text-slate-500 hover:bg-slate-200/50'
                            }`}
                    >
                        Pacientes Atendidos
                    </button>
                </div>

                {/* List of Patients */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin pb-4">
                    {patients.map((patient) => (
                        <Card key={patient.id} className={`border-l-4 shadow-sm hover:shadow-md transition-shadow group ${patient.color}`}>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                            <User className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                {patient.name}
                                                <span className="px-2 py-0.5 rounded-full bg-white/50 text-[10px] font-medium text-slate-500 border border-slate-100">
                                                    {patient.type}
                                                </span>
                                            </h3>

                                            <div className="text-xs text-slate-500 mt-1.5 space-y-1">
                                                {patient.prontuario && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-semibold text-slate-400">ID:</span> {patient.prontuario}
                                                    </div>
                                                )}
                                                {patient.phone && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-semibold text-slate-400">Tel:</span> {patient.phone}
                                                    </div>
                                                )}
                                                {patient.details && (
                                                    <div className="flex items-center gap-1 p-1 bg-amber-50 text-amber-700 rounded border border-amber-100 max-w-fit">
                                                        <span className="font-bold">⚠</span> {patient.details}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status Icons */}
                                            <div className="flex gap-2 mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 cursor-help" title="Check-in"><User className="w-3 h-3" /></div>
                                                <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 cursor-help" title="Médico"><Stethoscope className="w-3 h-3" /></div>
                                                <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 cursor-help" title="Financeiro"><div className="text-[10px] font-bold">$</div></div>
                                                <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 cursor-help" title="Agendamento"><CalendarIcon className="w-3 h-3" /></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3">
                                        <div className="flex items-center text-xs font-mono font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-100">
                                            <Clock className="w-3 h-3 mr-1.5 text-teal-600" />
                                            {patient.time}
                                        </div>
                                        <Button className="bg-teal-600 hover:bg-teal-700 text-white h-8 text-xs px-4 rounded shadow-sm btn-hover-effect">
                                            <Play className="w-3 h-3 mr-1.5 fill-current" />
                                            Iniciar
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Right Column: Notifications & Ads */}
            <div className="w-full md:w-72 flex flex-col gap-6 shrink-0">
                <Card className="flex-1 border-none shadow-sm card-hover-effect max-h-[300px]">
                    <CardHeader className="p-4 py-3 border-b border-slate-100 bg-slate-50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">Notificações</CardTitle>
                            <div className="relative">
                                <Bell className="w-4 h-4 text-slate-400 hover:text-teal-600 cursor-pointer transition-colors" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="text-center text-gray-400 text-xs mt-10">
                            Tudo limpo por aqui.
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl overflow-hidden relative group">
                    <CardContent className="p-6 relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-lg tracking-tight">Calyx<span className="text-teal-400">AI</span></h4>
                            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_10px_#2dd4bf]"></div>
                        </div>
                        <h3 className="font-bold text-sm mb-3 leading-relaxed text-slate-200">
                            Ative o agente de confirmação automática.
                        </h3>
                        <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] tracking-widest uppercase shadow-lg shadow-teal-900/50">
                            Ativar Automação
                        </Button>
                    </CardContent>

                    {/* Decorative background element */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-500 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500"></div>

                    {/* Chat floating icon simulation */}
                    <div className="absolute bottom-4 right-4 w-8 h-8 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border border-white/20">
                        <MessageSquare className="w-4 h-4 text-teal-400" />
                    </div>
                </Card>
            </div>
        </div>
    );
}
