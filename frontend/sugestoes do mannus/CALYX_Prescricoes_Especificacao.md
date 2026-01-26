# CALYX - Especificação Completa: Sistema de Prescrições

## Visão Geral

O Sistema de Prescrições permite ao médico criar receituários médicos profissionais, com geração automática de PDF, envio por WhatsApp e armazenamento no prontuário do paciente.

---

## Arquitetura de Dados

### Modelo Principal: Prescription

```typescript
interface Prescription {
  id: string;
  patientId: string;
  medicalRecordId: string;
  doctorId: string;
  
  // Dados da Prescrição
  date: string;                        // Data de emissão
  type: 'simple' | 'controlled' | 'special';  // Tipo de receita
  
  // Medicamentos
  medications: Medication[];
  
  // Orientações Gerais
  generalInstructions?: string;        // Orientações adicionais
  
  // PDF Gerado
  pdfUrl?: string;                     // URL do PDF no Storage
  pdfGeneratedAt?: string;
  
  // Envio WhatsApp
  sentViaWhatsApp: boolean;
  sentAt?: string;
  
  // Metadados
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

interface Medication {
  id: string;                          // ID único do medicamento na prescrição
  name: string;                        // Nome do medicamento
  dosage: string;                      // Dosagem (ex: "500mg", "10ml")
  form: string;                        // Forma farmacêutica (comprimido, cápsula, etc)
  frequency: string;                   // Frequência (ex: "8/8h", "2x/dia")
  duration: string;                    // Duração (ex: "7 dias", "30 dias", "uso contínuo")
  route: string;                       // Via de administração (oral, tópico, etc)
  instructions?: string;               // Instruções específicas (ex: "tomar em jejum")
  quantity?: string;                   // Quantidade a ser dispensada
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  crm: string;                         // CRM + UF (ex: "CRM/SP 123456")
  address: string;
  phone: string;
  email: string;
}
```

### Coleções Firestore

```
/prescriptions/{prescriptionId}
  - patientId: string
  - medicalRecordId: string
  - doctorId: string
  - medications: Medication[]
  - pdfUrl: string
  - createdAt, etc.

/doctors/{doctorId}
  - Dados do médico (nome, CRM, etc)
```

---

## Interface do Usuário

### 1. Acesso ao Sistema de Prescrições

**Fluxos de Acesso:**

#### A) A partir do Prontuário
1. Usuário está na página de Prontuário do paciente
2. Aba "Evoluções" → Botão "Nova Prescrição" ao lado de "Nova Evolução"
3. Modal de prescrição abre

#### B) A partir da Consulta
1. Usuário está registrando uma evolução
2. Campo "Plano (P)" → Botão "Gerar Prescrição"
3. Modal de prescrição abre com contexto da consulta

#### C) Acesso Direto
1. Menu superior → "Prescrições"
2. Lista de todas as prescrições
3. Botão "Nova Prescrição"

### 2. Modal: Nova Prescrição

```
┌─────────────────────────────────────────────────────────────────┐
│ NOVA PRESCRIÇÃO                        [Visualizar] [Salvar] [X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Paciente: João da Silva - 45 anos                               │
│ Data: [21/01/2026]                                              │
│                                                                  │
│ Tipo de Receita                                                  │
│ ( ) Simples  ( ) Controlada  ( ) Especial                      │
│                                                                  │
│ ─────────────────────────────────────────────────────────────  │
│                                                                  │
│ MEDICAMENTOS                                                     │
│                                                                  │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ 1. Omeprazol                                    [Remover]  │  │
│ │    Dosagem: [20mg ▼]  Forma: [Cápsula ▼]                 │  │
│ │    Frequência: [1x ao dia ▼]                               │  │
│ │    Duração: [30 dias]                                      │  │
│ │    Via: [Oral ▼]                                           │  │
│ │    Instruções: [Tomar em jejum, 30min antes do café]     │  │
│ │    Quantidade: [30 cápsulas]                               │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ 2. Dipirona                                     [Remover]  │  │
│ │    Dosagem: [500mg ▼]  Forma: [Comprimido ▼]             │  │
│ │    Frequência: [6/6h ▼]                                    │  │
│ │    Duração: [Se necessário]                                │  │
│ │    Via: [Oral ▼]                                           │  │
│ │    Instruções: [Tomar em caso de dor ou febre]           │  │
│ │    Quantidade: [20 comprimidos]                            │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│ [+ Adicionar Medicamento]                                        │
│                                                                  │
│ ─────────────────────────────────────────────────────────────  │
│                                                                  │
│ ORIENTAÇÕES GERAIS (opcional)                                    │
│ [_____________________________________________________________]  │
│ [_____________________________________________________________]  │
│ [_____________________________________________________________]  │
│                                                                  │
│                                                                  │
│ [Cancelar] [Salvar Rascunho] [Gerar PDF] [Gerar e Enviar WhatsApp]│
└─────────────────────────────────────────────────────────────────┘
```

