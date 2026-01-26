# 🧠 Planejamento N8N: A Mente da Máquina (CALYX AI)

> **Foco:** Inteligência Artificial, Agentes Autônomos e Humanização.

---

## 🤖 Os Agentes Ativos (Personas)

| Agente | Função | Personalidade |
| :--- | :--- | :--- |
| **SECRETÁRIA** | Agendamento e Dúvidas Básicas | Simpática, emojizada, proativa. |
| **FINANCEIRO** | Cobranças e Recibos | Formal, direta, precisa. |
| **ENFERMEIRA** | Triagem e Dúvidas Médicas | Protetora, técnica, acolhedora. |
| **SENTINEL** | Vigilância de Risco (Invisível) | Paranoico, focado em segurança do paciente. |

---

## 👁️ O Agente "SENTINEL" (Vigilância Silenciosa)

Você perguntou dele. Ele é o guarda-costas invisível da clínica.
Diferente da Sophia (que fala), o Sentinel **nunca** manda mensagem no WhatsApp. Ele fala com **VOCÊ** (no App/Painel).

### ⚙️ Como ele funciona (SENTINEL 2.0 - Dinâmico)

Você pediu, e faz todo sentido. O Sentinel não pode ser "hardcoded". Ele precisa ler o que preocupou você na semana passada.

**Nova Base de Dados no Notion:** `CALYX_SENTINEL_RULES`
Você cadastra lá o que quer vigiar. Exemplo:
- *Regra 1:* "Paciente reclamando de preço" -> Gravidade: Baixa -> Ação: Avisar Financeiro.
- *Regra 2:* "Paciente falando que a caneta falhou" -> Gravidade: Média -> Ação: Avisar Suporte.
- *Regra 3:* "Sintoma X (Novo)" -> Gravidade: Alta.

**O Fluxo no n8n:**
1.  **Trigger:** Mensagem Chegou.
2.  **Fetch Rules (O Pulo do Gato):** O n8n vai no Notion e puxa a lista atualizada de "Coisas para Vigiar".
3.  **Análise AI:** O prompt recebe as regras dinamicamente:
    > "Analise a mensagem com base NESTAS regras do Dr. Paulo: [Lista do Notion]. Se der match em alguma, gere o alerta."
4.  **Disparo:** Cria a Intercorrência no App.

**Vantagem:** Se aparecer um efeito colateral novo amanhã, você adiciona no Notion e o Sentinel aprende na hora, sem mexer em código.

---

## 🧬 Deep Dive: Agente 02 (SOPHIA) - O Clone Médico
**O desafio:** Responder pacientes com a **SUA** expertise e o **SEU** jeito de falar.

### 1. A Matéria-Prima (Notion Database: `CALYX_MEDICAL_BRAIN`)
Não vamos escrever manuais chatos. Vamos usar o que você já disse.

**Exemplo de Caso Real (Emagrecimento):**
1.  **Pergunta:** *"Doutor, tô com muito enjoo depois que apliquei a caneta ontem."*
2.  **Sua Resposta Transcrita:** *"Oi querida! É normal nesse começo. Tenta aplicar na coxa na próxima vez que diminui bastante, e toma um Vonau se tiver muito ruim. Bebe bastante água gelada."*
3.  **Princípio Médico (Extraído):** `Enjoo pós-aplicação: Sugerir troca de sítio (Coxa) e Hidratação. Sintomático: Ondansetrona.`

### 2. O Cérebro RAG (Retrieval Augmented Generation) no n8n
Quando outra paciente perguntar *"Tô passando mal de enjoo"*, a Sophia vai lembrar desse princípio e responder igual a você.

1.  **Vetorização:** A pergunta *"Meu dreno tá vazando um troço amarelo"* é convertida em números (Embeddings).
2.  **Busca Semântica:** O n8n varre o Notion buscando vetores próximos (Conceitos de "Vazamento", "Amarelo", "Dreno").
3.  **Montagem do Prompt (Contexto):**
    > "Você é a Sophia. O paciente perguntou sobre vazamento amarelo.
    > O Dr. Paulo ensinou nestes 3 casos passados que isso é Seroma e é normal, exceto se houver infecção.
    > Responda o paciente usando este conhecimento, com um tom tranquilizador."
4.  **Geração:** A IA responde com a precisão técnica do Dr. Paulo e a empatia da Sophia.

---

## � O Orquestrador (Supervisor AI)

Como o sistema sabe quem deve responder? Temos um "Router" na entrada.

**Mensagem Recebida:** *"Bom dia, queria ver o valor da cirurgia e também tô com uma dorzinha na cicatriz."*

**Análise do Supervisor:**
- "Valor" -> Assunto de `EVA (Financeiro)`.
- "Dor na cicatriz" -> Assunto de `SOPHIA (Médica)`.

**Decisão do Supervisor:**
1.  Aciona `SOPHIA` primeiro (Saúde é prioridade): *"Oi Fulana! Sobre a dorzinha, me conta mais..."*
2.  Cria um "Gatilho Lento" para `EVA`: *"Sobre valores, a Eva do financeiro já vai te chamar em seguida com a tabela."*

---

## 🎭 Protocolo Turing (Humanização)

Para a SOPHIA (Médica), a humanização é crítica.

1.  **Áudios Sintetizados (Futuro):** Se a resposta for complexa, podemos usar ElevenLabs para responder em áudio com uma voz feminina ultra-realista.
2.  **"Digitando..." Realista:**
    - Pergunta simples: Delay de 3s.
    - Pergunta complexa (exige consulta ao Notion): Delay de 12s + Status "Digitando...".
    - *Isso cria a ilusão de que ela foi consultar você ou ler o prontuário.*

