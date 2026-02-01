# 📱 CRM CALYX - Pipeline de Atendimento WhatsApp

> **Data:** 31/01/2026  
> **Status:** Em implementação  
> **Versão:** 2.0

---

## 🎯 Objetivo
Sistema de CRM para gestão de conversas WhatsApp da clínica, com pipeline visual (Kanban), atribuição de responsáveis e rastreabilidade de quem enviou cada mensagem.

---

## 📊 PIPELINE - Etapas do Funil

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    PIPELINE DO CRM                                          │
├────────────┬────────────────┬─────────────────┬──────────────────┬─────────────┬───────────┤
│  🧊 LEAD   │  📋 MARCAÇÃO   │  📅 CONFIRM.    │  💉 CONFIRM.     │  🆘 DÚVIDAS │  👨‍⚕️ DR.  │
│  FRIO      │  CONSULTA      │  CONSULTA       │  PROCEDIMENTO    │  INTERC.    │  PAULO    │
├────────────┼────────────────┼─────────────────┼──────────────────┼─────────────┼───────────┤
│ "Quanto    │ "Quero agendar │ "Confirmar      │ "Confirmar       │ "Dúvida     │ Chamados  │
│  custa?"   │  consulta"     │  para amanhã"   │  procedimento"   │  pós-op"    │ internos  │
│            │                │                 │                  │             │           │
│ Pessoas    │ Paciente       │ 24h antes       │ Preparo e        │ Qualquer    │ Meninas   │
│ querendo   │ agendando      │ da consulta     │ orientações      │ dúvida ou   │ chamam    │
│ saber      │                │                 │                  │ problema    │ Dr. Paulo │
└────────────┴────────────────┴─────────────────┴──────────────────┴─────────────┴───────────┘
```

### Descrição das Colunas

| Etapa | ID | Cor | Descrição |
|-------|-----|-----|-----------|
| 🧊 **Lead Frio** | `lead_frio` | Cinza | Pessoas perguntando sobre serviços, preços, disponibilidade. Ainda não são pacientes. |
| 📋 **Marcação Consulta** | `marcacao_consulta` | Azul | Pessoa quer agendar consulta. Quando confirma → sai do pipeline. |
| 📅 **Confirmação Consulta** | `confirmacao_consulta` | Amarelo | Pacientes com consulta agendada. Confirmar 24h antes. |
| 💉 **Confirmação Procedimento** | `confirmacao_procedimento` | Verde | Pacientes com procedimento agendado. Enviar preparo e orientações. |
| 🆘 **Dúvidas/Intercorrências** | `duvidas_intercorrencias` | Vermelho | Dúvidas pós-consulta, pós-procedimento, ou qualquer intercorrência. |
| 👨‍⚕️ **Dr. Paulo** | `dr_paulo` | Teal | Chamados internos que as meninas abrem para o Dr. Paulo resolver. |

---

## 👥 EQUIPE

### Membros

| Nome | Cargo | Nível | Pode Responder | Números |
|------|-------|-------|----------------|---------|
| **Dr. Paulo** | Médico / Proprietário | ADMIN | Sim | Pessoal (46 99256-7770) |
| **Sandra** | Enfermeira | OPERADOR | Sim | Clínica 1 + 2 |
| **Iraciele** | Enfermeira | OPERADOR | Sim | Clínica 1 + 2 |
| **Helenita** | Téc. Enfermagem | OPERADOR | Sim | Clínica 1 + 2 |
| **Edilene** | Téc. Enfermagem | OPERADOR | Sim | Clínica 1 + 2 |
| **Jeniffer** | Enfermagem | OPERADOR | Sim | Clínica 1 + 2 |

### Níveis de Acesso

```
ADMIN (Dr. Paulo)
├── Ver TODAS as conversas (todos os números)
├── Ver métricas e relatórios
├── Gerenciar equipe
├── Responder no WhatsApp PESSOAL
├── Responder no "Dr. Paulo" do CRM
└── Configurar automações

