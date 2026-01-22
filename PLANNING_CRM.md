
# Planejamento CALYX CRM - Sistema Completo com Gestão e Automações

Este documento serve como o plano mestre para a implementação do CRM CALYX, incorporando gestão de relacionamento, pipeline Kanban, automações inteligentes e análise de dados.

## Visão Geral
**Objetivo:** Implementar um ecossistema completo de CRM dentro da plataforma Administrativa, permitindo transição fluida de Lead -> Paciente -> Fidelização.

## 1. Arquitetura de Dados

### Coleções Principais (Ref. Firestore)
- `leads`: Armazena informações de prospects antes de virarem pacientes.
- `leads/{leadId}/interactions`: Histórico de todas as interações (chats, emails, calls).
- `tasks`: Tarefas vinculadas a leads ou pacientes (follow-ups, calls).
- `campaigns`: Gerenciamento de campanhas de marketing em massa.
- `crm_settings`: Configurações por usuário (regras de score, notificações).

### Principais Interfaces
- **Leads**: Pipeline (Kanban), Filtros Avançados, Detalhes + Timeline.
- **Tarefas**: Dashboard pessoal de tarefas pendentes e atrasadas.
- **Campanhas**: Criador de campanhas e análises de envio.
- **Dashboard**: Métricas de conversão, funil de vendas e ROI.

## 2. Funcionalidades Core

### A. Pipeline Kanban
- **Visualização**: Colunas customizáveis (Novos, Contatados, Qualificados, Agendados, Convertidos, Perdidos).
- **Ações**: Drag-and-drop para mover cards, cálculo automático de totais por coluna.
- **Card Rico**: Exibe nome, score (estrelas/cor), origem, tags e ações rápidas (WhatsApp/Ligar).

### B. Gestão de Lead 360º
- **Perfil**: Dados completos, score dinâmico, origem e responsáveis.
- **Timeline Unificada**: Histórico cronológico de mensagens, notas e mudanças de estágio.
- **Agendamento Próximos Passos**: Criação rápida de tarefas de follow-up.

### C. Automações Inteligentes (Backend/Functions)
- **Score Automático**: Cálculo baseado em completude do perfil, origem e interações recentes.
- **Atribuição Inteligente**: Distribuição de leads para profissionais com menor carga (Round Robin ou Carga).
- **Follow-up Automático**:
  - Geração de tarefas se o lead ficar "morno" (sem interação por X horas).
  - Alertas para leads "quentes" parados.

### D. Integração WhatsApp
- **Entrada**: Webhook que cria ou atualiza Lead automaticamente ao receber mensagem.
- **Saída**: Envio de templates de mensagens direto do card do Kanban.

### E. Campanhas de Marketing
- Segmentação poderosa (ex: "Todos os leads de 'Emagrecimento' que não fecharam").
- Disparo de mensagens em massa (WhatsApp/Email).
- Rastreamento de aberturas e conversões.

## 3. Roteiro de Implementação (Roadmap)

### Fase 1: Fundação e Kanban (Dias 1-5)
- [ ] Criar tipos TypeScript e Schemas de validação (Zod).
- [ ] Implementar Stores (Zustand/Context) para Leads.
- [ ] Construir layout do Kanban com Drag-and-drop (`@dnd-kit/core`).
- [ ] Criar modal de Detalhes do Lead + Timeline básica.

### Fase 2: Automações e Integrações (Dias 6-8)
- [ ] Implementar cálculo de Score no frontend e backend.
- [ ] Configurar webhook de WhatsApp para criação de Leads.
- [ ] Sistema de tarefas automáticas para Leads ociosos.

### Fase 3: Gestão e Tarefas (Dias 9-10)
- [ ] Tela de gerenciamento de Tarefas pessoais.
- [ ] Filtros avançados no Kanban (Por tags, data, origem).

### Fase 4: Dashboard e Analytics (Dias 11-12)
- [ ] Painel com gráficos (Recharts) do Funil de Conversão.
- [ ] Métricas de Top Performers e Origens mais rentáveis.

### Fase 5: Campanhas e Email Marketing (Dias 13-15)
- [ ] Builder de Campanhas.
- [ ] Disparo e monitoramento de métricas.

## 4. Tecnologias
- **Frontend**: Next.js 14, Tailwind CSS, Shadcn/UI, Lucide Icons.
- **Drag & Drop**: @dnd-kit/core
- **Charts**: Recharts
- **State Mgt**: React Query (TanStack Query) + Context/Zustand.

---
*Este documento será atualizado conforme o progresso do desenvolvimento.*
