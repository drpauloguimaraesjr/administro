# 🔧 Troubleshooting - Railway Build Fails

## ❌ Erro Atual

```
src/index.ts(35,27): error TS2769: No overload matches this call.
Argument of type 'string | 3001' is not assignable to parameter of type 'number'.
```

## ✅ Solução

O código local está **CORRETO** (linha 16 tem `parseInt`), mas o Railway está usando código antigo.

### 1. Verificar Root Directory

No Railway Dashboard:
1. Serviço do backend → **Settings**
2. Procure por **"Root Directory"** ou **"Source"**
3. **DEVE estar configurado como:** `backend`
4. Se não estiver, configure e salve

### 2. Limpar Cache do Railway

1. No Railway Dashboard → Serviço do backend
2. Vá em **Settings** → **Build Settings**
3. Tente limpar cache ou fazer **"Clear Build Cache"**

### 3. Redeploy Manual

1. No Railway Dashboard → **Deployments**
2. Clique nos **3 pontos** (⋯) no último deployment
3. Selecione **"Redeploy"**

### 4. Verificar Git

Certifique-se de que o commit foi feito:

```bash
cd backend
git log --oneline -3
# Deve mostrar commits recentes

git status
# Deve mostrar "nothing to commit"
```

### 5. Forçar Novo Build

Se nada funcionar, adicione um espaço em branco no arquivo:

```bash
# No arquivo backend/src/index.ts, adicione um espaço vazio no final
# Faça commit e push novamente
```

---

## 🔍 Verificação Rápida

O código correto deve ter:

```typescript
const PORT = parseInt(process.env.PORT || '3001', 10);
```

**NÃO:**
```typescript
const PORT = process.env.PORT || 3001; // ❌ ERRADO
```

---

**Se o problema persistir**, pode ser necessário:
1. Recriar o serviço no Railway
2. Ou verificar se há algum arquivo `dist/` commitado que está sobrescrevendo

