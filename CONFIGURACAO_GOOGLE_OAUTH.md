# 🔐 Configuração Google OAuth e Gmail SMTP

## 📋 Status Atual

Seu arquivo `.env` possui as variáveis necessárias, mas estão **vazias**:

```env
GOOGLE_CLIENT_SECRET=
VITE_GOOGLE_CLIENT_ID=
GMAIL_APP_PASSWORD=
```

---

## 🎯 PASSO 1: Obter Credenciais do Google OAuth

### 1.1. Acesse o Google Cloud Console
👉 **Link:** https://console.cloud.google.com

### 1.2. Criar/Selecionar Projeto
1. Clique em **"Select a project"** no topo
2. Clique em **"New Project"**
3. Nome do projeto: `BíbliaFS` (ou qualquer nome)
4. Clique em **"Create"**
5. Aguarde a criação e selecione o projeto

### 1.3. Ativar APIs Necessárias
1. No menu lateral, vá em: **APIs & Services** > **Library**
2. Procure por: **"Google+ API"** ou **"People API"**
3. Clique em **"Enable"**

### 1.4. Criar Credenciais OAuth 2.0
1. Vá em: **APIs & Services** > **Credentials**
2. Clique em: **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
3. Se aparecer aviso sobre "consent screen":
   - Clique em **"CONFIGURE CONSENT SCREEN"**
   - Escolha **"External"** (para qualquer usuário Google)
   - Clique em **"Create"**
   - Preencha apenas os campos obrigatórios:
     - **App name:** BíbliaFS
     - **User support email:** seu@email.com
     - **Developer contact:** seu@email.com
   - Clique em **"Save and Continue"** até finalizar
   - Volte para **Credentials**

4. Novamente: **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
5. **Application type:** Selecione **"Web application"**
6. **Name:** BíbliaFS Web
7. **Authorized JavaScript origins:**
   ```
   http://localhost:5000
   https://bibliafs.com.br
   ```
8. **Authorized redirect URIs:**
   ```
   http://localhost:5000/api/auth/google/callback
   https://bibliafs.com.br/api/auth/google/callback
   ```
9. Clique em **"CREATE"**

### 1.5. Copiar as Credenciais
Uma janela aparecerá com:
- **Client ID** (algo como: `123456789-abc123.apps.googleusercontent.com`)
- **Client Secret** (algo como: `GOCSPX-abc123xyz789`)

**⚠️ GUARDE ESSES VALORES!**

---

## 📧 PASSO 2: Gerar Gmail App Password (OPCIONAL)

> **Nota:** Isso é opcional. O sistema já funciona via Supabase sem isso.  
> Com Gmail SMTP você terá emails personalizados (de: bibliafs3@gmail.com)

### 2.1. Requisitos
- Ter uma conta Gmail (bibliafs3@gmail.com)
- **2-Step Verification ativada** (obrigatório)

### 2.2. Ativar 2-Step Verification (se não estiver ativo)
1. Acesse: https://myaccount.google.com/security
2. Em "Signing in to Google", clique em **"2-Step Verification"**
3. Clique em **"Get Started"** e siga as instruções

### 2.3. Gerar App Password
1. Acesse: https://myaccount.google.com/apppasswords
2. Faça login com a conta Gmail (bibliafs3@gmail.com)
3. Em "App passwords", clique em **"Select app"**
4. Escolha **"Mail"** ou **"Other (Custom name)"**
5. Digite: **"BíbliaFS"**
6. Clique em **"Generate"**
7. Aparecerá uma senha de 16 caracteres (ex: `abcd efgh ijkl mnop`)
8. **Copie essa senha** (sem espaços: `abcdefghijklmnop`)

**⚠️ GUARDE ESSA SENHA! Ela aparece apenas uma vez.**

---

## ⚙️ PASSO 3: Configurar o arquivo .env

Abra o arquivo `.env` e **substitua as linhas vazias** pelos valores obtidos:

