import axios from 'axios';
import { db } from '../config/firebaseAdmin.js';
export class MedXService {
    config;
    bearerToken = null;
    tokenExpiration = null;
    constructor(apiUrl = 'https://v65.medx.med.br', token) {
        console.log(`🔧 MedX Service Initialized. API URL: ${apiUrl}, Token Present: ${!!token}`);
        this.config = { apiUrl, token };
    }
    /**
     * Obtém ou renova o token de autenticação (Passo 1 da documentação)
     */
    async getAuthToken() {
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
        }
        catch (error) {
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
    async getClient() {
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
        }
        catch (error) {
            console.error('❌ MedX: Erro ao buscar pacientes.', error);
            throw error;
        }
    }
    /**
     * Busca agendamentos por período (GetAgenda)
     */
    async getAppointments(startDate, endDate) {
        const client = await this.getClient();
        try {
            const response = await client.get('/api/integration/GetAgenda', {
                params: { inicio: startDate, fim: endDate }
            });
            return response.data;
        }
        catch (error) {
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
            let batch = db.batch();
            const batchSize = 400;
            let batchCount = 0;
            let importedCount = 0;
            let skippedCount = 0;
            const patientsRef = db.collection('patients');
            for (const p of medxPatients) {
                const cpf = p.CPF || p.CPF_CGC || '';
                const name = p.Nome || p.Name;
                if (!name)
                    continue; // Pula sem nome
                let existingQuery;
                // Verifica duplicidade
                if (cpf) {
                    existingQuery = await patientsRef.where('cpf', '==', cpf).limit(1).get();
                }
                else {
                    existingQuery = await patientsRef.where('name', '==', name).limit(1).get();
                }
                // Usando 'any' para o objeto p pois a resposta da API pode variar
                const payload = p;
                // Dados a serem salvos (update ou create)
                const patientData = {
                    name: name,
                    socialName: payload.Nome_Social || '',
                    cpf: cpf.replace(/\D/g, ''),
                    rg: payload.RG || payload.Rg || '',
                    birthDate: payload.Nascimento || payload.BirthDate || '',
                    gender: payload.Sexo === 'M' ? 'M' : payload.Sexo === 'F' ? 'F' : 'Outro',
                    // Contato
                    email: payload.Email || payload.Email1 || '',
                    phone: payload.Celular || payload.Telefone_Celular || '',
                    phoneAlternative: payload.Telefone_Residencial || payload.Phone || '',
                    phoneWork: payload.Telefone_Comercial || '',
                    // Endereço
                    address: payload.Endereco_Residencial || payload.Endereco || '',
                    neighborhood: payload.Bairro_Residencial || payload.Bairro || '',
                    zipCode: payload.Cep_Residencial || payload.Cep || '',
                    city: payload.Cidade_Residencial || payload.Cidade || '',
                    state: payload.Estado_Residencial || payload.Estado || payload.UF || '',
                    region: payload.Regiao || '',
                    complement: payload.Complemento_Residencial || payload.Complemento || '',
                    reference: payload.Referencia || '',
                    // Convênio
                    insurance: payload.Convenio || payload.Nome_Convenio || '',
                    insuranceNumber: payload.Matricula || payload.Numero_Carteira || '',
                    cns: payload.Cns || payload.Numero_Cns || payload.Cartao_Nacional_Saude || '',
                    // Complementares
                    profession: payload.Profissao || '',
                    company: payload.Empresa || '',
                    civilStatus: payload.Estado_Civil || '',
                    education: payload.Escolaridade || '',
                    religion: payload.Religiao || '',
                    // Origem
                    referralSource: payload.Conheceu_Por || '',
                    referredBy: payload.Indicado_Por || '',
                    // Familiares
                    fatherName: payload.Nome_Pai || payload.Pai || '',
                    motherName: payload.Nome_Mae || payload.Mae || '',
                    spouseName: payload.Nome_Conjuge || payload.Conjuge || '',
                    childrenCount: payload.Filhos ? parseInt(payload.Filhos) : 0,
                    source: 'MedX Integration',
                    medxId: payload.Id || payload.Id_do_Usuario || '',
                    updatedAt: new Date().toISOString()
                };
                if (!existingQuery.empty) {
                    // Atualiza existente (Merge)
                    const existingDoc = existingQuery.docs[0];
                    batch.set(existingDoc.ref, patientData, { merge: true });
                }
                else {
                    // Cria novo
                    const newRef = patientsRef.doc();
                    batch.set(newRef, {
                        ...patientData,
                        createdAt: new Date().toISOString()
                    });
                }
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
            console.log(`✅ Sincronização MedX concluída. Processados: ${importedCount}.`);
            return { imported: importedCount, total: medxPatients.length };
        }
        catch (error) {
            console.error('❌ Erro CRÍTICO na sincronização de pacientes:', error);
            throw new Error(`Falha na sincronização: ${error.message}`);
        }
    }
}
// Singleton para uso na aplicação
// O token deve vir das variáveis de ambiente
export const medxService = new MedXService(process.env.MEDX_API_URL || 'https://v65.medx.med.br', process.env.MEDX_INTEGRATION_TOKEN || '');
//# sourceMappingURL=medx.service.js.map