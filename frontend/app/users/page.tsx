'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Shield, Stethoscope, Search, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { fetchUsers, createUser, updateUser, deleteUser as apiDeleteUser } from '@/lib/api'; // Adjust path if needed
import { User, UserRole } from '@/shared/types';
import { useAuth } from '@/components/auth/auth-provider'; // Assuming this exists

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'receptionist' as UserRole,
        specialty: '',
        phone: ''
    });

    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role as UserRole,
                specialty: user.specialty || '',
                phone: user.phone || ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                role: 'receptionist',
                specialty: '',
                phone: ''
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await updateUser(editingUser.id, formData);
            } else {
                await createUser({ ...formData, isActive: true, permissions: [] });
            }
            setIsDialogOpen(false);
            loadUsers();
        } catch (error) {
            console.error('Error saving user', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja remover este membro da equipe?')) {
            await apiDeleteUser(id);
            loadUsers();
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'master': return <span className="bg-primary/15 text-primary px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><Shield className="w-3 h-3" /> Master</span>;
            case 'doctor': return <span className="bg-primary/15 text-primary px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><Stethoscope className="w-3 h-3" /> Médico</span>;
            case 'nurse': return <span className="bg-primary/15 text-primary px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><UserPlus className="w-3 h-3" /> Enfermagem</span>;
            default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><Users className="w-3 h-3" /> Equipe</span>;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
                        Gestão de Equipe
                    </h1>
                    <p className="text-muted-foreground">Gerencie quem tem acesso ao sistema Calyx.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-white  hover: transition-all">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Novo Membro
                </Button>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-none shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <Search className="w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Buscar por nome, email ou cargo..."
                            className="border-0 bg-transparent focus-visible:ring-0 text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-primary/10/50">
                    <CardContent className="p-4 flex flex-col justify-center items-center text-center">
                        <span className="text-sm text-primary font-medium">Total de Membros</span>
                        <span className="text-4xl font-bold text-primary">{users.length}</span>
                    </CardContent>
                </Card>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredUsers.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="group hover: transition-all duration-300 border-none bg-white shadow-sm overflow-hidden relative">
                                <div className={`absolute top-0 left-0 w-1 h-full ${user.isActive ? 'bg-primary/100' : 'bg-gray-300'}`} />
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{user.name}</CardTitle>
                                        <CardDescription className="text-sm truncate">{user.email}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-4">
                                        {getRoleBadge(user.role)}
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            {user.isActive ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-gray-400" />}
                                            {user.isActive ? 'Ativo' : 'Inativo'}
                                        </div>
                                    </div>

                                    {user.specialty && (
                                        <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                                            🩺 {user.specialty}
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDialog(user)}>
                                            <Edit2 className="w-3 h-3 mr-2" /> Editar
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-red-700" onClick={() => handleDelete(user.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredUsers.length === 0 && !isLoading && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Nenhum membro encontrado.</p>
                    </div>
                )}
            </div>

            {/* Dialog Form */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Editar Membro' : 'Adicionar Novo Membro'}</DialogTitle>
                        <DialogDescription>
                            Crie um acesso para sua equipe. Eles receberão as permissões baseadas no cargo.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Nome Completo</label>
                            <Input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Dra. Ana Silva"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Email de Acesso</label>
                            <Input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="ana@calyx.com"
                                disabled={!!editingUser} // Prevent email change logic for simplicity for now
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Cargo (Role)</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                >
                                    <option value="receptionist">Recepcionista</option>
                                    <option value="nurse">Enfermeira</option>
                                    <option value="doctor">Médico(a)</option>
                                    <option value="master">Administrador</option>
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Telefone (WhatsApp)</label>
                                <Input
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                        </div>

                        {formData.role === 'doctor' && (
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Especialidade / CRM</label>
                                <Input
                                    value={formData.specialty}
                                    onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                                    placeholder="Ex: Dermatologista - CRM 12345"
                                />
                            </div>
                        )}

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">
                                {editingUser ? 'Salvar Alterações' : 'Criar Acesso'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
