
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '@/services/leads-service';
import { Lead, LeadStage } from '@/types/crm';

const now = new Date().toISOString();

// MOCK DATA FOR PRESENTATION (all required fields filled)
const mockLeads: Lead[] = [
    { id: '1', name: 'Juliana Paz', phone: '11999001001', source: 'instagram', stage: 'lead_frio', stageUpdatedAt: now, stageHistory: [], createdAt: now, updatedAt: now, createdBy: 'system', tags: ['Botox'], estimatedValue: 1500 },
    { id: '2', name: 'Marcos Viana', phone: '11999002002', source: 'google', stage: 'lead_frio', stageUpdatedAt: now, stageHistory: [], createdAt: now, updatedAt: now, createdBy: 'system', tags: ['Harmonização'], estimatedValue: 2500 },
    { id: '3', name: 'Ana Paula', phone: '11999003003', source: 'indication', stage: 'marcacao_consulta', stageUpdatedAt: now, stageHistory: [], createdAt: now, updatedAt: now, createdBy: 'system', tags: ['Consulta'], estimatedValue: 500 },
    { id: '4', name: 'Carlos Eduardo', phone: '11999004004', source: 'whatsapp', stage: 'marcacao_consulta', stageUpdatedAt: now, stageHistory: [], createdAt: now, updatedAt: now, createdBy: 'system', tags: ['Preenchimento'], estimatedValue: 3500 },
    { id: '5', name: 'Mariana Costa', phone: '11999005005', source: 'instagram', stage: 'confirmacao_consulta', stageUpdatedAt: now, stageHistory: [], createdAt: now, updatedAt: now, createdBy: 'system', tags: ['Cirurgia'], estimatedValue: 15000 },
    { id: '6', name: 'Roberto Almeida', phone: '11999006006', source: 'google', stage: 'confirmacao_procedimento', stageUpdatedAt: now, stageHistory: [], createdAt: now, updatedAt: now, createdBy: 'system', tags: ['Cirurgia'], estimatedValue: 12000 },
    { id: '7', name: 'Fernanda Lima', phone: '11999007007', source: 'website', stage: 'duvidas_intercorrencias', stageUpdatedAt: now, stageHistory: [], createdAt: now, updatedAt: now, createdBy: 'system', tags: ['Dúvida'], estimatedValue: 0 },
    { id: '8', name: 'Dr. Paulo VIP', phone: '11999008008', source: 'indication', stage: 'dr_paulo', stageUpdatedAt: now, stageHistory: [], createdAt: now, updatedAt: now, createdBy: 'system', tags: ['VIP'], estimatedValue: 50000 },
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

    // Mutation: Mover Lead (Drag & Drop) com Optimistic Updates
    const moveLeadMutation = useMutation({
        mutationFn: ({ id, stage }: { id: string; stage: LeadStage }) =>
            leadsService.updateStage(id, stage),
        onMutate: async ({ id, stage }) => {
            await queryClient.cancelQueries({ queryKey: ['leads'] });
            const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);
            if (previousLeads) {
                queryClient.setQueryData<Lead[]>(['leads'], (old) =>
                    old?.map(lead => lead.id === id ? { ...lead, stage } : lead) || []
                );
            }
            return { previousLeads };
        },
        onError: (_err, _vars, context) => {
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
        onError: (_err, _vars, context) => {
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
