# CALYX - Sistema de Questionários

## Visão Geral

O Sistema de Questionários permite criar formulários personalizados, enviá-los para pacientes via WhatsApp/Email e coletar respostas estruturadas que são automaticamente armazenadas no banco de dados e vinculadas ao prontuário.

**Casos de Uso:**
- Anamnese pré-consulta (paciente preenche antes de chegar)
- Follow-up pós-consulta (acompanhamento de evolução)
- Pesquisa de satisfação
- Recordatório alimentar de 24h
- Diário de sintomas
- Questionários de triagem (ex: risco cardiovascular)
- Formulários de consentimento

---

## Arquitetura de Dados

### Modelos Principais

```typescript
interface Questionnaire {
  id: string;
  title: string;                       // Ex: "Anamnese Inicial"
  description?: string;
  type: 'anamnesis' | 'followup' | 'satisfaction' | 'screening' | 'consent' | 'custom';
  
  // Estrutura
  sections: QuestionnaireSection[];
  
  // Configurações
  settings: {
    allowMultipleResponses: boolean;   // Pode responder mais de uma vez?
    requiresAuth: boolean;             // Precisa estar logado?
    expiresAfterDays?: number;         // Expira após X dias
    sendReminder: boolean;             // Enviar lembrete?
    reminderAfterDays?: number;        // Lembrete após X dias
  };
  
  // Metadados
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  isActive: boolean;                   // Ativo ou arquivado
  responseCount: number;               // Total de respostas
}

interface QuestionnaireSection {
  id: string;
  title: string;                       // Ex: "Dados Pessoais"
  description?: string;
  order: number;                       // Ordem de exibição
  questions: Question[];
}

interface Question {
  id: string;
  text: string;                        // Pergunta *
  type: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'scale' | 'file';
  required: boolean;
  order: number;
  
  // Opções (para select, radio, checkbox)
  options?: string[];
  
  // Validação
  validation?: {
    min?: number;                      // Valor mínimo (number, scale)
    max?: number;                      // Valor máximo
    minLength?: number;                // Tamanho mínimo (text)
    maxLength?: number;                // Tamanho máximo
    pattern?: string;                  // Regex (text)
    fileTypes?: string[];              // Tipos aceitos (file)
    maxFileSize?: number;              // Tamanho máximo em MB
  };
  
  // Lógica condicional
  conditionalLogic?: {
    showIf: {
      questionId: string;
      operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
      value: any;
    };
  };
  
  // Mapeamento para banco de dados
  dataMapping?: {
    collection: string;                // Ex: "patients", "medical_records"
    field: string;                     // Ex: "weight", "bloodPressure"
  };
}

interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  patientId: string;
  
  // Respostas
  answers: Answer[];
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  startedAt?: string;
  completedAt?: string;
  
  // Envio
  sentVia: 'whatsapp' | 'email' | 'link' | 'in_person';
  sentAt: string;
  
  // Metadados
  createdAt: string;
  expiresAt?: string;
}

interface Answer {
  questionId: string;
  questionText: string;                // Guardar texto da pergunta para histórico
  value: any;                          // Resposta (string, number, array, etc)
  fileUrl?: string;                    // Se tipo file
}
```

### Coleções Firestore

```
/questionnaires/{questionnaireId}
  - Dados do questionário

/questionnaire_responses/{responseId}
  - Respostas dos pacientes

/patients/{patientId}/questionnaires/{responseId}
  - Subcoleção: respostas do paciente
```

---

## Funcionalidades

### 1. Construtor de Questionários

**Acesso:** Menu → "Questionários" → "Novo Questionário"

**Interface:**