OPERADOR (Meninas)
├── Ver conversas dos números da CLÍNICA
├── Responder mensagens
├── Arrastar conversas entre etapas
├── Atribuir conversas (dropdown)
├── Abrir chamado para Dr. Paulo
└── Marcar como resolvido
```

---

## 📞 NÚMEROS WHATSAPP

```
┌─────────────────────────────────────────────────────────────────┐
│                     3 INSTÂNCIAS WHATSAPP                       │
├──────────────────────┬──────────────────────┬───────────────────┤
│  📱 PESSOAL          │  📱 CLÍNICA 1        │  📱 CLÍNICA 2     │
│  (46) 99256-7770     │  A definir           │  A definir        │
├──────────────────────┼──────────────────────┼───────────────────┤
│  SÓ DR. PAULO        │  TODA EQUIPE         │  TODA EQUIPE      │
│  (acesso exclusivo)  │  (compartilhado)     │  (backup)         │
└──────────────────────┴──────────────────────┴───────────────────┘
```

---

## 💬 FORMATO DAS MENSAGENS

Toda mensagem enviada pela equipe terá assinatura automática:

```
┌──────────────────────────────────────┐
│                                      │
│  Helenita:                           │
│  Bom dia! Sua consulta está          │
│  confirmada para amanhã às 14h.      │
│                                      │
│                          13:08 ✓✓    │
└──────────────────────────────────────┘
```

**Regra:** O sistema adiciona automaticamente `[NOME]:` antes de cada mensagem.

---

## 🔄 FLUXO DE ATRIBUIÇÃO (Dropdown)

### Na Interface
```
┌─────────────────────────────────────────┐
│  Conversa: Maria Silva                  │
│  ────────────────────────────────────── │
│  Etapa: [📅 Confirmação Consulta ▼]     │
│  ────────────────────────────────────── │
│  Atribuído: [Helenita ▼]                │
│             ┌──────────────────┐        │
│             │ ○ Ninguém        │        │
│             │ ● Helenita       │        │
│             │ ○ Sandra         │        │
│             │ ○ Iraciele       │        │
│             │ ○ Edilene        │        │
│             │ ○ Jeniffer       │        │
│             └──────────────────┘        │
└─────────────────────────────────────────┘
```

### Comportamento
1. **Qualquer uma pode atribuir para outra** (ajudar quando está cheio)
2. **Histórico registra** quem mudou a atribuição
3. **Notificação** para a pessoa que recebeu

---

## 🖥️ INTERFACE DO PIPELINE

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│  📱 CRM WhatsApp                                    [Sandra ●]  🔔 3  ⚙️           │
├────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  [Todos ▼] [Meus ▼] [Sem dono ▼]               📊 18 conversas | ⏱️ TM: 5min      │
│                                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │ 🧊 LEAD     │ │ 📋 MARCAÇÃO │ │ 📅 CONFIRM  │ │ 💉 CONFIRM  │ │ 🆘 DÚVIDAS  │  │
│  │ FRIO (5)    │ │ CONSUL (3)  │ │ CONSUL (4)  │ │ PROCED (2)  │ │ INTERC (4)  │  │
│  ├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤  │
│  │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │  │
│  │ │ Maria   │ │ │ │ João    │ │ │ │ Ana     │ │ │ │ Carlos  │ │ │ │ Paula   │ │  │
│  │ │ Helenita│ │ │ │ Sandra  │ │ │ │ Edilene │ │ │ │ Iraciele│ │ │ │ Jeniffer│ │  │
│  │ │ 2m 🔴   │ │ │ │ 5m 🟡   │ │ │ │ 10m 🟢  │ │ │ │ 1h 🟢   │ │ │ │ 3m 🔴   │ │  │
│  │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │  │
│  │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │  │
│  │ │ Pedro   │ │ │ │ Lucas   │ │ │ │ Carla   │ │ │ │ Marcos  │ │ │ │ Roberto │ │  │
│  │ │ --      │ │ │ │ Helenita│ │ │ │ Sandra  │ │ │ │ --      │ │ │ │ --      │ │  │
│  │ │ 15m 🔴  │ │ │ │ 20m 🟡  │ │ │ │ 30m 🟢  │ │ │ │ 2h 🟡   │ │ │ │ 10m 🔴  │ │  │
│  │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
│                                                                                     │
│                 ← ARRASTA CARDS ENTRE COLUNAS (DRAG & DROP) →                       │
│                                                                                     │
└────────────────────────────────────────────────────────────────────────────────────┘
```

### Legenda dos Status
| Ícone | Significado |
|-------|-------------|
| 🔴 | Pendente - Sem resposta recente |
| 🟡 | Em atendimento - Respondido, aguardando paciente |
| 🟢 | Resolvido - Finalizado |
| `--` | Sem ninguém atribuído |

---

## 🚀 IMPLEMENTAÇÃO

### Fase 1 - Pipeline (Em andamento ✅)
- [x] Atualizar colunas do Kanban
- [x] Atualizar tipos (LeadStage)
- [ ] Adicionar dropdown de atribuição
- [ ] Adicionar assinatura automática

### Fase 2 - Equipe
- [ ] Criar tabela de membros da equipe
- [ ] Implementar autenticação por membro
- [ ] Criar página de gestão de equipe

### Fase 3 - WhatsApp
- [ ] Conectar 3 números via Evolution API
- [ ] Sincronizar conversas em tempo real
- [ ] Implementar envio de mensagens

### Fase 4 - Notificações
- [ ] Notificar quando atribuído
- [ ] Notificar novas mensagens
- [ ] Alertas de SLA (tempo sem resposta)

---

## ❓ PENDÊNCIAS

1. **Quais são os 2 números da clínica?**
2. **Login individual para cada menina?** (para rastrear)
3. **Horário de atendimento?** (mensagem automática fora)
4. **SLA desejado?** (tempo máximo para responder)

---

> **Arquivo:** `.agent/plans/crm-whatsapp-equipe.md`  
> **Última atualização:** 31/01/2026 22:27
