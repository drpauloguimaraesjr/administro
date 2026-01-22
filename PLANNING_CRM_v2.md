
# Planejamento CALYX CRM - Sistema Completo de Gestão de Relacionamento

Este roteiro detalhado descreve a implementação do módulo CRM, cobrindo desde a gestão básica de leads até automações avançadas e inteligência de dados.

## Visão Geral
**Objetivo:** Implementar um CRM moderno e visual dentro do ambiente Administrativo do CALYX para gerenciar todo o ciclo de vida do paciente (Lead -> Paciente -> Fidelização).

**Stack Tecnológico:**
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI
- **Drag & Drop:** `@dnd-kit/core`
- **Visualização de Dados:** Recharts
- **Backend:** Firebase (Firestore, Functions, Storage) + API Routes Next.js

---

## Roteiro de Implementação (Roadmap)

### Fase 1: Fundação e Kanban (Dias 1-5)
**Meta:** Ter um pipeline funcional onde leads podem ser visualizados e movidos.
- **Estrutura de Dados:** Definir interfaces `Lead`, `Interaction`, `Task`.
- **Pipeline Kanban:**
  - Layout horizontal com colunas (`new`, `contacted`, `qualified`, `scheduled`, `converted`, `lost`).
  - Cards ricos com informações resumidas e ações rápidas.
  - Funcionalidade Drag-and-drop para atualização de estágio.
- **Gestão de Leads:**
  - Formulário "Novo Lead" com validação Zod.
  - Filtros básicos (Responsável, Origem, Tags).
- **Cálculo de Score:** Implementar lógica de pontuação baseada em perfil e engajamento.

### Fase 2: Detalhes do Lead e Timeline (Dias 6-8)
**Meta:** Centralizar todas as informações e histórico do lead.
- **Página de Detalhes:** Layout 2 colunas (Info + Timeline).
- **Timeline Unificada:** Histórico cronológico de WhatsApp, Calls, Emails e Notas.
- **Ações de Negócio:**
  - "Converter em Paciente" (integração com cadastro de pacientes).
  - "Marcar como Perdido" (motivo da perda).

### Fase 3: Tarefas e Notificações (Dias 9-10)
**Meta:** Garantir que nenhum lead seja esquecido.
- **Sistema de Tarefas:** CRUD completo, listagem pessoal e vínculo com leads.
- **Notificações:** Alertas visuais e badges para tarefas vencidas/hoje.
- **Automação Básica:** Criar tarefa de "Primeiro Contato" automaticamente ao receber lead.

### Fase 4: Dashboard e Analytics (Dias 11-12)
**Meta:** Dar visibilidade sobre a performance do negócio.
- **KPIs:** Cards de métricas (Taxa de Conversão, CAC, Tempo Médio).
- **Funil de Vendas:** Gráfico de funil visual.
- **Relatórios:** Top Performers e Origens mais rentáveis.

### Fase 5: Automações e WhatsApp (Dias 13-15)
**Meta:** Reduzir trabalho manual e aumentar velocidade de resposta.
- **Entrada via WhatsApp:** Webhook para criar leads automaticamente.
- **Distribuição Inteligente:** Atribuir leads baseada na carga de trabalho dos profissionais.
- **Follow-up Automático:** Cron jobs para detectar leads "mornos" e gerar tarefas.
- **Alertas Inteligentes:** Notificar sobre leads quentes parados.

### Fase 6: Campanhas de Marketing (Dias 16-18 - Opcional)
**Meta:** Reengajar leads e fidelizar pacientes.
- **Gestor de Campanhas:** Wizard para criação de disparos em massa.
- **Segmentação:** Filtros avançados de público.
- **Monitoramento:** Métricas de envio, abertura e conversão.

---

## Detalhamento Técnico (Prompts e Especificações)

### Prompt 1: Pipeline Kanban e Estrutura Base
**Contexto:** Criar o coração do CRM.
**Funcionalidades:**
- Implementação da interface `Lead` completa.
- Tela `/crm` com Kanban board.
- Colunas com totais monetários e contadores.
- Drag-and-drop usando `@dnd-kit`.

### Prompt 2: Detalhes do Lead e Timeline
**Contexto:** Aprofundar a visão do cliente.
**Funcionalidades:**
- Modal/Page `/crm/leads/{id}`.
- Timeline interativa (adicionar notas, registrar calls).
- Integração com o módulo de Pacientes existente para conversão.

### Prompt 3: Tarefas e Notificações
**Contexto:** Gestão do dia a dia.
**Funcionalidades:**
- Aba de Tarefas dentro do Lead.
- Dashboard pessoal "Minhas Tarefas".
- Cron jobs para notificações de atraso.

### Prompt 4: Dashboard e Analytics
**Contexto:** Visão gerencial.
**Funcionalidades:**
- Página `/crm/dashboard`.
- Gráficos Recharts (Barras, Linhas, Pizza).
- Cálculos de performance de equipe.

### Prompt 5: Automações e Integração WhatsApp
**Contexto:** Inteligência e velocidade.
**Funcionalidades:**
- Webhook de entrada do WhatsApp.
- Lógica de distribuição Round-Robin ou Carga.
- Cron jobs para varredura de leads estagnados.

### Prompt 6: Campanhas de Marketing
**Contexto:** Expansão e Vendas.
**Funcionalidades:**
- Criador de campanhas multi-canal (WhatsApp, Email).
- Processamento em lote (Batch processing).
- Analytics de campanha.

---
*Este documento consolida a visão estratégica e técnica para o desenvolvimento do CALYX CRM.*
