# Opções de SMTP para Envio de Emails

Este documento lista todas as soluções SMTP disponíveis, desde opções gratuitas até serviços pagos profissionais.

## 📊 Comparação Rápida

| Serviço | Tipo | Limite Grátis | Custo | Melhor Para |
|---------|------|---------------|-------|-------------|
| **Gmail** | Gratuito | 100 emails/dia | Grátis | Desenvolvimento/Testes |
| **SendGrid** | Freemium | 100 emails/dia | $19.95/mês | Pequenos projetos |
| **Mailgun** | Freemium | 5.000 emails/mês | $35/mês | Desenvolvimento |
| **Resend** | Freemium | 3.000 emails/mês | $20/mês | Aplicações modernas |
| **Brevo (Sendinblue)** | Freemium | 300 emails/dia | €25/mês | Pequenas empresas |
| **AWS SES** | Pago | $0.10 por 1.000 | Muito barato | Alta escala |
| **Postmark** | Pago | - | $15/mês | Confiabilidade |
| **Mailtrap** | Freemium | 500 emails/mês | $15/mês | Desenvolvimento/Testes |

---

## 🆓 Opções Gratuitas

### 1. Gmail SMTP

**Limite:** 100 emails por dia
**Ideal para:** Desenvolvimento, testes, projetos pessoais

#### Configuração:

1. **Ative a verificação em duas etapas:**
   - Acesse: https://myaccount.google.com/security
   - Ative "Verificação em duas etapas"

2. **Gere uma Senha de App:**
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "App" → "Email"
   - Selecione "Dispositivo" → "Outro (nome personalizado)"
   - Digite "Varena App" e clique em "Gerar"
   - Copie a senha gerada (16 caracteres)

3. **Configure no .env:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Senha de app gerada (sem espaços)
SMTP_FROM=noreply@seudominio.com
```

**⚠️ Limitações:**
- Máximo 100 emails por dia
- Pode ir para spam se enviar muitos emails
- Não recomendado para produção com alto volume

---

### 2. Mailtrap (Desenvolvimento)

**Limite:** 500 emails/mês no plano gratuito
**Ideal para:** Desenvolvimento e testes (emails não são enviados de verdade)

#### Configuração:

1. **Crie uma conta:** https://mailtrap.io/

2. **Configure no .env:**
```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=seu-user-id-mailtrap
SMTP_PASS=sua-senha-mailtrap
SMTP_FROM=noreply@seudominio.com
```

**✅ Vantagens:**
- Perfeito para desenvolvimento
- Não envia emails reais (captura todos)
- Interface web para ver emails
- Não vai para spam

**❌ Desvantagens:**
- Não envia emails reais
- Limite de 500 emails/mês no gratuito

---

## 💰 Opções Freemium (Gratuito com limites)

### 3. SendGrid

**Limite Grátis:** 100 emails por dia (permanente)
**Plano Pago:** A partir de $19.95/mês (40.000 emails)

#### Configuração:

1. **Crie uma conta:** https://sendgrid.com/

2. **Crie uma API Key:**
   - Settings → API Keys → Create API Key
   - Dê um nome e selecione "Full Access"
   - Copie a API Key gerada

3. **Configure no .env:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua-api-key-gerada-aqui
SMTP_FROM=noreply@seudominio.com
```

**✅ Vantagens:**
- Confiável e rápido
- Boa documentação
- Analytics de emails
- Suporte a templates

**❌ Desvantagens:**
- Limite de 100 emails/dia no gratuito
- Pode ser caro para alto volume

---

### 4. Mailgun

**Limite Grátis:** 5.000 emails/mês (primeiros 3 meses), depois 1.000/mês
**Plano Pago:** A partir de $35/mês (50.000 emails)

#### Configuração:

1. **Crie uma conta:** https://www.mailgun.com/

2. **Obtenha credenciais SMTP:**
   - Sending → Domain Settings → SMTP credentials
   - Copie o usuário e senha SMTP

3. **Configure no .env:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@seu-dominio.mailgun.org
SMTP_PASS=sua-senha-smtp-mailgun
SMTP_FROM=noreply@seudominio.com
```

**✅ Vantagens:**
- 5.000 emails/mês grátis (inicialmente)
- Muito confiável
- Boa para desenvolvimento

**❌ Desvantagens:**
- Limite reduz após 3 meses
- Precisa verificar domínio para produção

---

### 5. Resend

**Limite Grátis:** 3.000 emails/mês
**Plano Pago:** A partir de $20/mês (50.000 emails)

#### Configuração:

1. **Crie uma conta:** https://resend.com/

2. **Obtenha API Key:**
   - API Keys → Create API Key
   - Copie a chave gerada

3. **Configure no .env:**
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=sua-api-key-resend
SMTP_FROM=noreply@seudominio.com
```

**✅ Vantagens:**
- Moderno e fácil de usar
- Boa documentação
- 3.000 emails/mês grátis
- Focado em desenvolvedores

**❌ Desvantagens:**
- Serviço mais novo (menos histórico)
- Precisa verificar domínio

---

### 6. Brevo (Sendinblue)

**Limite Grátis:** 300 emails por dia
**Plano Pago:** A partir de €25/mês (20.000 emails)

