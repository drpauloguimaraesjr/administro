# CALYX - Especificação Completa: Prontuário Eletrônico

## Visão Geral

O Prontuário Eletrônico é o coração do CALYX. Deve ser acessível através da página de detalhes do paciente e permitir registro completo da história clínica, evoluções, documentos e prescrições.

---

## Arquitetura de Dados

### Modelo Principal: MedicalRecord

```typescript
interface MedicalRecord {
  id: string;
  patientId: string;
  clinicId: string;
  
  // Anamnese (primeira consulta)
  anamnesis: Anamnesis | null;
  
  // Evoluções (consultas de retorno)
  evolutions: Evolution[];
  
  // Documentos anexados
  documents: Document[];
  
  // Metadados
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

interface Anamnesis {
  id: string;
  
  // Identificação e Queixa
  chiefComplaint: string;              // Queixa principal
  historyOfPresentIllness: string;     // História da doença atual (HDA)
  
  // Antecedentes
  pastMedicalHistory: string;          // Antecedentes pessoais (doenças prévias)
  surgicalHistory: string;             // Cirurgias realizadas
  allergies: string;                   // Alergias
  currentMedications: string;          // Medicamentos em uso
  
  // História Familiar
  familyHistory: string;               // Antecedentes familiares
  
  // Hábitos de Vida
  smoking: 'never' | 'former' | 'current';
  smokingDetails?: string;
  alcohol: 'never' | 'occasional' | 'frequent';
  alcoholDetails?: string;
  physicalActivity: 'sedentary' | 'light' | 'moderate' | 'intense';
  physicalActivityDetails?: string;
  diet: string;                        // Hábitos alimentares
  
  // Exame Físico Inicial
  physicalExam: string;
  
  // Hipótese Diagnóstica Inicial
  initialDiagnosis: string;
  
  // Conduta Inicial
  initialTreatment: string;
  
  // Metadados
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

interface Evolution {
  id: string;
  appointmentId?: string;              // Vínculo com agendamento
  
  // Dados da Consulta
  date: string;                        // Data e hora do atendimento
  complaint: string;                   // Queixa/motivo da consulta
  subjectiveData: string;              // Dados subjetivos (S do SOAP)
  objectiveData: string;               // Dados objetivos (O do SOAP)
  assessment: string;                  // Avaliação/diagnóstico (A do SOAP)
  plan: string;                        // Plano/conduta (P do SOAP)
  
  // Exame Físico
  vitalSigns?: {
    bloodPressure?: string;            // PA (ex: "120/80")
    heartRate?: number;                // FC (bpm)
    temperature?: number;              // Temperatura (°C)
    weight?: number;                   // Peso (kg)
    height?: number;                   // Altura (cm)
    bmi?: number;                      // IMC (calculado)
  };
  
  physicalExam: string;                // Exame físico detalhado
  
  // Observações
  notes?: string;                      // Observações adicionais
  
  // Metadados
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

interface Document {
  id: string;
  type: 'exam' | 'report' | 'image' | 'prescription' | 'certificate' | 'other';
  category?: string;                   // Ex: "Laboratorial", "Imagem", "Laudo"
  name: string;
  description?: string;
  fileUrl: string;                     // Firebase Storage URL
  fileSize: number;                    // Bytes
  mimeType: string;                    // Ex: "application/pdf"
  
  // Metadados
  uploadedAt: string;
  uploadedBy: string;
}
```

### Coleções Firestore

```
/patients/{patientId}
  - Dados cadastrais do paciente

/medical_records/{recordId}
  - patientId: string
  - anamnesis: Anamnesis
  - evolutions: Evolution[]
  - documents: Document[]
  - createdAt, updatedAt, etc.

/appointments/{appointmentId}
  - Agendamentos (já existe)
```

---

## Interface do Usuário

### 1. Acesso ao Prontuário

**Fluxo:**
1. Usuário acessa módulo "Pacientes"
2. Clica em um paciente da lista
3. Página de detalhes do paciente abre com abas
4. Aba "Prontuário" é uma das principais

