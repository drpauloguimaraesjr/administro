
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '@/services/leads-service';
import { Lead, LeadStage } from '@/types/crm';

export function useLeads() {
    const queryClient = useQueryClient();

    // Query: Buscar todos os leads
    const {
        data: leads = [],
        isLoading,
        error
    } = useQuery<Lead[]>({
        queryKey: ['leads'],
        queryFn: leadsService.getAll,
        // Refetch a cada 1 minuto ou quando focar na janela
        staleTime: 1000 * 60,
    });

    // Mutation: Criar Lead
    const createLeadMutation = useMutation({
        mutationFn: leadsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });

    // Mutation: Mover Lead (Drag & Drop)
    // Implementamos Optimistic Updates para a UI não travar
    const moveLeadMutation = useMutation({
        mutationFn: ({ id, stage }: { id: string; stage: LeadStage }) =>
            leadsService.updateStage(id, stage),
        onMutate: async ({ id, stage }) => {
            // Cancela refetches pendentes
            await queryClient.cancelQueries({ queryKey: ['leads'] });

            // Snapshot do valor anterior
            const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);

            // Atualiza otimisticamente
            if (previousLeads) {
                queryClient.setQueryData<Lead[]>(['leads'], (old) =>
                    old?.map(lead => lead.id === id ? { ...lead, stage } : lead) || []
                );
            }

            return { previousLeads };
        },
        onError: (err, newTodo, context) => {
            // Reverte se der erro
            if (context?.previousLeads) {
                queryClient.setQueryData(['leads'], context.previousLeads);
            }
        },
        onSettled: () => {
            // Revalida após terminar (sucesso ou erro) para garantir consistência
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });

    return {
        leads,
        isLoading,
        error,
        createLead: createLeadMutation.mutateAsync,
        moveLead: moveLeadMutation.mutate,
        isMoving: moveLeadMutation.isLoading
    };
}
