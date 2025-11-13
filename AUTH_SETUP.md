# Configuração de Autenticação

Este projeto usa **Better Auth** para autenticação completa de usuários com email/senha, verificação de email e recuperação de senha.

## 📦 O que foi instalado

- `better-auth` - Biblioteca de autenticação moderna e completa
- `mysql2` - Driver MySQL para conexão direta com o banco
- `nodemailer` - Para envio de emails (verificação e reset de senha)
- `@types/nodemailer` - Tipos TypeScript para Nodemailer

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no seu arquivo `.env`:

```env
# Database (OBRIGATÓRIO)
DATABASE_URL=mysql://user:password@host:port/database

# App URL (OBRIGATÓRIO)
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SMTP para envio de emails (OBRIGATÓRIO)
# Recomendado: Resend (3.000 emails/mês grátis)
# Veja RESEND_SETUP.md para instruções completas
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Sua API Key do Resend
SMTP_FROM=noreply@seudominio.com  # Use onboarding@resend.dev para testes
```

### 2. Configurar SMTP

🎯 **Recomendado: Resend** - Veja o guia completo em [`RESEND_SETUP.md`](./RESEND_SETUP.md)

#### Opção 1: Resend (Recomendado) ⭐

1. **Crie uma conta:** https://resend.com/
2. **Gere uma API Key:** Dashboard → API Keys → Create API Key
3. **Configure no .env:**
   ```env
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=587
   SMTP_USER=resend
   SMTP_PASS=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Sua API Key
   SMTP_FROM=onboarding@resend.dev  # Para testes (ou seu domínio verificado)
   ```

**✅ Vantagens:**
- 3.000 emails/mês grátis (permanente)
- Moderno e fácil de usar
- Boa deliverability
- Dashboard completo

📖 **Guia completo:** [`RESEND_SETUP.md`](./RESEND_SETUP.md)

#### Opção 2: Gmail (Desenvolvimento)

1. Ative a verificação em duas etapas na sua conta Google
2. Gere uma "Senha de app" em: https://myaccount.google.com/apppasswords
3. Use a senha de app como `SMTP_PASS`

**Limitação:** Apenas 100 emails/dia

#### Opção 3: Outros provedores SMTP

- **Mailtrap** (desenvolvimento): Veja [`SMTP_OPTIONS.md`](./SMTP_OPTIONS.md)
- **SendGrid**: `SMTP_HOST=smtp.sendgrid.net`, `SMTP_PORT=587`
- **Mailgun**: `SMTP_HOST=smtp.mailgun.org`, `SMTP_PORT=587`
- **AWS SES**: Configure conforme documentação AWS

📚 **Veja todas as opções em:** [`SMTP_OPTIONS.md`](./SMTP_OPTIONS.md)

### 3. Executar Migration do Prisma

```bash
npx prisma migrate dev --name add-auth
npx prisma generate
```

**Nota**: O Better Auth cria suas próprias tabelas automaticamente. O modelo `User` do Prisma é sincronizado automaticamente via hooks.

## 🚀 Funcionalidades

### Autenticação
- ✅ Login com Email/Senha
- ✅ Registro de novos usuários
- ✅ Verificação de email após cadastro
- ✅ Recuperação de senha (esqueci minha senha)
- ✅ Sessões seguras
- ✅ Proteção de rotas
- ✅ Sincronização automática com modelo User do Prisma

### Banco de Dados
- ✅ Better Auth gerencia suas próprias tabelas automaticamente
- ✅ Modelo `User` do Prisma sincronizado via hooks
- ✅ Modelo `Build` relacionado com `User`

## 📝 Fluxos de Autenticação

### 1. Registro de Usuário

1. Usuário preenche formulário em `/auth/signup`
2. Better Auth cria usuário no banco (senha hasheada automaticamente)
3. Better Auth gera token de verificação (válido por 24h)
4. Email de verificação é enviado automaticamente
5. Hook sincroniza com modelo `User` do Prisma
6. Usuário recebe mensagem: "Verifique seu email para ativar sua conta"
7. Usuário clica no link do email
8. Better Auth marca email como verificado
9. Hook atualiza `emailVerified` no Prisma
10. Usuário é redirecionado para `/auth/signin?verified=true`

### 2. Verificação de Email

- Link no email é gerenciado pelo Better Auth
- Token expira em 24 horas
- Após verificação, token é deletado automaticamente
- Sincronização automática com Prisma

