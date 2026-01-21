'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Check, X, AlertCircle, Info, Plus, Edit, Trash2, Search,
    Calendar, Users, DollarSign, Settings, Bell, Moon, Sun
} from 'lucide-react';

export default function DesignSystemPage() {
    const [darkMode, setDarkMode] = useState(false);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
    };

    const colors = [
        { name: 'Background', var: '--background', class: 'bg-background' },
        { name: 'Foreground', var: '--foreground', class: 'bg-foreground' },
        { name: 'Primary', var: '--primary', class: 'bg-primary' },
        { name: 'Primary FG', var: '--primary-foreground', class: 'bg-[var(--primary-foreground)]' },
        { name: 'Secondary', var: '--secondary', class: 'bg-secondary' },
        { name: 'Muted', var: '--muted', class: 'bg-muted' },
        { name: 'Muted FG', var: '--muted-foreground', class: 'bg-[var(--muted-foreground)]' },
        { name: 'Accent', var: '--accent', class: 'bg-accent' },
        { name: 'Destructive', var: '--destructive', class: 'bg-destructive' },
        { name: 'Border', var: '--border', class: 'bg-border' },
        { name: 'Ring', var: '--ring', class: 'bg-ring' },
        { name: 'Card', var: '--card', class: 'bg-card' },
        { name: 'Popover', var: '--popover', class: 'bg-popover' },
    ];

    const chartColors = [
        { name: 'Chart 1', var: '--chart-1' },
        { name: 'Chart 2', var: '--chart-2' },
        { name: 'Chart 3', var: '--chart-3' },
        { name: 'Chart 4', var: '--chart-4' },
        { name: 'Chart 5', var: '--chart-5' },
    ];

    const sidebarColors = [
        { name: 'Sidebar', var: '--sidebar' },
        { name: 'Sidebar FG', var: '--sidebar-foreground' },
        { name: 'Sidebar Primary', var: '--sidebar-primary' },
        { name: 'Sidebar Accent', var: '--sidebar-accent' },
        { name: 'Sidebar Border', var: '--sidebar-border' },
    ];

    return (
        <main className="min-h-screen bg-background text-foreground transition-colors">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center border-b pb-6">
                        <div>
                            <h1 className="text-4xl font-bold">CALYX Design System</h1>
                            <p className="text-muted-foreground mt-2">
                                Guia visual de componentes, cores e tipografia
                            </p>
                        </div>
                        <Button onClick={toggleTheme} variant="outline" size="lg">
                            {darkMode ? <Sun className="w-5 h-5 mr-2" /> : <Moon className="w-5 h-5 mr-2" />}
                            {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </Button>
                    </div>

                    {/* Colors - Main Palette */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">🎨 Cores Principais</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {colors.map((color) => (
                                <div key={color.name} className="space-y-2">
                                    <div
                                        className={`h-20 rounded-lg border ${color.class}`}
                                        style={{ backgroundColor: `var(${color.var})` }}
                                    />
                                    <div>
                                        <p className="font-medium text-sm">{color.name}</p>
                                        <code className="text-xs text-muted-foreground">{color.var}</code>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Chart Colors */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">📊 Cores de Gráficos</h2>
                        <div className="flex gap-4">
                            {chartColors.map((color) => (
                                <div key={color.name} className="flex-1 space-y-2">
                                    <div
                                        className="h-16 rounded-lg"
                                        style={{ backgroundColor: `var(${color.var})` }}
                                    />
                                    <div className="text-center">
                                        <p className="font-medium text-sm">{color.name}</p>
                                        <code className="text-xs text-muted-foreground">{color.var}</code>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Sidebar Colors */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">📱 Cores de Sidebar</h2>
                        <div className="grid grid-cols-5 gap-4">
                            {sidebarColors.map((color) => (
                                <div key={color.name} className="space-y-2">
                                    <div
                                        className="h-16 rounded-lg border"
                                        style={{ backgroundColor: `var(${color.var})` }}
                                    />
                                    <div className="text-center">
                                        <code className="text-xs text-muted-foreground">{color.name}</code>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Typography */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">✍️ Tipografia</h2>
                        <div className="space-y-4 p-6 bg-card rounded-xl border">
                            <h1 className="text-4xl font-bold">Heading 1 - 4xl Bold</h1>
                            <h2 className="text-3xl font-bold">Heading 2 - 3xl Bold</h2>
                            <h3 className="text-2xl font-semibold">Heading 3 - 2xl Semibold</h3>
                            <h4 className="text-xl font-semibold">Heading 4 - xl Semibold</h4>
                            <h5 className="text-lg font-medium">Heading 5 - lg Medium</h5>
                            <p className="text-base">Paragraph - Base (16px)</p>
                            <p className="text-sm text-muted-foreground">Small text - Muted foreground</p>
                            <p className="text-xs text-muted-foreground">Extra small - Caption</p>
                        </div>
                    </section>

                    {/* Buttons */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">🔘 Botões</h2>
                        <div className="space-y-6 p-6 bg-card rounded-xl border">
                            <div>
                                <p className="text-sm font-medium mb-3">Variants</p>
                                <div className="flex flex-wrap gap-3">
                                    <Button>Default</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="destructive">Destructive</Button>
                                    <Button variant="outline">Outline</Button>
                                    <Button variant="ghost">Ghost</Button>
                                    <Button variant="link">Link</Button>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-3">Sizes</p>
                                <div className="flex items-center gap-3">
                                    <Button size="sm">Small</Button>
                                    <Button size="default">Default</Button>
                                    <Button size="lg">Large</Button>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-3">Com Ícones</p>
                                <div className="flex flex-wrap gap-3">
                                    <Button><Plus className="w-4 h-4 mr-2" /> Adicionar</Button>
                                    <Button variant="outline"><Edit className="w-4 h-4 mr-2" /> Editar</Button>
                                    <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" /> Excluir</Button>
                                    <Button variant="secondary"><Search className="w-4 h-4 mr-2" /> Buscar</Button>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-3">Estados</p>
                                <div className="flex gap-3">
                                    <Button disabled>Disabled</Button>
                                    <Button className="opacity-50 cursor-wait">Loading...</Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Form Inputs */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">📝 Inputs & Forms</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-card rounded-xl border">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="text">Text Input</Label>
                                    <Input id="text" placeholder="Digite algo..." />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="email@exemplo.com" />
                                </div>

                                <div>
                                    <Label htmlFor="password">Senha</Label>
                                    <Input id="password" type="password" placeholder="••••••••" />
                                </div>

                                <div>
                                    <Label htmlFor="disabled">Disabled</Label>
                                    <Input id="disabled" disabled placeholder="Campo desabilitado" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="select">Select</Label>
                                    <select
                                        id="select"
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    >
                                        <option>Opção 1</option>
                                        <option>Opção 2</option>
                                        <option>Opção 3</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="textarea">Textarea</Label>
                                    <textarea
                                        id="textarea"
                                        className="w-full h-24 px-3 py-2 rounded-md border border-input bg-background resize-none"
                                        placeholder="Digite um texto longo..."
                                    />
                                </div>

                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" className="w-4 h-4" />
                                        Checkbox
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="radio" name="radio" className="w-4 h-4" />
                                        Radio 1
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="radio" name="radio" className="w-4 h-4" />
                                        Radio 2
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cards */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">📦 Cards</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-card border rounded-xl p-6">
                                <h3 className="font-semibold text-lg mb-2">Card Simples</h3>
                                <p className="text-muted-foreground text-sm">
                                    Um card básico com borda e fundo card.
                                </p>
                            </div>

                            <div className="bg-card border rounded-xl p-6 shadow-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Users className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="font-semibold">Com Ícone</h3>
                                </div>
                                <p className="text-3xl font-bold">1,234</p>
                                <p className="text-muted-foreground text-sm">Pacientes ativos</p>
                            </div>

                            <div className="bg-gradient-to-br from-[var(--chart-2)] to-[var(--chart-4)] text-white rounded-xl p-6">
                                <h3 className="font-semibold text-lg mb-2">Card Gradiente</h3>
                                <p className="text-white/80 text-sm">
                                    Usando cores de chart para gradiente.
                                </p>
                                <Button className="mt-4 bg-white text-[var(--chart-3)]">Ação</Button>
                            </div>
                        </div>
                    </section>

                    {/* Alerts / Badges */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">🏷️ Badges & Alerts</h2>
                        <div className="space-y-4 p-6 bg-card rounded-xl border">
                            <div className="flex flex-wrap gap-3">
                                <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                                    Primary
                                </span>
                                <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                                    Secondary
                                </span>
                                <span className="px-3 py-1 bg-destructive text-destructive-foreground rounded-full text-sm font-medium">
                                    Destructive
                                </span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    Success
                                </span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                    Warning
                                </span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    Info
                                </span>
                            </div>

                            <div className="space-y-3 mt-6">
                                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                                    <Check className="w-5 h-5" />
                                    <span>Sucesso! Operação realizada com sucesso.</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                    <X className="w-5 h-5" />
                                    <span>Erro! Algo deu errado.</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>Atenção! Revise antes de continuar.</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                                    <Info className="w-5 h-5" />
                                    <span>Informação importante.</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Icons */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">🎯 Ícones (Lucide)</h2>
                        <div className="grid grid-cols-6 md:grid-cols-12 gap-4 p-6 bg-card rounded-xl border">
                            {[Plus, Edit, Trash2, Search, Calendar, Users, DollarSign, Settings, Bell, Check, X, AlertCircle].map((Icon, i) => (
                                <div key={i} className="p-4 border rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                                    <Icon className="w-6 h-6" />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Usando <code>lucide-react</code> para ícones consistentes.
                        </p>
                    </section>

                    {/* Modal Example */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">💬 Modals/Dialogs</h2>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>Abrir Modal</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Título do Modal</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <p className="text-muted-foreground">
                                        Este é um exemplo de modal/dialog usando Radix UI.
                                    </p>
                                    <div className="mt-4">
                                        <Label>Nome</Label>
                                        <Input placeholder="Digite seu nome..." />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline">Cancelar</Button>
                                    <Button>Confirmar</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </section>

                    {/* Spacing & Radius */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">📐 Spacing & Radius</h2>
                        <div className="p-6 bg-card rounded-xl border space-y-4">
                            <div>
                                <p className="text-sm font-medium mb-3">Border Radius</p>
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 bg-primary rounded-sm flex items-center justify-center text-primary-foreground text-xs">sm</div>
                                    <div className="w-20 h-20 bg-primary rounded-md flex items-center justify-center text-primary-foreground text-xs">md</div>
                                    <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xs">lg</div>
                                    <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-xs">xl</div>
                                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs">full</div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-3">Shadows</p>
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 bg-card border rounded-lg shadow-sm flex items-center justify-center text-xs">sm</div>
                                    <div className="w-20 h-20 bg-card border rounded-lg shadow flex items-center justify-center text-xs">default</div>
                                    <div className="w-20 h-20 bg-card border rounded-lg shadow-md flex items-center justify-center text-xs">md</div>
                                    <div className="w-20 h-20 bg-card border rounded-lg shadow-lg flex items-center justify-center text-xs">lg</div>
                                    <div className="w-20 h-20 bg-card border rounded-lg shadow-xl flex items-center justify-center text-xs">xl</div>
                                </div>
                            </div>
                        </div>
                    </section>

                </motion.div>
            </div>
        </main>
    );
}