```
┌─────────────────────────────────────────────────────────┐
│ NOVO QUESTIONÁRIO                                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Título: [Anamnese Inicial_____________________]         │
│                                                          │
│ Descrição (opcional):                                    │
│ [Formulário de coleta de dados antes da primeira        │
│  consulta]                                               │
│                                                          │
│ Tipo: [Anamnese ▼]                                      │
│                                                          │
│ ─────────────────────────────────────────────────────  │
│                                                          │
│ SEÇÕES                                                   │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 📋 Seção 1: Dados Pessoais              [↑] [↓] [×] ││
│ │                                                      ││
│ │ ┌──────────────────────────────────────────────────┐││
│ │ │ ❓ Pergunta 1                      [↑] [↓] [×]  │││
│ │ │ Qual é o seu peso atual?                         │││
│ │ │ Tipo: [Número ▼]                                 │││
│ │ │ ☑ Obrigatória                                    │││
│ │ │ Validação: Min: [0] Max: [300] kg                │││
│ │ │ Mapear para: [patients.weight]                   │││
│ │ └──────────────────────────────────────────────────┘││
│ │                                                      ││
│ │ ┌──────────────────────────────────────────────────┐││
│ │ │ ❓ Pergunta 2                      [↑] [↓] [×]  │││
│ │ │ Qual é a sua altura?                             │││
│ │ │ Tipo: [Número ▼]                                 │││
│ │ │ ☑ Obrigatória                                    │││
│ │ │ Validação: Min: [50] Max: [250] cm               │││
│ │ │ Mapear para: [patients.height]                   │││
│ │ └──────────────────────────────────────────────────┘││
│ │                                                      ││
│ │ [+ Adicionar Pergunta]                               ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ [+ Adicionar Seção]                                      │
│                                                          │
│ ─────────────────────────────────────────────────────  │
│                                                          │
│ CONFIGURAÇÕES                                            │
│                                                          │
│ ☑ Permitir múltiplas respostas                          │
│ ☐ Requer autenticação                                   │
│ ☑ Enviar lembrete após [3] dias                         │
│ ☑ Expira após [7] dias                                  │
│                                                          │
│                                    [Cancelar] [Salvar]   │
└─────────────────────────────────────────────────────────┘
```

### 2. Tipos de Perguntas

#### A) Texto Curto

```
Pergunta: Qual é o seu nome completo?
[_________________________________________________]
```

#### B) Texto Longo (Textarea)

```
Pergunta: Descreva seus hábitos alimentares:
[_________________________________________________]
[_________________________________________________]
[_________________________________________________]
[_________________________________________________]
```

#### C) Número

```
Pergunta: Qual é o seu peso atual? (kg)
[_____] kg
```

#### D) Data

```
Pergunta: Qual é a sua data de nascimento?
[__/__/____] 📅
```

#### E) Hora

```
Pergunta: A que horas você costuma jantar?
[__:__] 🕐
```

#### F) Seleção Única (Radio)

```
Pergunta: Você pratica atividade física?
( ) Sim, regularmente (3x ou mais por semana)
( ) Sim, ocasionalmente (1-2x por semana)
( ) Não
```

#### G) Seleção Múltipla (Checkbox)

```
Pergunta: Quais refeições você faz diariamente? (marque todas)
☐ Café da manhã
☐ Lanche da manhã
☐ Almoço
☐ Lanche da tarde
☐ Jantar
☐ Ceia
```

#### H) Dropdown (Select)

```
Pergunta: Qual é o seu nível de escolaridade?
[Selecione... ▼]
- Ensino Fundamental
- Ensino Médio
- Ensino Superior
- Pós-graduação
```

#### I) Escala (1-10)

```
Pergunta: Em uma escala de 1 a 10, qual é o seu nível de estresse?
1 ○──○──○──○──○──○──○──○──○──○ 10
  Baixo                      Alto
```

#### J) Upload de Arquivo

```
Pergunta: Anexe seus exames mais recentes:
[Arrastar arquivo ou clicar para selecionar]
Formatos aceitos: PDF, JPG, PNG (máx 10MB)
```

---

### 3. Envio de Questionários

**Fluxo:**

1. Selecionar questionário
2. Selecionar paciente(s)
3. Escolher canal (WhatsApp, Email, Link)
4. Enviar

**Interface:**

```
┌─────────────────────────────────────────────────────────┐
│ ENVIAR QUESTIONÁRIO                                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Questionário: [Anamnese Inicial ▼]                      │
│                                                          │
│ Enviar para:                                             │
│ ( ) Paciente específico                                 │
│     [Buscar paciente..._______________] 🔍              │
│                                                          │
│ ( ) Múltiplos pacientes                                 │
│     ☐ Maria Silva                                        │
│     ☐ João Santos                                        │
│     ☐ Ana Oliveira                                       │
│     [Selecionar Todos] [Limpar]                         │
│                                                          │
│ ( ) Novos pacientes automaticamente                     │
│     (enviar para todo paciente novo cadastrado)         │
│                                                          │
│ Canal de envio:                                          │
│ ( ) WhatsApp                                             │
│ ( ) Email                                                │
│ ( ) Gerar link (copiar para compartilhar)               │
│                                                          │
│ Mensagem personalizada (opcional):                       │
│ [Olá! Para otimizar sua consulta, por favor preencha   │
│  este formulário antes do atendimento.]                 │
│                                                          │
│                                    [Cancelar] [Enviar]   │
└─────────────────────────────────────────────────────────┘
```

