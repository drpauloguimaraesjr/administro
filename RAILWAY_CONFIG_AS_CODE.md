# 🎯 Railway Config as Code - Solução Definitiva!

## ✅ O que é Config as Code?

Config as Code permite definir **todas as configurações do Railway diretamente no código**, usando arquivo `railway.toml` ou `railway.json`.

## 🚀 Vantagens:

1. ✅ **Root Directory sempre correto** - definido no código, não no dashboard
2. ✅ **Versionamento** - configurações ficam no Git
3. ✅ **Reprodutível** - mesmo deploy em qualquer ambiente
4. ✅ **Override automático** - configuração do código sempre prevalece sobre o dashboard

## 📝 Arquivo Criado

Criei `backend/railway.toml` com as configurações básicas.

**Nota:** Infelizmente, o Root Directory NÃO pode ser definido no `railway.toml` (é uma limitação do Railway). Mas podemos definir outras coisas importantes!

## 🔧 Como Usar

1. O arquivo `backend/railway.toml` já está criado
2. Faça commit e push
3. O Railway vai ler automaticamente o arquivo
4. As configurações do arquivo vão **sobrescrever** as do dashboard

## 📋 O que está configurado:

- **builder**: nixpacks (padrão)
- **startCommand**: npm start
- **healthcheckPath**: /healthz
- **healthcheckTimeout**: 300 segundos
- **restartPolicyType**: on_failure (reinicia se falhar)

## ⚠️ IMPORTANTE:

O **Root Directory** AINDA precisa ser configurado manualmente no dashboard do Railway porque não é suportado no config as code.

Mas outras configurações importantes (como healthcheck, restart policy, etc.) agora estão no código!



