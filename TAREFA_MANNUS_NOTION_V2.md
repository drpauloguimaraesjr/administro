e se fze# 📋 Tarefa Técnica: Estrutura Notion V2 (Profundidade)

**Para:** Mannus
**De:** Dr. Paulo / Antigravity
**Contexto:** Estamos evoluindo a integração N8N + Notion. 
O Dr. Paulo sentiu que o campo único de "Conteúdo" resulta em dados "brutos" e superficiais, o que emburrece a IA.
Para criar uma "Sophia" com consciência real, precisamos de dados estruturados.

---

## 🏗️ Mudança na Database `CALYX_MEDICAL_BRAIN` (Versão Estendida)

O Dr. Paulo aprovou um **Schema JSON** muito mais rico para a IA. Precisamos que o Notion reflita exatamente essa estrutura para armazenar toda a inteligência que o Zapier vai enviar.

### Estrutura de Colunas Necessária:

| Nome da Coluna (Exato) | Tipo (Type) | Descrição do Conteúdo |
| :--- | :--- | :--- |
| **Tópico** | `Title` (Aa) | Título curto do assunto (vem do campo `tema`). |
| **Pergunta Paciente** | `Text` | A pergunta exata que um paciente faria. |
| **Resposta Sophia** | `Text` | Resposta empática e didática já pronta (rascunho de ouro da IA). |
| **Contexto Clínico** | `Text` | Resumo técnico para médicos (não paciente). |
| **Causa e Efeito** | `Text` | Cadeia lógica (Ex: A -> B -> C). |
| **Orientações** | `Text` | Lista numerada de ações práticas. |
| **Palavras-Chave** | `Text` | Termos para busca semântica (seo interno). |
| **Categoria** | `Select` | Opções: `Sintoma`, `Tratamento`, `Exame`, `Suplemento`, `Estilo de Vida`, `Hormônio`. |
| **Princípio (Why)** | `Text` | A filosofia/motivo clínico. Por que? |
| **Ação (What)** | `Text` | O resumo da conduta prática. |
| **Nuance (How)** | `Text` | O tom de voz e detalhes de como explicar. |
| **Status** | `Status` | `Rascunho` (Default) -> `Aprovado`. |
| **Tags** | `Multi-select` | Categorização extra (mantém a antiga se quiser). |

---

## 🔄 Fluxo Atualizado
1. **Plaud** Transcreve.
2. **Zapier** Envia para GPT-4o Estruturado.
3. **Zapier/N8N** Recebe esse JSON gigante e preenche TODAS essas colunas sozinho.
4. **Dr. Paulo** Só revisa e aprova.

Isso vai transformar o Notion na base de dados mais inteligente possível.

Obrigado, Mannus!
