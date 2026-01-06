# 🔐 Informações sobre Credenciais

## ⚠️ IMPORTANTE - SEGURANÇA

Os arquivos `.env` e `.env.local` contêm credenciais sensíveis e **NUNCA** devem ser commitados no Git.

## 📁 Arquivos de Credenciais

### Frontend
- **Arquivo real**: `frontend/.env.local` (não commitado)
- **Arquivo exemplo**: `frontend/.env.example` (commitado, sem credenciais)

### Backend
- **Arquivo real**: `backend/.env` (não commitado)
- **Arquivo exemplo**: `backend/.env.example` (commitado, sem credenciais)

## ✅ Verificação de Segurança

Todos os arquivos de credenciais estão listados no `.gitignore`:

```
backend/.env
frontend/.env.local
.env*.local
```

## 🔍 Como Verificar se Está Seguro

Execute o comando para verificar se nenhum arquivo `.env` está sendo rastreado:

```bash
git status
git ls-files | grep -E '\.env'
```

**Resultado esperado**: Nenhum arquivo `.env` ou `.env.local` deve aparecer.

## 🚨 Se Você Acidentalmente Commitar Credenciais

1. **REMOVA IMEDIATAMENTE** do histórico:
   ```bash
   git rm --cached frontend/.env.local backend/.env
   git commit -m "Remove arquivos de credenciais"
   git push
   ```

2. **REVOGUE as credenciais no Firebase**:
   - Gere uma nova Service Account
   - Regenerar as chaves da API

3. **Limpe o histórico** (se necessário):
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch frontend/.env.local backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

## 📝 Status das Credenciais Atuais

✅ **Credenciais configuradas localmente**:
- Frontend: `frontend/.env.local` (projeto: administro-af341)
- Backend: `backend/.env` (projeto: administro-af341)

✅ **Arquivos protegidos**: Ambos estão no `.gitignore`

✅ **Pronto para uso local**: Você pode executar `npm run dev` em ambos os projetos

## 🌐 Para Deploy (Vercel + Railway)

As mesmas credenciais precisam ser configuradas nas variáveis de ambiente das plataformas:

- **Vercel**: Settings > Environment Variables
- **Railway**: Variables tab

Consulte `DEPLOY.md` para instruções detalhadas.

---

**Nunca compartilhe ou commite esses arquivos!** 🔒