**Mensagem WhatsApp:**

```
Olá Maria! 👋

Para otimizar sua consulta, por favor preencha este formulário antes do atendimento:

📋 Anamnese Inicial
⏱️ Tempo estimado: 5 minutos

Link: https://calyx.health/q/abc123

Qualquer dúvida, estou à disposição!

Dr. Paulo Guimarães
```

---

### 4. Página de Resposta (Paciente)

**URL:** `https://calyx.health/q/{responseId}`

**Interface:**

```
┌─────────────────────────────────────────────────────────┐
│ 🏥 CALYX                                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Anamnese Inicial                                         │
│ Dr. Paulo Guimarães                                      │
│                                                          │
│ Olá, Maria Silva!                                        │
│ Por favor, preencha este formulário para otimizar       │
│ sua consulta.                                            │
│                                                          │
│ ⏱️ Tempo estimado: 5 minutos                            │
│                                                          │
│ ─────────────────────────────────────────────────────  │
│                                                          │
│ SEÇÃO 1: DADOS PESSOAIS                                 │
│                                                          │
│ 1. Qual é o seu peso atual? (kg) *                      │
│    [_____] kg                                            │
│                                                          │
│ 2. Qual é a sua altura? (cm) *                          │
│    [_____] cm                                            │
│                                                          │
│ 3. Você pratica atividade física? *                     │
│    ( ) Sim, regularmente (3x ou mais por semana)        │
│    ( ) Sim, ocasionalmente (1-2x por semana)            │
│    ( ) Não                                               │
│                                                          │
│ ─────────────────────────────────────────────────────  │
│                                                          │
│ SEÇÃO 2: HÁBITOS ALIMENTARES                            │
│                                                          │
│ 4. Quais refeições você faz diariamente? *              │
│    ☐ Café da manhã                                       │
│    ☐ Lanche da manhã                                     │
│    ☐ Almoço                                              │
│    ☐ Lanche da tarde                                     │
│    ☐ Jantar                                              │
│    ☐ Ceia                                                │
│                                                          │
│ 5. Descreva seus hábitos alimentares: *                 │
│    [_____________________________________________]       │
│    [_____________________________________________]       │
│    [_____________________________________________]       │
│                                                          │
│ ─────────────────────────────────────────────────────  │
│                                                          │
│ [◀ Voltar]                  [Salvar Rascunho] [Enviar ▶]│
│                                                          │
│ Progresso: [████████████░░░░░░] 60%                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Salvamento automático (rascunho a cada 30s)
- Validação em tempo real
- Barra de progresso
- Navegação entre seções
- Responsivo (mobile-first)

---

### 5. Visualização de Respostas

**Acesso:** Prontuário do paciente → Aba "Questionários"

**Interface:**

```
┌─────────────────────────────────────────────────────────┐
│ QUESTIONÁRIOS - Maria Silva                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 📋 Anamnese Inicial                                 ││
│ │ Enviado em: 15/01/2026                              ││
│ │ Respondido em: 16/01/2026 10:30                     ││
│ │ Status: ✅ Completo                                 ││
│ │                                                      ││
│ │ [Ver Respostas] [Exportar PDF] [Reenviar]          ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 📊 Follow-up - 1 Mês                                ││
│ │ Enviado em: 20/01/2026                              ││
│ │ Status: ⏳ Pendente                                 ││
│ │                                                      ││
│ │ [Lembrar Paciente] [Cancelar]                       ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ [+ Enviar Novo Questionário]                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Modal: Ver Respostas**

