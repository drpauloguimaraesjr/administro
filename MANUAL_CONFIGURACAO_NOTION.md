# 📘 Manual de Configuração: Banco de Dados Notion (CALYX)

> **Destinado a:** Dr. Paulo
> **Objetivo:** Criar as estruturas no Notion para alimentar a Inteligência Artificial (Sophia e Sentinel).

Siga este guia para criar as duas tabelas que servirão de "Cérebro" para o sistema.

---

## 1️⃣ Tabela: Cérebro da Sophia (`CALYX_MEDICAL_BRAIN`)
Esta tabela armazena seu conhecimento médico. A Sophia lerá isso para responder dúvidas.

1.  Crie uma nova **Database (Full Page)** no Notion.
2.  Nomeie como: `CALYX_MEDICAL_BRAIN`
3.  Configure as colunas exatas abaixo:

| Nome da Coluna | Tipo (Type) | Configuração / Detalhes |
| :--- | :--- | :--- |
| **Tópico** | `Title` (Aa) | O título do assunto (ex: "Enjoo na 1ª semana"). |
| **Conteúdo** | `Text` | **Importante:** Aqui vai a transcrição do Plaud. A IA lê isso. |
| **Tags** | `Multi-select` | Crie opções como: `Emagrecimento`, `Efeito Colateral`, `Financeiro`. |
| **Status** | `Status` | Defina opções: `Rascunho` (Padrão), `Revisar`, `Aprovado` (IA só lê este). |
| **Last Edited Time** | `Last edited time` | Automático. Ajuda o n8n a saber se mudou algo. |

---

## 2️⃣ Tabela: Regras do Sentinel (`CALYX_SENTINEL_RULES`)
Esta tabela define o que o "Vigia" deve monitorar.

1.  Crie uma nova **Database (Full Page)** no Notion.
2.  Nomeie como: `CALYX_SENTINEL_RULES`
3.  Configure as colunas exatas abaixo:

| Nome da Coluna | Tipo (Type) | Configuração / Detalhes |
| :--- | :--- | :--- |
| **Regra / Gatilho** | `Title` (Aa) | Nome do risco (ex: "Queda de Cabelo Severa"). |
| **Gravidade** | `Select` | Opções: `Baixa`, `Média`, `Alta`, `Crítica`. Isso define a cor do alerta. |
| **Palavras-Chave** | `Text` | Palavras para a IA buscar (ex: "cabelo, cair, careca, falha"). |
| **Instrução AI** | `Text` | O que a IA deve checar? (ex: "Confirme se é queda acentuada ou normal"). |
| **Status** | `Checkbox` | "Ativo?". Se desmarcado, o Sentinel ignora a regra. |

---

## 3️⃣ Tabela: Exemplos de Ouro (`CALYX_GOLDEN_EXAMPLES`)
*Opcional para agora, mas útil para o futuro.*
Esta tabela serve para a IA "aprender por observação" (Shadow Learning).

1.  Crie uma nova **Database**.
2.  Colunas:
    *   **Pergunta do Paciente** (`Title`)
    *   **Melhor Resposta** (`Text`) - A resposta ideal que suas secretárias enviaram.
    *   **Categoria** (`Select`)

---

## 🔗 Próximo Passo: Conexão
Após criar as tabelas:
1.  Vá em **Settings & connection** no Notion.
2.  Crie uma integração chamada "Calyx N8N".
3.  Vá nas 3 tabelas criadas, clique nos `...` (canto superior direito) > `Connect to` > Selecione "Calyx N8N".
4.  Copie o **ID** de cada database (está na URL, logo após o `notion.so/`).

Guarde esses IDs para configurar no n8n depois.
