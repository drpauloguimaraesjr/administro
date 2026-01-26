# 📋 Planejamento: Sistema de Usuários, Perfis e Filas WhatsApp (CALYX)

## 🎯 Objetivo
Implementar um sistema completo de gestão de usuários com perfis hierárquicos, permissões granulares e filas de atendimento WhatsApp multi-agente com inteligência artificial.

---

## 📅 Roteiro de Implementação

### ✅ Fase 1: Sistema de Usuários (Base)
**Foco:** Garantir que o sistema suporte múltiplos usuários com diferentes cargos e permissões.
- [ ] **Definição de Tipos**: Criar interfaces `User`, `Role`, `Permission`.
- [ ] **Backend Users Service**: CRUD completo no Firestore (`users` collection).
- [ ] **Frontend Users Page**: Listagem de usuários com filtros e badges.
- [ ] **Modal de Novo Usuário**: Formulário multi-step (Abas: Pessoal, Cargo, Agenda, WhatsApp).
- [ ] **Middleware de Permissões**: Hooks `usePermission` e proteção de rotas.
- [ ] **Adaptação da Auth**: Garantir que o login carregue o perfil completo.
- [ ] **Agenda Multi-Profissional**: Adicionar filtro de profissional na tela de Agenda.

### 🚧 Fase 2: Filas de WhatsApp
**Foco:** Organizar o caos do atendimento via WhatsApp.
- [ ] **Definição de Tipos**: `WhatsAppQueue`, `WhatsAppConversation`, `WhatsAppMessage`.
- [ ] **Backend Queues Service**: CRUD de filas (`whatsapp_queues`).
- [ ] **Configuração de Filas (Frontend)**: Página para criar/editar filas e regras.
- [ ] **Seeds**: Criar as filas padrão (Aquecimento, Confirmação, Receitas, etc.).
- [ ] **Página de Atendimento (/whatsapp)**: Layout de 3 colunas (Filas | Chat | Detalhes).

### 🤖 Fase 3: Automação e Inteligência
**Foco:** Automatizar triagem e distribuição.
- [ ] **Webhook Inteligente**: Processar mensagens recebidas.
- [ ] **Classificação com IA**: GPT-4 define para qual fila vai a mensagem.
- [ ] **Roteamento**: Round Robin ou Menos Ocupado.
- [ ] **Auto-Reply**: Mensagens de boas-vindas e fora de horário.

### 💊 Fase 4: Receitas com IA
**Foco:** Funcionalidade "Uau" para médicos.
- [ ] **Prompt de Sistema (IA)**: Configurar GPT-4 para gerar receitas.
- [ ] **Fluxo de Aprovação**: Médico revisa o JSON gerado pela IA.
- [ ] **Geração de PDF**: Transformar JSON aprovado em PDF.
- [ ] **Envio Automático**: Disparar PDF via WhatsApp.

---

## 🛠️ Detalhamento Técnico - Fase 1 (Imediato)

### 1. Estrutura de Dados (Types)
Arquivo: `shared/types/user.ts`
```typescript
export type UserRole = 'owner' | 'doctor' | 'nurse' | 'nursing_tech' | 'receptionist' | 'custom';

export interface Permission {
  module: 'patients' | 'appointments' | 'medical_records' | 'prescriptions' | 'financial' | 'crm' | 'whatsapp' | 'reports' | 'settings' | 'users';
  actions: ('view' | 'create' | 'edit' | 'delete' | 'export')[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  customRoleName?: string;
  professionalId?: string; // CRM, COREN
  specialty?: string;
  permissions: Permission[];
  hasAgenda: boolean;
  agendaConfig?: {
    workingDays: number[]; // 0-6
    workingHours: { start: string; end: string; };
    appointmentDuration: number;
    allowOnlineBooking: boolean;
  };
  canAnswerWhatsApp: boolean;
  whatsappQueues: string[]; // IDs das filas
  isActive: boolean;
  createdAt: string;
}
```

### 2. Rotas Backend
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### 3. Frontend Pages
- `/configuracoes/usuarios` (Nova rota)
