# CALYX - Prompts Antigravity: Indicações e Questionários

## MÓDULO 1: Sistema de Indicações

### PROMPT 1: Estrutura Base de Indicações

```
Implemente o Sistema de Indicações no CALYX para rastrear a rede de pacientes:

CONTEXTO:
- Sistema: CALYX - Prontuário Eletrônico
- Módulo Pacientes já existe
- Stack: Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI, Firebase

OBJETIVO:
Rastrear quem indicou quem, criar árvore genealógica de indicações e calcular métricas.

ESTRUTURA DE DADOS:

```typescript
// Adicionar ao modelo Patient existente
interface Patient {
  // ... campos existentes
  
  // Indicação
  referredBy?: string;                 // ID do paciente que indicou
  referralSource?: 'indication' | 'google' | 'instagram' | 'facebook' | 'friend' | 'other';
  referralNotes?: string;
  referralCount?: number;              // Calculado
  referralLevel?: number;              // Nível na árvore
}

interface ReferralTree {
  patientId: string;
  patientName: string;
  level: number;
  referredBy: string | null;
  children: ReferralTree[];
  totalDescendants: number;
  directReferrals: number;
}
```

FUNCIONALIDADES - FASE 1:

1. **Atualizar Formulário de Cadastro de Paciente**
   - Adicionar campo "Como nos conheceu?" (radio buttons)
   - Opções: Google, Instagram, Facebook, Indicação de paciente, Amigo/Familiar, Outro
   - Se selecionar "Indicação de paciente":
     - Campo de autocomplete: "Quem indicou?" (busca pacientes)
     - Campo opcional: "Observações"
   - Salvar: referredBy, referralSource, referralNotes

2. **Atualizar Contadores**
   - Ao criar paciente com referredBy:
     - Incrementar referralCount do paciente que indicou
     - Calcular referralLevel baseado no pai

3. **Aba "Indicações" no Perfil do Paciente**
   - Mostrar: "Indicado por: [Nome do Paciente]" (se aplicável)
   - Lista de "Pacientes Indicados" (indicações diretas)
   - Card para cada indicação:
     - Nome
     - Data de cadastro
     - Quantos indicou
     - Botão "Ver Rede"

APIS:

```typescript
// Atualizar POST /api/patients
// Adicionar campos de indicação

// GET /api/patients/:id/referrals
// Retorna lista de pacientes indicados por este

// GET /api/patients/:id/referral-tree
// Retorna árvore completa de indicações
```

TECNOLOGIAS:
- Shadcn/UI (RadioGroup, Autocomplete)
- Firestore para persistência

DESIGN:
- Seguir padrão visual do sistema
- Campo de autocomplete com busca em tempo real
- Cards de indicações com ícones

PRIORIZAÇÃO:
- Foco em cadastro e listagem básica
- Visualização de árvore na próxima fase
```

---

### PROMPT 2: Visualização de Árvore e Dashboard

```
Implemente visualização de árvore de indicações e dashboard de métricas no CALYX:

CONTEXTO:
- Estrutura base de indicações já implementada
- Pacientes já têm campos referredBy e referralCount
- Stack: Next.js 14, TypeScript, React Flow

FUNCIONALIDADES - FASE 2:

1. **Visualização de Árvore (React Flow)**
   - Página: /pacientes/{id}/rede-de-indicacoes
   - Renderizar árvore hierárquica visual
   - Nós: círculos com nome do paciente + número de indicações
   - Linhas conectando pais e filhos
   - Zoom e pan
   - Botões: Expandir Tudo, Colapsar, Exportar PNG

2. **Dashboard de Indicações**
   - Página: /indicacoes
   - Cards de métricas:
     - Total de Indicações
     - Indicações Este Mês
     - Taxa de Conversão (% de pacientes via indicação)
   - Top 5 Indicadores (tabela/cards)
   - Gráfico: Indicações por Mês (linha)
   - Gráfico: Canais de Aquisição (pizza)

3. **Algoritmo de Construção de Árvore**

```typescript
async function buildReferralTree(patientId: string): Promise<ReferralTree> {
  const patient = await getPatient(patientId);
  const directReferrals = await db
    .collection('patients')
    .where('referredBy', '==', patientId)
    .get();
  
  const children: ReferralTree[] = [];
  let totalDescendants = directReferrals.size;
  
  for (const doc of directReferrals.docs) {
    const childTree = await buildReferralTree(doc.id);
    children.push(childTree);
    totalDescendants += childTree.totalDescendants;
  }
  
  return {
    patientId: patient.id,
    patientName: patient.name,
    level: patient.referralLevel || 0,
    referredBy: patient.referredBy || null,
    children,
    totalDescendants,
    directReferrals: directReferrals.size
  };
}
```

APIS:

```typescript
// GET /api/referrals/stats
// Retorna estatísticas globais