---

## 🌐 Infraestrutura Híbrida: O Poder da Mistura

**Pergunta:** *Tenho um n8n self-hosted de outro projeto. Posso misturar?*
**Resposta:** **SIM, com certeza!** E isso é uma estratégia inteligente.

Podemos dividir as responsabilidades para economizar recursos e organizar a casa:

### 🏭 Instância 1: O "Operário" (Local / Railway)
Esta instância fica junto com o seu App (Backend).
-   **Função:** Conexão bruta com WhatsApp (Baileys), Upload de Mídia, Sentinel (Vigilância em tempo real).
-   **Por que aqui?** Precisa de latência zero e acesso direto ao banco de dados para salvar logs.

### 🧠 Instância 2: O "Pensador" (Seu Outro Server / Externo)
Esta instância é o cérebro criativo.
-   **Função:** RAG (Notion), OpenAI (Geração de Texto), Integrações com ferramentas externas.
-   **Por que lá?** Se você já tem processos pesados de IA configurados lá, reaproveite. Não polui o servidor de produção do App.

### 🔗 A Ponte (Webhooks)
Eles conversam via Webhooks criptografados. É invisível para o usuário.

1.  **Paciente fala:** "Oi!"
2.  **Z-API (Webhook):** Recebe o Zap -> Manda Webhook `POST /ask-sophia` para o N8N.
3.  **N8N (Sophia):** Recebe -> Consulta Notion -> Gera Resposta -> Devolve.
4.  **N8N (Envio):** Chama a API do Z-API (`POST /send-text`) para responder.

---

## 🔌 Conexão WhatsApp: Z-API (A Escolha da Paz)
Você escolheu bem. Z-API acaba com a dor de cabeça de desconexão.

**Configuração Necessária:**
1.  Contratar instância no [Z-API](https://z-api.io/).
2.  Pegar: `INSTANCE ID` e `CLIENT TOKEN`.
3.  Configurar o **Webhook** no painel do Z-API para apontar para o seu n8n:
    *   `Ao receber mensagem` -> `https://n8n-production.../webhook/sophia-medical-webhook`

---

## 🧠 O Motor da Conversa (Por que ela é boa?)

---

## 🧠 O Motor da Conversa (Por que ela é boa?)

Você perguntou qual a alternativa para ela ser **BOM DE PAPO**. Não é sorte, é engenharia.

### 1. O Motor Principal: GPT-4o (OpenAI)
Esqueça os modelos antigos. O **GPT-4o** (Omni) é a nossa escolha porque ele entende *sarcasmo, gírias e subtexto* melhor que qualquer um. Ele não soa "robótico" se bem configurado.
*Alternativa de "Calor":* Se acharmos o GPT-4o muito frio, trocamos para o **Claude 3.5 Sonnet** (Anthropic), que é famoso por ser o modelo mais "humano" e empático do mercado.

### 2. A Técnica Secreta: "Few-Shot Style Transfer"
A IA não aprende sozinha como falar. Nós vamos ensinar.
No "Prompt do Sistema", não diremos apenas "Seja legal". Nós colaremos **20 exemplos reais** de conversas suas ou da sua melhor secretária.
*   **A IA lê:** "Ah, quando o paciente reclama de preço, o Dr. Paulo fala desse jeito aqui...".
*   **A IA copia:** Ela mimetiza o tamanho das frases, o uso de emojis e até os vícios de linguagem aceitáveis.

### 3. Memória de Curto Prazo (Context Window)
Ninguém gosta de repetir as coisas. Toda vez que a IA for responder, o n8n enviará junto **as últimas 10-20 mensagens** da conversa.
*   **Paciente:** "E dói?"
*   **IA (Sem memória):** "Dói o quê?" (Burra)
*   **IA (Com memória):** "A aplicação do botox? Quase nada, é só uma picadinha rápida!" (Inteligente)

---

## 🧬 A Evolução: "Shadow Learning" (Aprendizado por Observação)

Você perguntou se ela aprende observando as meninas. **SIM.**
Implementaremos o loop de **"Active Learning"**. É assim que ela deixa de ser uma "Estagiária" e vira "Sênior".

### Como Funciona (O Ciclo de Feedback)
1.  **A Intervenção:** Suponha que a IA sugeriu uma resposta, mas a sua secretária achou ruim, apagou e escreveu outra melhor.
2.  **A Captura (O Pulo do Gato):**
    - O sistema detecta que houve uma **Intervenção Humana**.
    - Ele captura: `Pergunta do Paciente` + `Resposta Real da Secretária`.
3.  **O Aprendizado (Auto-Save no Notion):**
    - O n8n joga esse par automaticamente no Notion, numa tabela chamada **"Exemplos de Ouro"**.
4.  **O Uso Futuro:**
    - Da próxima vez que alguém perguntar algo parecido, a IA consulta os "Exemplos de Ouro" primeiro.
    - Ela vai "imitar" exatamente o que a secretária fez.

**Resultado:** Quanto mais sua equipe trabalha, mais inteligente a IA fica. Ela "rouba" o conhecimento delas em tempo real.

---

## 🛠️ Próximos Passos (Mão na Massa n8n)

1.  **Configurar Notion:** Criar o Database `CALYX_MEDICAL_BRAIN`.
2.  **Conexão Híbrida:** Testar um webhook simples entre seu n8n atual e o local.
3.  **Workflow n8n:** Começar pela **SOPHIA** (Agente Médico com Notion).

