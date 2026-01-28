import { Request, Response } from "express";
import OpenAI from "openai";
import { z } from "zod";
import { Client } from "@notionhq/client";
import { db } from "../config/firebaseAdmin.js";

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
});

// Initialize Notion client
const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

const NOTION_DATABASE_ID = "2f342023207580049c5fe31e9b4c19be"; // Medical Brain ID

// Zod Schema for validation
const SingleKnowledgeSchema = z.object({
    topic: z.string(),
    patientQuestion: z.string(),
    sophiaResponse: z.string(),
    clinicalContext: z.string(),
    causeEffect: z.string(),
    guidelines: z.string(),
    keywords: z.string(),
    category: z.string(),
    principle: z.string(),
    action: z.string(),
    nuance: z.string(),
});

// Schema for the AI response (which might contain multiple items)
const MultiKnowledgeResultSchema = z.object({
    results: z.array(SingleKnowledgeSchema)
});

// Constants for chunking
const MAX_CHUNK_SIZE = 25000; // ~25k characters per chunk (safe limit for GPT-4)
const CHUNK_OVERLAP = 500; // Overlap to avoid cutting mid-sentence

// Helper function to split text into chunks
function splitTextIntoChunks(text: string): string[] {
    if (text.length <= MAX_CHUNK_SIZE) {
        return [text];
    }

    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        let endIndex = startIndex + MAX_CHUNK_SIZE;

        // If not the last chunk, try to find a good break point (newline or period)
        if (endIndex < text.length) {
            // Look for a newline near the end
            const newlineIndex = text.lastIndexOf('\n', endIndex);
            if (newlineIndex > startIndex + MAX_CHUNK_SIZE * 0.7) {
                endIndex = newlineIndex + 1;
            } else {
                // Look for a period
                const periodIndex = text.lastIndexOf('. ', endIndex);
                if (periodIndex > startIndex + MAX_CHUNK_SIZE * 0.7) {
                    endIndex = periodIndex + 2;
                }
            }
        }

        chunks.push(text.slice(startIndex, endIndex));
        startIndex = endIndex - CHUNK_OVERLAP; // Small overlap for context continuity
    }

    console.log(`📦 Text split into ${chunks.length} chunks for processing`);
    return chunks;
}

// Helper function to process a single chunk
async function processChunk(rawText: string, chunkIndex: number, totalChunks: number): Promise<any[]> {
    const systemPrompt = `Você é um Editor Médico Sênior da clínica Calyx.
Sua missão é ler uma transcrição (que pode conter VÁRIOS assuntos diferentes) e extrair MÚLTIPLOS itens de conhecimento estruturado.

${totalChunks > 1 ? `⚠️ ATENÇÃO: Este é o CHUNK ${chunkIndex + 1} de ${totalChunks} de uma transcrição maior. Processe apenas o conteúdo deste trecho.` : ''}

### OBJETIVO
Identifique cada tópico distinto abordado no texto e crie um objeto para cada um.
Retorne um JSON com a chave "results" contendo uma lista de objetos.

SCHEMA DE CADA OBJETO (dentro da lista 'results'):
{
  "topic": "Título curto (max 10 palavras)",
  "patientQuestion": "Como um paciente perguntaria isso? (Linguagem natural)",
  "sophiaResponse": "Resposta empática, didática e completa da Sophia (2-4 parágrafos).",
  "clinicalContext": "Resumo técnico para médicos.",
  "causeEffect": "Cadeia lógica: Causa → Efeito → Sintoma.",
  "guidelines": "Lista numerada de ações práticas.",
  "keywords": "8-12 keywords para busca.",
  "category": "Opções: Sintoma, Tratamento, Exame, Suplemento, Estilo de Vida, Hormônio",
  "principle": "Filosofia/Motivo clínico (Por que?)",
  "action": "Resumo da conduta (O que?)",
  "nuance": "Tom de voz, analogias usadas (Como?)"
}

### INSTRUÇÕES:
- Se o texto falar de "Enjoo" e depois de "Queda de Cabelo", CRIE DOIS OBJETOS SEPARADOS.
- Não misture assuntos. Divida para conquistar.
- Se for apenas um assunto, retorne uma lista com um único objeto.
- Se não houver conteúdo médico relevante neste trecho, retorne { "results": [] }.`;

    console.log(`🧠 Processing chunk ${chunkIndex + 1}/${totalChunks} (${rawText.length} chars)...`);

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: rawText },
        ],
        response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
        console.warn(`⚠️ Empty response for chunk ${chunkIndex + 1}`);
        return [];
    }

    const jsonContent = JSON.parse(content);

    // Handle different response formats
    if (jsonContent.results && Array.isArray(jsonContent.results)) {
        console.log(`✅ Chunk ${chunkIndex + 1} returned ${jsonContent.results.length} items`);
        return jsonContent.results;
    } else if (jsonContent.topic) {
        console.log(`✅ Chunk ${chunkIndex + 1} returned 1 item`);
        return [jsonContent];
    }

    return [];
}