// GET /api/referrals/top-referrers?limit=10
// Retorna top indicadores
```

TECNOLOGIAS:
- React Flow para visualização de árvore
- Recharts para gráficos
- Shadcn/UI (Card, Badge)

DESIGN:
- Árvore com nós coloridos (verde)
- Dashboard com cards de métricas
- Gráficos interativos

PRIORIZAÇÃO:
- Visualização de árvore funcional
- Dashboard com métricas básicas
- Gráficos simples
```

---

## MÓDULO 2: Sistema de Questionários

### PROMPT 3: Construtor de Questionários

```
Implemente o Construtor de Questionários no CALYX:

CONTEXTO:
- Sistema: CALYX - Prontuário Eletrônico
- Stack: Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI, Firebase

OBJETIVO:
Criar interface para construir questionários personalizados com múltiplas seções e tipos de perguntas.

ESTRUTURA DE DADOS:

```typescript
interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  type: 'anamnesis' | 'followup' | 'satisfaction' | 'screening' | 'consent' | 'custom';
  sections: QuestionnaireSection[];
  settings: {
    allowMultipleResponses: boolean;
    requiresAuth: boolean;
    expiresAfterDays?: number;
    sendReminder: boolean;
    reminderAfterDays?: number;
  };
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  isActive: boolean;
  responseCount: number;
}

interface QuestionnaireSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'scale' | 'file';
  required: boolean;
  order: number;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    fileTypes?: string[];
    maxFileSize?: number;
  };
  dataMapping?: {
    collection: string;
    field: string;
  };
}
```

FUNCIONALIDADES:

1. **Página: Novo Questionário** (/questionarios/novo)
   - Campos:
     - Título *
     - Descrição (opcional)
     - Tipo (dropdown)
   - Seção "Seções"
     - Botão "Adicionar Seção"
     - Cada seção tem:
       - Título *
       - Descrição (opcional)
       - Botões: Mover para cima, Mover para baixo, Remover
       - Lista de perguntas
       - Botão "Adicionar Pergunta"
   - Cada pergunta tem:
     - Texto da pergunta *
     - Tipo (dropdown: text, textarea, number, date, select, radio, checkbox, scale, file)
     - Checkbox "Obrigatória"
     - Campos de validação (dependendo do tipo)
     - Opções (se tipo select/radio/checkbox)
     - Mapeamento de dados (opcional)
     - Botões: Mover para cima, Mover para baixo, Remover
   - Seção "Configurações"
     - Checkboxes: Permitir múltiplas respostas, Requer autenticação, Enviar lembrete
     - Inputs: Expira após X dias, Lembrete após X dias
   - Botões: Cancelar, Salvar

2. **Componente: QuestionBuilder**
   - Componente reutilizável para adicionar/editar perguntas
   - Renderizar campos específicos baseado no tipo
   - Validação em tempo real

3. **Listagem de Questionários** (/questionarios)
   - Cards com:
     - Título
     - Tipo
     - Número de perguntas e seções
     - Estatísticas: enviado X vezes, taxa de resposta Y%
     - Ações: Editar, Enviar, Ver Respostas, Duplicar, Excluir

APIS:

```typescript
// POST /api/questionnaires
// Cria questionário

