# 🎯 Railway Config as Code - Explicação Completa

## ✅ O que é Config as Code?

**Config as Code** permite definir configurações de deploy **diretamente no código**, usando arquivo `railway.toml` ou `railway.json`.

## 🚀 Vantagens:

1. ✅ **Versionamento** - Configurações ficam no Git, pode ver histórico
2. ✅ **Reprodutível** - Mesma configuração em qualquer ambiente
3. ✅ **Consistente** - Não depende de configurações manuais no dashboard
4. ✅ **Override automático** - Configurações do código sempre sobrescrevem o dashboard

## 📝 O que podemos configurar:

- ✅ `buildCommand` - Comando de build
- ✅ `startCommand` - Comando de start
- ✅ `healthcheckPath` - Caminho do healthcheck
- ✅ `healthcheckTimeout` - Timeout do healthcheck
- ✅ `restartPolicyType` - Política de reinício
- ✅ `restartPolicyMaxRetries` - Máximo de tentativas

## ⚠️ Limitação:

**Root Directory NÃO pode ser definido no config as code** (limitação do Railway).
Por isso, o Root Directory ainda precisa ser configurado manualmente no dashboard.

## 📋 Arquivos Criados:

1. **`backend/railway.toml`** - Configurações em formato TOML (mais legível)
2. **`backend/railway.json`** - Já existia (formato JSON)

Ambos fazem a mesma coisa! Você pode usar qualquer um. O Railway aceita ambos.

## 🔧 O que está configurado agora:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/healthz"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

## ✅ Benefícios práticos:

1. **Healthcheck sempre correto** - Sempre vai checar `/healthz`
2. **Restart automático** - Se falhar, reinicia automaticamente
3. **Versionado no Git** - Se alguém mudar, fica no histórico
4. **Mesma config em todos os ambientes** - Dev, staging, produção

## 🎯 Próximos Passos:

1. O arquivo `railway.toml` já foi criado
2. Faça commit e push
3. O Railway vai ler automaticamente e usar essas configurações!



