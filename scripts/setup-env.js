#!/usr/bin/env node
/**
 * Script para ajudar a configurar o arquivo .env
 * Uso: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function encodePassword(password) {
  return password.replace(/[^a-zA-Z0-9]/g, (c) =>
    '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')
  );
}

async function main() {
  console.log('\n🔧 Configuração do arquivo .env\n');
  console.log('Este script irá ajudá-lo a configurar suas variáveis de ambiente.\n');

  // Verificar se .env já existe
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  O arquivo .env já existe. Deseja sobrescrever? (s/N): ');
    if (overwrite.toLowerCase() !== 's' && overwrite.toLowerCase() !== 'sim') {
      console.log('❌ Operação cancelada.');
      rl.close();
      return;
    }
  }

  console.log('\n📋 Por favor, forneça as seguintes informações:\n');

  // Database
  console.log('--- CONFIGURAÇÃO DO BANCO DE DADOS ---');
  const dbHost = await question('Host do banco de dados (ex: localhost ou 46.4.112.197): ');
  const dbPort = await question('Porta do banco de dados (ex: 3306 ou 8010): ') || '3306';
  const dbUser = await question('Usuário do banco de dados: ');
  const dbPassword = await question('Senha do banco de dados: ');
  const dbName = await question('Nome do banco de dados: ');

  // Codificar senha para URL
  const encodedPassword = encodePassword(dbPassword);
  const encodedUser = encodeURIComponent(dbUser);
  const databaseUrl = `mysql://${encodedUser}:${encodedPassword}@${dbHost}:${dbPort}/${dbName}`;

  // App URLs
  console.log('\n--- CONFIGURAÇÃO DA APLICAÇÃO ---');
  const appUrl = await question('URL da aplicação (ex: http://localhost:3000): ') || 'http://localhost:3000';

  // SMTP
  console.log('\n--- CONFIGURAÇÃO SMTP (Email) ---');
  console.log('💡 Recomendado: Resend (3.000 emails/mês grátis)');
  console.log('   Crie uma conta em: https://resend.com/');
  console.log('   Obtenha sua API Key em: Dashboard → API Keys\n');

  const smtpProvider = await question('Provedor SMTP (resend/gmail/mailtrap/outro) [resend]: ') || 'resend';

  let smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom;

  if (smtpProvider.toLowerCase() === 'resend') {
    smtpHost = 'smtp.resend.com';
    smtpPort = '587';
    smtpUser = 'resend';
    smtpPass = await question('API Key do Resend (começa com re_): ');
    smtpFrom = await question('Email remetente (use onboarding@resend.dev para testes): ') || 'onboarding@resend.dev';
    console.log('\n✅ Configuração do Resend selecionada!');
    console.log('📖 Veja RESEND_SETUP.md para instruções completas.\n');
  } else if (smtpProvider.toLowerCase() === 'mailtrap') {
    smtpHost = 'sandbox.smtp.mailtrap.io';
    smtpPort = '2525';
    smtpUser = await question('User ID do Mailtrap: ');
    smtpPass = await question('Senha do Mailtrap: ');
    smtpFrom = await question('Email remetente (ex: noreply@teste.local): ') || 'noreply@teste.local';
    console.log('\n✅ Configuração do Mailtrap selecionada (desenvolvimento/testes)!\n');
  } else if (smtpProvider.toLowerCase() === 'gmail') {
    smtpHost = 'smtp.gmail.com';
    smtpPort = '587';
    smtpUser = await question('Email do Gmail: ');
    smtpPass = await question('Senha de app do Gmail (gere em: https://myaccount.google.com/apppasswords): ');
    smtpFrom = smtpUser;
    console.log('\n✅ Configuração do Gmail selecionada!\n');
  } else {
    smtpHost = await question('Host SMTP: ');
    smtpPort = await question('Porta SMTP (ex: 587): ') || '587';
    smtpUser = await question('Usuário SMTP: ');
    smtpPass = await question('Senha SMTP: ');
    smtpFrom = await question('Email remetente: ') || smtpUser;
  }

  // Gerar conteúdo do .env
  const envContent = `# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL="${databaseUrl}"

# ============================================
# APPLICATION CONFIGURATION
# ============================================
NEXTAUTH_URL="${appUrl}"
NEXT_PUBLIC_APP_URL="${appUrl}"

# ============================================
# SMTP CONFIGURATION (Email)
# ============================================
SMTP_HOST="${smtpHost}"
SMTP_PORT="${smtpPort}"
SMTP_USER="${smtpUser}"
SMTP_PASS="${smtpPass}"
SMTP_FROM="${smtpFrom}"
`;

  // Escrever arquivo
  fs.writeFileSync(envPath, envContent, 'utf8');

  console.log('\n✅ Arquivo .env criado com sucesso!');
  console.log(`📁 Localização: ${envPath}\n`);
  console.log('⚠️  IMPORTANTE: Certifique-se de que o arquivo .env está no .gitignore\n');

  rl.close();
}

main().catch(error => {
  console.error('❌ Erro:', error);
  rl.close();
  process.exit(1);
});

