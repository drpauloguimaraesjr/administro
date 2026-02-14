'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch'; // Assuming we have Switch component, if not will use Checkbox
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersService } from '@/services/users-service';
import { User, UserRole } from '@/types/user-system';
import { Loader2 } from 'lucide-react';

const userSchema = z.object({
    name: z.string().min(2, 'Nome muito curto'),
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
    role: z.enum(['owner', 'doctor', 'nurse', 'nursing_tech', 'receptionist', 'custom']),
    professionalId: z.string().optional(),
    specialty: z.string().optional(),
    customRoleName: z.string().optional(),

    // Permissions (Optional override)
    permissions: z.array(z.object({
        module: z.enum(['patients', 'appointments', 'medical_records', 'prescriptions', 'financial', 'crm', 'whatsapp', 'reports', 'settings', 'users']),
        actions: z.array(z.enum(['view', 'create', 'edit', 'delete', 'export']))
    })).optional(),

    // Agenda
    hasAgenda: z.boolean().default(false),
    workingDays: z.array(z.number()).optional(),

    // WhatsApp
    canAnswerWhatsApp: z.boolean().default(false),
    whatsappQueues: z.array(z.string()).optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface NewUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userToEdit?: User | null;
}

export function NewUserDialog({ open, onOpenChange, userToEdit }: NewUserDialogProps) {
    const queryClient = useQueryClient();
    const { register, control, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            role: 'doctor',
            hasAgenda: false,
            canAnswerWhatsApp: false,
            workingDays: [1, 2, 3, 4, 5],
            whatsappQueues: [],
            permissions: []
        }
    });

    const selectedRole = watch('role');
    const hasAgenda = watch('hasAgenda');
    const canAnswerWhatsApp = watch('canAnswerWhatsApp');

    useEffect(() => {
        if (userToEdit) {
            reset({
                name: userToEdit.name,
                email: userToEdit.email,
                phone: userToEdit.phone,
                role: userToEdit.role as any, // Cast for safety if role mismatch
                professionalId: userToEdit.professionalId,
                specialty: userToEdit.specialty,
                customRoleName: userToEdit.customRoleName,
                hasAgenda: userToEdit.hasAgenda,
                canAnswerWhatsApp: userToEdit.canAnswerWhatsApp,
                // TODO: Map complex objects like workingDays if needed
            });
        } else {
            reset({
                role: 'doctor',
                hasAgenda: false,
                canAnswerWhatsApp: false
            });
        }
    }, [userToEdit, reset]);

    const mutation = useMutation({
        mutationFn: (data: UserFormData) => {
            if (userToEdit) {
                return UsersService.update(userToEdit.id, data);
            } else {
                return UsersService.create(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            onOpenChange(false);
            reset();
        }
    });

    const onSubmit = (data: UserFormData) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{userToEdit ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
                    <DialogDescription>
                        {userToEdit ? 'Atualize as informações do usuário.' : 'Adicione um novo membro à equipe.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="personal">Pessoal</TabsTrigger>
                            <TabsTrigger value="role">Cargo</TabsTrigger>
                            <TabsTrigger value="agenda">Agenda</TabsTrigger>
                            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                            <TabsTrigger value="permissions">Permissões</TabsTrigger>
                        </TabsList>

                        {/* ABA 1: PESSOAL */}
                        <TabsContent value="personal" className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome Completo *</Label>
                                <Input id="name" {...register('name')} placeholder="Ex: Dr. João Silva" />
                                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" type="email" {...register('email')} placeholder="joao@clinica.com" />
                                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                                <Input id="phone" {...register('phone')} placeholder="(11) 99999-9999" />
                            </div>
                        </TabsContent>

                        {/* ABA 2: CARGO */}
                        <TabsContent value="role" className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Cargo / Função *</Label>
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="owner">👑 Proprietário</SelectItem>
                                                <SelectItem value="doctor">👨‍⚕️ Médico</SelectItem>
                                                <SelectItem value="nurse">👩‍⚕️ Enfermeiro(a)</SelectItem>
                                                <SelectItem value="nursing_tech">🩺 Téc. Enfermagem</SelectItem>
                                                <SelectItem value="receptionist">📋 Recepcionista</SelectItem>
                                                <SelectItem value="custom">⚙️ Personalizado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            {(selectedRole === 'doctor' || selectedRole === 'nurse') && (
                                <div className="grid gap-2">
                                    <Label>{selectedRole === 'doctor' ? 'CRM (Conselho Regional de Medicina)' : 'COREN'}</Label>
                                    <Input {...register('professionalId')} placeholder="Ex: 123456/SP" />
                                </div>
                            )}

                            {selectedRole === 'doctor' && (
                                <div className="grid gap-2">
                                    <Label>Especialidade</Label>
                                    <Input {...register('specialty')} placeholder="Ex: Cardiologia" />
                                </div>
                            )}

                            {selectedRole === 'custom' && (
                                <div className="grid gap-2">
                                    <Label>Nome do Cargo</Label>
                                    <Input {...register('customRoleName')} placeholder="Ex: Financeiro" />
                                </div>
                            )}
                        </TabsContent>

                        {/* ABA 3: AGENDA */}
                        <TabsContent value="agenda" className="space-y-4 py-4">
                            <div className="flex items-center space-x-2 border p-4 rounded-lg">
                                <Controller
                                    name="hasAgenda"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="hasAgenda"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <Label htmlFor="hasAgenda" className="font-medium">Este usuário possui agenda própria?</Label>
                            </div>

                            {hasAgenda && (
                                <div className="pl-6 border-l-2 border-border space-y-4">
                                    <p className="text-sm text-muted-foreground">Configurações de horário e dias virão aqui (implementar componente de dias).</p>
                                    {/* TODO: Implementar seletor de dias da semana e horários */}
                                </div>
                            )}
                        </TabsContent>

                        {/* ABA 4: WHATSAPP */}
                        <TabsContent value="whatsapp" className="space-y-4 py-4">
                            <div className="flex items-center space-x-2 border p-4 rounded-lg">
                                <Controller
                                    name="canAnswerWhatsApp"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="canAnswerWhatsApp"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <Label htmlFor="canAnswerWhatsApp" className="font-medium">Pode atender chamados no WhatsApp?</Label>
                            </div>

                            {canAnswerWhatsApp && (
                                <div className="pl-6 border-l-2 border-border space-y-4">
                                    <Label>Filas de Atendimento</Label>
                                    <p className="text-sm text-muted-foreground">As filas serão carregadas aqui.</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* ABA 5: PERMISSÕES */}
                        <TabsContent value="permissions" className="space-y-4 py-4">
                            <div className="rounded-md border">
                                <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 font-medium text-sm border-b">
                                    <div className="col-span-2">Módulo</div>
                                    <div className="text-center">Ver</div>
                                    <div className="text-center">Criar</div>
                                    <div className="text-center">Editar</div>
                                    <div className="text-center">Excluir</div>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {(['patients', 'appointments', 'medical_records', 'prescriptions', 'financial', 'crm', 'whatsapp', 'reports', 'settings', 'users'] as const).map(module => (
                                        <div key={module} className="grid grid-cols-6 gap-4 p-4 border-b last:border-0 items-center hover:bg-gray-50">
                                            <div className="col-span-2 font-medium capitalize text-sm">
                                                {module === 'medical_records' ? 'Prontuário' :
                                                    module === 'users' ? 'Usuários' :
                                                        module === 'settings' ? 'Configurações' :
                                                            module === 'patients' ? 'Pacientes' :
                                                                module === 'appointments' ? 'Agenda' :
                                                                    module === 'financial' ? 'Financeiro' :
                                                                        module === 'prescriptions' ? 'Receituário' :
                                                                            module === 'reports' ? 'Relatórios' : module}
                                            </div>
                                            {(['view', 'create', 'edit', 'delete'] as const).map(action => (
                                                <div key={action} className="flex justify-center">
                                                    <Checkbox
                                                        checked={
                                                            (watch('permissions') || []).find(p => p.module === module)?.actions.includes(action) || false
                                                        }
                                                        onCheckedChange={(checked) => {
                                                            const currentPerms = watch('permissions') || [];
                                                            const modPerm = currentPerms.find(p => p.module === module);
                                                            let newPerms = [...currentPerms];

                                                            if (modPerm) {
                                                                const newActions = checked
                                                                    ? [...modPerm.actions, action]
                                                                    : modPerm.actions.filter(a => a !== action);

                                                                if (newActions.length === 0) {
                                                                    newPerms = newPerms.filter(p => p.module !== module);
                                                                } else {
                                                                    newPerms = newPerms.map(p => p.module === module ? { ...p, actions: newActions } : p);
                                                                }
                                                            } else if (checked) {
                                                                newPerms.push({ module, actions: [action] });
                                                            }
                                                            setValue('permissions', newPerms as any, { shouldDirty: true });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                    </Tabs>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)} type="button">Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {mutation.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {userToEdit ? 'Salvar Alterações' : 'Criar Usuário'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