// GET /api/questionnaires
// Lista questionários

// GET /api/questionnaires/:id
// Busca questionário

// PUT /api/questionnaires/:id
// Atualiza questionário

// DELETE /api/questionnaires/:id
// Exclui questionário
```

TECNOLOGIAS:
- React Hook Form + Zod para validação
- Shadcn/UI (Form, Input, Textarea, Select, Checkbox, Card, Dialog)
- Firestore para persistência
- UUID para IDs de seções e perguntas

DESIGN:
- Interface drag-and-drop (opcional, usar botões ↑↓ se mais simples)
- Cards para seções e perguntas
- Formulário longo com scroll
- Loading states

PRIORIZAÇÃO:
- CRUD completo de questionários
- Todos os tipos de perguntas
- Validações básicas
- Interface funcional (não precisa ser sofisticada)
```

---

### PROMPT 4: Envio e Página de Resposta

```
Implemente envio de questionários e página de resposta para pacientes no CALYX:

CONTEXTO:
- Construtor de questionários já funciona
- Integração WhatsApp já existe no sistema
- Stack: Next.js 14, TypeScript, Firebase

ESTRUTURA DE DADOS:

```typescript
interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  patientId: string;
  answers: Answer[];
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  startedAt?: string;
  completedAt?: string;
  sentVia: 'whatsapp' | 'email' | 'link';
  sentAt: string;
  createdAt: string;
  expiresAt?: string;
}

interface Answer {
  questionId: string;
  questionText: string;
  value: any;
  fileUrl?: string;
}
```

FUNCIONALIDADES - FASE 1:

1. **Modal: Enviar Questionário**
   - Acesso: botão "Enviar" na listagem de questionários
   - Campos:
     - Questionário (readonly, preenchido)
     - Enviar para:
       - ( ) Paciente específico (autocomplete)
       - ( ) Múltiplos pacientes (checklist)
     - Canal: ( ) WhatsApp ( ) Email ( ) Gerar link
     - Mensagem personalizada (textarea, opcional)
   - Botões: Cancelar, Enviar

2. **Lógica de Envio**
   - Criar documento QuestionnaireResponse para cada paciente
   - Status: pending
   - Gerar link único: https://calyx.health/q/{responseId}
   - Se WhatsApp:
     - Enviar mensagem com link
     - Template: "Olá [Nome]! Por favor preencha este formulário: [Link]"
   - Se Email:
     - Enviar email com link (implementar depois)
   - Se Link:
     - Copiar link para clipboard

3. **Página de Resposta** (/q/{responseId})
   - Pública (sem autenticação)
   - Buscar QuestionnaireResponse e Questionnaire
   - Renderizar formulário:
     - Cabeçalho: Logo CALYX + Título do questionário + Nome do médico
     - Saudação: "Olá, [Nome do Paciente]!"
     - Descrição do questionário
     - Tempo estimado
     - Seções e perguntas
     - Barra de progresso
     - Botões: Salvar Rascunho, Enviar
   - Validação em tempo real
   - Salvamento automático (rascunho) a cada 30s

4. **Renderização de Tipos de Perguntas**
   - text: Input
   - textarea: Textarea
   - number: Input type=number
   - date: Input type=date
   - time: Input type=time
   - select: Select (dropdown)
   - multiselect: Select multiple
   - radio: RadioGroup
   - checkbox: CheckboxGroup
   - scale: Slider (1-10)
   - file: Upload (react-dropzone)

APIS:

```typescript
// POST /api/questionnaires/:id/send
// Envia questionário para pacientes

