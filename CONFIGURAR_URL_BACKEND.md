# 🔗 Configurar URL do Backend

## 📍 URL do Backend no Railway:

```
https://administro-production.up.railway.app
```

**Sem barra final (`/`)!**

## ▲ Configurar no Vercel:

1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá no projeto **administro**
3. Vá em **Settings** → **Environment Variables**
4. Adicione ou edite a variável:

```
NEXT_PUBLIC_BACKEND_URL=https://administro-production.up.railway.app
```

⚠️ **IMPORTANTE:**
- Use `https://` (não `http://`)
- **NÃO** coloque barra final (`/`)
- Configure para **Production**, **Preview** e **Development**
- Depois de adicionar/editar, faça um novo deploy no Vercel

## 🚂 No Railway (para referência):

A URL do backend é gerada automaticamente pelo Railway:
- Domínio: `administro-production.up.railway.app`
- URL completa: `https://administro-production.up.railway.app`

Você pode ver essa URL em:
- Railway → Settings → Networking → Public Networking
- Ou na aba **Deployments** após o deploy

## ✅ Após Configurar:

1. No Vercel: faça um novo deploy para aplicar a nova variável
2. Teste acessando o frontend e verificando se consegue comunicar com o backend

