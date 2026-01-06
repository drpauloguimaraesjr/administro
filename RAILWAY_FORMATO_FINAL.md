# ✅ Formato CORRETO para Railway - Variáveis Separadas

Baseado no exemplo do NutriBuddy, o formato recomendado é usar **variáveis separadas** (muito mais fácil de gerenciar no Railway!).

## 📋 Formato Correto

```env
NODE_ENV="production"
PORT="3001"
FIREBASE_PROJECT_ID="administro-af341"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCvM369w4N5Nmbm
K1DtHak+sLoLNQ/s2wBkfOrYQwZZCamNl+HOmXKaXLdTPpn8utm5zoGQ5cXJfRQ/
...
-----END PRIVATE KEY-----
"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@administro-af341.iam.gserviceaccount.com"
FIREBASE_STORAGE_BUCKET="administro-af341.firebasestorage.app"
WHATSAPP_WHITELIST=""
WHATSAPP_AUTO_START="true"
N8N_WEBHOOK_URL=""
BACKEND_WEBHOOK_URL=""
```

## 🔑 Características Importantes

1. **Todos os valores entre aspas duplas** (`"valor"`)
2. **Private key com quebras de linha REAIS** (não `\n`, mas quebras de linha de verdade)
3. **Private key termina em `-----END PRIVATE KEY-----`** (sem mais nada depois)
4. **Variáveis separadas** - muito mais fácil de editar no Railway!

## 📝 Como Usar

1. Abra o Railway Raw Editor (aba ENV)
2. Copie o conteúdo de `RAILWAY_RAW_EDITOR.env`
3. Cole no Raw Editor
4. Clique em "Update Variables"
5. Quando as cores mudarem, significa que está correto! ✅

## 🔄 Compatibilidade

O código agora aceita ambos os formatos:
- ✅ **Variáveis separadas** (recomendado) - `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
- ✅ JSON completo (compatibilidade) - `FIREBASE_SERVICE_ACCOUNT`

