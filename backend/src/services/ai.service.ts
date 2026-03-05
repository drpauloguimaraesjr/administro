import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Serviço de IA usando OpenRouter.
 * A chave do OpenRouter permite acessar GPT-4, Claude 3, Llama, etc.
 * Model padrão: gpt-4o-mini (rápido, barato e inteligente para CRM).
 */
export class AiService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY || 'MISSING_KEY',
            defaultHeaders: {
                'HTTP-Referer': 'https://administro.io', // Obrigatório para o OpenRouter
                'X-Title': 'Administro CRM',
            },
        });
    }

    /**
     * Gera resposta baseada nas mensagens recebidas + instrução do sistema (persona da clínica).
     */
    async generateResponse(
        messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
        model: string = 'openai/gpt-4o-mini'
    ) {
        if (!process.env.OPENROUTER_API_KEY) {
            return "Estou em modo offline no momento. Peça ao administrador para configurar a API de Inteligência.";
        }

        try {
            const completion = await this.openai.chat.completions.create({
                model: model, // Ex: 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o'
                messages: messages,
                temperature: 0.5, // Resposta não muito criativa, sendo precisa para agendamento
            });

            return completion.choices[0]?.message?.content || 'Desculpe, não consegui entender.';
        } catch (error: any) {
            console.error('AI Error:', error?.response?.data || error.message);
            return 'Desculpe, estou passando por instabilidades técnicas. Tente novamente em instantes.';
        }
    }

    /**
     * O prompt base para o agente de atendimento (triagem inicial)
     */
    getBasePrompt(clinicName: string = 'Sua Clínica') {
        return `Você é a assistente virtual da ${clinicName}.
Seu objetivo é fazer atendimento de nível 1 via WhatsApp.

REGRAS:
1. Seja sempre muito educada, humana e acolhedora.
2. Seu trabalho é responder dúvidas simples, informar horários e captar a intenção do paciente (se ele quer agendar, tirar dúvida médica, ou renovar prescrição).
3. Seja breve! Responda em parágrafos curtos, formato amigável para celular, limitando-se a 3 frases. 
4. NÃO de diagnósticos médicos.
5. Se for dúvida complexa ou pedir agendamento, você deve confirmar os dados (Nome, interesse) e informar: "Vou pedir para alguém da equipe humana verificar a agenda e te chamar em instantes."`;
    }
}

export const aiService = new AiService();
