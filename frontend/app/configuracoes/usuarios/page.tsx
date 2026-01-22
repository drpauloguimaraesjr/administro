'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Edit, Trash2, Shield, Calendar, Smartphone, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UsersService } from '@/services/users-service';
import { User, UserRole } from '@/types/user-system';
import { NewUserDialog } from '@/components/users/new-user-dialog';

const ROLE_BADGES: Record<UserRole, { label: string; className: string }> = {
    owner: { label: 'Proprietário', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    doctor: { label: 'Médico', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    nurse: { label: 'Enfermeiro', className: 'bg-green-100 text-green-800 border-green-200' },
    nursing_tech: { label: 'Téc. Enfermagem', className: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    receptionist: { label: 'Recepcionista', className: 'bg-pink-100 text-pink-800 border-pink-200' },
    spouse: { label: 'Cônjuge', className: 'bg-purple-100 text-purple-800 border-purple-200' },
    secretary: { label: 'Secretária', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    custom: { label: 'Personalizado', className: 'bg-slate-100 text-slate-800 border-slate-200' },
};

export default function UsersPage() {
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const queryClient = useQueryClient();

    // Buscar usuários
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: UsersService.getAll
    });

    const deleteMutation = useMutation({
        mutationFn: UsersService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    // Filtro local
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const handleNewUser = () => {
        setSelectedUser(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Usuários e Permissões</h1>
                    <p className="text-slate-500">Gerencie o acesso e funções da equipe.</p>
                </div>
                <Button onClick={handleNewUser} className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-2" /> Novo Usuário
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <p>Carregando...</p>
                ) : filteredUsers.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="bg-slate-100 text-slate-700">
                                    {user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <CardTitle className="text-base truncate">{user.name}</CardTitle>
                                <CardDescription className="truncate">{user.email}</CardDescription>
                            </div>
                            <Badge variant="outline" className={ROLE_BADGES[user.role]?.className || ''}>
                                {user.customRoleName || ROLE_BADGES[user.role]?.label || user.role}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between text-sm text-slate-500">
                                    <div className="flex items-center gap-2" title="Especialidade">
                                        <Shield className="w-4 h-4" />
                                        <span>{user.specialty || '-'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {user.hasAgenda && (
                                            <div title="Possui Agenda">
                                                <Calendar className="w-4 h-4 text-blue-500" />
                                            </div>
                                        )}
                                        {user.canAnswerWhatsApp && (
                                            <div title="Atende WhatsApp">
                                                <Smartphone className="w-4 h-4 text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                                        <Edit className="w-4 h-4 mr-2" /> Editar
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(user.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal de Novo/Editar Usuário */}
            <NewUserDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                userToEdit={selectedUser}
            />
        </div>
    );
}
