import { KanbanBoard } from '@/components/crm/kanban-board';
import { NewLeadDialog } from '@/components/crm/new-lead-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function CRMPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
            {/* CRM Header - Sticky Top */}
            <div className="flex-none p-4 border-b bg-white dark:bg-slate-900 shadow-sm z-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Pipeline de Vendas</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Gerencie seus leads e oportunidades em tempo real.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <NewLeadDialog />
                        <Button variant="ghost" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filtrar
                        </Button>
                        <Link href="/crm/analytics">
                            <Button variant="ghost" size="sm">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analytics
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Toolbar (Filters & Search) */}
                <div className="flex items-center gap-2">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            type="search"
                            placeholder="Buscar por nome, telefone ou tags..."
                            className="pl-9 h-9 bg-slate-50 border-slate-200"
                        />
                    </div>
                    <Button variant="outline" size="sm" className="h-9">
                        <Filter className="w-4 h-4 mr-2" /> Filtros
                    </Button>
                </div>
            </div>

            {/* Main Board Area - Scrollable */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
                <div className="h-full min-w-max">
                    <KanbanBoard />
                </div>
            </div>
        </div >
    );
}
