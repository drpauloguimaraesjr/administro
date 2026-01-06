# 📋 Briefing: Workflow Vision OCR - Estrutura e Campos

## 🎯 Objetivo

Criar um workflow n8n que recebe imagens de comprovantes via WhatsApp e extrai automaticamente os dados usando GPT-4 Vision OCR.

---

## 📊 Estrutura Atual do Sistema

### Tipo: `Transaction` (Firestore)

```typescript
{
  id?: string;                    // Gerado automaticamente
  amount: number;                  // Valor da transação (OBRIGATÓRIO)
  type: 'income' | 'expense';      // Receita ou despesa (OBRIGATÓRIO)
  status: 'paid' | 'pending';      // Pago ou pendente
  date: Date | string;             // Data da transação
  description: string;              // Descrição/observações
  category: string;                 // Categoria (ex: Alimentação, Transporte)
  contextId: 'HOME' | 'CLINIC';    // Contexto: pessoal ou clínica (OBRIGATÓRIO)
  attachmentUrl?: string;           // URL da imagem no Firebase Storage
  createdAt?: Date | string;       // Data de criação
  updatedAt?: Date | string;        // Data de atualização
}
```

### Payload do n8n: `N8nTransactionPayload`

```typescript
{
  amount: number;                  // OBRIGATÓRIO
  type: 'income' | 'expense';      // OBRIGATÓRIO
  date: string;                    // Formato: YYYY-MM-DD
  description: string;
  category: string;
  contextId: 'HOME' | 'CLINIC';    // OBRIGATÓRIO
  attachmentUrl?: string;          // URL da imagem
}
```

---

## 🔍 Campos que Serão Extraídos das Imagens

### Campos Obrigatórios (Sempre Tentar Extrair)

1. **`amount`** (number)
   - Valor da transação em reais
   - Exemplos: `150.00`, `2500.50`, `99.99`
   - Se não encontrar: usar `0` (marcar para revisão manual)

2. **`type`** ('income' | 'expense')
   - **income**: Depósito, transferência recebida, salário, recebimento
   - **expense**: Pagamento, compra, saque, transferência enviada
   - Se não identificar: usar `'expense'` (mais comum)

3. **`contextId`** ('HOME' | 'CLINIC')
   - **HOME**: Despesas pessoais, receitas pessoais
   - **CLINIC**: Despesas da clínica, receitas da clínica
   - Se não identificar: usar `'HOME'`

### Campos Opcionais (Tentar Extrair, Mas Ter Padrão)

4. **`date`** (string - YYYY-MM-DD)
   - Data da transação no comprovante
   - Se não encontrar: usar data atual
   - Formato: `2026-01-06`

5. **`description`** (string)
   - Descrição da transação
   - Exemplos: "Pagamento de conta de luz", "Transferência recebida", "Compra no supermercado"
   - Se não encontrar: usar `"Transação via WhatsApp"`

6. **`category`** (string)
   - Categorias possíveis:
     - **Receitas**: Salário, Freelance, Investimentos, Outros
     - **Despesas**: Alimentação, Transporte, Saúde, Serviços, Moradia, Educação, Lazer, Outros
   - Se não identificar: usar `"Outros"`

### Campo de Metadados (Não Salvo no Firestore)

7. **`confidence`** (number - 0 a 1)
   - Confiança na extração (para debug/logs)
   - Exemplo: `0.95` = 95% de confiança
   - Não é salvo no Firestore, apenas para logs

---

## 🏗️ Estrutura de Dados Proposta

### Fluxo de Dados

```
WhatsApp → Backend → Firebase Storage → n8n → GPT-4 Vision → Processamento → Backend → Firestore
   📱         🖥️            ☁️            🔄         🤖            ⚙️            🖥️         🗄️
```

### 1. Recebimento (WhatsApp → Backend)

```typescript
{
  messageId: string;
  from: string;                    // Número do WhatsApp
  fromName: string;                // Nome do contato
  timestamp: number;
  text?: string;                   // Texto da mensagem (se houver)
  mediaType: 'image' | 'video' | 'document';
  mediaUrl: string;                // URL do Firebase Storage
  fileName?: string;
  mimeType?: string;
}
```

### 2. Envio para n8n (Backend → n8n)

```typescript
{
  messageId: string;
  from: string;
  fromName: string;
  timestamp: number;
  text?: string;
  mediaType: 'image';
  mediaUrl: string;               // URL pública do Firebase Storage
  fileName?: string;
  mimeType?: string;
}
```

### 3. Processamento no n8n (n8n → GPT-4 Vision)

**Prompt para GPT-4 Vision:**
```
Analise esta imagem de comprovante bancário brasileiro.

Extraia em JSON:
{
  "amount": número,
  "type": "income" ou "expense",
  "date": "YYYY-MM-DD",
  "description": "texto",
  "category": "categoria",
  "contextId": "HOME" ou "CLINIC",
  "confidence": 0.0 a 1.0
}
```

