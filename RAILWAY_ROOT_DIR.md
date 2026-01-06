# 🚂 Configurar Root Directory no Railway

## ⚠️ Problema

O Railway está tentando detectar o projeto na raiz, mas o código do backend está na pasta `backend/`. 

Erro típico:
```
✖ Railpack could not determine how to build the app.
The app contents that Railpack analyzed contains:
./
└── administrador de contas/
```

## ✅ Solução

Você precisa configurar o **Root Directory** no Railway Dashboard para apontar para a pasta `backend`.

### Passo a Passo:

1. **Acesse o Railway Dashboard**
   - Vá para seu projeto
   - Clique no serviço do backend

2. **Configurar Root Directory**
   - Vá em **Settings** → **Service Settings**
   - Procure por **"Root Directory"** ou **"Source"**
   - Defina como: `backend`
   - Salve

3. **Redeploy**
   - O Railway vai fazer um novo deploy automaticamente
   - Aguarde o build completar

### Alternativa: Usar arquivo railway.json na raiz

Se preferir, você pode criar um `railway.json` na raiz que aponte para o backend, mas a forma mais simples é configurar no Dashboard.

---

## 🔍 Verificar se funcionou

Após configurar o Root Directory, os logs devem mostrar:

```
[inf] Detected Node.js project
[inf] Running: npm install
[inf] Running: npm run build
[inf] Starting: npm start
```

---

**Depois de configurar, o Railway vai encontrar o `package.json` na pasta `backend/` e vai funcionar!** ✅