// GET /api/questionnaire-responses/:responseId
// Busca resposta (público)

// PUT /api/questionnaire-responses/:responseId
// Salva rascunho

// POST /api/questionnaire-responses/:responseId/submit
// Submete resposta completa
```

TECNOLOGIAS:
- React Hook Form + Zod
- Shadcn/UI (Form, Input, Select, RadioGroup, Checkbox, Slider)
- react-dropzone para upload
- Firestore

DESIGN:
- Página de resposta responsiva (mobile-first)
- Barra de progresso visível
- Loading states
- Toast de sucesso ao enviar

PRIORIZAÇÃO:
- Envio via WhatsApp funcional
- Página de resposta com todos os tipos de perguntas
- Salvamento de rascunho
- Submissão completa
```

---

### PROMPT 5: Visualização e Integração

```
Implemente visualização de respostas e integração com prontuário no CALYX:

CONTEXTO:
- Questionários podem ser enviados e respondidos
- Prontuário já existe
- Stack: Next.js 14, TypeScript, Firebase

FUNCIONALIDADES:

1. **Aba "Questionários" no Prontuário**
   - Acesso: /pacientes/{patientId}/prontuario → Aba "Questionários"
   - Lista de questionários enviados para o paciente
   - Card para cada questionário:
     - Título
     - Enviado em: [Data]
     - Status: Pendente / Completo / Expirado
     - Se completo: Respondido em: [Data e Hora]
     - Ações:
       - Ver Respostas (se completo)
       - Lembrar Paciente (se pendente)
       - Reenviar (se expirado)
       - Exportar PDF (se completo)
       - Cancelar (se pendente)
   - Botão "Enviar Novo Questionário"

2. **Modal: Ver Respostas**
   - Cabeçalho: Título do questionário + Paciente + Data de resposta
   - Renderizar seções e perguntas com respostas
   - Formato:
     - Pergunta (bold)
     - → Resposta (indentada)
   - Botões: Fechar, Exportar PDF, Imprimir

3. **Exportação PDF**
   - Gerar PDF com:
     - Cabeçalho: Logo + Título
     - Paciente e data
     - Seções e perguntas com respostas
     - Rodapé: Nome do médico
   - Upload para Firebase Storage
   - Adicionar aos documentos do prontuário automaticamente

4. **Mapeamento Automático de Dados**
   - Ao submeter resposta:
     - Para cada pergunta com dataMapping:
       - Atualizar campo correspondente no banco
       - Ex: pergunta "Peso" → atualizar patients.weight
   - Registrar histórico de alterações

5. **Notificações**
   - Quando paciente completa questionário:
     - Notificar médico (toast no sistema + WhatsApp opcional)
   - Quando questionário expira sem resposta:
     - Atualizar status para "expired"

APIS:

```typescript
// GET /api/patients/:patientId/questionnaire-responses
// Lista respostas do paciente

// POST /api/questionnaire-responses/:responseId/generate-pdf
// Gera PDF da resposta

// POST /api/questionnaire-responses/:responseId/send-reminder
// Envia lembrete via WhatsApp

// POST /api/questionnaire-responses/:responseId/cancel
// Cancela resposta pendente
```

TECNOLOGIAS:
- PDFMake para geração de PDF
- Firebase Storage
- Shadcn/UI (Dialog, Card, Badge)

DESIGN:
- Modal de respostas com scroll
- Badges coloridos para status (verde=completo, amarelo=pendente, vermelho=expirado)
- PDF profissional

PRIORIZAÇÃO:
- Visualização de respostas funcional
- Integração com prontuário
- Exportação PDF básica
- Mapeamento de dados (MVP)
```

---

### PROMPT 6: Automações e Templates