#### Configuração:

1. **Crie uma conta:** https://www.brevo.com/

2. **Obtenha credenciais SMTP:**
   - Settings → SMTP & API → SMTP
   - Copie servidor, porta, login e senha

3. **Configure no .env:**
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=seu-email@brevo.com
SMTP_PASS=sua-senha-smtp-brevo
SMTP_FROM=noreply@seudominio.com
```

**✅ Vantagens:**
- 300 emails/dia grátis
- Interface amigável
- Inclui marketing email

**❌ Desvantagens:**
- Pode ir para spam se não configurar SPF/DKIM
- Limite diário (não mensal)

---

## 🏢 Opções Profissionais Pagas

### 7. AWS SES (Amazon Simple Email Service)

**Custo:** $0.10 por 1.000 emails
**Ideal para:** Alto volume, escalabilidade

#### Configuração:

1. **Crie uma conta AWS:** https://aws.amazon.com/

2. **Configure SES:**
   - SES → SMTP Settings → Create SMTP Credentials
   - Copie as credenciais geradas

3. **Configure no .env:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com  # Use sua região
SMTP_PORT=587
SMTP_USER=sua-access-key-id
SMTP_PASS=sua-secret-access-key
SMTP_FROM=noreply@seudominio.com
```

**✅ Vantagens:**
- Muito barato para alto volume
- Altamente escalável
- Confiável (AWS)
- Pay-as-you-go

**❌ Desvantagens:**
- Configuração mais complexa
- Precisa verificar domínio
- Sandbox mode inicialmente (apenas emails verificados)

**Regiões disponíveis:**
- `us-east-1` (N. Virginia)
- `us-west-2` (Oregon)
- `eu-west-1` (Ireland)
- `ap-southeast-1` (Singapore)
- etc.

---

### 8. Postmark

**Custo:** A partir de $15/mês (10.000 emails)
**Ideal para:** Confiabilidade máxima, transacionais

#### Configuração:

1. **Crie uma conta:** https://postmarkapp.com/

2. **Obtenha Server API Token:**
   - Servers → Create Server
   - Copie o Server API Token

3. **Configure no .env:**
```env
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USER=seu-server-api-token
SMTP_PASS=seu-server-api-token  # Mesmo valor
SMTP_FROM=noreply@seudominio.com
```

**✅ Vantagens:**
- Extremamente confiável
- Focado em emails transacionais
- Excelente deliverability
- Suporte excepcional

**❌ Desvantagens:**
- Mais caro que alternativas
- Sem plano gratuito

---

## 🧪 Recomendações por Caso de Uso

### Para Desenvolvimento/Testes
1. **Mailtrap** - Não envia emails reais, perfeito para dev
2. **Gmail** - Se precisar testar envio real

### Para Projetos Pequenos (< 100 emails/dia)
1. **Gmail** - Grátis e simples
2. **Resend** - Se precisar de mais volume

### Para Projetos Médios (100-5.000 emails/mês)
1. **SendGrid** - Boa relação custo/benefício
2. **Mailgun** - Se ainda estiver no período promocional
3. **Resend** - Moderno e fácil

### Para Alto Volume (> 10.000 emails/mês)
1. **AWS SES** - Mais barato
2. **SendGrid** - Se precisar de features extras
3. **Postmark** - Se precisar de máxima confiabilidade

### Para Emails Transacionais Críticos
1. **Postmark** - Melhor deliverability
2. **AWS SES** - Se já usar AWS

---

## 🔧 Configuração Adicional Recomendada

### Para Produção (Todos os Serviços)

1. **Configure SPF Record:**
```
TXT @ "v=spf1 include:servidor-smtp.com ~all"
```

2. **Configure DKIM:**
- Obtenha a chave DKIM do seu provedor SMTP
- Adicione como registro TXT no DNS

3. **Configure DMARC:**
```
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:admin@seudominio.com"
```

4. **Use domínio verificado:**
- Sempre use `SMTP_FROM` com seu domínio verificado
- Não use emails genéricos (@gmail.com, etc.) em produção

---

## 📝 Exemplo de Configuração Completa

### Desenvolvimento (Mailtrap)
```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=seu-user-id
SMTP_PASS=sua-senha
SMTP_FROM=noreply@teste.local
```

### Produção (SendGrid)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxx
SMTP_FROM=noreply@seudominio.com
```

---

## 🚀 Migrando Entre Serviços

Para trocar de serviço SMTP, basta atualizar as variáveis no `.env`:

1. Pare o servidor
2. Atualize as variáveis `SMTP_*` no `.env`
3. Reinicie o servidor
4. Teste o envio de email

**Não é necessário alterar código!** O código já está preparado para usar qualquer serviço SMTP compatível.

---

## ❓ Qual Escolher?

**Comece com:**
- **Desenvolvimento:** Mailtrap (grátis, não envia emails reais)
- **Produção pequena:** Gmail ou Resend
- **Produção média:** SendGrid ou Mailgun
- **Produção grande:** AWS SES

**Dica:** Comece com Mailtrap para desenvolvimento e depois migre para um serviço de produção quando estiver pronto!


