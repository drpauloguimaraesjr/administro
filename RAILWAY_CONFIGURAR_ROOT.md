# 🚂 Como Configurar Root Directory no Railway

## 📍 Passo a Passo Visual

Na tela que você está vendo:

1. **Encontre a seção "Source"** (no meio da tela, logo abaixo de "Source Repo")

2. **Procure pelo link que diz:**
   ```
   Add Root Directory (used for build and deploy steps. Docs ↗)
   ```
   👆 **Clique nesse link!**

3. **Uma caixa de texto vai aparecer**

4. **Digite:** `backend`

5. **Salve** ou pressione Enter

6. **Clique em "Deploy"** ou **"Apply changes"** (botão roxo no canto superior esquerdo)

---

## 🔍 O que vai acontecer:

Após configurar, o Railway vai:
- ✅ Procurar o `package.json` na pasta `backend/`
- ✅ Executar `npm install` na pasta `backend/`
- ✅ Executar `npm run build` na pasta `backend/`
- ✅ Iniciar com `npm start` da pasta `backend/`

---

## ⚠️ Se não aparecer o link "Add Root Directory":

1. Clique no ícone de **lápis (Edit)** ao lado de "Source Repo"
2. Ou vá em **Build** no menu lateral direito
3. Procure por **"Root Directory"** ou **"Working Directory"**

---

**Depois de configurar, o build vai funcionar!** ✅

