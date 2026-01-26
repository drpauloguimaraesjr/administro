# CALYX - Roadmap de Implementação: Prontuário + Prescrições

## Dependências e Ordem de Execução

### Análise de Dependências

```
┌─────────────────┐
│  Módulo         │
│  Pacientes      │  ← BLOQUEADOR
│  (não existe)   │
└────────┬────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│   Prontuário    │    │   Prescrições   │
│                 │◄───│                 │
└─────────────────┘    └─────────────────┘
```

**Conclusão:** Precisamos criar o módulo Pacientes primeiro (mínimo viável).

---

## Roadmap Priorizado

### ETAPA 0: Módulo Pacientes (MVP)

**Objetivo:** Criar estrutura mínima para cadastrar e listar pacientes

**Escopo Reduzido:**
- CRUD básico de pacientes
- Listagem com busca
- Página de detalhes (com abas preparadas)
- **NÃO** incluir: formulário completo, bioimpedância, etc

**Entregáveis:**
1. Modelo `Patient` (TypeScript)
2. Coleção Firestore `/patients`
3. Tela de listagem (`/pacientes`)
4. Formulário básico (nome, CPF, telefone, email, data nascimento)
5. Página de detalhes (`/pacientes/{id}`)
6. Abas: Perfil, Consultas, **Prontuário**, Financeiro

**Tempo:** 2 dias com Antigravity

---

### ETAPA 1: Prontuário - Estrutura Base

**Objetivo:** Criar arquitetura de dados e navegação

**Entregáveis:**
1. Modelo `MedicalRecord` completo
2. Coleção Firestore `/medical_records`
3. Página `/pacientes/{id}/prontuario`
4. Abas: Anamnese, Evoluções, Documentos
5. Estados vazios (empty states)

**APIs:**
```typescript
GET /api/patients/:patientId/medical-record
POST /api/medical-records
```

**Tempo:** 1 dia

---

### ETAPA 2: Prontuário - Anamnese

**Objetivo:** Implementar formulário completo de anamnese

**Entregáveis:**
1. Formulário de anamnese (todos os campos)
2. Integração Tiptap (editor de texto rico)
3. Validação de campos obrigatórios
4. Modo leitura vs edição
5. Salvamento no Firestore

**APIs:**
```typescript
POST /api/medical-records/:recordId/anamnesis
PUT /api/medical-records/:recordId/anamnesis
GET /api/medical-records/:recordId/anamnesis
```

**Tempo:** 2 dias

---

### ETAPA 3: Prontuário - Evoluções

**Objetivo:** Sistema de evoluções com timeline

**Entregáveis:**
1. Timeline de evoluções (ordem cronológica)
2. Modal de nova evolução
3. Formulário SOAP (Subjetivo, Objetivo, Avaliação, Plano)
4. Sinais vitais com cálculo automático de IMC
5. Integração Tiptap
6. CRUD completo

**APIs:**
```typescript
POST /api/medical-records/:recordId/evolutions
GET /api/medical-records/:recordId/evolutions
PUT /api/medical-records/:recordId/evolutions/:evolutionId
DELETE /api/medical-records/:recordId/evolutions/:evolutionId
```

**Tempo:** 3 dias

---

### ETAPA 4: Prontuário - Documentos

**Objetivo:** Upload e gestão de documentos

**Entregáveis:**
1. Upload para Firebase Storage
2. Listagem com filtros (tipo)
3. Visualização inline (PDF, imagens)
4. Download de documentos
5. Exclusão com confirmação

**APIs:**
```typescript
POST /api/medical-records/:recordId/documents
GET /api/medical-records/:recordId/documents
DELETE /api/medical-records/:recordId/documents/:documentId
```

**Tempo:** 2 dias

---

### ETAPA 5: Prescrições - Estrutura Base

**Objetivo:** Criar arquitetura de prescrições

**Entregáveis:**
1. Modelo `Prescription` completo
2. Coleção Firestore `/prescriptions`
3. Seed de medicamentos comuns (50-100)
4. Modal de nova prescrição
5. Formulário básico