**URL:** `/pacientes/{patientId}/prontuario`

### 2. Layout da Página de Prontuário

```
┌─────────────────────────────────────────────────────────┐
│ [← Voltar] João da Silva - 45 anos                      │
│ [Perfil] [Consultas] [Prontuário] [Financeiro] [Docs]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PRONTUÁRIO                                              │
│                                                          │
│  [Anamnese] [Evoluções] [Documentos]                    │
│  ─────────────────────────────────────────────          │
│                                                          │
│  (Conteúdo da aba selecionada)                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 3. Aba: Anamnese

**Quando mostrar:**
- Se não existe anamnese → Mostrar botão "Criar Anamnese"
- Se existe → Mostrar anamnese em modo leitura + botão "Editar"

**Formulário de Anamnese:**

```
┌─────────────────────────────────────────────────────────┐
│ ANAMNESE                                    [Salvar] [X] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Identificação e Queixa                                   │
│ ─────────────────────────────────────────────          │
│ Queixa Principal *                                       │
│ [_______________________________________________]        │
│                                                          │
│ História da Doença Atual (HDA) *                         │
│ [Editor de Texto Rico - Tiptap]                         │
│                                                          │
│ Antecedentes                                             │
│ ─────────────────────────────────────────────          │
│ Antecedentes Pessoais (doenças prévias)                 │
│ [Editor de Texto Rico]                                  │
│                                                          │
│ Cirurgias Realizadas                                     │
│ [Editor de Texto Rico]                                  │
│                                                          │
│ Alergias                                                 │
│ [_______________________________________________]        │
│                                                          │
│ Medicamentos em Uso                                      │
│ [Editor de Texto Rico]                                  │
│                                                          │
│ História Familiar                                        │
│ ─────────────────────────────────────────────          │
│ Antecedentes Familiares                                  │
│ [Editor de Texto Rico]                                  │
│                                                          │
│ Hábitos de Vida                                          │
│ ─────────────────────────────────────────────          │
│ Tabagismo: ( ) Nunca fumou ( ) Ex-fumante ( ) Fumante  │
│ Detalhes: [_____________________________________]        │
│                                                          │
│ Etilismo: ( ) Não bebe ( ) Ocasional ( ) Frequente     │
│ Detalhes: [_____________________________________]        │
│                                                          │
│ Atividade Física:                                        │
│ ( ) Sedentário ( ) Leve ( ) Moderada ( ) Intensa       │
│ Detalhes: [_____________________________________]        │
│                                                          │
│ Hábitos Alimentares                                      │
│ [Editor de Texto Rico]                                  │
│                                                          │
│ Exame Físico Inicial                                     │
│ ─────────────────────────────────────────────          │
│ [Editor de Texto Rico]                                  │
│                                                          │
│ Hipótese Diagnóstica Inicial                             │
│ ─────────────────────────────────────────────          │
│ [Editor de Texto Rico]                                  │
│                                                          │
│ Conduta Inicial                                          │
│ ─────────────────────────────────────────────          │
│ [Editor de Texto Rico]                                  │
│                                                          │
│                              [Cancelar] [Salvar Anamnese]│
└─────────────────────────────────────────────────────────┘
```

**Validações:**
- Queixa Principal: obrigatório
- História da Doença Atual: obrigatório
- Demais campos: opcionais

**Ações:**
- Salvar → POST /api/medical-records/{recordId}/anamnesis
- Editar → PUT /api/medical-records/{recordId}/anamnesis

### 4. Aba: Evoluções

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ EVOLUÇÕES                           [+ Nova Evolução]    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Timeline (ordem cronológica decrescente)                 │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 📅 21/01/2026 14:30 - Dr. Paulo Guimarães       │    │
│ │ ─────────────────────────────────────────────   │    │
│ │ Queixa: Dor abdominal                            │    │
│ │                                                  │    │
│ │ Subjetivo: Paciente relata dor em região...     │    │
│ │                                                  │    │
│ │ Objetivo: PA: 120/80 | FC: 72 bpm | Temp: 36.5°C│    │
│ │ Abdome: flácido, indolor à palpação...          │    │
│ │                                                  │    │
│ │ Avaliação: Gastrite aguda                        │    │
│ │                                                  │    │
│ │ Plano: Omeprazol 20mg 1x/dia...                 │    │
│ │                                                  │    │
│ │                      [Editar] [Excluir] [Imprimir]│   │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 📅 15/01/2026 10:00 - Dr. Paulo Guimarães       │    │
│ │ ─────────────────────────────────────────────   │    │
│ │ Queixa: Primeira consulta                        │    │
│ │ (Resumo da evolução...)                          │    │
│ │                      [Editar] [Excluir] [Imprimir]│   │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Modal: Nova Evolução**

```
┌─────────────────────────────────────────────────────────┐
│ NOVA EVOLUÇÃO                               [Salvar] [X] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Data e Hora *                                            │
│ [21/01/2026] [14:30]                                    │
│                                                          │
│ Vincular a Consulta (opcional)                           │
│ [Dropdown: Selecione uma consulta]                      │
│                                                          │
│ Queixa/Motivo da Consulta *                              │
│ [_______________________________________________]        │
│                                                          │
│ Subjetivo (S) *                                          │
│ [Editor de Texto Rico - Tiptap]                         │
│                                                          │
│ Objetivo (O) *                                           │
│ ─────────────────────────────────────────────          │
│ Sinais Vitais (opcional)                                 │
│ PA: [______] FC: [___] bpm Temp: [___] °C               │
│ Peso: [___] kg Altura: [___] cm IMC: [___] (auto)      │
│                                                          │
│ Exame Físico Detalhado                                   │
│ [Editor de Texto Rico]                                  │
│                                                          │
│ Avaliação (A) *                                          │
│ [Editor de Texto Rico]                                  │
│                                                          │
│ Plano (P) *                                              │
│ [Editor de Texto Rico]                                  │
│                                                          │
│ Observações Adicionais                                   │
│ [Editor de Texto Rico]                                  │
│                                                          │
│                              [Cancelar] [Salvar Evolução]│
└─────────────────────────────────────────────────────────┘
```

**Validações:**
- Data e Hora: obrigatório
- Queixa: obrigatório
- Subjetivo, Objetivo, Avaliação, Plano: obrigatórios
- Sinais Vitais: opcionais
- IMC: calculado automaticamente se peso e altura preenchidos

**Ações:**
- Salvar → POST /api/medical-records/{recordId}/evolutions
- Editar → PUT /api/medical-records/{recordId}/evolutions/{evolutionId}
- Excluir → DELETE (com confirmação)
- Imprimir → Gerar PDF da evolução

### 5. Aba: Documentos

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ DOCUMENTOS                          [+ Upload Documento] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Filtros: [Todos] [Exames] [Laudos] [Imagens] [Outros]  │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 📄 Hemograma Completo.pdf                        │    │
│ │ Exame Laboratorial | 2.3 MB | 20/01/2026        │    │
│ │                   [Visualizar] [Download] [Excluir]│  │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 🖼️ Raio-X Tórax.jpg                              │    │
│ │ Imagem | 1.8 MB | 18/01/2026                     │    │
│ │                   [Visualizar] [Download] [Excluir]│  │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Modal: Upload Documento**

```
┌─────────────────────────────────────────────────────────┐
│ UPLOAD DE DOCUMENTO                         [Enviar] [X] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Tipo de Documento *                                      │
│ [Dropdown: Exame, Laudo, Imagem, Prescrição, Outro]    │
│                                                          │
│ Categoria (opcional)                                     │
│ [_______________________________________________]        │
│ Ex: "Laboratorial", "Raio-X", "Ultrassom"              │
│                                                          │
│ Nome do Documento *                                      │
│ [_______________________________________________]        │
│                                                          │
│ Descrição (opcional)                                     │
│ [_______________________________________________]        │
│                                                          │
│ Arquivo *                                                │
│ [Arrastar arquivo ou clicar para selecionar]            │
│ Formatos aceitos: PDF, JPG, PNG (máx 10MB)             │
│                                                          │
│                                [Cancelar] [Enviar Arquivo]│
└─────────────────────────────────────────────────────────┘
```

**Ações:**
- Upload → POST /api/medical-records/{recordId}/documents
  - Upload para Firebase Storage
  - Salvar metadata no Firestore
- Visualizar → Abrir em modal/nova aba
- Download → Download direto do Storage
- Excluir → DELETE (com confirmação)

---

## Editor de Texto Rico (Tiptap)

### Configuração Recomendada

```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Placeholder.configure({
      placeholder: 'Digite aqui...',
    }),
  ],
  content: initialContent,
  onUpdate: ({ editor }) => {
    const html = editor.getHTML();
    onChange(html);
  },
});
```

### Barra de Ferramentas

```
[B] [I] [U] [S] | [H1] [H2] [H3] | [•] [1.] | [←] [→] [↔] | [↶] [↷]
Bold Italic Underline Strike | Headings | Lists | Align | Undo/Redo
```

**Funcionalidades:**
- Negrito, Itálico, Sublinhado, Riscado
- Títulos (H1, H2, H3)
- Listas (ordenadas e não-ordenadas)
- Alinhamento (esquerda, centro, direita)
- Desfazer/Refazer

---

## APIs Backend

### Endpoints

#### 1. Anamnese

```typescript
// Criar anamnese
POST /api/medical-records/:recordId/anamnesis
Body: Anamnesis
Response: { success: true, data: Anamnesis }