### 3. Campos e Validações

#### Medicamento

| Campo | Tipo | Obrigatório | Opções/Validação |
|-------|------|-------------|------------------|
| Nome | Text | Sim | Autocomplete com banco de medicamentos |
| Dosagem | Select | Sim | Dropdown com opções comuns (10mg, 20mg, 500mg, etc) |
| Forma | Select | Sim | Comprimido, Cápsula, Solução, Xarope, Pomada, etc |
| Frequência | Select | Sim | 1x/dia, 2x/dia, 3x/dia, 6/6h, 8/8h, 12/12h, etc |
| Duração | Text | Sim | Ex: "7 dias", "30 dias", "uso contínuo" |
| Via | Select | Sim | Oral, Tópico, Sublingual, Injetável, etc |
| Instruções | Textarea | Não | Texto livre |
| Quantidade | Text | Não | Ex: "30 comprimidos", "1 frasco" |

#### Validações Gerais
- Mínimo 1 medicamento
- Todos os campos obrigatórios preenchidos
- Data não pode ser futura
- Tipo de receita selecionado

### 4. Botão "Visualizar"

Ao clicar em "Visualizar", abre preview do PDF em modal:

```
┌─────────────────────────────────────────────────────────┐
│ PREVIEW DA PRESCRIÇÃO                              [X]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Preview do PDF renderizado]                            │
│                                                          │
│                                                          │
│                                     [Fechar] [Gerar PDF] │
└─────────────────────────────────────────────────────────┘
```

---

## Template de PDF

### Layout da Receita

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │  Dr. Paulo Guimarães Júnior                      │  │
│  │  Nutricionista                                    │  │
│  │  CRN/SP 12345                                     │  │
│  │                                                   │  │
│  │  Rua das Flores, 123 - São Paulo/SP              │  │
│  │  Tel: (11) 98765-4321                            │  │
│  │  drpauloguimaraesjr@gmail.com                    │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                          │
│                    PRESCRIÇÃO MÉDICA                     │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                          │
│  Paciente: João da Silva                                 │
│  Data: 21/01/2026                                        │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  1. Omeprazol 20mg - Cápsula                            │
│     Tomar 1 cápsula, via oral, 1x ao dia                │
│     Duração: 30 dias                                     │
│     Instruções: Tomar em jejum, 30min antes do café     │
│     Quantidade: 30 cápsulas                              │
│                                                          │
│  2. Dipirona 500mg - Comprimido                         │
│     Tomar 1 comprimido, via oral, de 6 em 6 horas       │
│     Duração: Se necessário                               │
│     Instruções: Tomar em caso de dor ou febre           │
│     Quantidade: 20 comprimidos                           │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  ORIENTAÇÕES GERAIS:                                     │
│  Manter hidratação adequada. Retornar em caso de        │
│  piora dos sintomas.                                     │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│                                                          │
│                                                          │
│                    _____________________________         │
│                    Dr. Paulo Guimarães Júnior           │
│                    CRN/SP 12345                         │
│                                                          │
│  São Paulo, 21 de janeiro de 2026                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Elementos do Template

1. **Cabeçalho do Médico**
   - Nome completo
   - Especialidade
   - Registro profissional (CRM/CRN + UF)
   - Endereço
   - Telefone
   - Email

