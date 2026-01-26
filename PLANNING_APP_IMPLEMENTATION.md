# 🛠️ Planejamento de Implementação: Backend & Frontend (CALYX App)

> **Foco:** Gestão de Usuários, Painel de Intercorrências (Sentinel) e Segurança.
> **Status:** 🏗️ Em Construção Imediata.

---

## 1️⃣ Módulo de Usuários e Permissões (RBAC)

Este módulo garante que cada membro da equipe (Médicos, Enfermeiras, Recepcionistas) tenha acesso apenas ao que precisa.

### 🏗️ Backend (Autenticação e Dados)
-   **Nova Collection:** `users`
    -   `uid` (Auth ID)
    -   `role` (Enum: `master`, `doctor`, `nurse`, `receptionist`)
    -   `permissions` (Array de strings: `view_financial`, `edit_records`, etc.)
    -   `profile` (Nome, Especialidade, CRM)
-   **Middleware de Segurança:**
    -   Interceptar toda requisição para verificar: *Este usuário tem permissão para esta rota?*

### 🖥️ Frontend (Telas)
-   **Tela de Login Melhorada:** Suporte a recuperação de senha e reconhecimento de perfil.
-   **Admin de Usuários (Apenas Master):**
    -   Listar toda a equipe.
    -   Criar novo acesso (convite por email).
    -   Definir permissões (Checklist: "Pode ver financeiro?", "Pode ver prontuário?").

---

## 2️⃣ Módulo de Intercorrências (Sentinel Dashboard)

O painel onde o Dr. Paulo visualiza os "Alertas" gerados pela IA ou pela equipe.

### 🏗️ Backend
-   **Nova Collection:** `intercurrences`
    -   `status`: ( `open`, `resolved`, `investigating` )
    -   `severity`: ( `low`, `medium`, `high`, `critical` )
    -   `patientId`: Link para o paciente.
    -   `aiAnalysis`: Objeto com a sugestão da IA (Resumo, Gravidade, Sugestão de Conduta).
    -   `chatContext`: Trecho da conversa que gerou o alerta.

### 🖥️ Frontend (A "Sala de Guerra")
-   **Nova Aba no Menu:** `🚨 Intercorrências` (Visível apenas para Médicos/Enfermeiras).
-   **Cards de Alerta:**
    -   Visual estilo Kanban ou Lista Priorizada (Críticos no topo).
    -   Indicador visual de gravidade (Vermelho pulsante para críticos).
-   **Detalhe da Intercorrência:**
    -   **Esquerda:** Dados do Paciente e Chat Recente.
    -   **Centro:** Análise da IA (*"Detectei dor nível 8. Sugiro contato imediato"*).
    -   **Ação Rápida:** Botões "Confirmar Sugestão", "Ligar para Paciente", "Marcar como Resolvido".

---

## 3️⃣ Ordem de Implementação (Produção)

Vamos executar nesta ordem para garantir que a base exista antes das funcionalidades avançadas.

1.  **Backend Users:** Criar Modelos e Rotas de CRUD de Usuários.
2.  **Backend Auth:** Garantir que o token JWT carregue as `roles`.
3.  **Frontend Users:** Tela para cadastrar as "4 pessoas" da equipe.
4.  **Backend Intercurrences:** Criar a estrutura para receber os alertas.
5.  **Frontend Sentinel:** Criar o painel visual de alertas.
