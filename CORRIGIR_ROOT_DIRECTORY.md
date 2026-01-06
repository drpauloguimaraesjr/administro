# 🔧 Corrigir Root Directory no Railway

## ❌ ERRADO (Atual):
```
/administrador de contas/backend/src/config
```

## ✅ CORRETO:
```
administrador de contas/backend
```

## 📝 Como Corrigir:

1. No Railway, vá em **Settings**
2. Na seção **Source**, encontre **Root Directory**
3. Altere de `/administrador de contas/backend/src/config` para `administrador de contas/backend`
4. **Salve** (o Railway salva automaticamente)
5. O Railway vai fazer um novo deploy automaticamente

## ⚠️ Importante:

- **NÃO** inclua `/src/config` no Root Directory
- O Root Directory deve apontar para a pasta `backend/` que contém o `package.json`
- Use `administrador de contas/backend` (sem barra inicial `/`)

