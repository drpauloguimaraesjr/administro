import axios from 'axios';

interface MedXConfig {
    apiUrl: string;
    token: string; // Token de integração (fixo, obtido nas configurações)
}

interface MedXAuthResponse {
    token: string; // Token Bearer com validade de 180 min
}

export class MedXService {
    private config: MedXConfig;
    private bearerToken: string | null = null;
    private tokenExpiration: Date | null = null;

    constructor(apiUrl: string = 'https://v65.medx.med.br', token: string) {
        this.config = { apiUrl, token };
    }

    /**
     * Obtém ou renova o token de autenticação (Passo 1 da documentação)
     */
    private async getAuthToken(): Promise<string> {
        // Se temos um token válido (com margem de 5 min), retorna ele
        if (this.bearerToken && this.tokenExpiration && this.tokenExpiration > new Date(Date.now() + 5 * 60000)) {
            return this.bearerToken;
        }

        try {
            const response = await axios.get(`${this.config.apiUrl}/api/integration/GetAuthorizedToken`, {
                params: { token: this.config.token }
            });

            // A documentação diz que retorna uma string direta com o token 200 OK
            this.bearerToken = response.data;
            this.tokenExpiration = new Date(Date.now() + 175 * 60000); // Validade de 180 min, renovamos em 175

            console.log('✅ MedX: Token de autenticação renovado com sucesso.');
            return this.bearerToken || '';
        } catch (error) {
            console.error('❌ MedX: Falha ao obter token de autenticação.', error);
            throw new Error('Falha na autenticação com MedX');
        }
    }

    /**
     * Cria uma instância do Axios com o header Authorization configurado
     */
    private async getClient() {
        const token = await this.getAuthToken();
        return axios.create({
            baseURL: this.config.apiUrl,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Busca a lista de pacientes (GetPacientes)
     */
    async getPatients() {
        const client = await this.getClient();
        try {
            const response = await client.get('/api/integration/GetPacientes');
            return response.data;
        } catch (error) {
            console.error('❌ MedX: Erro ao buscar pacientes.', error);
            throw error;
        }
    }

    /**
     * Busca agendamentos por período (GetAgenda)
     */
    async getAppointments(startDate: string, endDate: string) {
        const client = await this.getClient();
        try {
            const response = await client.get('/api/integration/GetAgenda', {
                params: { inicio: startDate, fim: endDate }
            });
            return response.data;
        } catch (error) {
            console.error('❌ MedX: Erro ao buscar agenda.', error);
            throw error;
        }
    }

    /**
     * Sincroniza pacientes do MedX para o nosso banco de dados
     * (Esta função será chamada por um cron job ou botão manual)
     */
    async syncPatientsToLocal() {
        console.log('🔄 Iniciando sincronização de pacientes MedX...');
        const medxPatients = await this.getPatients();

        // Aqui virá a lógica de salvar no Firestore/Postgres
        // Importar o service de patients local e fazer o upsert
        console.log(`✅ Recebidos ${medxPatients?.length || 0} pacientes do MedX.`);

        return medxPatients;
    }
}

// Singleton para uso na aplicação
// O token deve vir das variáveis de ambiente
export const medxService = new MedXService(
    process.env.MEDX_API_URL || 'https://v65.medx.med.br',
    process.env.MEDX_INTEGRATION_TOKEN || ''
);