```
┌─────────────────────────────────────────────────────────┐
│ RESPOSTAS - Anamnese Inicial                      [X]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Paciente: Maria Silva                                    │
│ Respondido em: 16/01/2026 10:30                         │
│                                                          │
│ ─────────────────────────────────────────────────────  │
│                                                          │
│ SEÇÃO 1: DADOS PESSOAIS                                 │
│                                                          │
│ 1. Qual é o seu peso atual? (kg)                        │
│    → 68 kg                                               │
│                                                          │
│ 2. Qual é a sua altura? (cm)                            │
│    → 165 cm                                              │
│                                                          │
│ 3. Você pratica atividade física?                       │
│    → Sim, ocasionalmente (1-2x por semana)              │
│                                                          │
│ ─────────────────────────────────────────────────────  │
│                                                          │
│ SEÇÃO 2: HÁBITOS ALIMENTARES                            │
│                                                          │
│ 4. Quais refeições você faz diariamente?                │
│    → Café da manhã, Almoço, Jantar                      │
│                                                          │
│ 5. Descreva seus hábitos alimentares:                   │
│    → Costumo comer bastante carboidrato no almoço       │
│      e jantar. Tenho dificuldade de comer verduras.     │
│      Bebo pouca água durante o dia.                     │
│                                                          │
│ ─────────────────────────────────────────────────────  │
│                                                          │
│                     [Fechar] [Exportar PDF] [Imprimir]  │
└─────────────────────────────────────────────────────────┘
```

---

### 6. Mapeamento Automático de Dados

**Conceito:** Respostas podem ser automaticamente salvas em campos do banco de dados.

**Exemplo:**

```typescript
// Pergunta
{
  id: 'q1',
  text: 'Qual é o seu peso atual? (kg)',
  type: 'number',
  dataMapping: {
    collection: 'patients',
    field: 'weight'
  }
}

// Ao responder "68"
// Sistema automaticamente atualiza:
await db.collection('patients').doc(patientId).update({
  weight: 68,
  weightUpdatedAt: new Date().toISOString()
});
```

**Campos Mapeáveis:**

| Pergunta | Mapeamento |
|----------|------------|
| Peso | `patients.weight` |
| Altura | `patients.height` |
| Pressão Arterial | `medical_records.evolutions[].vitalSigns.bloodPressure` |
| Alergias | `medical_records.anamnesis.allergies` |
| Medicamentos em uso | `medical_records.anamnesis.currentMedications` |

---

### 7. Dashboard de Questionários

**Acesso:** Menu → "Questionários"

**Interface:**

```
┌─────────────────────────────────────────────────────────┐
│ QUESTIONÁRIOS                                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [+ Novo Questionário] [Templates]                       │
│                                                          │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│ │ Total        │ │ Enviados     │ │ Taxa de      │    │
│ │ Criados      │ │ Este Mês     │ │ Resposta     │    │
│ │              │ │              │ │              │    │
│ │      8       │ │      45      │ │     78%      │    │
│ └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                          │
│ ─────────────────────────────────────────────────────  │
│                                                          │
│ MEUS QUESTIONÁRIOS                                       │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 📋 Anamnese Inicial                                 ││
│ │ Tipo: Anamnese | 12 perguntas | 3 seções            ││
│ │ Enviado: 156 vezes | Taxa de resposta: 82%         ││
│ │ [Editar] [Enviar] [Ver Respostas] [Duplicar] [×]   ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 📊 Follow-up - 1 Mês                                ││
│ │ Tipo: Follow-up | 8 perguntas | 2 seções            ││
│ │ Enviado: 89 vezes | Taxa de resposta: 65%          ││
│ │ [Editar] [Enviar] [Ver Respostas] [Duplicar] [×]   ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 😊 Pesquisa de Satisfação                           ││
│ │ Tipo: Satisfação | 5 perguntas | 1 seção            ││
│ │ Enviado: 234 vezes | Taxa de resposta: 91%         ││
│ │ [Editar] [Enviar] [Ver Respostas] [Duplicar] [×]   ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 8. Templates Prontos

**Biblioteca de Templates:**

1. **Anamnese Inicial**
   - Dados pessoais
   - Histórico médico
   - Hábitos de vida
   - Objetivos

2. **Follow-up Nutricional**
   - Peso atual
   - Adesão ao plano
   - Dificuldades encontradas
   - Evolução percebida

3. **Recordatório Alimentar 24h**
   - Café da manhã
   - Lanche da manhã
   - Almoço
   - Lanche da tarde
   - Jantar
   - Ceia

4. **Pesquisa de Satisfação**
   - Avaliação do atendimento (1-10)
   - Avaliação das instalações (1-10)
   - Recomendaria? (Sim/Não)
   - Sugestões

5. **Triagem de Risco Cardiovascular**
   - Idade
   - Pressão arterial
   - Colesterol
   - Diabetes
   - Tabagismo
   - Histórico familiar

6. **Consentimento Informado**
   - Explicação do tratamento
   - Riscos e benefícios
   - Concordo (checkbox)
   - Assinatura digital

---

## APIs Backend

### Endpoints

```typescript
// Criar questionário
POST /api/questionnaires
Body: Omit<Questionnaire, 'id' | 'createdAt'>
Response: { success: true, data: Questionnaire }

