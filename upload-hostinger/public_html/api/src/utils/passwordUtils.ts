import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class PasswordUtils {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static generateRandomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Garantir pelo menos: 1 minúscula, 1 maiúscula, 1 número, 1 símbolo
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

    // Preencher o resto aleatoriamente
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Embaralhar os caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH || '8');

    if (password.length < minLength) {
      errors.push(`A senha deve ter pelo menos ${minLength} caracteres`);
    }

    if (!/[a-z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra minúscula');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('A senha deve conter pelo menos um caractere especial');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static generateTokenWithExpiry(hoursValid: number = 24): { token: string; expiresAt: Date } {
    const token = this.generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hoursValid);

    return { token, expiresAt };
  }
}