// Atualizar anamnese
PUT /api/medical-records/:recordId/anamnesis
Body: Partial<Anamnesis>
Response: { success: true, data: Anamnesis }

// Buscar anamnese
GET /api/medical-records/:recordId/anamnesis
Response: { success: true, data: Anamnesis | null }
```

#### 2. Evoluções

```typescript
// Criar evolução
POST /api/medical-records/:recordId/evolutions
Body: Omit<Evolution, 'id' | 'createdAt' | 'createdBy'>
Response: { success: true, data: Evolution }

// Listar evoluções
GET /api/medical-records/:recordId/evolutions
Query: ?limit=20&offset=0
Response: { success: true, data: Evolution[], total: number }

// Atualizar evolução
PUT /api/medical-records/:recordId/evolutions/:evolutionId
Body: Partial<Evolution>
Response: { success: true, data: Evolution }

// Excluir evolução
DELETE /api/medical-records/:recordId/evolutions/:evolutionId
Response: { success: true }

// Gerar PDF de evolução
GET /api/medical-records/:recordId/evolutions/:evolutionId/pdf
Response: PDF file
```

#### 3. Documentos

```typescript
// Upload documento
POST /api/medical-records/:recordId/documents
Body: FormData (file + metadata)
Response: { success: true, data: Document }

