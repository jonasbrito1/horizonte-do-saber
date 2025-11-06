import api from './api';

export interface UpdateProfileData {
  nome: string;
  email: string;
  telefone?: string;
  data_nascimento?: string;
}

export interface ChangePasswordData {
  senhaAtual: string;
  novaSenha: string;
}

export interface UserProfile {
  id: number;
  nome: string;
  email: string;
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

class ProfileService {
  /**
   * Atualizar dados do perfil do usuário logado
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await api.patch('/users/profile', data);
    return response.data.data;
  }

  /**
   * Alterar senha do usuário logado
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await api.patch('/users/profile/password', data);
  }

  /**
   * Upload de foto de perfil
   */
  async uploadProfilePhoto(file: File): Promise<{ foto_perfil: string; user: UserProfile }> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post('/users/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  /**
   * Obter URL completa da foto de perfil
   */
  getPhotoUrl(photoPath?: string): string {
    if (!photoPath) {
      return '/default-avatar.png'; // Fallback para imagem padrão
    }

    const baseURL = api.defaults.baseURL || '';
    // Remove /api from baseURL if present
    const serverUrl = baseURL.replace('/api', '');
    return `${serverUrl}${photoPath}`;
  }

  /**
   * Validar tamanho da imagem (max 5MB)
   */
  validateImageSize(file: File): { valid: boolean; message?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        message: 'Imagem muito grande. Tamanho máximo: 5MB',
      };
    }
    return { valid: true };
  }

  /**
   * Validar tipo da imagem
   */
  validateImageType(file: File): { valid: boolean; message?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype || file.type)) {
      return {
        valid: false,
        message: 'Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP',
      };
    }
    return { valid: true };
  }
}

export const profileService = new ProfileService();
export default profileService;
