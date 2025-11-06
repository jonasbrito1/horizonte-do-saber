import api from './api';

export interface Mensagem {
  id: number;
  remetente_id: number;
  remetente_nome: string;
  remetente_tipo: 'responsavel' | 'professor' | 'admin';
  destinatario_id?: number;
  destinatario_nome?: string;
  destinatario_tipo?: 'responsavel' | 'professor' | 'admin' | 'suporte';
  aluno_id?: number;
  aluno_nome?: string;
  assunto: string;
  mensagem: string;
  resposta?: string;
  respondido_por?: number;
  respondido_em?: string;
  lida: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMensagemData {
  destinatario_tipo?: 'responsavel' | 'professor' | 'admin' | 'suporte';
  destinatario_id?: number;
  aluno_id?: number;
  assunto: string;
  mensagem: string;
}

export interface EditMensagemData {
  assunto?: string;
  mensagem?: string;
}

class MensagensService {
  /**
   * Buscar todas as mensagens do usuário autenticado
   */
  async getMensagens(): Promise<Mensagem[]> {
    try {
      const response = await api.get<{ success: boolean; data: Mensagem[] }>('/mensagens');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }
  }

  /**
   * Criar nova mensagem
   */
  async createMensagem(data: CreateMensagemData): Promise<Mensagem> {
    try {
      const response = await api.post<{ success: boolean; data: Mensagem }>('/mensagens', data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar mensagem:', error);
      throw error;
    }
  }

  /**
   * Editar mensagem existente
   */
  async editMensagem(id: number, data: EditMensagemData): Promise<Mensagem> {
    try {
      const response = await api.put<{ success: boolean; data: Mensagem }>(`/mensagens/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao editar mensagem:', error);
      throw error;
    }
  }

  /**
   * Marcar mensagem como lida
   */
  async marcarComoLida(id: number): Promise<Mensagem> {
    try {
      const response = await api.put<{ success: boolean; data: Mensagem }>(`/mensagens/${id}/ler`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
      throw error;
    }
  }

  /**
   * Responder mensagem
   */
  async responderMensagem(id: number, resposta: string): Promise<Mensagem> {
    try {
      const response = await api.put<{ success: boolean; data: Mensagem }>(
        `/mensagens/${id}/responder`,
        { resposta }
      );
      return response.data.data;
    } catch (error) {
      console.error('Erro ao responder mensagem:', error);
      throw error;
    }
  }

  /**
   * Contar mensagens não lidas
   */
  async contarMensagensNaoLidas(): Promise<number> {
    try {
      const mensagens = await this.getMensagens();
      return mensagens.filter(m => !m.lida).length;
    } catch (error) {
      console.error('Erro ao contar mensagens não lidas:', error);
      return 0;
    }
  }
}

export const mensagensService = new MensagensService();
export default mensagensService;
