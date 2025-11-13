# Configuração do Resend SMTP

Este guia mostra como configurar o Resend como seu provedor SMTP.

## 🚀 Por que Resend?

- ✅ **3.000 emails/mês grátis** (permanente)
- ✅ Moderno e focado em desenvolvedores
- ✅ API simples e documentação excelente
- ✅ Boa deliverability (emails não vão para spam)
- ✅ Dashboard intuitivo
- ✅ $20/mês para 50.000 emails (muito barato)

## 📋 Passo a Passo

### 1. Criar Conta no Resend

1. Acesse: https://resend.com/
2. Clique em "Sign Up" (canto superior direito)
3. Crie sua conta (pode usar GitHub, Google ou email)

### 2. Verificar Domínio (Opcional mas Recomendado)

**Para produção, você DEVE verificar seu domínio:**

1. No dashboard do Resend, vá em **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio (ex: `seudominio.com`)
4. O Resend fornecerá registros DNS para adicionar:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT - opcional)

5. Adicione esses registros no seu provedor DNS (onde você gerencia seu domínio)
6. Aguarde alguns minutos para propagação
7. Clique em **Verify** no Resend

**✅ Domínio verificado = emails não vão para spam!**

### 3. Obter API Key

1. No dashboard do Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Dê um nome (ex: "Varena Production")
4. Selecione as permissões:
   - ✅ **Sending access** (obrigatório)
   - ✅ **Full access** (recomendado para começar)
5. Clique em **Add**
6. **COPIE A API KEY** (ela só aparece uma vez!)

### 4. Configurar no Projeto

Adicione as seguintes variáveis no seu arquivo `.env`:

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM=noreply@seudominio.com
```

**Importante:**
- `SMTP_USER` sempre é `resend` (não seu email)
- `SMTP_PASS` é sua API Key do Resend
- `SMTP_FROM` deve ser um email do domínio verificado (ou use `onboarding@resend.dev` para testes)

### 5. Testar Configuração

1. Reinicie o servidor Next.js:
   ```bash
   npm run dev
   ```

2. Teste o registro de um novo usuário:
   - Acesse `/auth/signup`
   - Crie uma conta
   - Verifique se recebeu o email de verificação

3. Verifique no dashboard do Resend:
   - Vá em **Emails** → **Logs**
   - Você verá todos os emails enviados
   - Status: "Delivered", "Bounced", etc.

## 🔧 Configuração para Desenvolvimento

### Usando Domínio de Teste do Resend

Se você ainda não tem um domínio verificado, pode usar o domínio de teste do Resend:

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM=onboarding@resend.dev
```

**⚠️ Limitação:**
- Emails enviados de `onboarding@resend.dev` só funcionam para emails que você adicionou como "test recipients"
- Vá em **Settings** → **Test Recipients** e adicione seus emails de teste

### Usando Mailtrap para Desenvolvimento

Para desenvolvimento local, você pode usar Mailtrap (não envia emails reais):

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=seu-user-id-mailtrap
SMTP_PASS=sua-senha-mailtrap
SMTP_FROM=noreply@teste.local
```

## 📊 Monitoramento

O Resend oferece um dashboard completo:

- **Emails Logs:** Veja todos os emails enviados
- **Analytics:** Taxa de entrega, aberturas, cliques
- **Domains:** Status de verificação dos domínios
- **API Keys:** Gerencie suas chaves

## 🎯 Limites e Preços

### Plano Gratuito
- ✅ 3.000 emails/mês
- ✅ 100 emails/dia
- ✅ Sempre grátis
- ✅ Suporte por email

### Plano Pro ($20/mês)
- ✅ 50.000 emails/mês
- ✅ Sem limite diário
- ✅ Suporte prioritário
- ✅ Analytics avançados

### Plano Business ($80/mês)
- ✅ 200.000 emails/mês
- ✅ Suporte dedicado
- ✅ SLA garantido

## 🐛 Troubleshooting

### Erro: "Authentication failed"
- Verifique se `SMTP_USER` está como `resend` (não seu email)
- Verifique se a API Key está correta
- Certifique-se de copiar a API Key completa (começa com `re_`)

### Emails não estão sendo enviados
- Verifique os logs no dashboard do Resend
- Verifique se o domínio está verificado (para produção)
- Se usando `onboarding@resend.dev`, adicione seu email em Test Recipients

### Emails vão para spam
- Verifique seu domínio no Resend
- Configure SPF, DKIM e DMARC corretamente
- Use um domínio verificado (não `onboarding@resend.dev`)

### Limite de emails atingido
- Verifique quantos emails você enviou no dashboard
- Aguarde o reset mensal (dia 1 de cada mês)
- Considere fazer upgrade para o plano Pro

## 🔒 Segurança

- ✅ **NUNCA** commite sua API Key no git
- ✅ Use variáveis de ambiente (`.env`)
- ✅ Rotacione API Keys regularmente
- ✅ Use diferentes API Keys para dev/prod
- ✅ Revogue API Keys não utilizadas

## 📚 Recursos Adicionais

- **Documentação:** https://resend.com/docs
- **Dashboard:** https://resend.com/emails
- **Status:** https://status.resend.com/
- **Suporte:** support@resend.com

## ✅ Checklist de Configuração

- [ ] Conta criada no Resend
- [ ] API Key gerada e copiada
- [ ] Variáveis adicionadas no `.env`
- [ ] Domínio verificado (para produção)
- [ ] Teste de envio realizado
- [ ] Emails sendo recebidos corretamente
- [ ] Dashboard do Resend monitorado

---

**Pronto!** Seu Resend está configurado e pronto para enviar emails! 🎉


