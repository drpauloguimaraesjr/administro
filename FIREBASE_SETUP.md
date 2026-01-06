# 🔥 Guia Completo de Configuração do Firebase

Este guia detalha passo a passo como criar e configurar um projeto Firebase do zero para este sistema.

## 📋 Pré-requisitos

- Conta Google (Gmail)
- Navegador web atualizado
- ~10 minutos para configuração

## 🚀 Passo 1: Criar Projeto no Firebase

### 1.1 Acessar Firebase Console

1. Acesse [https://console.firebase.google.com](https://console.firebase.google.com)
2. Faça login com sua conta Google
3. Se for sua primeira vez, aceite os termos de serviço

### 1.2 Criar Novo Projeto

1. Clique no botão **"Adicionar projeto"** ou **"Create a project"**
2. **Nome do projeto**: Digite um nome (ex: `administro-financeiro`)
3. Clique em **"Continuar"**
4. **Google Analytics**: 
   - Você pode desabilitar (não é necessário para este projeto)
   - Ou habilitar se quiser métricas (opcional)
5. Clique em **"Criar projeto"**
6. Aguarde alguns segundos enquanto o Firebase cria o projeto
7. Clique em **"Continuar"** quando concluído

## 🔐 Passo 2: Configurar Authentication

### 2.1 Habilitar Authentication

1. No menu lateral esquerdo, clique em **"Authentication"** ou **"Autenticação"**
2. Se aparecer uma tela inicial, clique em **"Começar"** ou **"Get started"**
3. Você verá a tela de **"Sign-in method"** ou **"Método de login"**

### 2.2 Configurar Email/Password

1. Clique em **"Email/Password"** ou **"E-mail/Senha"**
2. **Habilite** o primeiro toggle (Email/Password)
3. **Desabilite** o segundo toggle (Email link) - não precisamos disso
4. Clique em **"Salvar"** ou **"Save"**

### 2.3 (Opcional) Configurar Usuários de Teste

1. Ainda na página de Authentication, vá na aba **"Users"**
2. Clique em **"Adicionar usuário"** ou **"Add user"**
3. Digite um email e senha de teste
4. Clique em **"Adicionar usuário"**

⚠️ **Importante**: Guarde essas credenciais, você vai precisar para testar o sistema!

## 💾 Passo 3: Configurar Firestore Database

### 3.1 Criar Database

1. No menu lateral, clique em **"Firestore Database"** ou **"Banco de dados Firestore"**
2. Clique em **"Criar banco de dados"** ou **"Create database"**
3. **Modo de produção**: Selecione **"Modo de produção"** (Production mode)
   - Isso cria regras de segurança mais restritivas
   - Vamos ajustar depois se necessário
4. Clique em **"Avançar"**
5. **Localização**: Escolha a região mais próxima do Brasil (ex: `southamerica-east1` - São Paulo)
6. Clique em **"Habilitar"** ou **"Enable"**
7. Aguarde alguns segundos enquanto o banco é criado

### 3.2 (Opcional) Configurar Regras Básicas

1. Vá na aba **"Rules"** ou **"Regras"**
2. Por enquanto, podemos deixar as regras padrão de produção:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```
3. **⚠️ IMPORTANTE**: Essas regras bloqueiam tudo! Vamos criar regras mais específicas na FASE 4 quando implementarmos autenticação no frontend.

## 📦 Passo 4: Configurar Storage

### 4.1 Habilitar Storage

1. No menu lateral, clique em **"Storage"** ou **"Armazenamento"**
2. Clique em **"Começar"** ou **"Get started"**
3. Leia as regras de segurança e clique em **"Avançar"**
4. **Localização**: Use a mesma região do Firestore (ex: `southamerica-east1`)
5. Clique em **"Concluído"** ou **"Done"**

### 4.2 (Opcional) Configurar Regras de Storage

1. Vá na aba **"Rules"**
2. Por enquanto, podemos deixar as regras padrão (tudo bloqueado)
3. Vamos ajustar quando implementarmos upload de comprovantes

## 🔑 Passo 5: Obter Credenciais do Frontend

### 5.1 Configurações do Projeto

1. No menu lateral, clique no **ícone de engrenagem** ⚙️ ao lado de "Visão geral do projeto"
2. Clique em **"Configurações do projeto"** ou **"Project settings"**
3. Role até a seção **"Seus apps"** ou **"Your apps"**

### 5.2 Adicionar App Web

1. Se ainda não tiver um app, clique no ícone **`</>`** (Web)
2. **Apelido do app**: Digite um nome (ex: `administro-web`)
3. **Não marque** a opção "Também configurar o Firebase Hosting" (não precisamos)
4. Clique em **"Registrar app"** ou **"Register app"**

### 5.3 Copiar Credenciais

Você verá um código JavaScript com as credenciais. Copie os seguintes valores:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",                    // ← Copie este valor
  authDomain: "seu-projeto.firebaseapp.com",  // ← Copie este valor
  projectId: "seu-projeto-id",          // ← Copie este valor
  storageBucket: "seu-projeto.appspot.com",   // ← Copie este valor
  messagingSenderId: "123456789",       // ← Copie este valor
  appId: "1:123456789:web:abc123"       // ← Copie este valor
};
```

**Guarde esses valores!** Você vai precisar configurá-los no Vercel.

## 🔐 Passo 6: Obter Service Account (Backend)

### 6.1 Acessar Service Accounts

1. Ainda na página de **"Configurações do projeto"**
2. Vá na aba **"Contas de serviço"** ou **"Service accounts"**
3. Role até ver a seção **"Firebase Admin SDK"**

### 6.2 Gerar Chave Privada

1. Clique no botão **"Gerar nova chave privada"** ou **"Generate new private key"**
2. Uma caixa de diálogo aparecerá avisando sobre segurança
3. Clique em **"Gerar chave"** ou **"Generate key"**
4. Um arquivo JSON será baixado automaticamente (ex: `seu-projeto-firebase-adminsdk-xxxxx.json`)

⚠️ **IMPORTANTE**: 
- **NUNCA** commite este arquivo no Git!
- Guarde este arquivo em local seguro
- Você vai usar o conteúdo deste arquivo no Railway

### 6.3 Preparar para Railway

O arquivo JSON baixado terá este formato:

```json
{
  "type": "service_account",
  "project_id": "seu-projeto-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

Para usar no Railway, você tem duas opções:

**Opção 1 (Recomendada)**: Copie o conteúdo completo do JSON e cole como uma única linha na variável `FIREBASE_SERVICE_ACCOUNT` do Railway. Mantenha todas as `\n` nas strings.

**Opção 2**: No Railway, você pode fazer upload do arquivo, mas a Opção 1 é mais segura.

## ✅ Passo 7: Verificar Configuração

### 7.1 Checklist de Verificação

Antes de configurar no Vercel/Railway, verifique se você tem:

- ✅ **Firebase Project ID**: Encontrado nas Configurações do Projeto
- ✅ **Authentication habilitado** (Email/Password)
- ✅ **Firestore Database criado** e rodando
- ✅ **Storage habilitado**
- ✅ **Credenciais do Frontend** (6 valores: apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)
- ✅ **Service Account JSON** baixado e guardado com segurança

### 7.2 Teste Rápido

1. No Firebase Console, vá em **Firestore Database**
2. Clique em **"Iniciar coleção"** ou **"Start collection"**
3. Coleção ID: `test`
4. Documento ID: `test-doc`
5. Campo: `test` (string) = `"Hello World"`
6. Clique em **"Salvar"**
7. Se aparecer na lista, o Firestore está funcionando! ✅
8. Você pode deletar esse teste depois

## 🔗 Passo 8: Configurar no Vercel

Agora que você tem todas as credenciais:

1. Acesse seu projeto no [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Settings** > **Environment Variables**
3. Adicione as seguintes variáveis:

```
NEXT_PUBLIC_FIREBASE_API_KEY=<seu-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<seu-projeto>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<seu-projeto-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<seu-projeto>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<seu-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<seu-app-id>
NEXT_PUBLIC_BACKEND_URL=https://<seu-backend>.railway.app
```

4. Selecione os ambientes: **Production**, **Preview**, **Development**
5. Clique em **Save**
6. Faça um novo deploy para aplicar as variáveis

## 🚂 Passo 9: Configurar no Railway

1. Acesse seu projeto no [Railway Dashboard](https://railway.app/dashboard)
2. Vá na aba **Variables**
3. Adicione as seguintes variáveis:

```
FIREBASE_SERVICE_ACCOUNT=<cole-o-json-completo-em-uma-linha>
FIREBASE_STORAGE_BUCKET=<seu-projeto>.appspot.com
```

**Importante para FIREBASE_SERVICE_ACCOUNT**: 
- Copie todo o conteúdo do arquivo JSON
- Remova as quebras de linha, mas mantenha `\n` dentro das strings
- Cole como uma única linha

4. Railway salvará automaticamente
5. O serviço reiniciará com as novas variáveis

## 🐛 Troubleshooting

### Erro: "Firebase: Error (auth/configuration-not-found)"
- **Causa**: Variáveis de ambiente não configuradas corretamente
- **Solução**: Verifique se todas as variáveis `NEXT_PUBLIC_*` estão configuradas no Vercel

### Erro: "Permission denied" no Firestore
- **Causa**: Regras de segurança bloqueando acesso
- **Solução**: Por enquanto, durante desenvolvimento, você pode temporariamente permitir tudo (⚠️ apenas para testes):
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if true;
      }
    }
  }
  ```
  **⚠️ ATENÇÃO**: Isso permite acesso público! Use apenas em desenvolvimento.

### Service Account não funciona no Railway
- **Causa**: JSON mal formatado ou quebras de linha incorretas
- **Solução**: 
  1. Copie o JSON completo
  2. Use um minificador JSON online
  3. Cole na variável `FIREBASE_SERVICE_ACCOUNT`
  4. Ou use a Opção 2 (upload de arquivo) se disponível

### Storage não permite upload
- **Causa**: Regras de Storage bloqueando
- **Solução**: Ajuste as regras na aba Rules do Storage (faremos isso na FASE 3)

## 📚 Recursos Adicionais

- [Documentação Oficial do Firebase](https://firebase.google.com/docs)
- [Guia de Firestore](https://firebase.google.com/docs/firestore)
- [Guia de Authentication](https://firebase.google.com/docs/auth)
- [Guia de Storage](https://firebase.google.com/docs/storage)

## ✅ Próximos Passos

Após configurar o Firebase:

1. ✅ Verifique que todas as variáveis estão configuradas
2. ✅ Teste o deploy no Vercel
3. ✅ Teste o backend no Railway
4. 🚀 Continue para **FASE 2**: Implementar Baileys e WhatsApp

---

**Dúvidas?** Consulte também o `SETUP.md` para instruções de setup local.

