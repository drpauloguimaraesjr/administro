'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { useLeads } from '@/hooks/use-leads';

// Schema de validação
const leadSchema = z.object({
    name: z.string().min(2, "Nome é obrigatório"),
    phone: z.string().min(10, "Telefone inválido"),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
    source: z.string().default('whatsapp'),
});

type LeadFormData = z.infer<typeof leadSchema>;

export function NewLeadDialog() {
    const [open, setOpen] = useState(false);
    const { createLead } = useLeads();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LeadFormData>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            source: 'whatsapp'
        }
    });

    const onSubmit = async (data: LeadFormData) => {
        try {
            await createLead({
                ...data,
                stage: 'new',
                score: 50,
                urgency: 'medium'
            });
            setOpen(false);
            reset();
        } catch (error) {
            console.error("Erro ao criar lead:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" /> Novo Lead
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Lead</DialogTitle>
                    <DialogDescription>
                        Adicione um novo potencial cliente ao pipeline.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" {...register('name')} placeholder="Ex: Maria Silva" />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                        <Input id="phone" {...register('phone')} placeholder="Ex: 11999999999" />
                        {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email (Opcional)</Label>
                        <Input id="email" {...register('email')} placeholder="Ex: maria@email.com" />
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Criar Lead'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
