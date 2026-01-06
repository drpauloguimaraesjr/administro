# ✅ Formato CORRETO para Railway Raw Editor

## 🔑 Diferenças Importantes

No Railway, o formato ENV no Raw Editor precisa de:

1. **TODOS os valores entre aspas duplas** (`"valor"`)
2. **Valores vazios também com aspas** (`""`)
3. **Booleanos como string com aspas** (`"true"` não `true`)
4. **Private Key com quebras de linha com `\`** (não `\\n`)

## ❌ Formato ERRADO (o que eu estava enviando):

```env
NODE_ENV=development
PORT=3001
FIREBASE_STORAGE_BUCKET=administro-af341.firebasestorage.app
WHATSAPP_AUTO_START=false
N8N_WEBHOOK_URL=
```

## ✅ Formato CORRETO (funciona no Railway):

```env
NODE_ENV="production"
FIREBASE_STORAGE_BUCKET="administro-af341.firebasestorage.app"
WHATSAPP_AUTO_START="true"
N8N_WEBHOOK_URL=""
```

## 📋 Arquivo Completo Correto

Use o arquivo `RAILWAY_RAW_EDITOR.env` que foi atualizado com o formato correto!

**Importante:** 
- No Railway, quando você cola as variáveis no Raw Editor, se estiver correto, as cores mudam automaticamente (isso indica que o formato está certo)
- Use a aba **ENV** (não JSON) no Raw Editor
- Copie o conteúdo de `RAILWAY_RAW_EDITOR.env` e cole direto no Railway