// Listar questionários
GET /api/questionnaires
Response: { success: true, data: Questionnaire[] }

// Buscar questionário por ID
GET /api/questionnaires/:id
Response: { success: true, data: Questionnaire }

// Atualizar questionário
PUT /api/questionnaires/:id
Body: Partial<Questionnaire>
Response: { success: true, data: Questionnaire }

// Excluir questionário
DELETE /api/questionnaires/:id
Response: { success: true }

// Enviar questionário
POST /api/questionnaires/:id/send
Body: {
  patientIds: string[];
  channel: 'whatsapp' | 'email' | 'link';
  customMessage?: string;
}
Response: { success: true, responseIds: string[] }

// Buscar resposta (paciente)
GET /api/questionnaire-responses/:responseId
Response: { success: true, data: QuestionnaireResponse }

// Salvar resposta parcial (rascunho)
PUT /api/questionnaire-responses/:responseId
Body: { answers: Answer[] }
Response: { success: true }

// Submeter resposta completa
POST /api/questionnaire-responses/:responseId/submit
Body: { answers: Answer[] }
Response: { success: true }

// Listar respostas do paciente
GET /api/patients/:patientId/questionnaire-responses
Response: { success: true, data: QuestionnaireResponse[] }

// Estatísticas
GET /api/questionnaires/:id/stats
Response: { 
  success: true, 
  data: {
    totalSent: number;
    totalCompleted: number;
    completionRate: number;
    avgTimeToComplete: number;
  }
}
```

---

## Automações

### 1. Envio Automático para Novos Pacientes

```typescript
// Trigger: Novo paciente cadastrado
async function onPatientCreated(patientId: string) {
  // Buscar questionários configurados para envio automático
  const autoQuestionnaires = await db
    .collection('questionnaires')
    .where('settings.sendToNewPatients', '==', true)
    .get();
  
  for (const doc of autoQuestionnaires.docs) {
    await sendQuestionnaire({
      questionnaireId: doc.id,
      patientIds: [patientId],
      channel: 'whatsapp'
    });
  }
}
```

### 2. Lembrete Automático

```typescript
// Cron job: Rodar diariamente
async function sendReminders() {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  
  // Buscar respostas pendentes enviadas há 3 dias
  const pendingResponses = await db
    .collection('questionnaire_responses')
    .where('status', '==', 'pending')
    .where('sentAt', '<=', threeDaysAgo.toISOString())
    .get();
  
  for (const doc of pendingResponses.docs) {
    const response = doc.data() as QuestionnaireResponse;
    const patient = await getPatient(response.patientId);
    const questionnaire = await getQuestionnaire(response.questionnaireId);
    
    await whatsappService.sendMessage(
      patient.phone,
      `Olá ${patient.name}! Lembrando que você ainda não respondeu o questionário "${questionnaire.title}". Por favor, acesse: https://calyx.health/q/${response.id}`
    );
  }
}
```

### 3. Expiração Automática

```typescript
// Cron job: Rodar diariamente
async function expireOldResponses() {
  const now = new Date();
  
  const expiredResponses = await db
    .collection('questionnaire_responses')
    .where('status', 'in', ['pending', 'in_progress'])
    .where('expiresAt', '<=', now.toISOString())
    .get();
  
  for (const doc of expiredResponses.docs) {
    await doc.ref.update({ status: 'expired' });
  }
}
```

---

## Exportação de Dados

### PDF de Respostas

```typescript
import pdfMake from 'pdfmake/build/pdfmake';

