# 📋 Tarefa Técnica: Estrutura Notion para IA Calyx

**Para:** Mannus
**De:** Dr. Paulo
**Contexto:** Estamos implementando a IA "Sophia" e o "Sentinel". Precisamos que o Notion esteja estruturado perfeitamente para receber os dados do PlaudNote (via API) e servir de cérebro para o N8N.

Precisamos criar 2 Bases de Dados com **IDs e Permissões** específicas.

---

## 1️⃣ Database: `CALYX_MEDICAL_BRAIN`
Esta base vai receber o "Upload de Consciência" do Dr. Paulo.

**Estrutura de Colunas (Exata):**
| Nome da Coluna | Tipo (Type) | Obs |
| :--- | :--- | :--- |
| **Tópico** | `Title` (Aa) | Título do pensamento/protocolo. |
| **Conteúdo** | `Text` (Rich Text) | Onde a IA escreverá o texto estruturado. |
| **Tags** | `Multi-select` | Ex: `Filosofia`, `Protocolo`, `Bioimpedância`. |
| **Status** | `Status` | Opções: `Rascunho` (Default), `Aprovado` (IA só lê este). |
| **Last Edited Time** | `Last edited time` | Para versionamento. |

---

## 2️⃣ Database: `CALYX_SENTINEL_RULES`
Esta base serve para configurar os alertas de risco do WhatsApp.

**Estrutura de Colunas (Exata):**
| Nome da Coluna | Tipo (Type) | Obs |
| :--- | :--- | :--- |
| **Regra** | `Title` (Aa) | Nome do risco (ex: "Queda de Cabelo"). |
| **Gravidade** | `Select` | `Baixa`, `Média`, `Alta`, `Crítica`. |
| **Palavras-Chave** | `Text` | Termos para busca (ex: "cabelo, cair, falha"). |
| **Instrução AI** | `Text` | Contexto para o Sentinel (ex: "Queda acentuada pós-bariátrica"). |
| **Ativo** | `Checkbox` | Se marcado, a regra vale. |

---

## 🚨 Configuração de Integração (Crucial)
Para o robô conseguir ler/escrever nestas tabelas:
1.  Crie as tabelas.
2.  Vá no menu da tabela (`...` no canto superior direito).
3.  Clique em **Connections** > **Connect to**.
4.  Adicione a integração **"Calyx N8N"** (Se não aparecer, me avise para eu passar o link de convite da integração).

## 📤 O que eu preciso de volta
Por favor, me envie os **Database IDs** dessas duas tabelas.
*(O ID é a parte do link entre o `notion.so/` e o `?`).*
