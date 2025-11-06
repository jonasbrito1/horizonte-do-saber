import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';

interface User {
  id: number;
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  endereco?: string;
  data_nascimento?: string;
  tipo: 'admin' | 'professor' | 'responsavel';
  status: 'ativo' | 'inativo' | 'suspenso';
  foto_perfil?: string;
  created_at: string;
  primeiro_login: boolean;
  ultimo_login?: string;
}

class UserDbService {
  private dbPath = path.join(__dirname, '../data/users.json');

  async ensureDataDir() {
    const dir = path.dirname(this.dbPath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async loadUsers(): Promise<User[]> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(this.dbPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Se não existe, criar arquivo inicial
      const initialData = [
        {
          id: 1,
          nome: 'Administrador',
          email: 'admin@horizontedosaber.com',
          senha: await bcrypt.hash('admin123', 12),
          telefone: '(11) 99999-9999',
          endereco: 'Rua da Escola, 123',
          data_nascimento: '1980-01-01',
          tipo: 'admin' as const,
          status: 'ativo' as const,
          created_at: new Date().toISOString(),
          primeiro_login: false,
          ultimo_login: new Date().toISOString()
        }
      ];
      await this.saveUsers(initialData);
      return initialData;
    }
  }

  async saveUsers(users: User[]): Promise<void> {
    await this.ensureDataDir();
    const jsonData = JSON.stringify(users, null, 2);
    await fs.writeFile(this.dbPath, jsonData, { encoding: 'utf-8' });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const users = await this.loadUsers();
    return users.find(user => user.email === email) || null;
  }

  async findUserById(id: number): Promise<User | null> {
    const users = await this.loadUsers();
    return users.find(user => user.id === id) || null;
  }

  async createUser(userData: {
    nome: string;
    email: string;
    senha?: string;
    telefone?: string;
    endereco?: string;
    data_nascimento?: string;
    tipo: 'admin' | 'professor' | 'responsavel';
    gerarSenhaAutomatica?: boolean;
  }): Promise<{ user: User; senhaGerada?: string }> {
    const users = await this.loadUsers();

    // Verificar se email já existe
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    let senha = userData.senha;
    let senhaGerada: string | undefined;

    // Gerar senha se necessário
    if (userData.gerarSenhaAutomatica || !senha) {
      senhaGerada = this.generateRandomPassword();
      senha = senhaGerada;
    }

    const hashedPassword = await bcrypt.hash(senha!, 12);
    const newId = Math.max(...users.map(u => u.id), 0) + 1;

    const newUser: User = {
      id: newId,
      nome: userData.nome,
      email: userData.email,
      senha: hashedPassword,
      telefone: userData.telefone,
      endereco: userData.endereco,
      data_nascimento: userData.data_nascimento,
      tipo: userData.tipo,
      status: 'ativo',
      created_at: new Date().toISOString(),
      primeiro_login: true
    };

    users.push(newUser);
    await this.saveUsers(users);

    // Retornar usuário sem senha
    const { senha: _, ...userWithoutPassword } = newUser;
    return {
      user: userWithoutPassword as User,
      senhaGerada
    };
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const users = await this.loadUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    // Se senha está sendo atualizada, fazer hash
    if (userData.senha) {
      userData.senha = await bcrypt.hash(userData.senha, 12);
    }

    users[userIndex] = { ...users[userIndex], ...userData };
    await this.saveUsers(users);

    const { senha: _, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword as User;
  }

  async resetPassword(id: number, newPassword?: string): Promise<{ novaSenha: string }> {
    const users = await this.loadUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    const novaSenha = newPassword || this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(novaSenha, 12);

    users[userIndex].senha = hashedPassword;
    users[userIndex].primeiro_login = true;

    await this.saveUsers(users);

    return { novaSenha };
  }

  async toggleStatus(id: number): Promise<User> {
    const users = await this.loadUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    users[userIndex].status = users[userIndex].status === 'ativo' ? 'inativo' : 'ativo';
    await this.saveUsers(users);

    const { senha: _, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword as User;
  }

  async getAllUsers(): Promise<Omit<User, 'senha'>[]> {
    const users = await this.loadUsers();
    return users.map(({ senha, ...user }) => user);
  }

  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.senha);
    if (!isValid) {
      return null;
    }

    // Atualizar último login (mas não alterar primeiro_login aqui)
    const users = await this.loadUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].ultimo_login = new Date().toISOString();
      await this.saveUsers(users);
      // Retornar usuário atualizado
      user.ultimo_login = users[userIndex].ultimo_login;
    }

    // Retornar usuário sem senha
    const { senha: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const users = await this.loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, message: 'Usuário não encontrado' };
    }

    const user = users[userIndex];

    // Verificar senha antiga
    const isValidOldPassword = await bcrypt.compare(oldPassword, user.senha);
    if (!isValidOldPassword) {
      return { success: false, message: 'Senha antiga incorreta' };
    }

    // Atualizar senha
    user.senha = await bcrypt.hash(newPassword, 12);

    // Marcar primeiro_login como false apenas ao trocar senha
    user.primeiro_login = false;

    await this.saveUsers(users);

    return { success: true, message: 'Senha alterada com sucesso' };
  }

  async changePasswordFirstAccess(userId: number, newPassword: string): Promise<{ success: boolean; message: string }> {
    const users = await this.loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, message: 'Usuário não encontrado' };
    }

    const user = users[userIndex];

    // Verificar se é primeiro acesso
    if (!user.primeiro_login) {
      return { success: false, message: 'Esta função é apenas para primeiro acesso' };
    }

    // Atualizar senha
    user.senha = await bcrypt.hash(newPassword, 12);

    // Marcar primeiro_login como false
    user.primeiro_login = false;

    await this.saveUsers(users);

    return { success: true, message: 'Senha definida com sucesso' };
  }

  private generateRandomPassword(): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

export default new UserDbService();