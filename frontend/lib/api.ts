// lib/api.ts
import axios from 'axios';

let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Garante que a URL tenha protocolo (https por padrão em produção)
if (process.env.NODE_ENV === 'production' && !baseURL.startsWith('http')) {
    baseURL = `https://${baseURL}`;
}

const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor para debugging
// Interceptor de Requisição (Request)
api.interceptors.request.use(request => {
    console.log(`🚀 [API Request] ${request.method?.toUpperCase()} ${request.url}`, {
        baseURL: request.baseURL,
        headers: request.headers,
        params: request.params,
        data: request.data
    });
    return request;
});

// Interceptor de Resposta (Response)
api.interceptors.response.use(
    response => {
        console.log(`✅ [API Response] ${response.status} ${response.config.url}`, response.data);
        return response;
    },
    error => {
        console.error('❌ [API Error Details]:', {
            message: error.message,
            code: error.code,
            url: error.config?.url,
            baseURL: error.config?.baseURL, // Verificar se está undefined ou correto
            fullUrl: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            responseData: error.response?.data, // Dados do erro vindos do backend
        });
        return Promise.reject(error);
    }
);

// Appointments
export const fetchAppointments = async () => {
    const response = await api.get('/appointments');
    return response.data;
};

export const createAppointment = async (appointment: any) => {
    const response = await api.post('/appointments', appointment);
    return response.data;
};

export const updateAppointment = async (id: string, data: any) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
};

export const deleteAppointment = async (id: string) => {
    await api.delete(`/appointments/${id}`);
};

export const fetchAvailableSlots = async (date: string) => {
    const response = await api.get('/appointments/available-slots', { params: { date } });
    return response.data;
};


export const sendReminder = async (id: string) => {
    const response = await api.post(`/appointments/${id}/send-reminder`);
    return response.data;
};

// Users
export const fetchUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const fetchUser = async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

export const createUser = async (user: any) => {
    const response = await api.post('/users', user);
    return response.data;
};

export const updateUser = async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id: string) => {
    await api.delete(`/users/${id}`);
};

// Intercurrences (Sentinel)
export const fetchIntercurrences = async () => {
    const response = await api.get('/intercurrences');
    return response.data;
};

export const createIntercurrence = async (data: any) => {
    const response = await api.post('/intercurrences', data);
    return response.data;
};

export const updateIntercurrenceStatus = async (id: string, status: string, aiAnalysis?: any) => {
    const response = await api.put(`/intercurrences/${id}`, { status, aiAnalysis });
    return response.data;
};

// Knowledge Base
export const generateKnowledge = async (rawText: string) => {
    const response = await api.post('/knowledge/generate', { rawText });
    return response.data;
};

export const saveKnowledge = async (data: any) => {
    const response = await api.post('/knowledge', data);
    return response.data;
};

export const fetchKnowledge = async () => {
    const response = await api.get('/knowledge');
    return response.data;
};

// Knowledge Library (saved items with search/filter)
export const fetchKnowledgeLibrary = async (params?: { search?: string; category?: string; limit?: number }) => {
    const response = await api.get('/knowledge/library', { params });
    return response.data;
};

export const deleteKnowledgeItem = async (id: string) => {
    await api.delete(`/knowledge/${id}`);
};

// Knowledge Drafts
export const saveKnowledgeDraft = async (content: string, title?: string) => {
    const response = await api.post('/knowledge/drafts', { content, title });
    return response.data;
};

export const fetchKnowledgeDrafts = async () => {
    const response = await api.get('/knowledge/drafts');
    return response.data;
};

export const deleteKnowledgeDraft = async (id: string) => {
    await api.delete(`/knowledge/drafts/${id}`);
};

// Documents (Receitas, Atestados, Prontuários)
export interface MedicamentoData {
    nome: string;
    posologia: string;
}

export interface ReceitaData {
    medico_nome: string;
    medico_crm: string;
    medico_especialidade: string;
    clinica_nome: string;
    clinica_endereco: string;
    clinica_telefone: string;
    paciente_nome: string;
    paciente_cpf?: string;
    medicamentos: MedicamentoData[];
    data: string;
    cidade: string;
}

export interface AtestadoData {
    medico_nome: string;
    medico_crm: string;
    medico_especialidade: string;
    clinica_nome: string;
    clinica_endereco: string;
    clinica_telefone: string;
    paciente_nome: string;
    paciente_cpf?: string;
    cid?: string;
    dias_afastamento: number;
    data_inicio?: string;
    motivo?: string;
    data: string;
    cidade: string;
}

export interface EvolucaoData {
    medico_nome: string;
    medico_crm: string;
    medico_especialidade: string;
    clinica_nome: string;
    clinica_endereco: string;
    clinica_telefone: string;
    paciente_nome: string;
    paciente_cpf: string;
    paciente_nascimento?: string;
    paciente_idade?: string;
    data_atendimento: string;
    hora_atendimento: string;
    tipo_atendimento?: string;
    queixa_principal?: string;
    historia_doenca_atual?: string;
    antecedentes?: string;
    exame_fisico?: string;
    hipotese_diagnostica?: string;
    conduta?: string;
    retorno?: string;
    observacoes?: string;
}

export type DocumentType = 'receita' | 'atestado' | 'evolucao';

export const createDocument = async (type: DocumentType, data: ReceitaData | AtestadoData | EvolucaoData, addToQueue = true) => {
    const response = await api.post('/documents', { type, data, addToQueue });
    return response.data;
};

export const getDocument = async (id: string) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
};

export const getDocuments = async (params?: { status?: string; type?: DocumentType; patientName?: string }) => {
    const response = await api.get('/documents', { params });
    return response.data;
};

export const deleteDocument = async (id: string) => {
    await api.delete(`/documents/${id}`);
};

export const getSignatureQueue = async () => {
    const response = await api.get('/documents/queue/pending');
    return response.data;
};

export const signDocumentsBatch = async (documentIds: string[], birdIdCode: string) => {
    const response = await api.post('/documents/queue/sign-batch', { documentIds, birdIdCode });
    return response.data;
};

export const removeFromSignatureQueue = async (id: string) => {
    await api.delete(`/documents/queue/${id}`);
};

export const sendDocument = async (id: string, via: 'whatsapp' | 'email', recipient: string) => {
    const response = await api.post(`/documents/${id}/send`, { via, recipient });
    return response.data;
};

export const downloadDocument = async (id: string) => {
    const response = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
    return response.data;
};

export default api;