### 3. Recuperação de Senha

1. Usuário acessa `/auth/reset`
2. Digite email e clica em "Enviar link de redefinição"
3. Better Auth gera token de reset (válido por 1h)
4. Email com link é enviado
5. Usuário clica no link: `/auth/reset/[token]`
6. Usuário define nova senha
7. Better Auth atualiza senha e deleta token
8. Redireciona para `/auth/signin?reset=success`

**Segurança**: Sistema sempre retorna sucesso mesmo se email não existir (para não revelar emails cadastrados)

### 4. Login

- Usuário faz login em `/auth/signin`
- Better Auth valida credenciais
- Cria sessão segura
- Redireciona para página inicial

## 📝 Como Usar

### No Frontend

```tsx
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/better-auth/client";

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <div>Faça login</div>;

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <div>
      <p>Olá, {user?.name}!</p>
      <button onClick={handleSignOut}>Sair</button>
    </div>
  );
}
```

### No Backend (API Routes)

```tsx
import { getServerSession } from "@/lib/better-auth/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Usuário autenticado
  const userId = session.user.id;
  // ...
}
```

### Verificar se Email foi Verificado

```tsx
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/better-auth/server";

export async function GET(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true }
  });

  if (!user?.emailVerified) {
    return NextResponse.json(
      { error: "Email não verificado" },
      { status: 403 }
    );
  }

  // Continuar...
}
```

## 🔐 Rotas Protegidas

As seguintes rotas estão protegidas no middleware:
- `/admin/*` - Requer autenticação
- `/builds/create/*` - Requer autenticação

## 📄 Páginas Criadas

- `/auth/signin` - Página de login
- `/auth/signup` - Página de registro
- `/auth/reset` - Solicitar reset de senha
- `/auth/reset/[token]` - Redefinir senha com token
- `/auth/error` - Página de erros de autenticação

## 🔌 API Routes

- `/api/auth/[...better]` - API do Better Auth (handler principal)
- `/api/builds` - API para gerenciar builds do usuário

## 🎨 Componentes e Hooks

- `components/providers/session-provider.tsx` - Provider de sessão (Better Auth)
- `hooks/use-auth.ts` - Hook para usar autenticação
- `lib/better-auth/auth.ts` - Configuração do servidor Better Auth
- `lib/better-auth/client.ts` - Cliente Better Auth para frontend
- `lib/better-auth/server.ts` - Helper para obter sessão no servidor

## 🛡️ Segurança

### Tokens
- Tokens de verificação: expiram em 24 horas
- Tokens de reset: expiram em 1 hora
- Tokens são deletados após uso automaticamente
- Gerenciamento automático pelo Better Auth

### Senhas
- Hash automático pelo Better Auth (bcrypt)
- Mínimo de 6 caracteres
- Validação no frontend e backend

### Sincronização com Prisma
- Hooks automáticos sincronizam usuários criados/atualizados
- Modelo `User` do Prisma sempre atualizado
- Relacionamento com `Build` mantido

## 🔄 Próximos Passos

1. ✅ Configure as variáveis de ambiente (especialmente SMTP e DATABASE_URL)
2. ✅ Execute a migration do Prisma
3. ✅ Teste o registro e verificação de email
4. ✅ Teste o reset de senha
5. ✅ Configure SMTP em produção
6. ✅ Verifique sincronização com modelo User do Prisma
7. ✅ Adicione logs de auditoria para ações sensíveis

## 🐛 Troubleshooting

### Emails não estão sendo enviados
- Verifique as variáveis SMTP no `.env`
- Teste a conexão SMTP manualmente
- Verifique logs do servidor para erros

### Token de verificação não funciona
- Verifique se o token não expirou (24h para verificação, 1h para reset)
- Verifique se `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` estão corretos no `.env`
- Verifique logs do servidor

### Erro de conexão com banco de dados
- Verifique se `DATABASE_URL` está no formato correto: `mysql://user:password@host:port/database`
- Verifique se o banco de dados está acessível
- Verifique logs do servidor

### Usuário não sincroniza com Prisma
- Verifique logs do servidor para erros nos hooks
- Certifique-se de que o modelo `User` existe no Prisma
- Verifique se o email é único no banco

## 📚 Documentação

Para mais informações sobre Better Auth, consulte: https://www.better-auth.com/