```
Implemente automações e biblioteca de templates no CALYX:

CONTEXTO:
- Sistema de questionários completo funciona
- Stack: Next.js 14, TypeScript, Firebase Functions

FUNCIONALIDADES:

1. **Envio Automático para Novos Pacientes**
   - Configuração no questionário:
     - Checkbox "Enviar automaticamente para novos pacientes"
   - Trigger: Quando paciente é cadastrado
   - Enviar questionários marcados automaticamente

2. **Lembretes Automáticos**
   - Cron job (Firebase Functions ou Vercel Cron):
     - Rodar diariamente
     - Buscar respostas pendentes enviadas há X dias (configurável)
     - Enviar lembrete via WhatsApp
   - Mensagem: "Olá [Nome]! Lembrando que você ainda não respondeu o questionário '[Título]'. Acesse: [Link]"

3. **Expiração Automática**
   - Cron job:
     - Rodar diariamente
     - Buscar respostas pendentes com expiresAt < hoje
     - Atualizar status para "expired"

4. **Biblioteca de Templates**
   - Página: /questionarios/templates
   - Templates prontos:
     - Anamnese Inicial
     - Follow-up Nutricional
     - Recordatório Alimentar 24h
     - Pesquisa de Satisfação
     - Triagem de Risco Cardiovascular
     - Consentimento Informado
   - Card para cada template:
     - Título
     - Descrição
     - Preview (número de perguntas/seções)
     - Botão "Usar Template"
   - Ao clicar "Usar Template":
     - Duplicar questionário
     - Abrir editor para personalizar

5. **Seed de Templates**
   - Script para popular Firestore com templates
   - Executar uma vez no setup

APIS:

```typescript
// GET /api/questionnaires/templates
// Lista templates públicos

// POST /api/questionnaires/:id/duplicate
// Duplica questionário

// POST /api/questionnaires/seed-templates
// Popula templates (admin)
```

TECNOLOGIAS:
- Firebase Functions ou Vercel Cron para automações
- Firestore para persistência

DESIGN:
- Página de templates com grid de cards
- Preview visual dos templates

PRIORIZAÇÃO:
- Lembretes automáticos (alta prioridade)
- Biblioteca de templates (alta prioridade)
- Envio automático para novos pacientes (média)
- Expiração automática (baixa)
```

---

## Ordem de Implementação Recomendada

### Sistema de Indicações
1. PROMPT 1: Estrutura Base (2 dias)
2. PROMPT 2: Visualização e Dashboard (3 dias)

**Total: 5 dias**

### Sistema de Questionários
3. PROMPT 3: Construtor (4 dias)
4. PROMPT 4: Envio e Resposta (3 dias)
5. PROMPT 5: Visualização e Integração (2 dias)
6. PROMPT 6: Automações e Templates (2 dias)

**Total: 11 dias**

**Total Geral: 16 dias** (com Antigravity: ~8-10 dias)

---

## Dependências

- Sistema de Indicações: independente (pode começar agora)
- Sistema de Questionários: independente (pode começar agora)
- Ambos podem ser desenvolvidos em paralelo

---

## Checklist Final

### Sistema de Indicações
- [ ] Campos de indicação no cadastro de paciente
- [ ] Atualização de contadores
- [ ] Aba de indicações no perfil
- [ ] Visualização de árvore (React Flow)
- [ ] Dashboard de métricas
- [ ] Gráficos de evolução

### Sistema de Questionários
- [ ] Construtor de questionários
- [ ] Todos os tipos de perguntas
- [ ] Envio via WhatsApp
- [ ] Página de resposta pública
- [ ] Salvamento de rascunho
- [ ] Visualização de respostas
- [ ] Exportação PDF
- [ ] Mapeamento de dados
- [ ] Lembretes automáticos
- [ ] Biblioteca de templates

---

## Próximos Passos

1. Escolher qual módulo implementar primeiro (recomendo Questionários por ser mais útil imediatamente)
2. Copiar primeiro prompt
3. Colar no Antigravity
4. Revisar código gerado
5. Testar
6. Avançar para próximo prompt