**APIs:**
```typescript
POST /api/prescriptions
GET /api/prescriptions?patientId={id}
GET /api/medications?q={query}
```

**Tempo:** 1 dia

---

### ETAPA 6: Prescrições - Interface Completa

**Objetivo:** Formulário completo de prescrições

**Entregáveis:**
1. Adicionar/remover medicamentos dinamicamente
2. Autocomplete de medicamentos
3. Campos com dropdowns (dosagem, forma, frequência)
4. Validação completa
5. Salvar rascunho

**Tempo:** 2 dias

---

### ETAPA 7: Prescrições - Geração de PDF

**Objetivo:** Template profissional e geração de PDF

**Entregáveis:**
1. Template HTML da receita
2. Integração jsPDF ou PDFMake
3. Upload para Firebase Storage
4. Preview antes de gerar
5. Download do PDF

**APIs:**
```typescript
POST /api/prescriptions/:id/generate-pdf
```

**Tempo:** 2 dias

---

### ETAPA 8: Prescrições - Envio WhatsApp

**Objetivo:** Enviar prescrição automaticamente

**Entregáveis:**
1. Integração com serviço WhatsApp existente
2. Envio de mensagem + PDF
3. Atualização de status
4. Confirmação visual (toast)

**APIs:**
```typescript
POST /api/prescriptions/:id/send-whatsapp
```

**Tempo:** 1 dia

---

### ETAPA 9: Integração e Polish

**Objetivo:** Integrar tudo e melhorar UX

**Entregáveis:**
1. Vincular prescrição ao prontuário (documentos)
2. Botão "Gerar Prescrição" na evolução
3. Listagem de prescrições do paciente
4. Loading states em tudo
5. Toast notifications
6. Confirmações de ações destrutivas
7. Empty states com ilustrações
8. Responsividade mobile

**Tempo:** 2 dias

---

## Cronograma Consolidado

| Etapa | Descrição | Dias | Acumulado |
|-------|-----------|------|-----------|
| 0 | Módulo Pacientes (MVP) | 2 | 2 |
| 1 | Prontuário - Estrutura | 1 | 3 |
| 2 | Prontuário - Anamnese | 2 | 5 |
| 3 | Prontuário - Evoluções | 3 | 8 |
| 4 | Prontuário - Documentos | 2 | 10 |
| 5 | Prescrições - Estrutura | 1 | 11 |
| 6 | Prescrições - Interface | 2 | 13 |
| 7 | Prescrições - PDF | 2 | 15 |
| 8 | Prescrições - WhatsApp | 1 | 16 |
| 9 | Integração e Polish | 2 | **18 dias** |

**Total:** 18 dias úteis (~3-4 semanas)

---

## Milestones

### Milestone 1: Prontuário Funcional (Dia 10)
- ✅ Pacientes cadastrados
- ✅ Anamnese completa
- ✅ Evoluções com timeline
- ✅ Upload de documentos

**Entregável:** Sistema usável para registrar consultas

---

### Milestone 2: Prescrições Funcionais (Dia 16)
- ✅ Criar prescrições
- ✅ Gerar PDF profissional
- ✅ Enviar via WhatsApp

**Entregável:** Sistema completo para atendimento médico

---

### Milestone 3: Sistema Polido (Dia 18)
- ✅ Integração completa
- ✅ UX refinada
- ✅ Responsivo
- ✅ Pronto para produção

**Entregável:** Sistema pronto para uso real

---

## Estratégia de Execução

### Princípios

1. **Iterativo:** Cada etapa entrega valor funcional
2. **Testável:** Testar cada etapa antes de avançar
3. **Focado:** Sem scope creep (features extras)
4. **Pragmático:** MVP primeiro, refinamento depois

### Uso do Antigravity

**Para cada etapa:**
1. Usar prompt específico (próxima seção)
2. Revisar código gerado
3. Ajustar manualmente se necessário
4. Testar funcionalidade
5. Commit e avançar