2. **Título**
   - "PRESCRIÇÃO MÉDICA" centralizado

3. **Dados do Paciente**
   - Nome completo
   - Data de emissão

4. **Lista de Medicamentos**
   - Numeração sequencial
   - Nome + Dosagem + Forma
   - Posologia completa
   - Duração do tratamento
   - Instruções específicas
   - Quantidade a ser dispensada

5. **Orientações Gerais**
   - Texto livre (se preenchido)

6. **Assinatura**
   - Linha para assinatura
   - Nome do médico
   - Registro profissional
   - Local e data por extenso

---

## Geração de PDF

### Biblioteca Recomendada: jsPDF + html2canvas

```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

async function generatePrescriptionPDF(prescription: Prescription, doctor: Doctor, patient: Patient) {
  // Renderizar template HTML
  const template = renderPrescriptionTemplate(prescription, doctor, patient);
  
  // Converter HTML para canvas
  const canvas = await html2canvas(template);
  const imgData = canvas.toDataURL('image/png');
  
  // Criar PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  
  // Salvar no Firebase Storage
  const pdfBlob = pdf.output('blob');
  const fileName = `prescriptions/${prescription.id}.pdf`;
  const storageRef = storage.ref(fileName);
  await storageRef.put(pdfBlob);
  
  // Obter URL pública
  const pdfUrl = await storageRef.getDownloadURL();
  
  return pdfUrl;
}
```

### Alternativa: PDFMake

```typescript
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

function generatePrescriptionPDF(prescription: Prescription, doctor: Doctor, patient: Patient) {
  const docDefinition = {
    content: [
      // Cabeçalho
      {
        text: doctor.name,
        style: 'header',
        alignment: 'center'
      },
      {
        text: `${doctor.specialty}\n${doctor.crm}`,
        style: 'subheader',
        alignment: 'center'
      },
      {
        text: `${doctor.address}\nTel: ${doctor.phone}\n${doctor.email}`,
        style: 'contact',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      
      // Linha separadora
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] },
      
      // Título
      {
        text: 'PRESCRIÇÃO MÉDICA',
        style: 'title',
        alignment: 'center',
        margin: [0, 20, 0, 20]
      },
      
      // Linha separadora
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] },
      
      // Dados do paciente
      {
        text: `Paciente: ${patient.name}`,
        margin: [0, 20, 0, 5]
      },
      {
        text: `Data: ${formatDate(prescription.date)}`,
        margin: [0, 0, 0, 20]
      },
      
      // Medicamentos
      ...prescription.medications.map((med, index) => ({
        stack: [
          { text: `${index + 1}. ${med.name} ${med.dosage} - ${med.form}`, bold: true },
          { text: `   Tomar ${med.frequency}, via ${med.route}` },
          { text: `   Duração: ${med.duration}` },
          med.instructions ? { text: `   Instruções: ${med.instructions}`, italics: true } : {},
          med.quantity ? { text: `   Quantidade: ${med.quantity}` } : {},
          { text: ' ' } // Espaço entre medicamentos
        ]
      })),
      
      // Orientações gerais
      prescription.generalInstructions ? {
        text: 'ORIENTAÇÕES GERAIS:',
        bold: true,
        margin: [0, 20, 0, 5]
      } : {},
      prescription.generalInstructions ? {
        text: prescription.generalInstructions,
        margin: [0, 0, 0, 40]
      } : {},
      
      // Assinatura
      {
        text: '_____________________________',
        alignment: 'center',
        margin: [0, 60, 0, 5]
      },
      {
        text: doctor.name,
        alignment: 'center'
      },
      {
        text: doctor.crm,
        alignment: 'center'
      },
      {
        text: `${doctor.address.split(',')[1]}, ${formatDateExtensive(prescription.date)}`,
        alignment: 'center',
        margin: [0, 20, 0, 0]
      }
    ],
    
    styles: {
      header: { fontSize: 16, bold: true },
      subheader: { fontSize: 12 },
      contact: { fontSize: 10 },
      title: { fontSize: 18, bold: true },
    }
  };
  
  return pdfMake.createPdf(docDefinition);
}
```

---

