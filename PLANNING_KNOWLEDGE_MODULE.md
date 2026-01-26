# 🧠 Módulo de Gestão de Conhecimento (Knowledge Base)

> **Objetivo:** Criar um ambiente dentro do App para o Dr. Paulo gerar, revisar e armazenar conhecimento estruturado, eliminando a dependência do Notion/Zapier.

---

## 🏗️ Arquitetura

### 1. Fluxo de Dados
1.  **Input:** Dr. Paulo insere texto bruto (transcrição ou pensamento) no App.
2.  **Processamento:** Backend envia para OpenAI (GPT-4o) para estruturar nos campos "Padrão Sophia".
3.  **Revisão:** Frontend exibe os campos gerados para edição/confirmação.
4.  **Persistência:** Dados aprovados são salvos no Firebase (Collection: `knowledge_base`).
5.  **Consumo:** N8N ou a própria API do App consultam essa base para gerar respostas.

### 2. Backend (Node.js/Express)
-   **Dependências:** `openai`, `zod`.
-   **Rotas:**
    -   `POST /api/knowledge/generate`: Recebe `{ rawText }`, retorna JSON estruturado.
    -   `POST /api/knowledge`: Recebe o JSON final e salva no Firebase.
    -   `GET /api/knowledge`: Lista todo o conhecimento salvo.
-   **Segurança:** Protegido por autenticação (apenas médicos/admins).

### 3. Frontend (Next.js)
-   **Página:** `/knowledge`
-   **Abas:**
    1.  **Gerador:** Input de texto -> Botão Gerar -> Formulário de Edição -> Salvar.
    2.  **Biblioteca:** Tabela com busca para visualizar o "Cérebro" da clínica.

### 4. Schema do Banco de Dados (Firebase)
Collection: `knowledge_base`
```json
{
  "id": "uuid",
  "topic": "String",
  "patientQuestion": "String",
  "sophiaResponse": "String",
  "clinicalContext": "String",
  "causeEffect": "String",
  "guidelines": "String",
  "keywords": "Array<String>",
  "category": "String",
  "principle": "String", // Why
  "action": "String",    // What
  "nuance": "String",    // How
  "status": "approved",  // draft | approved
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

---

## 🚀 Passos de Implementação

1.  **Setup Backend:** Instalar libs e configurar OpenAI Client.
2.  **API Backend:** Criar Controller e Rotas.
3.  **Frontend API:** Criar funções de fetch em `lib/api.ts`.
4.  **Frontend UI:** Criar página e componentes de formulário/tabela.