// Listar documentos
GET /api/medical-records/:recordId/documents
Query: ?type=exam&limit=20
Response: { success: true, data: Document[] }

// Excluir documento
DELETE /api/medical-records/:recordId/documents/:documentId
Response: { success: true }
```

---

## Implementação Backend (Firebase)

### Estrutura de Pastas

```
backend/src/
├── routes/
│   └── medical-records.ts
├── controllers/
│   └── medical-records.controller.ts
├── services/
│   ├── medical-records.service.ts
│   └── storage.service.ts
├── validators/
│   └── medical-records.validator.ts
└── types/
    └── medical-records.types.ts
```

### Exemplo: Service

```typescript
// backend/src/services/medical-records.service.ts
import { getFirestore } from 'firebase-admin/firestore';
import { Anamnesis, Evolution, MedicalRecord } from '../types';

export class MedicalRecordsService {
  private db = getFirestore();

  async createAnamnesis(recordId: string, anamnesis: Anamnesis) {
    const recordRef = this.db.collection('medical_records').doc(recordId);
    
    await recordRef.update({
      anamnesis,
      updatedAt: new Date().toISOString(),
    });

    return anamnesis;
  }

  async createEvolution(recordId: string, evolution: Omit<Evolution, 'id'>) {
    const recordRef = this.db.collection('medical_records').doc(recordId);
    const evolutionId = this.db.collection('_').doc().id;

    const newEvolution: Evolution = {
      id: evolutionId,
      ...evolution,
      createdAt: new Date().toISOString(),
    };

    await recordRef.update({
      evolutions: admin.firestore.FieldValue.arrayUnion(newEvolution),
      updatedAt: new Date().toISOString(),
    });

    return newEvolution;
  }

