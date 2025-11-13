# Variáveis de Ambiente

Este documento descreve todas as variáveis de ambiente necessárias para o projeto.

## 📋 Arquivo .env

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL=mysql://username:password@host:port/database

# ============================================
# APPLICATION CONFIGURATION
# ============================================
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# SMTP CONFIGURATION (Email)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=noreply@seudominio.com
```

## 🔧 Configuração Detalhada

### DATABASE_URL

**Formato:** `mysql://username:password@host:port/database`

**Importante:** Se sua senha contém caracteres especiais, você precisa codificá-los usando URL encoding:

- `^` → `%5E`
- `=` → `%3D`
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `*` → `%2A`
- `+` → `%2B`
- `,` → `%2C`
- `/` → `%2F`
- `:` → `%3A`
- `;` → `%3B`
- `?` → `%3F`
- `[` → `%5B`
- `]` → `%5D`

**Exemplo:**
- Senha original: `minhaSenha^123=abc!`
- Senha codificada: `minhaSenha%5E123%3Dabc%21`
- URL completa: `mysql://usuario:minhaSenha%5E123%3Dabc%21@host:port/database`

### NEXTAUTH_URL e NEXT_PUBLIC_APP_URL

URL base da aplicação. Use `http://localhost:3000` para desenvolvimento local.

**Produção:** Altere para a URL do seu domínio, ex: `https://seudominio.com`

### SMTP Configuration

🎯 **Solução Recomendada: Resend** - Veja o guia completo em [`RESEND_SETUP.md`](./RESEND_SETUP.md)

📚 **Para outras opções SMTP, consulte:** [`SMTP_OPTIONS.md`](./SMTP_OPTIONS.md)

#### Configuração do Resend (Recomendado):

1. **Crie uma conta:** https://resend.com/
2. **Gere uma API Key:** Dashboard → API Keys → Create API Key
3. **Configure no .env:**

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Sua API Key do Resend
SMTP_FROM=noreply@seudominio.com  # Use onboarding@resend.dev para testes
```

**✅ Vantagens do Resend:**
- 3.000 emails/mês grátis (permanente)
- Moderno e fácil de usar
- Boa deliverability
- Dashboard completo

**📖 Guia completo:** [`RESEND_SETUP.md`](./RESEND_SETUP.md)

#### Outras Opções:

**Desenvolvimento/Testes:**
- **Mailtrap** (grátis, não envia emails reais) - Veja [`SMTP_OPTIONS.md`](./SMTP_OPTIONS.md)
- **Gmail** (100 emails/dia grátis)

**Produção Alternativa:**
- **SendGrid** (100 emails/dia grátis)
- **Mailgun** (5.000 emails/mês grátis inicialmente)
- **AWS SES** (muito barato para alto volume)

## 🚀 Script de Configuração

Você pode usar o script interativo para configurar o `.env`:

```bash
node scripts/setup-env.js
```

Este script irá perguntar todas as informações necessárias e criar o arquivo `.env` automaticamente.

## 🔒 Segurança

⚠️ **IMPORTANTE:**

1. **NUNCA** commite o arquivo `.env` no git
2. O arquivo `.env` já está no `.gitignore`
3. Use `.env.example` ou este documento como referência
4. Em produção, use variáveis de ambiente do seu provedor de hospedagem
5. Rotacione senhas e chaves regularmente

## ✅ Verificação

Após configurar o `.env`, você pode verificar se tudo está correto:

1. Reinicie o servidor Next.js
2. Verifique os logs - deve aparecer: `✅ Conexão com MySQL estabelecida com sucesso`
3. Teste o registro/login na aplicação

## 🐛 Troubleshooting

### Erro: "DATABASE_URL não está definida"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Reinicie o servidor após criar/modificar o `.env`

### Erro: "Access denied for user"
- Verifique se as credenciais estão corretas
- Verifique se o IP está permitido no banco de dados
- Verifique se a senha está codificada corretamente na URL

### Erro: "Invalid DATABASE_URL format"
- Verifique o formato da URL: `mysql://user:password@host:port/database`
- Certifique-se de que caracteres especiais estão codificados

### Emails não são enviados
- Verifique as credenciais SMTP
- Para Gmail, use senha de app (não a senha normal)
- Verifique se a porta está correta (587 para TLS, 465 para SSL)

