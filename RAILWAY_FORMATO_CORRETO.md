# ✅ Formato Correto para Railway

## 📝 Observações Importantes

### 1. **Aspas Duplas**
O Railway aceita variáveis com ou sem aspas, mas **com aspas é mais seguro** especialmente quando há valores especiais ou espaços.

### 2. **FIREBASE_SERVICE_ACCOUNT**
⚠️ **CRÍTICO**: Esta variável precisa ser o **JSON completo** do service account, não apenas a chave privada!

O código faz `JSON.parse()` desta variável, então ela precisa ser um JSON válido com todos os campos:
- `type`
- `project_id`
- `private_key_id`
- `private_key` (a chave que você tem)
- `client_email`
- `client_id`
- `auth_uri`
- `token_uri`
- etc.

### 3. **Escape de Caracteres**
No formato com aspas duplas, dentro do JSON:
- Aspas duplas internas precisam ser escapadas: `\"`
- Quebras de linha (`\n`) precisam ser escapadas: `\\n`

## 📋 Formato Correto (RAILWAY_RAW_EDITOR.env)

```env
NODE_ENV="production"
FIREBASE_STORAGE_BUCKET="administro-af341.firebasestorage.app"
FIREBASE_SERVICE_ACCOUNT="{\"type\":\"service_account\",\"project_id\":\"administro-af341\",...JSON completo...}"
WHATSAPP_WHITELIST=""
WHATSAPP_AUTO_START="true"
N8N_WEBHOOK_URL=""
BACKEND_WEBHOOK_URL=""
```

## 🔍 Verificação

Para verificar se o formato está correto, você pode testar no Node.js:

```javascript
// Simula o que o código faz
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
console.log(serviceAccount.type); // Deve imprimir "service_account"
console.log(serviceAccount.project_id); // Deve imprimir "administro-af341"
console.log(serviceAccount.client_email); // Deve imprimir o email
```

Se der erro de parsing, o formato está incorreto!

## ⚠️ Erro Comum

❌ **ERRADO** (apenas chave privada):
```env
FIREBASE_SERVICE_ACCOUNT="-----BEGIN PRIVATE KEY-----\n..."
```

✅ **CORRETO** (JSON completo):
```env
FIREBASE_SERVICE_ACCOUNT="{\"type\":\"service_account\",\"private_key\":\"-----BEGIN PRIVATE KEY-----\\n...\",...}"
```

---

**O arquivo `RAILWAY_RAW_EDITOR.env` já está corrigido com o formato adequado!** ✅

