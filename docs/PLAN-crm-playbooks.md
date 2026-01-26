# PLAN-crm-playbooks.md

## Overview
Implementar um sistema de CRM Inteligente com "Playbooks" (Roteiros Guiados) e integração real com WhatsApp via Z-API.

## Módulos

### 1. Playbooks de Atendimento (Frontend)
- **Local:** `app/whatsapp/page.tsx` (Sidebar Direita no Chat)
- **Componentes:**
    - `PlaybookSidebar`: Lista de tarefas do roteiro (ex: "Qualificar", "Agendar").
    - `ScriptSuggestion`: Texto sugerido para copiar/colar.
    - `DataCapture`: Inputs para salvar dados direto no CRM sem sair do chat.

### 2. Configuração de Playbooks (Frontend)
- **Local:** `app/configuracoes/playbooks/page.tsx`
- **Funcionalidades:**
    - Criar/Editar Playbook.
    - Definir etapas (Perguntas, Campos a preencher).
    - Vincular a uma "Ilha" (Fila).

### 3. Integração Z-API (Backend)
- **Webhooks:**
    - Endpoint: `/api/webhooks/zapi`
    - Eventos: `on-message-received`, `on-status-change`.
- **Envio:**
    - Service: `WhatsappService` (Axios -> Z-API Endpoint).
    - Config: Guardar `INSTANCE_ID` e `CLIENT_TOKEN` no banco/env.

## Tech Stack
- **Frontend:** Next.js, Tailwind, Lucide Icons, React Query.
- **Backend:** Node.js (Express ou Next API Routes), Prisma (Persistência).
- **External:** Z-API (WhatsApp Gateway).

## Passos de Implementação

1.  [ ] **Criar Página de Configuração de Playbooks** (Editor visual simples).
2.  [ ] **Atualizar Tela de Chat** para incluir a Sidebar de Playbook dinâmica.
3.  [ ] **Implementar Backend de Webhook** para receber mensagens reais da Z-API.
4.  [ ] **Configurar Envio** de mensagens pela interface usando Z-API.

---
**Status:** Planning Approved via Command. Proceeding with implementation.
