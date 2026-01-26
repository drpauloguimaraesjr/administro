# 🔐 Segredos & IDs do Sistema (CALYX)

Arquivo centralizado com IDs, URLs e Chaves.
**NÃO COMPARTILHAR.**

## 🌐 URLs de Produção
- **Backend:** `https://backendcalyx.up.railway.app`
- **Frontend:** *(Em breve)*
- **N8N:** `https://n8n-production-3eae.up.railway.app`

## 📚 Banco de Dados Notion (IDs)
Estes IDs são usados nos Workflows do n8n.

| Nome Lógico | Nome no Notion | Notion Database ID | Usado Por |
| :--- | :--- | :--- | :--- |
| **Cérebro Médico** | `CALYX_MEDICAL_BRAIN` | `2f342023207580049c5fe31e9b4c19be` | Sophia (Agente Médico) |
| **Regras de Risco** | `CALYX_SENTINEL_RULES` | `2f34202320758075adebdb61586d4c79` | Sentinel (Vigia) |
| **Exemplos Reais** | `CALYX_GOLDEN_EXAMPLES`| `2f3420232075809fb78bf5f1cd0d221c` | Shadow Learning |

> **Dica:** O ID do Notion é apenas a sequência alfanumérica entre a última `/` e o `?` (se houver). Já limpei os IDs acima para uso direto no n8n.

---

## 🔑 Como Configurar as Credenciais no N8N (Passo a Passo)

Para o robô funcionar, ele precisa da "chave de casa". Você deve cadastrar isso no painel do n8n, não no código.

### 1️⃣ Notion API (Para ler seus dados)
Token: `ntn_...` (Veja backend/.env ou Painel Notion)
1.  Acesse [Notion My Integrations](https://www.notion.so/my-integrations).
2.  Clique em **+ New integration**.
3.  Nome: `Calyx N8N`.
4.  **Copie o "Internal Integration Secret"** (Começa com `secret_...`).
5.  **IMPORTANTE:** Vá nas tabelas do Notion que você criou (`CALYX_MEDICAL_BRAIN`, etc), clique nos `...` > `Connections` > Adicione `Calyx N8N`. Sem isso, o n8n não vê nada.
6.  No N8N: Menu Lateral > **Credentials** > Add Credential > Procure **Notion API** > Cole o Secret.

### 2️⃣ OpenAI API (Para a inteligência)
1.  Acesse [OpenAI API Keys](https://platform.openai.com/api-keys).
2.  Crie uma nova chave (`Create new secret key`).
3.  Copie a chave (Começa com `sk-...`).
4.  No N8N: **Credentials** > Add Credential > Procure **OpenAI API** > Cole a chave.

### 3️⃣ Backend Connection (Se tiver autenticação)
Se o seu backend no Railway tiver senha, crie uma credencial **Header Auth** no n8n.
-   Header: `Authorization`
-   Value: `Bearer SEU_TOKEN_AQUI`

### 4️⃣ Z-API (WhatsApp)
-   **Instance ID:** `3EDC776503AFA1024383BAA76574573D`
-   **Client Token:** `85E2CDA13359AF67A3346060`
-   **Security Token (opcional):** `...`

