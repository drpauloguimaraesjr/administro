# CALYX - Prompts para Antigravity

## Como Usar

Copie e cole cada prompt no Antigravity conforme a ordem das etapas do roadmap. Revise o código gerado antes de integrar ao projeto.

---

## ETAPA 0: Módulo Pacientes (MVP)

```
Crie o módulo de Pacientes no CALYX seguindo os padrões do sistema atual:

CONTEXTO DO SISTEMA:
- Sistema: CALYX - Prontuário Eletrônico e Gestão Médica
- Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI, Firebase (Firestore + Auth + Storage)
- Estrutura atual: /app/(medical)/ para rotas médicas
- Autenticação: Firebase Auth já configurada

ESTRUTURA DE DADOS:

```typescript
interface Patient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  birthDate: string;  // ISO 8601
  gender?: 'M' | 'F' | 'Outro';
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
```

FUNCIONALIDADES:

1. **Listagem de Pacientes** (/pacientes)
   - Tabela com colunas: Nome, CPF, Telefone, Email, Idade, Ações
   - Busca por nome ou CPF (filtro client-side)
   - Botão "Novo Paciente" (canto superior direito)
   - Paginação (20 por página)
   - Ação: "Ver Detalhes" (redireciona para /pacientes/{id})

2. **Formulário de Cadastro** (modal ou página /pacientes/novo)
   - Campos: Nome*, CPF*, Telefone*, Email, Data de Nascimento*, Gênero
   - Validação: CPF válido, telefone formato brasileiro, email válido
   - Botões: Cancelar, Salvar
   - Após salvar: redirecionar para página de detalhes

3. **Página de Detalhes** (/pacientes/{id})
   - Cabeçalho: Nome do paciente + idade
   - Abas: Perfil, Consultas, Prontuário, Financeiro
   - Aba "Perfil": mostrar dados cadastrais + botão "Editar"
   - Outras abas: empty state ("Em desenvolvimento")

APIS BACKEND (Next.js Route Handlers):

```typescript
// GET /api/patients
// Retorna lista de pacientes

// POST /api/patients
// Cria novo paciente

// GET /api/patients/:id
// Retorna dados de um paciente

// PUT /api/patients/:id
// Atualiza dados de um paciente

// DELETE /api/patients/:id
// Exclui paciente (soft delete)
```

TECNOLOGIAS:
- React Hook Form + Zod para validação
- Shadcn/UI para componentes (Table, Dialog, Form, Button, Input)
- Firestore para persistência (/patients collection)
- date-fns para manipulação de datas

DESIGN:
- Seguir padrão visual do sistema atual (cores, tipografia)
- Responsivo (mobile-first)
- Loading states (skeletons)
- Toast notifications (sucesso, erro)

PRIORIZAÇÃO:
- Foco em funcionalidade, não em design elaborado
- MVP: CRUD básico funcional
- Não implementar: bioimpedância, histórico médico completo, etc
```

---

## ETAPA 1: Prontuário - Estrutura Base