function generateResponsePDF(response: QuestionnaireResponse, questionnaire: Questionnaire, patient: Patient) {
  const docDefinition = {
    content: [
      { text: questionnaire.title, style: 'header' },
      { text: `Paciente: ${patient.name}`, margin: [0, 10, 0, 5] },
      { text: `Respondido em: ${formatDate(response.completedAt)}`, margin: [0, 0, 0, 20] },
      
      ...questionnaire.sections.map(section => [
        { text: section.title, style: 'sectionHeader', margin: [0, 10, 0, 5] },
        ...section.questions.map(question => {
          const answer = response.answers.find(a => a.questionId === question.id);
          return [
            { text: question.text, bold: true, margin: [0, 5, 0, 2] },
            { text: `→ ${formatAnswer(answer?.value, question.type)}`, margin: [10, 0, 0, 10] }
          ];
        })
      ])
    ],
    styles: {
      header: { fontSize: 18, bold: true },
      sectionHeader: { fontSize: 14, bold: true }
    }
  };
  
  return pdfMake.createPdf(docDefinition);
}
```

### Excel de Respostas Consolidadas

```typescript
import * as XLSX from 'xlsx';

async function exportResponsesToExcel(questionnaireId: string) {
  const responses = await db
    .collection('questionnaire_responses')
    .where('questionnaireId', '==', questionnaireId)
    .where('status', '==', 'completed')
    .get();
  
  const questionnaire = await getQuestionnaire(questionnaireId);
  
  // Cabeçalhos
  const headers = ['Paciente', 'Data Resposta', ...questionnaire.sections.flatMap(s => 
    s.questions.map(q => q.text)
  )];
  
  // Linhas
  const rows = await Promise.all(responses.docs.map(async doc => {
    const response = doc.data() as QuestionnaireResponse;
    const patient = await getPatient(response.patientId);
    
    return [
      patient.name,
      formatDate(response.completedAt),
      ...questionnaire.sections.flatMap(s =>
        s.questions.map(q => {
          const answer = response.answers.find(a => a.questionId === q.id);
          return formatAnswer(answer?.value, q.type);
        })
      )
    ];
  }));
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Respostas');
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}
```

---

## Checklist de Implementação

### Fase 1: Construtor de Questionários
- [ ] Modelo de dados (Questionnaire, Question)
- [ ] Interface de criação
- [ ] Adicionar/remover seções e perguntas
- [ ] Todos os tipos de perguntas
- [ ] Validações
- [ ] Salvar no Firestore

### Fase 2: Envio
- [ ] Interface de envio
- [ ] Seleção de pacientes
- [ ] Integração WhatsApp
- [ ] Integração Email
- [ ] Geração de link único

### Fase 3: Página de Resposta
- [ ] Interface responsiva
- [ ] Validação em tempo real
- [ ] Salvamento automático (rascunho)
- [ ] Barra de progresso
- [ ] Submissão

### Fase 4: Visualização
- [ ] Lista de questionários do paciente
- [ ] Modal de respostas
- [ ] Exportação PDF
- [ ] Integração com prontuário

### Fase 5: Automações
- [ ] Envio automático para novos pacientes
- [ ] Lembretes automáticos
- [ ] Expiração automática
- [ ] Notificações

### Fase 6: Mapeamento de Dados
- [ ] Configuração de mapeamento
- [ ] Atualização automática de campos
- [ ] Histórico de alterações

### Fase 7: Templates
- [ ] Biblioteca de templates
- [ ] Duplicação de questionários
- [ ] Importação/Exportação

---

## Estimativa de Esforço

| Fase | Descrição | Dias |
|------|-----------|------|
| 1 | Construtor | 4 |
| 2 | Envio | 2 |
| 3 | Página de Resposta | 3 |
| 4 | Visualização | 2 |
| 5 | Automações | 2 |
| 6 | Mapeamento | 2 |
| 7 | Templates | 1 |
| **Total** | **Sistema Completo** | **16 dias** |

Com Antigravity: **8-10 dias**

---

## Melhorias Futuras

- [ ] Lógica condicional avançada (mostrar pergunta X se resposta Y)
- [ ] Cálculo de scores (ex: risco cardiovascular)
- [ ] Assinatura digital (canvas)
- [ ] Questionários multi-idioma
- [ ] Análise de sentimento nas respostas abertas
- [ ] Integração com Google Forms / Typeform
- [ ] App mobile nativo para pacientes
- [ ] Notificações push
- [ ] Gamificação (pontos por responder)
- [ ] Dashboard de análise de dados (BI)
