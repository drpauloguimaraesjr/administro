# 🎯 Solução Final: Workflow Inteligente com Confirmação

## 📋 Estrutura Proposta

### Fluxo Completo

```
1. Usuário envia imagem → WhatsApp
2. Backend recebe → Upload Firebase Storage
3. Backend envia para n8n → Webhook receive-media
4. n8n extrai dados → GPT-4 Vision (máximo de dados)
5. n8n envia confirmação → Backend → WhatsApp
6. Usuário responde → WhatsApp → Backend
7. Backend processa resposta → Cria transação no Firestore
```

---

## 🔍 Campos que Serão Extraídos (Máximo Possível)

### Campos Principais (Sempre Extrair)

1. **`amount`** (number)
   - Valor da transação
   - Se não encontrar: `0` (usuário confirma depois)

2. **`type`** ('income' | 'expense')
   - Receita ou despesa
   - Se não identificar: `'expense'` (padrão)

3. **`date`** (string - YYYY-MM-DD)
   - Data da transação
   - Se não encontrar: data atual

4. **`description`** (string)
   - Descrição completa
   - Se não encontrar: "Transação via WhatsApp"

### Campos com Sistema Inteligente

5. **`category`** (string)
   - Categoria mais provável
   - Exemplos: "Alimentação", "Transporte", "Saúde", etc.

6. **`possibleCategories`** (string[])
   - Lista de categorias possíveis (top 3)
   - Exemplo: `["Alimentação", "Supermercado", "Restaurante"]`

7. **`categoryConfidence`** (number 0-1)
   - Confiança na categoria
   - Se < 0.7 → pedir confirmação

### Campos de Contexto

8. **`contextId`** ('HOME' | 'CLINIC')
   - Tentativa de identificar
   - **SEMPRE** pedir confirmação (nunca confiar 100%)

9. **`contextConfidence`** (number 0-1)
   - Confiança no contexto
   - Sempre baixo (sempre confirmar)

### Campos Adicionais (Extrair se Disponível)

10. **`payer`** (string | null)
    - Nome do pagador
    - Exemplo: "João Silva"

11. **`receiver`** (string | null)
    - Nome do recebedor
    - Exemplo: "Maria Santos"

12. **`transactionId`** (string | null)
    - ID da transação no banco
    - Exemplo: "TXN123456789"

13. **`bank`** (string | null)
    - Nome do banco
    - Exemplo: "Banco do Brasil"

14. **`account`** (string | null)
    - Número da conta (mascarado)
    - Exemplo: "****1234"

15. **`notes`** (string | null)
    - Observações adicionais do comprovante

---

## 💬 Sistema de Confirmação

### Mensagem Enviada ao Usuário

```
📋 Comprovante Recebido

💰 Valor: R$ 150,00
📅 Data: 2026-01-06
📝 Descrição: Pagamento de conta de luz
🏷️ Tipo: Despesa

❓ Categoria: (Precisa confirmar)
Opções:
1. Serviços
2. Moradia
3. Outros

Responda com o número da categoria ou digite o nome.

📍 Para onde vai esta transação?
1. 🏠 HOME (Pessoal)
2. 🏥 CLINIC (Clínica)

Responda com 1 ou 2, ou digite HOME/CLINIC.

---
Confirme os dados acima para criar a transação.
```

### Resposta do Usuário

**Formato esperado:**
- Categoria: `1` ou `Serviços` ou `servicos`
- Contexto: `1` ou `HOME` ou `home` ou `2` ou `CLINIC` ou `clinica`

**Exemplos de respostas válidas:**
- `1 1` → Categoria 1, Contexto HOME
- `Serviços HOME` → Categoria Serviços, Contexto HOME
- `2 CLINIC` → Categoria 2, Contexto CLINIC

---

## 🏗️ Estrutura de Dados

### 1. Dados Extraídos (n8n → Backend)

```typescript
{
  amount: number;
  type: 'income' | 'expense';
  date: string;                    // YYYY-MM-DD
  description: string;
  category: string;                // Categoria mais provável
  possibleCategories: string[];    // Top 3 categorias
  categoryConfidence: number;      // 0-1
  contextId: 'HOME' | 'CLINIC';    // Tentativa
  contextConfidence: number;        // 0-1
  payer?: string;
  receiver?: string;
  transactionId?: string;
  bank?: string;
  account?: string;
  notes?: string;
  attachmentUrl: string;
  from: string;                    // Número WhatsApp
  fromName: string;
  messageId: string;
  confidence: number;              // Confiança geral
}
```

### 2. Dados Temporários (Backend → Firestore `pending_confirmations`)

```typescript
{
  id: string;                      // confirmationId
  messageId: string;               // ID da mensagem original
  from: string;                    // Número WhatsApp
  extractedData: {                 // Dados extraídos
    amount: number;
    type: 'income' | 'expense';
    date: string;
    description: string;
    category: string;
    possibleCategories: string[];
    // ... outros campos
  };
  status: 'pending';               // pending | confirmed | cancelled
  createdAt: Date;
  expiresAt: Date;                 // Expira em 10 minutos
}
```

### 3. Dados Finais (Backend → Firestore `transactions`)

```typescript
{
  amount: number;
  type: 'income' | 'expense';
  status: 'paid';
  date: Date;
  description: string;
  category: string;                // Confirmado pelo usuário
  contextId: 'HOME' | 'CLINIC';    // Confirmado pelo usuário
  attachmentUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔄 Fluxo Detalhado

### Fase 1: Extração (n8n)

1. Recebe imagem do webhook
2. Baixa imagem do Firebase Storage
3. Converte para Base64
4. Envia para GPT-4 Vision
5. Extrai TODOS os dados possíveis
6. Processa e normaliza dados
7. Prepara mensagem de confirmação
8. Envia para backend criar confirmação pendente
9. Backend salva em `pending_confirmations`
10. Backend envia mensagem WhatsApp ao usuário
11. Responde ao webhook: "Aguardando confirmação"

### Fase 2: Confirmação (Backend)

1. Usuário responde via WhatsApp
2. Backend recebe mensagem
3. Verifica se é resposta de confirmação
4. Busca confirmação pendente por número + timestamp
5. Processa resposta (categoria + contexto)
6. Cria transação no Firestore
7. Remove confirmação pendente
8. Envia mensagem de sucesso ao usuário

---

## 📝 Próximos Passos

### 1. Criar Rota no Backend para Confirmações Pendentes

```typescript
POST /api/n8n/create-pending-confirmation
// Salva dados temporários

GET /api/n8n/pending-confirmation/:messageId
// Busca confirmação pendente

POST /api/n8n/confirm-transaction
// Processa confirmação e cria transação
```

### 2. Atualizar Handler de Mensagens WhatsApp

- Detectar se mensagem é resposta de confirmação
- Processar resposta (categoria + contexto)
- Chamar endpoint de confirmação

### 3. Workflow n8n Final

- Extrair máximo de dados
- Enviar para backend criar confirmação
- Backend gerencia o resto

---

## ✅ Vantagens desta Abordagem

1. ✅ **n8n apenas extrai** - sem lógica complexa
2. ✅ **Backend gerencia confirmação** - mais controle
3. ✅ **Máximo de dados extraídos** - GPT-4 Vision completo
4. ✅ **Sistema inteligente de categorias** - múltiplas opções
5. ✅ **Sempre confirma contexto** - nunca erra
6. ✅ **Dados temporários no Firestore** - persistente e confiável
7. ✅ **Expiração automática** - limpa confirmações antigas

---

**Esta é a estrutura proposta. Posso criar o workflow e as rotas do backend agora!** 🚀

