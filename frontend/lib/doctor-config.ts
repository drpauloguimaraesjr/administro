// Configurações do Médico/Clínica
// Estes dados são usados em receituários, atestados e outros documentos

export const DOCTOR_CONFIG = {
    // Dados Pessoais
    name: 'Dr. Paulo Coelho Guimarães Jr.',
    shortName: 'Dr. Paulo Guimarães Jr.',
    crm: '21698',
    uf: 'SC',
    cpf: '023.896.961-47',

    // Contato
    phone: '(47) 99254-7770',
    email: 'drpauloguimaraesjr@gmail.com',

    // Endereço da Clínica
    address: 'Rua Blumenau, 797',
    neighborhood: 'América',
    city: 'Joinville',
    state: 'SC',
    cep: '89204-251',
    fullAddress: 'Rua Blumenau, 797 - América - Joinville - SC - CEP: 89204-251',

    // Especialidades (RQE)
    specialties: [
        { name: 'Clínica Médica', rqe: '' },
    ],

    // Assinatura Digital
    signatureUrl: '', // URL da imagem da assinatura (opcional)

    // Validação
    validationUrl: 'https://medx.med.br/l/',
};

// Formatadores
export const formatCRM = (crm: string, uf: string) => `CRM-${uf} ${crm}`;
export const formatCPF = (cpf: string) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
export const formatPhone = (phone: string) => phone;
export const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
};
export const formatDateTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};