### 3.1. Google OAuth (OBRIGATÓRIO para login com Google)
```env
# Auth / Google
GOOGLE_CLIENT_SECRET=GOCSPX-sua_secret_key_aqui
VITE_GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
```

**Exemplo real (fictício):**
```env
GOOGLE_CLIENT_SECRET=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H
VITE_GOOGLE_CLIENT_ID=987654321-abc123xyz789.apps.googleusercontent.com
```

### 3.2. Gmail SMTP (OPCIONAL para emails personalizados)
```env
# E-mail
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**Exemplo real (fictício):**
```env
GMAIL_APP_PASSWORD=xyzwabcd1234efgh
```

---

## ✅ PASSO 4: Testar as Configurações

### 4.1. Reiniciar o Servidor
```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

### 4.2. Testar Google OAuth
1. Acesse: http://localhost:5000/login
2. Clique em **"Acessar com Google"**
3. Deve abrir a tela de permissão do Google
4. Após permitir, deve fazer login com sucesso

### 4.3. Testar Email (se configurou GMAIL_APP_PASSWORD)
1. Acesse: http://localhost:5000/register
2. Crie uma conta nova
3. Verifique se o email OTP chegou

### 4.4. Debug Endpoint
Acesse para verificar configuração:
```
http://localhost:5000/api/auth/google/debug
```

Deve retornar:
```json
{
  "hasClientId": true,
  "clientIdPrefix": "123456789-...",
  "hasClientSecret": true,
  "secretLength": 35,
  "appUrl": "http://localhost:5000",
  "redirectUri": "http://localhost:5000/api/auth/google/callback"
}
```

---

## 🔄 PASSO 5: Configurar Produção

Quando for para produção (bibliafs.com.br), **repita o processo**:

1. No Google Cloud Console, edite as credenciais OAuth:
   - Adicione aos **Authorized redirect URIs**:
     ```
     https://bibliafs.com.br/api/auth/google/callback
     ```

2. No servidor de produção, configure o `.env`:
   ```env
   VITE_APP_URL=https://bibliafs.com.br
   GOOGLE_CLIENT_SECRET=GOCSPX-sua_secret_key
   VITE_GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
   GMAIL_APP_PASSWORD=seu_app_password
   ```

---

## ❓ Solução de Problemas

### Erro: "redirect_uri_mismatch"
**Causa:** URI não autorizada no Google Console  
**Solução:** Verifique se adicionou exatamente:
```
http://localhost:5000/api/auth/google/callback
```

### Erro: "access_denied"
**Causa:** Usuário cancelou ou app não verificado  
**Solução:** No Google Console, adicione usuários de teste em "OAuth consent screen" > "Test users"

### Erro: "Invalid credentials"
**Causa:** GMAIL_APP_PASSWORD incorreto  
**Solução:** Gere um novo App Password (o antigo se torna inválido após gerar novo)

### Email não chega (registro)
**Causa:** GMAIL_APP_PASSWORD vazio ou inválido  
**Solução:** Sistema usa fallback Supabase. Configure GMAIL_APP_PASSWORD ou continue usando Supabase (já funciona)

---

## 📝 Checklist Final

- [ ] Criei projeto no Google Cloud Console
- [ ] Ativei Google+ API
- [ ] Criei OAuth 2.0 Client ID
- [ ] Adicionei redirect URIs corretos
- [ ] Copiei Client ID e Client Secret
- [ ] (Opcional) Ativei 2-Step Verification no Gmail
- [ ] (Opcional) Gerei Gmail App Password
- [ ] Colei os valores no arquivo .env
- [ ] Reiniciei o servidor
- [ ] Testei login com Google
- [ ] Testei registro com email

---

## 🎉 Pronto!

Após seguir esses passos, seu sistema terá:

✅ **Login com Google funcionando**  
✅ **Emails personalizados (se configurou Gmail SMTP)**  
✅ **Sistema 100% funcional**

**Dúvidas?** Revise o passo que deu erro no checklist.
