# ⚡ Passo a Passo: PlaudNote -> Zapier -> Notion

> **Objetivo:** Sempre que você gravar um áudio no PlaudNote, ele aparecer automaticamente na sua tabela do Notion (`CALYX_MEDICAL_BRAIN`) para você revisar.

---

### 🎨 Prompt para criar sua "Consciência Digital"

O objetivo não é criar um manual técnico frio. É fazer o upload da sua mente.

> **Prompt de Sistema (Para o Editor):**
>
> "Você está transcrevendo a CONSCIÊNCIA do Dr. Paulo.
> Ele está gravando pensamentos livres sobre Medicina, Negócios, Vida e Pacientes.
>
> **Sua Missão:** Não resuma demais. Capture a ALMA e o RACIONAL por trás da fala.
>
> **Estrutura de Saída:**
> 1. **O Princípio (The Why):** Por que ele pensa assim? Qual a filosofia por trás?
> 2. **A Ação (The What):** O que deve ser feito na prática?
> 3. **As Nuances:** Capture os detalhes sutis ("atenção ao olhar do paciente", "cuidado com o tom de voz").
>
> **Exemplo:** Se ele falar sobre preço, não anote só o valor. Anote a filosofia dele sobre valorização e como ele quer que o paciente se sinta."

Dessa forma, a Sophia não aprende só "receitas de bolo". Ela aprende **como você pensa**. Se um dia perguntarem algo que você nunca ensinou diretamente, ela vai "deduzir" a resposta baseada na sua filosofia de vida gravada aí.

---

## 🔗 2. Conecte o PlaudNote ao Zapier
1.  Acesse o site: [Zapier.com](https://zapier.com) (Crie conta grátis se não tiver).
2.  Clique em **+ Create Zap**.
3.  **Trigger (Gatilho):**
    *   Procure por **"Plaud Note"**.
    *   Event: Escolha **"Transcript & Summary Ready"** (Quando a transcrição estiver pronta).
    *   Account: Ele vai pedir para logar na sua conta do Plaud.
    *   Test Trigger: O Zapier vai puxar sua última gravação do Plaud para testar. Se não tiver nenhuma, grave um "Teste 1, 2, 3" no Plaud agora e espere transcrever.

---

## � 3. A Ponte Inteligente (Zapier -> N8N)
Aqui acontece a mágica. Não vamos mandar direto para o Notion (senão vira bagunça). Vamos mandar para o **N8N** processar sua "Consciência".

1.  **Action (Ação):**
    *   Procure por **"Webhooks by Zapier"**.
    *   Event: Escolha **"POST"**.
2.  **Action Setup (Configuração):**
    *   **URL:** `https://n8n-production-3eae.up.railway.app/webhook/editor-webhook`
    *   **Payload Type:** `Json`.
    *   **Data (Dados):**
        *   No lado esquerdo escreva: `transcription`
        *   No lado direito (Valor): Selecione o campo **Transcription** (ou Summary) do Plaud Note.
3.  **Finalização:**
    *   Clique em Continue e **Test Action**.
    *   Se der "Success", o Zapier enviou seu texto para o nosso robô Editor.

### 🧠 O que acontece agora?
O N8N recebe esse texto, passa pelo **Prompt da Consciência** (que configuramos antes), estrutura o pensamento e **SALVA SOZINHO** no Notion.
Você não precisa conectar o Notion no Zapier. O N8N já faz isso.

---

## ✅ 4. Finalização
1.  Clique em **Test step**.
2.  Vá no seu Notion e veja se apareceu o item novo!
3.  Se apareceu: Clique em **Publish** no Zapier.

Pronto!
Agora, sua rotina é:
1.  Gravar no Plaud.
2.  Esperar aparecer no Notion.
3.  Ler, corrigir termos médicos e mudar Status para **"Aprovado"**.
4.  **A Sophia aprende imediatamente.**
