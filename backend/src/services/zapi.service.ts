import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const ZAPI_INSTANCE = process.env.ZAPI_INSTANCE;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;
const ZAPI_BASE_URL = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}`;

/**
 * Z-API Integration Service
 * Múltiplas instâncias podem ser passadas pelo construtor/banco de dados,
 * mas para V1 estamos focando no número central de atendimento usando ENV.
 */
export class ZApiService {
    private getInstanceUrl(instanceId?: string, token?: string) {
        if (instanceId && token) {
            return `https://api.z-api.io/instances/${instanceId}/token/${token}`;
        }
        if (!ZAPI_INSTANCE || !ZAPI_TOKEN) {
            console.warn("Z-API credentials missing in .env");
        }
        return ZAPI_BASE_URL;
    }

    /**
     * Envia mensagem de texto
     */
    async sendMessage(phone: string, message: string, instanceId?: string, token?: string) {
        try {
            const url = `${this.getInstanceUrl(instanceId, token)}/send-text`;
            const response = await axios.post(url, {
                phone: phone, // ex: "5511999999999"
                message: message,
            });
            return response.data;
        } catch (error: any) {
            console.error('Error sending Z-API message:', error?.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Envia um arquivo PDF (Prescrições, orçamentos, etc)
     */
    async sendDocument(phone: string, documentUrl: string, fileName: string, instanceId?: string, token?: string) {
        try {
            const url = `${this.getInstanceUrl(instanceId, token)}/send-document`;
            const response = await axios.post(url, {
                phone: phone,
                document: documentUrl,
                fileName: fileName,
            });
            return response.data;
        } catch (error: any) {
            console.error('Error sending Z-API document:', error?.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Verifica o status da instância (conectada, precisa ler QR, bateria)
     */
    async getStatus(instanceId?: string, token?: string) {
        try {
            const url = `${this.getInstanceUrl(instanceId, token)}/status`;
            const response = await axios.get(url);
            return response.data;
        } catch (error: any) {
            console.error('Error getting Z-API status:', error?.response?.data || error.message);
            return { connected: false, error: 'Failed to reach API' };
        }
    }

    /**
     * Pega o QR Code se estiver desconectado
     */
    async getQrCode(instanceId?: string, token?: string) {
        try {
            const url = `${this.getInstanceUrl(instanceId, token)}/qr-code`;
            const response = await axios.get(url);
            return response.data?.value || null;
        } catch (error) {
            return null;
        }
    }
}

export const zApiService = new ZApiService();
