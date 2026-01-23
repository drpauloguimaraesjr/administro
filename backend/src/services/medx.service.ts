import axios from 'axios';
import { db } from '../config/firebaseAdmin.js';

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
        console.log(`🔧 MedX Service Initialized. API URL: ${apiUrl}, Token Present: ${!!token}`);
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
            console.log('🔑 Requesting MedX Auth Token...');
            const response = await axios.get(`${this.config.apiUrl}/api/integration/GetAuthorizedToken`, {
                params: { token: this.config.token }
            });

            // A documentação diz que retorna uma string direta com o token 200 OK
            this.bearerToken = response.data;
            this.tokenExpiration = new Date(Date.now() + 175 * 60000); // Validade de 180 min, renovamos em 175

            console.log('✅ MedX: Token obtained successfully:', this.bearerToken ? 'Token received' : 'No token in body');
            return this.bearerToken || '';
        } catch (error: any) {
            console.error('❌ MedX Auth Failed:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw new Error(`Falha na autenticação com MedX: ${error.message}`);
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

    /*
   * Sincroniza pacientes do MedX para o nosso banco de dados
   */
    async syncPatientsToLocal() {
        console.log('🔄 Iniciando sincronização de pacientes MedX...');

        try {
            console.log('📡 Fetching patients from MedX API...');
            const medxPatients = await this.getPatients();
            console.log(`📦 Patients fetched: ${medxPatients?.length || 0}`);

            if (!medxPatients || !Array.isArray(medxPatients)) {
                console.warn('⚠️ Invalid response from MedX (not an array or empty).');
                return { imported: 0, total: 0, skipped: 0 };
            }

            // Importando a instância configurada do Firestore (com fallback)
            // Importação estática usada no topo do arquivo

            let batch = db.batch(); // Alterado para let para permitir reatribuição
            const batchSize = 400; // Firestore limit is 500 operations per batch
            let batchCount = 0;
            let importedCount = 0;
            let skippedCount = 0;

            const patientsRef = db.collection('patients');

            for (const p of medxPatients) {
                const cpf = p.CPF || p.CPF_CGC || '';
                const name = p.Nome || p.Name;

                if (!name) continue; // Pula sem nome

                let existingQuery;

                // Verifica duplicidade (Atenção: Query dentro de loop é lento, ideal seria cachear CPFs existentes se a base for muito grande)
                if (cpf) {
                    existingQuery = await patientsRef.where('cpf', '==', cpf).limit(1).get();
                } else {
                    existingQuery = await patientsRef.where('name', '==', name).limit(1).get();
                }

                if (!existingQuery.empty) {
                    skippedCount++;
                    continue; // Já existe
                }

                // Prepara objeto do paciente local
                const newPatientRef = patientsRef.doc();
                const newPatientData = {
                    name: name,
                    cpf: cpf.replace(/\D/g, ''), // Limpa CPF
                    birthDate: p.Nascimento || p.BirthDate || '',
                    gender: p.Sexo === 'M' ? 'M' : p.Sexo === 'F' ? 'F' : 'Outro',
                    phone: p.Celular || p.Telefone_Residencial || '',
                    email: p.Email || '',
                    address: p.Endereco_Residencial || '',
                    neighborhood: p.Bairro_Residencial || '',
                    zipCode: p.Cep_Residencial || '',
                    city: p.Cidade_Residencial || '',
                    source: 'MedX Integration',
                    medxId: p.Id || p.Id_do_Usuario || '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                batch.set(newPatientRef, newPatientData);
                batchCount++;
                importedCount++;

                if (batchCount >= batchSize) {
                    console.log(`💾 Comitando batch intermediário de ${batchCount} pacientes...`);
                    await batch.commit();
                    batch = db.batch(); // Inicia novo batch
                    batchCount = 0;
                }
            }

            // Comita o restante
            if (batchCount > 0) {
                await batch.commit();
            }

            console.log(`✅ Sincronização MedX concluída. Importados: ${importedCount}. Pulados: ${skippedCount}.`);
            return { imported: importedCount, total: medxPatients.length, skipped: skippedCount };

        } catch (error: any) {
            console.error('❌ Erro CRÍTICO na sincronização de pacientes:', error);
            // Retorna erro estruturado em vez de falhar a request
            throw new Error(`Falha na sincronização: ${error.message}`);
        }
    }
}

// Singleton para uso na aplicação
// O token deve vir das variáveis de ambiente
export const medxService = new MedXService(
    process.env.MEDX_API_URL || 'https://v65.medx.med.br',
    process.env.MEDX_INTEGRATION_TOKEN || ''
);