## Envio via WhatsApp

### Fluxo

1. Usuário clica em "Gerar e Enviar WhatsApp"
2. Sistema gera PDF
3. Sistema faz upload do PDF para Storage
4. Sistema envia mensagem via API WhatsApp (Baileys)

### Implementação

```typescript
async function sendPrescriptionViaWhatsApp(
  prescription: Prescription, 
  patient: Patient,
  pdfUrl: string
) {
  const message = `
Olá ${patient.name}!

Segue sua prescrição médica referente à consulta de ${formatDate(prescription.date)}.

*Medicamentos prescritos:*
${prescription.medications.map((med, i) => 
  `${i + 1}. ${med.name} ${med.dosage} - ${med.frequency}`
).join('\n')}

Qualquer dúvida, estou à disposição.

Dr. Paulo Guimarães
  `.trim();

  // Enviar mensagem de texto
  await whatsappService.sendMessage(patient.phone, message);
  
  // Enviar PDF
  await whatsappService.sendDocument(patient.phone, pdfUrl, 'prescricao.pdf');
  
  // Atualizar registro
  await db.collection('prescriptions').doc(prescription.id).update({
    sentViaWhatsApp: true,
    sentAt: new Date().toISOString()
  });
}
```

---

## Banco de Medicamentos

### Estrutura

```typescript
interface MedicationDatabase {
  id: string;
  name: string;                        // Nome comercial
  activeIngredient: string;            // Princípio ativo
  commonDosages: string[];             // Ex: ["10mg", "20mg", "40mg"]
  forms: string[];                     // Ex: ["Comprimido", "Cápsula"]
  commonFrequencies: string[];         // Ex: ["1x/dia", "2x/dia"]
  defaultRoute: string;                // Via padrão
  isControlled: boolean;               // Receita controlada?
  category: string;                    // Categoria terapêutica
}
```

### Seed Inicial

Criar seed com medicamentos mais comuns:

```typescript
const commonMedications = [
  {
    name: 'Omeprazol',
    activeIngredient: 'Omeprazol',
    commonDosages: ['20mg', '40mg'],
    forms: ['Cápsula'],
    commonFrequencies: ['1x/dia', '2x/dia'],
    defaultRoute: 'Oral',
    isControlled: false,
    category: 'Antiulceroso'
  },
  {
    name: 'Dipirona',
    activeIngredient: 'Dipirona sódica',
    commonDosages: ['500mg', '1g'],
    forms: ['Comprimido', 'Solução oral', 'Injetável'],
    commonFrequencies: ['6/6h', '8/8h', 'Se necessário'],
    defaultRoute: 'Oral',
    isControlled: false,
    category: 'Analgésico'
  },
  {
    name: 'Amoxicilina',
    activeIngredient: 'Amoxicilina',
    commonDosages: ['500mg', '875mg'],
    forms: ['Cápsula', 'Comprimido', 'Suspensão'],
    commonFrequencies: ['8/8h', '12/12h'],
    defaultRoute: 'Oral',
    isControlled: false,
    category: 'Antibiótico'
  },
  // ... adicionar mais 50-100 medicamentos comuns
];
```

### Autocomplete

```typescript
import { Autocomplete } from '@mui/material';

<Autocomplete
  options={medications}
  getOptionLabel={(option) => `${option.name} (${option.activeIngredient})`}
  onChange={(event, value) => {
    if (value) {
      // Preencher campos automaticamente
      setSelectedMedication(value);
      setDosageOptions(value.commonDosages);
      setFormOptions(value.forms);
      setFrequencyOptions(value.commonFrequencies);
      setRoute(value.defaultRoute);
    }
  }}
  renderInput={(params) => (
    <TextField {...params} label="Nome do Medicamento" />
  )}
/>
```

---

## APIs Backend

### Endpoints

