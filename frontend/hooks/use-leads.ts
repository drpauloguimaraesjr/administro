
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '@/services/leads-service';
import { Lead, LeadStage } from '@/types/crm';

// MOCK DATA FOR PRESENTATION
const mockLeads: Lead[] = [
    { id: '1', name: 'Juliana Paz', source: 'Instagram', stage: 'lead_frio', probableValue: 1500, createdAt: new Date().toISOString(), tags: ['Botox'] },
    { id: '2', name: 'Marcos Viana', source: 'Google', stage: 'lead_frio', probableValue: 2500, createdAt: new Date().toISOString(), tags: ['Harmonização'] },
    { id: '3', name: 'Ana Paula', source: 'Indicação', stage: 'marcacao_consulta', probableValue: 500, createdAt: new Date().toISOString(), tags: ['Consulta'] },
    { id: '4', name: 'Carlos Preenchimento', source: 'WhatsApp', stage: 'marcacao_consulta', probableValue: 3500, createdAt: new Date().toISOString(), tags: ['Preenchimento'] },
    { id: '5', name: 'Mariana Lipo', source: 'Instagram', stage: 'confirmacao_consulta', probableValue: 15000, createdAt: new Date().toISOString(), tags: ['Cirurgia'] },
    { id: '6', name: 'Roberto Rino', source: 'Google', stage: 'confirmacao_procedimento', probableValue: 12000, createdAt: new Date().toISOString(), tags: ['Cirurgia'] },
    { id: '7', name: 'Fernanda Dúvida', source: 'Site', stage: 'duvidas_intercorrencias', probableValue: 0, createdAt: new Date().toISOString(), tags: ['Dúvida'] },
    { id: '8', name: 'Dr. Paulo VIP', source: 'Indicação', stage: 'dr_paulo', probableValue: 50000, createdAt: new Date().toISOString(), tags: ['VIP'] },
];

export function useLeads() {
    const queryClient = useQueryClient();

    // Query: Buscar todos os leads
    const {
        data: apiLeads = [],
        isLoading: isApiLoading,
        error
    } = useQuery<Lead[]>({
        queryKey: ['leads'],
        queryFn: async () => {
            try {
                return await leadsService.getAll();
            } catch (error) {
                console.warn('API Error, using mock data', error);
                return [];
            }
        },
        // Refetch a cada 1 minuto
        staleTime: 1000 * 60,
    });

    // Use Mock Data if API is empty (Presentation Mode)
    const leads = apiLeads.length > 0 ? apiLeads : mockLeads;
    const isLoading = isApiLoading && apiLeads.length === 0 && mockLeads.length === 0;

    // Mutation: Criar Lead
    const createLeadMutation = useMutation({
        mutationFn: leadsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });

    // Mutation: Mover Lead (Drag & Drop)
    const moveLeadMutation = useMutation({
        mutationFn: ({ id, stage }: { id: string; stage: LeadStage }) =>
            leadsService.updateStage(id, stage),
        onMutate: async ({ id, stage }) => {
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
            if (context?.previousLeads) {
                queryClient.setQueryData(['leads'], context.previousLeads);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });

    // Mutation: Atribuir Lead
    const assignLeadMutation = useMutation({
        mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string | null }) =>
            leadsService.assignTo(id, assignedTo),
        onMutate: async ({ id, assignedTo }) => {
            await queryClient.cancelQueries({ queryKey: ['leads'] });

            const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);

            if (previousLeads) {
                queryClient.setQueryData<Lead[]>(['leads'], (old) =>
                    old?.map(lead => lead.id === id ? {
                        ...lead,
                        assignedTo: assignedTo || undefined,
                        assignedAt: assignedTo ? new Date().toISOString() : undefined
                    } : lead) || []
                );
            }

            return { previousLeads };
        },
        onError: (err, variables, context) => {
            if (context?.previousLeads) {
                queryClient.setQueryData(['leads'], context.previousLeads);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });

    return {
        leads,
        isLoading,
        error,
        createLead: createLeadMutation.mutateAsync,
        moveLead: moveLeadMutation.mutate,
        assignLead: assignLeadMutation.mutate,
        isMoving: moveLeadMutation.isPending,
        isAssigning: assignLeadMutation.isPending,
    };
}