**Não usar Antigravity para:**
- Configuração de Firebase (fazer manual)
- Deploy (fazer manual)
- Debugging complexo (fazer manual)

---

## Dependências Técnicas

### Bibliotecas a Instalar

```bash
# Editor de texto rico
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-placeholder

# Geração de PDF
npm install jspdf html2canvas
# OU
npm install pdfmake

# Upload de arquivos
npm install react-dropzone

# Autocomplete
npm install @mui/material @emotion/react @emotion/styled

# Utilitários
npm install date-fns
```

### Configuração Firebase

```typescript
// firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // ... suas credenciais
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
```

### Regras Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Pacientes
    match /patients/{patientId} {
      allow read, write: if request.auth != null;
    }
    
    // Prontuários
    match /medical_records/{recordId} {
      allow read, write: if request.auth != null;
    }
    
    // Prescrições
    match /prescriptions/{prescriptionId} {
      allow read, write: if request.auth != null;
    }
    
    // Medicamentos (leitura pública)
    match /medications/{medicationId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
  }
}
```

### Regras Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Documentos do prontuário
    match /medical_records/{recordId}/{fileName} {
      allow read, write: if request.auth != null;
    }
    
    // PDFs de prescrições
    match /prescriptions/{prescriptionId}.pdf {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Checklist Geral

### Antes de Começar
- [ ] Instalar todas as dependências
- [ ] Configurar Firebase (Firestore + Storage)
- [ ] Configurar regras de segurança
- [ ] Criar seed de medicamentos
- [ ] Configurar variáveis de ambiente

### Durante Desenvolvimento
- [ ] Seguir ordem das etapas
- [ ] Testar cada etapa antes de avançar
- [ ] Fazer commits frequentes
- [ ] Documentar decisões técnicas
- [ ] Revisar código gerado pelo Antigravity

### Antes de Deploy
- [ ] Testar fluxo completo
- [ ] Verificar responsividade
- [ ] Testar em diferentes navegadores
- [ ] Verificar performance
- [ ] Revisar regras de segurança
- [ ] Backup do Firestore

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Antigravity gera código incorreto | Média | Médio | Revisar todo código gerado |
| Tiptap não funciona bem | Baixa | Alto | Testar logo na Etapa 2 |
| Geração de PDF lenta | Média | Médio | Usar PDFMake (mais rápido) |
| Firebase Storage caro | Baixa | Médio | Limitar tamanho de uploads (10MB) |
| WhatsApp desconecta | Alta | Médio | Implementar auto-reconnect (já existe) |
| Scope creep | Alta | Alto | Seguir roadmap estritamente |

---

## Próximos Passos Imediatos

### Hoje:
1. Instalar dependências
2. Configurar Firebase
3. Criar seed de medicamentos
4. **Começar Etapa 0** (Módulo Pacientes)

### Amanhã:
5. Finalizar Etapa 0
6. **Começar Etapa 1** (Prontuário - Estrutura)

### Esta Semana:
7. Completar Etapas 1-4 (Prontuário completo)
8. Testar fluxo de anamnese + evoluções

---

## Métricas de Sucesso

### Milestone 1 (Dia 10)
- ✅ Consegue cadastrar paciente
- ✅ Consegue criar anamnese
- ✅ Consegue registrar evolução
- ✅ Consegue fazer upload de documento

### Milestone 2 (Dia 16)
- ✅ Consegue criar prescrição
- ✅ PDF gerado corretamente
- ✅ Envio WhatsApp funciona

### Milestone 3 (Dia 18)
- ✅ Sistema responsivo
- ✅ Sem bugs críticos
- ✅ Performance aceitável (<3s para carregar)
- ✅ Pronto para uso real

---

## Conclusão

Este roadmap prioriza **Prontuário e Prescrições** conforme solicitado, ignorando prazos e focando em entregar funcionalidades completas e bem feitas.

**Próxima ação:** Usar os prompts da próxima seção para começar a implementação com Antigravity.
