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
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(config);
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
        from: `${process.env.EMAIL_FROM_NAME || 'Sistema'} <${process.env.EMAIL_FROM_EMAIL || 'noreply@localhost'}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      };

      await this.transporter.sendMail(mailOptions);

      // Email sent successfully

      console.log(`Email enviado para: ${options.destinatario}`);
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);

      // Email error handling disabled for now

      return false;
    }
  }

  generateWelcomeEmail(nome: string, email: string, senha: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bem-vindo ao Sistema Horizonte do Saber</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .credentials { background: white; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Horizonte do Saber</h1>
              <p>Bem-vindo ao nosso sistema!</p>
            </div>

            <div class="content">
              <h2>Olá, ${nome}!</h2>

              <p>Seja bem-vindo ao Sistema Horizonte do Saber! Sua conta foi criada com sucesso.</p>

              <div class="credentials">
                <h3>📧 Suas credenciais de acesso:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Senha:</strong> ${senha}</p>
              </div>

              <p>⚠️ <strong>Importante:</strong> Por segurança, recomendamos que você altere sua senha no primeiro acesso.</p>

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

  async sendWelcomeEmail(nome: string, email: string, senha: string, usuarioId?: number): Promise<boolean> {
    const html = this.generateWelcomeEmail(nome, email, senha);

    return await this.sendEmail({
      destinatario: email,
      assunto: '🎓 Bem-vindo ao Sistema Horizonte do Saber - Suas Credenciais de Acesso',
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
      await this.transporter.verify();
      console.log('✅ Conexão com servidor de email estabelecida');
      return true;
    } catch (error) {
      console.error('❌ Erro na conexão com servidor de email:', error);
      return false;
    }
  }
}

export default new EmailService();