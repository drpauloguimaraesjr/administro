# 🔧 Troubleshooting n8n no Railway

## ❌ Problemas Comuns e Soluções

### 1. n8n não inicia / Crash no startup

**Sintomas:**
- Container reinicia constantemente
- Logs mostram erro ao iniciar
- Healthcheck falha

**Soluções:**

#### A. Verificar Variáveis de Ambiente Obrigatórias

No Railway → Variables, certifique-se de ter:

```env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=sua_senha_forte_aqui
```

**⚠️ IMPORTANTE:** Se `N8N_BASIC_AUTH_ACTIVE=true` mas não tiver senha, o n8n crasha!

#### B. Verificar URL e Protocolo

```env
N8N_HOST=seu-n8n.up.railway.app
N8N_PROTOCOL=https
WEBHOOK_URL=https://seu-n8n.up.railway.app/
```

**⚠️ IMPORTANTE:** 
- Use `https` (não `http`) em produção
- `N8N_HOST` deve ser o domínio gerado pelo Railway (sem `https://`)
- `WEBHOOK_URL` deve ter `https://` e terminar com `/`

#### C. Verificar Porta

No Railway → Settings → Networking:
- Porta deve ser: `5678`
- Ou deixe Railway detectar automaticamente

---

### 2. Erro: "Cannot connect to database"

**Solução:**

O n8n precisa de um banco de dados. Se não configurou, ele usa SQLite (arquivo local).

**Opção A: Usar SQLite (Padrão - Funciona)**
Não precisa fazer nada, o n8n cria automaticamente.

**Opção B: Usar PostgreSQL (Recomendado para produção)**

1. Railway → New → Database → PostgreSQL
2. Copie a URL de conexão
3. No n8n → Variables:
```env
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=seu-postgres.railway.app
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=railway
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=sua_senha
```

---

### 3. Erro: "Port already in use" ou "EADDRINUSE"

**Solução:**

No Railway → Settings → Networking:
- Verifique se a porta está configurada corretamente
- Ou remova a configuração de porta e deixe Railway detectar

---

### 4. n8n inicia mas não acessa a interface

**Soluções:**

#### A. Verificar Domínio Público

1. Railway → Networking → Generate Domain
2. Certifique-se de ter um domínio público gerado
3. Acesse esse domínio no navegador

#### B. Verificar Autenticação

Se configurou `N8N_BASIC_AUTH_ACTIVE=true`:
- Use o usuário e senha configurados
- Usuário padrão: `admin`
- Senha: a que você configurou em `N8N_BASIC_AUTH_PASSWORD`

#### C. Verificar HTTPS

Certifique-se de usar `https://` (não `http://`) ao acessar.

---

### 5. Webhooks não funcionam

**Sintomas:**
- Workflow não recebe requisições
- Erro 404 ao chamar webhook

**Soluções:**

#### A. Verificar WEBHOOK_URL

```env
WEBHOOK_URL=https://seu-n8n.up.railway.app/
```

**⚠️ IMPORTANTE:** 
- Deve terminar com `/`
- Deve usar `https://`
- Deve ser o domínio público do Railway

#### B. Ativar Webhook no Workflow

1. No n8n, abra o workflow
2. Clique no nó **Webhook**
3. Clique em **"Execute Node"** ou **"Listen for Test Event"**
4. Isso ativa o webhook e gera a URL

#### C. Verificar se Workflow está Ativo

No n8n, certifique-se de que o **toggle** do workflow está **ATIVO** (verde).

---

### 6. Erro de Memória / Container morre

**Solução:**

Railway pode ter limite de memória. Configure:

```env
NODE_OPTIONS=--max-old-space-size=512
```

Ou aumente o plano do Railway.

---

## 🔍 Como Diagnosticar

### 1. Ver Logs no Railway

1. Railway Dashboard → Seu serviço n8n
2. Clique em **"View Logs"**
3. Procure por erros em vermelho

### 2. Logs Comuns

**✅ Sucesso:**
```
n8n ready on 0.0.0.0, port 5678
```

**❌ Erro de Autenticação:**
```
Error: Basic auth is active but no password set
```
→ Configure `N8N_BASIC_AUTH_PASSWORD`

**❌ Erro de URL:**
```
Error: Invalid WEBHOOK_URL
```
→ Verifique `WEBHOOK_URL` e `N8N_HOST`

**❌ Erro de Porta:**
```
Error: Port 5678 already in use
```
→ Verifique configuração de porta no Railway

---

## ✅ Checklist de Configuração

Use este checklist para garantir que tudo está correto:

- [ ] Variáveis de ambiente configuradas no Railway
- [ ] `N8N_BASIC_AUTH_ACTIVE=true` (se quiser autenticação)
- [ ] `N8N_BASIC_AUTH_PASSWORD` configurada (se auth ativa)
- [ ] `N8N_HOST` = domínio do Railway (sem https://)
- [ ] `N8N_PROTOCOL=https`
- [ ] `WEBHOOK_URL=https://seu-n8n.up.railway.app/` (com https e /)
- [ ] Domínio público gerado no Railway
- [ ] Porta configurada como 5678 (ou auto-detect)
- [ ] Workflow importado e ativado no n8n
- [ ] Webhook ativado no workflow (Execute Node)

---

## 🚀 Setup Rápido (Se Começar do Zero)

1. **Railway → New → Deploy Template → n8n**
2. **Configure Variables:**
```env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=SUA_SENHA_FORTE_AQUI
N8N_PROTOCOL=https
```
3. **Generate Domain** no Railway
4. **Atualize Variables:**
```env
N8N_HOST=seu-n8n.up.railway.app
WEBHOOK_URL=https://seu-n8n.up.railway.app/
```
5. **Acesse** o domínio gerado
6. **Login** com admin/senha
7. **Importe** workflow
8. **Ative** webhook

---

## 📞 Precisa de Ajuda?

Envie os logs do Railway (Railway → View Logs) para diagnóstico específico.