```typescript
// Criar prescrição
POST /api/prescriptions
Body: Omit<Prescription, 'id' | 'createdAt' | 'pdfUrl'>
Response: { success: true, data: Prescription }

// Listar prescrições do paciente
GET /api/prescriptions?patientId={patientId}
Response: { success: true, data: Prescription[] }

// Buscar prescrição por ID
GET /api/prescriptions/:id
Response: { success: true, data: Prescription }

// Gerar PDF
POST /api/prescriptions/:id/generate-pdf
Response: { success: true, pdfUrl: string }

// Enviar via WhatsApp
POST /api/prescriptions/:id/send-whatsapp
Response: { success: true }

// Atualizar prescrição (rascunho)
PUT /api/prescriptions/:id
Body: Partial<Prescription>
Response: { success: true, data: Prescription }

// Excluir prescrição
DELETE /api/prescriptions/:id
Response: { success: true }

// Buscar medicamentos (autocomplete)
GET /api/medications?q={query}
Response: { success: true, data: MedicationDatabase[] }
```

---

## Integração com Prontuário

### Vincular Prescrição ao Prontuário

Quando uma prescrição é criada, ela deve ser automaticamente adicionada aos documentos do prontuário:

```typescript
async function createPrescription(data: CreatePrescriptionDTO) {
  // 1. Criar prescrição
  const prescription = await prescriptionsService.create(data);
  
  // 2. Gerar PDF
  const pdfUrl = await generatePrescriptionPDF(prescription);
  
  // 3. Atualizar prescrição com URL do PDF
  await prescriptionsService.update(prescription.id, { pdfUrl });
  
  // 4. Adicionar aos documentos do prontuário
  await medicalRecordsService.addDocument(data.medicalRecordId, {
    type: 'prescription',
    name: `Prescrição - ${formatDate(prescription.date)}`,
    fileUrl: pdfUrl,
    uploadedAt: new Date().toISOString(),
    uploadedBy: data.createdBy
  });
  
  return prescription;
}
```

---

## Checklist de Implementação

### Fase 1: Estrutura Básica
- [ ] Criar modelo TypeScript (Prescription, Medication)
- [ ] Criar coleção `prescriptions` no Firestore
- [ ] Criar seed de medicamentos comuns
- [ ] Criar rotas backend básicas

### Fase 2: Interface
- [ ] Modal de nova prescrição
- [ ] Formulário de medicamentos (adicionar/remover)
- [ ] Autocomplete de medicamentos
- [ ] Validação de campos obrigatórios
- [ ] Preview do PDF

### Fase 3: Geração de PDF
- [ ] Template HTML da receita
- [ ] Integração jsPDF ou PDFMake
- [ ] Upload para Firebase Storage
- [ ] Geração de URL pública

### Fase 4: Envio WhatsApp
- [ ] Integração com serviço WhatsApp existente
- [ ] Envio de mensagem + PDF
- [ ] Atualização de status de envio
- [ ] Confirmação visual

### Fase 5: Integração
- [ ] Vincular prescrição ao prontuário
- [ ] Adicionar aos documentos automaticamente
- [ ] Botão "Gerar Prescrição" na evolução
- [ ] Listagem de prescrições do paciente

### Fase 6: UX
- [ ] Loading states
- [ ] Toast notifications
- [ ] Confirmações
- [ ] Responsividade

---

## Estimativa de Esforço

| Fase | Descrição | Esforço |
|------|-----------|---------|
| 1 | Estrutura Básica | 1 dia |
| 2 | Interface | 2 dias |
| 3 | Geração de PDF | 2 dias |
| 4 | Envio WhatsApp | 1 dia |
| 5 | Integração | 1 dia |
| 6 | UX | 1 dia |
| **Total** | **Sistema Completo** | **8 dias** |

Com Antigravity acelerando: **4-5 dias**

---

## Melhorias Futuras

### Fase 2 (Opcional)
- [ ] Templates de prescrições (salvar prescrições frequentes)
- [ ] Histórico de prescrições do paciente
- [ ] Assinatura digital (certificado A1/A3)
- [ ] Impressão direta (sem gerar PDF)
- [ ] Receita de controle especial (formulário específico)
- [ ] Integração com farmácias (envio digital)
- [ ] Relatório de medicamentos mais prescritos
- [ ] Alertas de interação medicamentosa
- [ ] Posologia automática baseada em peso/idade
- [ ] Multi-idioma (inglês, espanhol)
