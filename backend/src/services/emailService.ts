import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SendEmailOptions {
  destinatario: string;
  assunto: string;
  corpo: string;
  tipo: 'boas_vindas' | 'reset_senha' | 'credenciais_acesso' | 'notificacao';
  usuarioId?: number;
  usuarioNome?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      console.log('🔧 Criando transporter de email pela primeira vez...');
      console.log('📧 EMAIL_HOST:', process.env.EMAIL_HOST);
      console.log('📧 EMAIL_PORT:', process.env.EMAIL_PORT);
      console.log('📧 EMAIL_SECURE:', process.env.EMAIL_SECURE);
      console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
      console.log('📧 EMAIL_PASS:', process.env.EMAIL_PASS ? `[${process.env.EMAIL_PASS.length} caracteres]` : '[VAZIO]');

      const config: EmailConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASS || '',
        },
      };

      console.log('⚙️ Config criada:', {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.auth.user,
        passLength: config.auth.pass.length
      });

      this.transporter = nodemailer.createTransport(config);
    }
    return this.transporter;
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      // Email logging disabled for now
      console.log(`Sending email to: ${options.destinatario}`);

      const emailData: EmailData = {
        to: options.destinatario,
        subject: options.assunto,
        html: options.corpo,
        text: options.corpo.replace(/<[^>]*>/g, ''), // Remove HTML tags for text version
      };

      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'Horizonte do Saber'} <${process.env.EMAIL_FROM_EMAIL || 'escola@horizontedosaber.com.br'}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      };

      await this.getTransporter().sendMail(mailOptions);

      // Email sent successfully

      console.log(`Email enviado para: ${options.destinatario}`);
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);

      // Email error handling disabled for now

      return false;
    }
  }

  generateWelcomeEmail(nome: string, email: string, senha: string, nomeAluno?: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <title>Bem-vindo ao Sistema Horizonte do Saber</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0 0 10px 0; font-size: 28px; }
            .header p { margin: 0; font-size: 16px; opacity: 0.9; }
            .content { padding: 30px 25px; }
            .content h2 { color: #1f2937; margin-top: 0; }
            .welcome-message { background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .credentials { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #e5e7eb; }
            .credentials h3 { color: #2563eb; margin-top: 0; margin-bottom: 15px; font-size: 18px; }
            .credential-item { margin: 12px 0; }
            .credential-label { font-weight: 600; color: #4b5563; display: block; margin-bottom: 5px; }
            .credential-value { font-family: 'Courier New', monospace; font-size: 16px; background-color: #ffffff; padding: 10px; border-radius: 4px; border: 1px solid #d1d5db; display: block; word-break: break-all; }
            .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .warning-box h3 { color: #92400e; margin-top: 0; font-size: 16px; display: flex; align-items: center; }
            .warning-box p { color: #78350f; margin: 8px 0 0 0; }
            .required-box { background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .required-box h3 { color: #991b1b; margin-top: 0; font-size: 16px; }
            .required-box p { color: #7f1d1d; margin: 8px 0 0 0; font-weight: 600; }
            .button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 25px 0; font-weight: bold; font-size: 16px; transition: transform 0.2s; }
            .button:hover { transform: translateY(-2px); }
            .instructions { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .instructions h3 { color: #374151; margin-top: 0; }
            .instructions ol { color: #4b5563; padding-left: 20px; }
            .instructions ol li { margin: 8px 0; }
            .security-tips { background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .security-tips h3 { color: #065f46; margin-top: 0; }
            .security-tips ul { color: #047857; padding-left: 20px; }
            .security-tips ul li { margin: 6px 0; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 13px; }
            .footer p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Horizonte do Saber</h1>
              <p>Sistema de Gestão Escolar</p>
            </div>

            <div class="content">
              <h2>Olá, ${nome}!</h2>

              ${nomeAluno ? `
              <div class="welcome-message">
                <p style="margin: 0;"><strong>Seja bem-vindo!</strong></p>
                <p style="margin: 8px 0 0 0;">Foi criada uma conta para você acompanhar o progresso escolar do(a) aluno(a) <strong>${nomeAluno}</strong>.</p>
              </div>
              ` : `
              <p>Seja bem-vindo ao Sistema Horizonte do Saber! Sua conta foi criada com sucesso.</p>
              `}

              <p>Através do nosso portal, você poderá:</p>
              <ul style="color: #4b5563;">
                <li>📊 Acompanhar o desempenho acadêmico</li>
                <li>📅 Visualizar frequência e presenças</li>
                <li>💰 Consultar informações financeiras</li>
                <li>📝 Receber comunicados importantes</li>
                <li>📞 Manter contato com a equipe pedagógica</li>
              </ul>

              <div class="credentials">
                <h3>🔐 Suas credenciais de acesso:</h3>
                <div class="credential-item">
                  <span class="credential-label">📧 Email:</span>
                  <code class="credential-value">${email}</code>
                </div>
                <div class="credential-item">
                  <span class="credential-label">🔑 Senha Temporária:</span>
                  <code class="credential-value">${senha}</code>
                </div>
              </div>

              <div class="required-box">
                <h3>⚠️ ATENÇÃO - Primeiro Acesso Obrigatório</h3>
                <p>Por motivos de segurança, você DEVERÁ criar uma nova senha no primeiro acesso ao sistema. A senha temporária acima é de uso único.</p>
              </div>

              <div class="instructions">
                <h3>📋 Instruções para Primeiro Acesso:</h3>
                <ol>
                  <li>Clique no botão "Acessar Sistema" abaixo</li>
                  <li>Faça login usando o email e a senha temporária fornecidos</li>
                  <li>Você será automaticamente direcionado para criar sua nova senha</li>
                  <li>Escolha uma senha forte e única (mínimo 6 caracteres)</li>
                  <li>Confirme sua nova senha e clique em "Alterar Senha"</li>
                  <li>Pronto! Agora você pode acessar o sistema normalmente</li>
                </ol>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.CORS_ORIGIN || 'http://localhost:5176'}/login" class="button">🚀 Acessar Sistema</a>
              </div>

              <div class="warning-box">
                <h3>⏰ Importante</h3>
                <p>Esta senha temporária é válida apenas para o primeiro acesso. Após criar sua nova senha, você não poderá mais usar a senha temporária.</p>
              </div>

              <div class="security-tips">
                <h3>🔒 Dicas de Segurança:</h3>
                <ul>
                  <li>Use uma senha com pelo menos 8 caracteres</li>
                  <li>Combine letras maiúsculas, minúsculas, números e símbolos</li>
                  <li>Não compartilhe suas credenciais com terceiros</li>
                  <li>Não use a mesma senha de outros sites</li>
                  <li>Faça logout ao terminar de usar o sistema</li>
                </ul>
              </div>
            </div>

            <div class="footer">
              <p><strong>Este é um email automático. Por favor, não responda.</strong></p>
              <p>Em caso de dúvidas, entre em contato com a secretaria da escola.</p>
              <p style="margin-top: 15px;">© ${new Date().getFullYear()} Horizonte do Saber - Todos os direitos reservados</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  generatePasswordResetEmail(nome: string, resetToken: string): string {
    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${resetToken}`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Redefinir Senha - Horizonte do Saber</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Redefinir Senha</h1>
              <p>Horizonte do Saber</p>
            </div>

            <div class="content">
              <h2>Olá, ${nome}!</h2>

              <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>

              <div class="warning">
                ⚠️ <strong>Atenção:</strong> Este link expira em 1 hora por segurança.
              </div>

              <a href="${resetUrl}" class="button">Redefinir Senha</a>

              <p>Se você não solicitou a redefinição de senha, ignore este email. Sua senha atual permanecerá inalterada.</p>

              <p><strong>Link alternativo:</strong><br>
              <small>${resetUrl}</small></p>
            </div>

            <div class="footer">
              <p>Este é um email automático. Não responda esta mensagem.</p>
              <p>© ${new Date().getFullYear()} Horizonte do Saber - Todos os direitos reservados</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendWelcomeEmail(nome: string, email: string, senha: string, usuarioId?: number, nomeAluno?: string): Promise<boolean> {
    const html = this.generateWelcomeEmail(nome, email, senha, nomeAluno);

    return await this.sendEmail({
      destinatario: email,
      assunto: '🎓 Bem-vindo ao Sistema Horizonte do Saber - Credenciais de Acesso',
      corpo: html,
      tipo: 'credenciais_acesso',
      usuarioId,
      usuarioNome: nome,
    });
  }

  async sendPasswordResetEmail(nome: string, email: string, novaSenha: string): Promise<boolean> {
    const html = this.generatePasswordResetEmailWithPassword(nome, novaSenha);

    return await this.sendEmail({
      destinatario: email,
      assunto: '🔐 Nova Senha - Horizonte do Saber',
      corpo: html,
      tipo: 'reset_senha',
      usuarioNome: nome,
    });
  }

  generatePasswordResetEmailWithPassword(nome: string, novaSenha: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nova Senha - Horizonte do Saber</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .credentials { background: white; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Nova Senha</h1>
              <p>Horizonte do Saber</p>
            </div>

            <div class="content">
              <h2>Olá, ${nome}!</h2>

              <p>Sua senha foi redefinida com sucesso. Aqui estão suas novas credenciais de acesso:</p>

              <div class="credentials">
                <h3>🔑 Nova Senha:</h3>
                <p><strong>${novaSenha}</strong></p>
              </div>

              <div class="warning">
                ⚠️ <strong>Importante:</strong> Por segurança, recomendamos que você altere esta senha após o primeiro login.
              </div>

              <a href="${process.env.CORS_ORIGIN}/login" class="button">Acessar Sistema</a>

              <h3>🔒 Dicas de Segurança:</h3>
              <ul>
                <li>Não compartilhe suas credenciais com terceiros</li>
                <li>Use uma senha forte e única</li>
                <li>Faça logout ao terminar de usar o sistema</li>
              </ul>
            </div>

            <div class="footer">
              <p>Este é um email automático. Não responda esta mensagem.</p>
              <p>© ${new Date().getFullYear()} Horizonte do Saber - Todos os direitos reservados</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getTransporter().verify();
      console.log('✅ Conexão com servidor de email estabelecida');
      return true;
    } catch (error) {
      console.error('❌ Erro na conexão com servidor de email:', error);
      return false;
    }
  }
}

export default new EmailService();