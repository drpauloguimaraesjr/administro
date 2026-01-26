# 🧠 Fluxo de Enriquecimento: Input Manual + IA Automática

> **Mudança de Estratégia:** Devido à instabilidade do Zapier, removemos o intermediário.
> **Novo Fluxo:** Você joga o texto "bruto" no Notion, e a IA organiza tudo sozinha alguns minutos depois.

---

## 🏗️ Como vai funcionar?

### 1. O Input (Dr. Paulo / Equipe)
Você não precisa preencher as 15 colunas complexas. Você só precisa preencher **DUAS**:
1.  **Nome:** O Título do assunto (Ex: "Protocolo Enjoo").
2.  **Input Bruto:** (Crie uma coluna nova chamada `Input Bruto` ou use a `Contexto Clínico` provisoriamente). Cole aqui a transcrição do Plaud, um áudio ditado, ou um rascunho rápido.
3.  **Status:** Marque como `A Processar` (Ou `Inbox`).

### 2. A Mágica (N8N - "O Bibliotecário")
Teremos um robô no N8N que funciona assim:
1.  **Vigia:** Ele olha o Notion a cada 10 minutos procurando "Status = A Processar".
2.  **Lê:** Ele pega seu texto do `Input Bruto`.
3.  **Pensa:** Envia para o GPT-4o com aquele Schema gigante (Princípio, Ação, Resposta Sophia, etc).
4.  **Escreve:** Ele volta na **MESMA PÁGINA** do Notion e preenche todas as outras colunas automaticamente.
5.  **Finaliza:** Muda o Status para `Revisão`.

### 3. A Revisão (Dr. Paulo)
Você entra no Notion, vê que a IA já preencheu tudo.
-   Lê a "Resposta Sophia".
-   Lê o "Princípio".
-   Está bom? Muda Status para `Aprovado`.
-   **Pronto.** A Sophia já está usando.

---

##  Advantages (Vantagens)
1.  **Zero Zapier:** Menos uma ferramenta para quebrar ou cobrar.
2.  **Sem Pressa:** Pode gravar 10 áudios, jogar lá, e ir dormir. A IA processa em lote.
3.  **Controle Total:** Nada entra na Sophia sem você mudar para `Aprovado`.
4.  **Simplicidade:** Para você, o trabalho é "Copiar e Colar".

## 🛠️ O que precisamos ajustar?
1.  **Mannus:** Criar a coluna extra `Input Bruto` (Text Area) no Notion.
2.  **N8N:** Alterar o Trigger de "Webhook" para "Notion Trigger (Poll)".

Podemos seguir assim? É o melhor dos dois mundos.
