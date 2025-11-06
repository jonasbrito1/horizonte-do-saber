// Script para testar configuração de email
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔧 Testando configuração de email...\n');

console.log('📧 Configurações:');
console.log('  HOST:', process.env.EMAIL_HOST);
console.log('  PORT:', process.env.EMAIL_PORT);
console.log('  SECURE:', process.env.EMAIL_SECURE);
console.log('  USER:', process.env.EMAIL_USER);
console.log('  PASS:', process.env.EMAIL_PASS ? `[${process.env.EMAIL_PASS.length} caracteres]` : '[VAZIO]');
console.log('');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

async function testConnection() {
  try {
    console.log('🔍 Verificando conexão com servidor SMTP...');
    await transporter.verify();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    console.log('📧 Enviando email de teste...');
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'Horizonte do Saber'} <${process.env.EMAIL_FROM_EMAIL || process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Enviando para si mesmo como teste
      subject: 'Teste de Email - Horizonte do Saber',
      html: `
        <h1>Email de Teste</h1>
        <p>Se você está vendo este email, a configuração está correta!</p>
        <p>Data/Hora: ${new Date().toLocaleString('pt-BR')}</p>
      `,
    });

    console.log('✅ Email enviado com sucesso!');
    console.log('📨 Message ID:', info.messageId);
    console.log('');
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('A configuração de email está funcionando corretamente.');

  } catch (error) {
    console.error('❌ ERRO ao testar email:');
    console.error('');
    console.error('Detalhes do erro:');
    console.error('  Mensagem:', error.message);
    console.error('  Código:', error.code);
    console.error('  Comando:', error.command);
    console.error('');

    if (error.code === 'EAUTH') {
      console.error('💡 Dica: Erro de autenticação. Verifique:');
      console.error('   - Email e senha estão corretos no arquivo .env');
      console.error('   - A senha não expirou ou foi alterada');
      console.error('   - O email permite autenticação SMTP');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('💡 Dica: Erro de conexão. Verifique:');
      console.error('   - HOST e PORT estão corretos no arquivo .env');
      console.error('   - Sua conexão com a internet está funcionando');
      console.error('   - O firewall não está bloqueando a porta', process.env.EMAIL_PORT);
    } else if (error.code === 'ESOCKET') {
      console.error('💡 Dica: Erro de socket. Verifique:');
      console.error('   - A configuração SECURE está correta');
      console.error('   - Porta 465 usa secure: true');
      console.error('   - Porta 587 usa secure: false');
    }

    process.exit(1);
  }
}

testConnection();