### 4. Retorno do n8n (n8n → Backend)

```typescript
{
  amount: number;
  type: 'income' | 'expense';
  date: string;                    // YYYY-MM-DD
  description: string;
  category: string;
  contextId: 'HOME' | 'CLINIC';
  attachmentUrl: string;           // URL da imagem original
  confidence?: number;              // Para logs (opcional)
}
```

### 5. Salvamento (Backend → Firestore)

```typescript
{
  amount: number;
  type: 'income' | 'expense';
  status: 'paid';                   // Sempre 'paid' para comprovantes
  date: Date;
  description: string;
  category: string;
  contextId: 'HOME' | 'CLINIC';
  attachmentUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🤔 Perguntas para Definir Antes de Criar o Workflow

### 1. Categorias Padronizadas

**Você quer categorias fixas ou livres?**

**Opção A: Categorias Fixas (Recomendado)**
```typescript
// Receitas
'Salário', 'Freelance', 'Investimentos', 'Outros'

// Despesas
'Alimentação', 'Transporte', 'Saúde', 'Serviços', 'Moradia', 'Educação', 'Lazer', 'Outros'
```

**Opção B: Categorias Livres**
- GPT-4 sugere categoria baseado no comprovante
- Mais flexível, mas pode gerar inconsistências

**Qual você prefere?**

### 2. Detecção de Contexto (HOME vs CLINIC)

**Como identificar se é HOME ou CLINIC?**

**Opção A: Automático (Baseado em palavras-chave)**
- Se comprovante mencionar "clínica", "consultório", "paciente" → CLINIC
- Caso contrário → HOME

**Opção B: Perguntar ao Usuário**
- Se não conseguir identificar, enviar mensagem perguntando
- Exemplo: "É despesa pessoal (HOME) ou da clínica (CLINIC)?"

**Opção C: Usar Número do WhatsApp**
- Se número X → sempre CLINIC
- Se número Y → sempre HOME

**Qual você prefere?**

### 3. Tratamento de Erros

**O que fazer quando não conseguir extrair dados?**

**Opção A: Criar com Valores Padrão**
- `amount: 0`, `type: 'expense'`, `category: 'Outros'`
- Marcar como `status: 'pending'` para revisão manual

**Opção B: Não Criar Transação**
- Retornar erro e pedir para enviar novamente

**Opção C: Criar e Notificar**
- Criar com valores padrão
- Enviar mensagem WhatsApp: "Não consegui ler o comprovante. Pode confirmar os dados?"

**Qual você prefere?**

### 4. Validação de Valor

**O que fazer se o valor extraído parecer errado?**

**Opção A: Aceitar Sempre**
- Confiar no OCR, mesmo se parecer errado

**Opção B: Validar Faixas**
- Se valor > R$ 10.000 → pedir confirmação
- Se valor < R$ 0,01 → usar 0

**Opção C: Sempre Confirmar Valores Altos**
- Se valor > R$ 1.000 → enviar mensagem pedindo confirmação

**Qual você prefere?**

### 5. Múltiplas Transações em Uma Imagem

**E se a imagem tiver vários comprovantes?**

**Opção A: Extrair Apenas o Primeiro**
- Mais simples, mas pode perder dados

**Opção B: Extrair Todos**
- Criar múltiplas transações
- Mais complexo, mas mais completo

**Qual você prefere?**

### 6. Histórico e Logs

**Você quer salvar logs das extrações?**

**Opção A: Apenas no n8n**
- Ver logs nas execuções do n8n

**Opção B: Salvar no Firestore**
- Criar coleção `ocr_logs` com:
  - Imagem original
  - Resposta do GPT-4
  - Dados extraídos
  - Confiança
  - Timestamp

**Qual você prefere?**

---

## 📝 Proposta de Estrutura Final

### Campos Mínimos (Sempre Extrair)

1. ✅ `amount` - Valor
2. ✅ `type` - Receita/Despesa
3. ✅ `contextId` - HOME/CLINIC
4. ✅ `date` - Data (ou atual)
5. ✅ `description` - Descrição (ou padrão)
6. ✅ `category` - Categoria (ou "Outros")
7. ✅ `attachmentUrl` - URL da imagem

### Campos Adicionais (Opcional)

8. ⚠️ `confidence` - Confiança (para logs)
9. ⚠️ `rawOcrText` - Texto bruto extraído (para debug)
10. ⚠️ `requiresReview` - Se precisa revisão manual

---

## 🎯 Próximos Passos

**Antes de criar o workflow, preciso saber:**

1. **Categorias**: Fixas ou livres?
2. **Contexto**: Como identificar HOME vs CLINIC?
3. **Erros**: Criar com padrão ou não criar?
4. **Validação**: Validar valores ou aceitar sempre?
5. **Múltiplas transações**: Extrair todas ou só a primeira?
6. **Logs**: Salvar no Firestore ou só no n8n?

**Depois que você responder, vou criar o workflow perfeito para suas necessidades!** 🚀