export const requestKnowledgeGeneration = async (req: Request, res: Response) => {
    try {
        const { rawText } = req.body;

        if (!rawText) {
            return res.status(400).json({ error: "rawText is required" });
        }

        console.log(`📝 Received text with ${rawText.length} characters`);

        // Split text into chunks if too large
        const chunks = splitTextIntoChunks(rawText);
        const allResults: any[] = [];

        // Process each chunk (sequentially to avoid rate limits)
        for (let i = 0; i < chunks.length; i++) {
            try {
                const chunkResults = await processChunk(chunks[i], i, chunks.length);
                allResults.push(...chunkResults);
            } catch (chunkError: any) {
                console.error(`❌ Error processing chunk ${i + 1}:`, chunkError.message);
                // Continue with other chunks even if one fails
            }
        }

        console.log(`🎉 Total items extracted: ${allResults.length}`);

        res.json({ results: allResults });
    } catch (error: any) {
        console.error("Error generating knowledge:", error);
        res.status(500).json({ error: error.message });
    }
};

export const saveKnowledge = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        // 1. Validate data
        const validatedData = SingleKnowledgeSchema.parse(data);

        // 2. Save to Firebase (Primary Source)
        const firebaseRef = await db.collection("knowledge_base").add({
            ...validatedData,
            status: "approved",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // 3. Save to Notion (Calyx Medical Brain)
        // Ensure NOTION_TOKEN is present to avoid crashing if not configured yet
        if (process.env.NOTION_TOKEN) {
            try {
                await notion.pages.create({
                    parent: { database_id: NOTION_DATABASE_ID },
                    properties: {
                        "Tópico": { title: [{ text: { content: validatedData.topic } }] },
                        "Pergunta Paciente": { rich_text: [{ text: { content: validatedData.patientQuestion } }] },
                        "Resposta Sophia": { rich_text: [{ text: { content: validatedData.sophiaResponse } }] },
                        "Contexto Clínico": { rich_text: [{ text: { content: validatedData.clinicalContext } }] },
                        "Causa e Efeito": { rich_text: [{ text: { content: validatedData.causeEffect } }] },
                        "Orientações": { rich_text: [{ text: { content: validatedData.guidelines } }] },
                        "Palavras-Chave": { rich_text: [{ text: { content: validatedData.keywords } }] },
                        "Categoria": { select: { name: validatedData.category } },
                        "1. Princípio (Why)": { rich_text: [{ text: { content: validatedData.principle } }] },
                        "2. Ação Prática (What)": { rich_text: [{ text: { content: validatedData.action } }] },
                        "3. Nuance/Tom (How)": { rich_text: [{ text: { content: validatedData.nuance } }] },
                        "Status": { status: { name: "Aprovado" } }
                    }
                });
                console.log("Synced to Notion successfully");
            } catch (notionError) {
                console.error("Failed to sync to Notion:", notionError);
                // We don't fail the request if Notion fails, since Firebase is our source of truth now
            }
        }

        res.status(201).json({
            id: firebaseRef.id,
            message: "Conhecimento salvo no Firebase e Sincronizado com Notion!"
        });
    } catch (error: any) {
        console.error("Error saving knowledge:", error);
        res.status(400).json({ error: error.message });
    }
};

export const getKnowledgeList = async (req: Request, res: Response) => {
    try {
        const snapshot = await db.collection("knowledge_base").orderBy("createdAt", "desc").get();
        const knowledge = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json(knowledge);
    } catch (error: any) {
        console.error("Error fetching knowledge:", error);
        res.status(500).json({ error: error.message });
    }
};

// Draft Management
export const saveDraft = async (req: Request, res: Response) => {
    try {
        const { content, title } = req.body;
        if (!content) return res.status(400).json({ error: "Content is required" });

        const draftData = {
            content,
            title: title || new Date().toLocaleString('pt-BR'),
            createdAt: new Date(),
            status: 'draft'
        };

        const docRef = await db.collection("knowledge_drafts").add(draftData);
        res.json({ id: docRef.id, ...draftData });
    } catch (error: any) {
        console.error("Error saving draft:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getDrafts = async (req: Request, res: Response) => {
    try {
        const snapshot = await db.collection("knowledge_drafts").orderBy("createdAt", "desc").limit(20).get();
        const drafts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(drafts);
    } catch (error: any) {
        console.error("Error fetching drafts:", error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteDraft = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await db.collection("knowledge_drafts").doc(id).delete();
        res.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting draft:", error);
        res.status(500).json({ error: error.message });
    }
};