  async getEvolutions(recordId: string, limit = 20, offset = 0) {
    const recordDoc = await this.db
      .collection('medical_records')
      .doc(recordId)
      .get();

    const record = recordDoc.data() as MedicalRecord;
    const evolutions = record.evolutions || [];

    // Ordenar por data decrescente
    evolutions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      data: evolutions.slice(offset, offset + limit),
      total: evolutions.length,
    };
  }
}
```

---

## Segurança e Permissões

### Regras Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Medical Records
    match /medical_records/{recordId} {
      // Apenas médicos autenticados podem ler/escrever
      allow read, write: if request.auth != null 
        && request.auth.token.role == 'doctor';
      
      // Logs de auditoria
      allow read: if request.auth != null 
        && request.auth.token.role == 'admin';
    }
  }
}
```

### Logs de Auditoria

Registrar todas as ações no prontuário:

```typescript
interface AuditLog {
  userId: string;
  action: 'create' | 'read' | 'update' | 'delete';
  resource: 'anamnesis' | 'evolution' | 'document';
  resourceId: string;
  timestamp: string;
  ipAddress?: string;
}

// Salvar em /audit_logs/{logId}
```

---

## Checklist de Implementação

### Fase 1: Estrutura Básica
- [ ] Criar modelos TypeScript (Anamnesis, Evolution, Document)
- [ ] Criar coleção `medical_records` no Firestore
- [ ] Configurar Firebase Storage para documentos
- [ ] Criar rotas backend básicas

### Fase 2: Anamnese
- [ ] Formulário de anamnese no frontend
- [ ] Integrar Tiptap para campos de texto rico
- [ ] API POST/PUT para anamnese
- [ ] Validação de campos obrigatórios
- [ ] Modo leitura vs edição

### Fase 3: Evoluções
- [ ] Timeline de evoluções
- [ ] Modal de nova evolução
- [ ] Cálculo automático de IMC
- [ ] API CRUD para evoluções
- [ ] Geração de PDF de evolução

### Fase 4: Documentos
- [ ] Upload de arquivos para Firebase Storage
- [ ] Listagem com filtros
- [ ] Visualização inline (PDF, imagens)
- [ ] Download de documentos
- [ ] Exclusão com confirmação

### Fase 5: Segurança
- [ ] Regras Firestore restritivas
- [ ] Logs de auditoria
- [ ] Validação de permissões
- [ ] Rate limiting

### Fase 6: UX
- [ ] Loading states
- [ ] Toast notifications
- [ ] Confirmações de ações destrutivas
- [ ] Empty states
- [ ] Responsividade mobile

---

## Estimativa de Esforço

| Fase | Descrição | Esforço |
|------|-----------|---------|
| 1 | Estrutura Básica | 1 dia |
| 2 | Anamnese | 2 dias |
| 3 | Evoluções | 3 dias |
| 4 | Documentos | 2 dias |
| 5 | Segurança | 1 dia |
| 6 | UX | 1 dia |
| **Total** | **Prontuário Completo** | **10 dias** |

Com Antigravity acelerando: **5-7 dias**