```
Crie a estrutura base do módulo Prontuário no CALYX:

CONTEXTO:
- Módulo Pacientes já existe (/pacientes)
- Prontuário é acessado via /pacientes/{patientId}/prontuario
- Stack: Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI, Firebase

ESTRUTURA DE DADOS:

```typescript
interface MedicalRecord {
  id: string;
  patientId: string;
  anamnesis: Anamnesis | null;
  evolutions: Evolution[];
  documents: Document[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

interface Anamnesis {
  id: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  // ... outros campos (ver especificação completa)
}

interface Evolution {
  id: string;
  date: string;
  complaint: string;
  subjectiveData: string;
  objectiveData: string;
  assessment: string;
  plan: string;
  // ... outros campos
}

interface Document {
  id: string;
  type: 'exam' | 'report' | 'image' | 'prescription' | 'other';
  name: string;
  fileUrl: string;
  uploadedAt: string;
}
```

FUNCIONALIDADES:

1. **Página de Prontuário** (/pacientes/{patientId}/prontuario)
   - Cabeçalho: Nome do paciente + "← Voltar"
   - Abas: Anamnese, Evoluções, Documentos
   - Cada aba: empty state inicial ("Nenhuma anamnese registrada", etc)

2. **Aba Anamnese**
   - Se não existe: botão "Criar Anamnese"
   - Se existe: mostrar em modo leitura + botão "Editar"

3. **Aba Evoluções**
   - Lista vazia: "Nenhuma evolução registrada" + botão "Nova Evolução"
   - Botão "Nova Evolução" sempre visível

4. **Aba Documentos**
   - Lista vazia: "Nenhum documento anexado" + botão "Upload Documento"
   - Botão "Upload Documento" sempre visível

APIS:

```typescript
// GET /api/patients/:patientId/medical-record
// Retorna prontuário completo ou cria se não existir

// POST /api/medical-records
// Cria novo prontuário
```

DESIGN:
- Tabs do Shadcn/UI
- Empty states com ícones (Lucide React)
- Botões primários para ações principais

PRIORIZAÇÃO:
- Apenas estrutura e navegação
- Não implementar formulários ainda (próximas etapas)
```

---

## ETAPA 2: Prontuário - Anamnese

```
Implemente o formulário completo de Anamnese no CALYX:

CONTEXTO:
- Estrutura base do Prontuário já existe
- Aba "Anamnese" precisa de formulário funcional
- Stack: Next.js 14, TypeScript, Tiptap para editor de texto rico

ESTRUTURA DE DADOS:

```typescript
interface Anamnesis {
  id: string;
  chiefComplaint: string;              // Queixa principal *
  historyOfPresentIllness: string;     // HDA *
  pastMedicalHistory: string;          // Antecedentes pessoais
  surgicalHistory: string;             // Cirurgias
  allergies: string;                   // Alergias
  currentMedications: string;          // Medicamentos em uso
  familyHistory: string;               // Antecedentes familiares
  smoking: 'never' | 'former' | 'current';
  smokingDetails?: string;
  alcohol: 'never' | 'occasional' | 'frequent';
  alcoholDetails?: string;
  physicalActivity: 'sedentary' | 'light' | 'moderate' | 'intense';
  physicalActivityDetails?: string;
  diet: string;                        // Hábitos alimentares
  physicalExam: string;                // Exame físico inicial
  initialDiagnosis: string;            // Hipótese diagnóstica
  initialTreatment: string;            // Conduta inicial
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
```

FUNCIONALIDADES:

1. **Formulário de Anamnese** (modal ou página separada)
   - Seções organizadas: Identificação, Antecedentes, Hábitos, Exame Físico, Diagnóstico
   - Campos de texto rico: usar Tiptap para HDA, antecedentes, exame físico, etc
   - Campos obrigatórios: Queixa Principal, HDA
   - Validação com Zod
   - Botões: Cancelar, Salvar

2. **Modo Leitura**
   - Mostrar anamnese formatada
   - Botão "Editar" no topo

3. **Integração Tiptap**
   - Barra de ferramentas: Bold, Italic, Underline, Headings, Lists, Align
   - Placeholder: "Digite aqui..."
   - Salvar como HTML

APIS:

```typescript
// POST /api/medical-records/:recordId/anamnesis
// Cria anamnese

// PUT /api/medical-records/:recordId/anamnesis
// Atualiza anamnese

// GET /api/medical-records/:recordId/anamnesis
// Busca anamnese
```

TECNOLOGIAS:
- @tiptap/react + @tiptap/starter-kit
- React Hook Form + Zod
- Shadcn/UI (Form, Input, Textarea, Select, RadioGroup)

DESIGN:
- Formulário longo: usar scroll
- Seções com títulos e separadores visuais
- Loading state ao salvar
- Toast de sucesso/erro

PRIORIZAÇÃO:
- Formulário completo e funcional
- Validação robusta
- Experiência de edição fluida
```

---

## ETAPA 3: Prontuário - Evoluções

```
Implemente o sistema de Evoluções com timeline no CALYX:

CONTEXTO:
- Prontuário com Anamnese já funciona
- Evoluções seguem método SOAP (Subjetivo, Objetivo, Avaliação, Plano)
- Stack: Next.js 14, TypeScript, Tiptap

ESTRUTURA DE DADOS:

```typescript
interface Evolution {
  id: string;
  appointmentId?: string;
  date: string;                        // Data e hora *
  complaint: string;                   // Queixa *
  subjectiveData: string;              // Subjetivo (S) *
  objectiveData: string;               // Objetivo (O) *
  assessment: string;                  // Avaliação (A) *
  plan: string;                        // Plano (P) *
  vitalSigns?: {
    bloodPressure?: string;            // PA
    heartRate?: number;                // FC (bpm)
    temperature?: number;              // Temp (°C)
    weight?: number;                   // Peso (kg)
    height?: number;                   // Altura (cm)
    bmi?: number;                      // IMC (calculado)
  };
  physicalExam: string;                // Exame físico detalhado
  notes?: string;                      // Observações
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
```

FUNCIONALIDADES:

1. **Timeline de Evoluções** (aba Evoluções)
   - Lista em ordem cronológica decrescente (mais recente primeiro)
   - Card para cada evolução com:
     - Data e hora
     - Queixa (título)
     - Resumo: Subjetivo, Objetivo, Avaliação, Plano (primeiras linhas)
     - Sinais vitais (se preenchidos)
     - Ações: Editar, Excluir, Imprimir
   - Botão "Nova Evolução" (topo)

2. **Modal: Nova Evolução**
   - Campos:
     - Data e Hora * (datetime-local)
     - Vincular a Consulta (dropdown opcional)
     - Queixa *
     - Subjetivo (S) * (Tiptap)
     - Sinais Vitais (PA, FC, Temp, Peso, Altura) → IMC calculado automaticamente
     - Exame Físico (Tiptap)
     - Objetivo (O) * (Tiptap)
     - Avaliação (A) * (Tiptap)
     - Plano (P) * (Tiptap)
     - Observações (Tiptap)
   - Validação: campos obrigatórios
   - Botões: Cancelar, Salvar

3. **Cálculo Automático de IMC**
   - Fórmula: IMC = peso / (altura/100)²
   - Atualizar em tempo real quando peso ou altura mudam
   - Mostrar classificação (Normal, Sobrepeso, etc)

4. **Ações**
   - Editar: abrir modal com dados preenchidos
   - Excluir: confirmação → DELETE
   - Imprimir: gerar PDF simples da evolução

APIS:

```typescript
// POST /api/medical-records/:recordId/evolutions
// Cria evolução

// GET /api/medical-records/:recordId/evolutions
// Lista evoluções (paginado)

// PUT /api/medical-records/:recordId/evolutions/:evolutionId
// Atualiza evolução

// DELETE /api/medical-records/:recordId/evolutions/:evolutionId
// Exclui evolução
```

TECNOLOGIAS:
- Tiptap para campos de texto rico
- React Hook Form + Zod
- date-fns para formatação de datas
- Shadcn/UI (Dialog, Form, Input, Card)

DESIGN:
- Timeline vertical com linha conectando cards
- Cards com sombra e hover
- Sinais vitais em grid (2 colunas)
- IMC com badge colorido (verde=normal, amarelo=sobrepeso, vermelho=obesidade)

PRIORIZAÇÃO:
- CRUD completo funcional
- Cálculo de IMC
- Timeline visual atraente
- Imprimir PDF (básico, sem design elaborado)
```

---

## ETAPA 4: Prontuário - Documentos

```
Implemente o sistema de upload e gestão de documentos no CALYX:

CONTEXTO:
- Prontuário com Anamnese e Evoluções já funciona
- Documentos são armazenados no Firebase Storage
- Stack: Next.js 14, TypeScript, Firebase Storage, react-dropzone

ESTRUTURA DE DADOS:

```typescript
interface Document {
  id: string;
  type: 'exam' | 'report' | 'image' | 'prescription' | 'certificate' | 'other';
  category?: string;                   // Ex: "Laboratorial", "Raio-X"
  name: string;                        // Nome do arquivo *
  description?: string;
  fileUrl: string;                     // Firebase Storage URL
  fileSize: number;                    // Bytes
  mimeType: string;                    // Ex: "application/pdf"
  uploadedAt: string;
  uploadedBy: string;
}
```

FUNCIONALIDADES:

1. **Listagem de Documentos** (aba Documentos)
   - Filtros: Todos, Exames, Laudos, Imagens, Prescrições, Outros
   - Card para cada documento:
     - Ícone baseado no tipo (📄 PDF, 🖼️ Imagem, etc)
     - Nome do arquivo
     - Tipo + Tamanho + Data
     - Ações: Visualizar, Download, Excluir
   - Botão "Upload Documento" (topo)

2. **Modal: Upload Documento**
   - Campos:
     - Tipo * (dropdown: Exame, Laudo, Imagem, Prescrição, Outro)
     - Categoria (text, opcional)
     - Nome * (text)
     - Descrição (textarea, opcional)
     - Arquivo * (drag-and-drop ou click)
   - Validação:
     - Formatos aceitos: PDF, JPG, PNG, JPEG
     - Tamanho máximo: 10MB
   - Upload para Firebase Storage: /medical_records/{recordId}/{fileName}
   - Botões: Cancelar, Enviar

3. **Visualização**
   - PDF: abrir em nova aba ou modal com iframe
   - Imagem: abrir em modal com zoom

4. **Download**
   - Download direto do Firebase Storage

5. **Exclusão**
   - Confirmação: "Tem certeza que deseja excluir este documento?"
   - DELETE do Firestore + Firebase Storage

APIS:

```typescript
// POST /api/medical-records/:recordId/documents
// Upload documento (multipart/form-data)
// 1. Upload para Storage
// 2. Salvar metadata no Firestore

// GET /api/medical-records/:recordId/documents
// Lista documentos (com filtro por tipo)

// DELETE /api/medical-records/:recordId/documents/:documentId
// Exclui documento (Firestore + Storage)
```

TECNOLOGIAS:
- react-dropzone para upload
- Firebase Storage para armazenamento
- Shadcn/UI (Dialog, Card, Badge)
- Lucide React para ícones

DESIGN:
- Grid de cards (3 colunas desktop, 1 mobile)
- Drag-and-drop area com borda tracejada
- Progress bar durante upload
- Toast de sucesso/erro

PRIORIZAÇÃO:
- Upload funcional e confiável
- Visualização básica (não precisa ser sofisticada)
- Exclusão com confirmação
```

---

## ETAPA 5: Prescrições - Estrutura Base

```
Crie a estrutura base do sistema de Prescrições no CALYX:

CONTEXTO:
- Prontuário completo já funciona
- Prescrições podem ser criadas a partir do Prontuário ou standalone
- Stack: Next.js 14, TypeScript, Firebase

ESTRUTURA DE DADOS:

```typescript
interface Prescription {
  id: string;
  patientId: string;
  medicalRecordId: string;
  doctorId: string;
  date: string;                        // Data de emissão
  type: 'simple' | 'controlled' | 'special';
  medications: Medication[];
  generalInstructions?: string;
  pdfUrl?: string;
  sentViaWhatsApp: boolean;
  sentAt?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

interface Medication {
  id: string;
  name: string;                        // Nome do medicamento *
  dosage: string;                      // Ex: "500mg" *
  form: string;                        // Ex: "Comprimido" *
  frequency: string;                   // Ex: "8/8h" *
  duration: string;                    // Ex: "7 dias" *
  route: string;                       // Ex: "Oral" *
  instructions?: string;               // Instruções específicas
  quantity?: string;                   // Ex: "30 comprimidos"
}

interface MedicationDatabase {
  id: string;
  name: string;
  activeIngredient: string;
  commonDosages: string[];
  forms: string[];
  commonFrequencies: string[];
  defaultRoute: string;
  isControlled: boolean;
  category: string;
}
```

FUNCIONALIDADES:

1. **Modal: Nova Prescrição**
   - Acesso: botão "Nova Prescrição" na aba Evoluções do Prontuário
   - Campos:
     - Paciente (readonly, preenchido automaticamente)
     - Data (date, default: hoje)
     - Tipo de Receita (radio: Simples, Controlada, Especial)
   - Seção "Medicamentos" (vazia inicialmente)
   - Botão "Adicionar Medicamento"
   - Botões: Cancelar, Salvar Rascunho

2. **Seed de Medicamentos**
   - Criar coleção /medications no Firestore
   - Seed com 50-100 medicamentos comuns (Omeprazol, Dipirona, Amoxicilina, etc)
   - Campos: name, activeIngredient, commonDosages, forms, commonFrequencies, defaultRoute, isControlled, category

3. **API de Busca**
   - Autocomplete para buscar medicamentos
   - Filtro por nome ou princípio ativo

APIS:

```typescript
// POST /api/prescriptions
// Cria prescrição

// GET /api/prescriptions?patientId={id}
// Lista prescrições do paciente

// GET /api/medications?q={query}
// Busca medicamentos (autocomplete)
```

TECNOLOGIAS:
- Shadcn/UI (Dialog, Form, RadioGroup)
- Firestore para persistência

DESIGN:
- Modal grande (fullscreen em mobile)
- Seção de medicamentos vazia com mensagem "Nenhum medicamento adicionado"

PRIORIZAÇÃO:
- Estrutura básica e seed de medicamentos
- Não implementar formulário de medicamentos ainda (próxima etapa)
```

---

## ETAPA 6: Prescrições - Interface Completa

```
Implemente o formulário completo de prescrições com múltiplos medicamentos no CALYX:

CONTEXTO:
- Estrutura base de prescrições já existe
- Seed de medicamentos já criado
- Stack: Next.js 14, TypeScript, MUI Autocomplete

FUNCIONALIDADES:

1. **Adicionar Medicamento**
   - Botão "Adicionar Medicamento" → adiciona novo card
   - Card de medicamento:
     - Autocomplete: Nome do medicamento * (busca em /medications)
     - Select: Dosagem * (opções do medicamento selecionado)
     - Select: Forma * (opções do medicamento)
     - Select: Frequência * (opções comuns: 1x/dia, 2x/dia, 6/6h, 8/8h, 12/12h, etc)
     - Input: Duração * (text, ex: "7 dias", "30 dias")
     - Select: Via * (Oral, Tópico, Sublingual, Injetável, etc)
     - Textarea: Instruções (opcional)
     - Input: Quantidade (opcional, ex: "30 comprimidos")
     - Botão "Remover" (canto superior direito)

2. **Autocomplete de Medicamentos**
   - Busca em tempo real (debounce 300ms)
   - Mostrar: Nome (Princípio Ativo)
   - Ao selecionar: preencher automaticamente dosagens, formas, frequências, via

3. **Validação**
   - Mínimo 1 medicamento
   - Todos os campos obrigatórios preenchidos
   - Data não pode ser futura

4. **Orientações Gerais**
   - Textarea grande (opcional)
   - Ex: "Manter hidratação adequada. Retornar em caso de piora."

5. **Ações**
   - Salvar Rascunho: salva sem gerar PDF
   - Visualizar: preview do PDF (próxima etapa)
   - Gerar PDF: gera e salva (próxima etapa)
   - Gerar e Enviar WhatsApp: gera, salva e envia (próxima etapa)

APIS:

```typescript
// PUT /api/prescriptions/:id
// Atualiza prescrição (rascunho)
```

TECNOLOGIAS:
- @mui/material (Autocomplete)
- Shadcn/UI (Select, Input, Textarea, Card)
- React Hook Form + Zod
- useFieldArray para múltiplos medicamentos

DESIGN:
- Cards de medicamentos numerados (1, 2, 3...)
- Botão "Adicionar Medicamento" sempre visível
- Scroll dentro do modal se muitos medicamentos

PRIORIZAÇÃO:
- Formulário dinâmico funcional
- Autocomplete responsivo
- Validação robusta
```

---

## ETAPA 7: Prescrições - Geração de PDF

```
Implemente a geração de PDF profissional para prescrições no CALYX:

CONTEXTO:
- Formulário de prescrições já funciona
- Precisa gerar PDF com template médico profissional
- Stack: Next.js 14, TypeScript, PDFMake ou jsPDF

TEMPLATE DE PDF:

Layout:
1. Cabeçalho do Médico
   - Nome completo
   - Especialidade
   - Registro (CRM/CRN + UF)
   - Endereço, Telefone, Email

2. Título: "PRESCRIÇÃO MÉDICA" (centralizado)

3. Dados do Paciente
   - Nome
   - Data de emissão

4. Lista de Medicamentos
   - Numeração (1, 2, 3...)
   - Nome + Dosagem + Forma
   - Posologia: "Tomar X, via Y, Z vezes ao dia"
   - Duração
   - Instruções (se houver)
   - Quantidade (se houver)

5. Orientações Gerais (se houver)

6. Assinatura
   - Linha para assinatura
   - Nome do médico
   - Registro profissional
   - Local e data por extenso

FUNCIONALIDADES:

1. **Botão "Visualizar"**
   - Gera preview do PDF em modal
   - Não salva ainda

2. **Botão "Gerar PDF"**
   - Gera PDF
   - Upload para Firebase Storage: /prescriptions/{prescriptionId}.pdf
   - Salva URL no Firestore
   - Adiciona aos documentos do prontuário automaticamente
   - Toast de sucesso
   - Fecha modal

3. **Dados do Médico**
   - Buscar de /doctors/{doctorId} ou user profile
   - Se não existir: usar dados do usuário logado

APIS:

```typescript
// POST /api/prescriptions/:id/generate-pdf
// 1. Busca prescrição
// 2. Busca dados do médico e paciente
// 3. Gera PDF com PDFMake
// 4. Upload para Storage
// 5. Atualiza prescrição com pdfUrl
// 6. Adiciona aos documentos do prontuário
// Response: { success: true, pdfUrl: string }
```

TECNOLOGIAS:
- pdfmake (recomendado) ou jspdf + html2canvas
- Firebase Storage
- date-fns para formatação de datas

DESIGN DO PDF:
- Fonte: Roboto ou Times New Roman
- Tamanho: A4
- Margens: 20mm
- Cabeçalho: centralizado, fonte 14-16pt
- Corpo: fonte 11-12pt
- Assinatura: linha de 8cm

PRIORIZAÇÃO:
- PDF funcional e legível
- Layout profissional (não precisa ser sofisticado)
- Upload e salvamento confiáveis
```

---

## ETAPA 8: Prescrições - Envio WhatsApp

```
Implemente o envio automático de prescrições via WhatsApp no CALYX:

CONTEXTO:
- Sistema de prescrições com geração de PDF já funciona
- Integração WhatsApp (Baileys) já existe no sistema
- Stack: Next.js 14, TypeScript, WhatsApp API

FUNCIONALIDADES:

1. **Botão "Gerar e Enviar WhatsApp"**
   - Gera PDF (se ainda não gerado)
   - Envia mensagem de texto + PDF para o paciente
   - Atualiza status: sentViaWhatsApp = true, sentAt = now
   - Toast de sucesso
   - Fecha modal

2. **Mensagem de Texto**
   Template:
   ```
   Olá [Nome do Paciente]!

   Segue sua prescrição médica referente à consulta de [Data].

   *Medicamentos prescritos:*
   1. [Nome] [Dosagem] - [Frequência]
   2. [Nome] [Dosagem] - [Frequência]

   Qualquer dúvida, estou à disposição.

   [Nome do Médico]
   ```

3. **Envio do PDF**
   - Enviar como documento (não imagem)
   - Nome do arquivo: "prescricao.pdf"

4. **Tratamento de Erros**
   - Se WhatsApp desconectado: toast de erro + sugestão de reconectar
   - Se número inválido: toast de erro
   - Se falha no envio: toast de erro + opção de tentar novamente

APIS:

```typescript
// POST /api/prescriptions/:id/send-whatsapp
// 1. Busca prescrição
// 2. Verifica se PDF já foi gerado (se não, gera)
// 3. Busca dados do paciente (telefone)
// 4. Envia mensagem de texto
// 5. Envia PDF
// 6. Atualiza status
// Response: { success: true }
```

INTEGRAÇÃO COM WHATSAPP:

```typescript
// Usar serviço existente
import { whatsappService } from '@/services/whatsapp';

// Enviar mensagem
await whatsappService.sendMessage(patient.phone, message);

// Enviar documento
await whatsappService.sendDocument(patient.phone, pdfUrl, 'prescricao.pdf');
```

TECNOLOGIAS:
- Serviço WhatsApp existente (Baileys)
- Firebase Storage (URL do PDF)

DESIGN:
- Loading state durante envio (spinner + "Enviando...")
- Toast de sucesso: "Prescrição enviada com sucesso!"
- Toast de erro: "Erro ao enviar prescrição. Verifique a conexão do WhatsApp."

PRIORIZAÇÃO:
- Envio funcional e confiável
- Tratamento de erros robusto
- Feedback visual claro
```

---

## ETAPA 9: Integração e Polish

```
Finalize a integração entre Prontuário e Prescrições e melhore a UX geral no CALYX:

CONTEXTO:
- Prontuário completo funciona
- Prescrições completas funcionam
- Precisa integrar e polir

FUNCIONALIDADES:

1. **Botão "Gerar Prescrição" na Evolução**
   - Adicionar botão ao lado de "Salvar Evolução"
   - Ao clicar: abre modal de prescrição com contexto preenchido
   - Vincular prescrição à evolução (appointmentId)

2. **Listagem de Prescrições do Paciente**
   - Nova aba no Prontuário: "Prescrições"
   - Lista todas as prescrições do paciente
   - Card para cada prescrição:
     - Data
     - Medicamentos (lista resumida)
     - Status: PDF gerado? Enviado WhatsApp?
     - Ações: Visualizar PDF, Reenviar WhatsApp, Excluir

3. **Vincular Prescrição ao Prontuário**
   - Quando prescrição é criada: adicionar automaticamente aos documentos
   - Tipo: "prescription"
   - Nome: "Prescrição - [Data]"

4. **Loading States**
   - Skeletons em todas as listagens
   - Spinners em botões durante ações
   - Progress bars em uploads

5. **Toast Notifications**
   - Sucesso: verde, ícone ✓
   - Erro: vermelho, ícone ✗
   - Info: azul, ícone ℹ
   - Posição: canto superior direito
   - Auto-dismiss: 3-5 segundos

6. **Confirmações**
   - Excluir evolução: "Tem certeza? Esta ação não pode ser desfeita."
   - Excluir documento: idem
   - Excluir prescrição: idem

7. **Empty States**
   - Ilustrações SVG (Lucide React ou Undraw)
   - Mensagem clara: "Nenhum [item] encontrado"
   - Call-to-action: botão primário

8. **Responsividade**
   - Mobile: menu hamburguer, cards empilhados, modals fullscreen
   - Tablet: layout adaptativo
   - Desktop: layout completo

9. **Performance**
   - Lazy loading de imagens
   - Paginação em listagens longas
   - Debounce em buscas (300ms)

TECNOLOGIAS:
- Shadcn/UI (Toast, Skeleton, AlertDialog)
- Lucide React (ícones)
- React Query (cache e loading states)

DESIGN:
- Consistência visual em todo o sistema
- Feedback visual em todas as ações
- Acessibilidade (ARIA labels, keyboard navigation)

PRIORIZAÇÃO:
- Integração completa funcional
- UX polida e profissional
- Sistema pronto para uso real
```

---

## Notas Finais

### Ordem de Execução
1. Executar prompts na ordem (0 → 9)
2. Testar cada etapa antes de avançar
3. Ajustar manualmente se necessário

### Revisão do Código Gerado
- Verificar tipos TypeScript
- Verificar validações Zod
- Verificar integração com Firebase
- Testar fluxo completo

### Próximos Passos
Após completar todas as etapas, o sistema estará pronto para:
- Uso em produção
- Testes com usuários reais
- Iterações de melhoria baseadas em feedback
