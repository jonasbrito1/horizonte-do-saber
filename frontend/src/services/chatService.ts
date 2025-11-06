import api from './api'

export interface Anexo {
  filename: string
  originalname: string
  url: string
  mimetype: string
  size: number
}

export interface Mensagem {
  id: number
  remetente_id: number
  remetente_nome: string
  remetente_tipo: 'professor' | 'responsavel' | 'admin'
  mensagem: string
  anexos?: Anexo[]
  lida: boolean
  created_at: string
}

export interface ParticipanteInfo {
  id: number
  nome: string
  tipo: 'professor' | 'responsavel' | 'admin'
}

export interface Thread {
  id: number
  participantes: number[]
  participantes_info: ParticipanteInfo[]
  aluno_id?: number
  aluno_nome?: string
  assunto: string
  status?: 'aberta' | 'encerrada'
  mensagens: Mensagem[]
  created_at: string
  updated_at: string
  ultima_mensagem?: Mensagem
  mensagens_nao_lidas?: number
}

export interface CreateThreadParams {
  destinatario_id: number
  aluno_id?: number
  assunto: string
}

export interface SendMessageParams {
  mensagem: string
  anexos?: Anexo[]
}

class ChatService {
  /**
   * Listar todas as threads do usuário atual
   */
  async getThreads(): Promise<Thread[]> {
    const response = await api.get('/chat/threads')
    return response.data.data
  }

  /**
   * Criar uma nova thread ou retornar thread existente
   */
  async createThread(params: CreateThreadParams): Promise<Thread> {
    const response = await api.post('/chat/threads', params)
    return response.data.data
  }

  /**
   * Buscar uma thread específica com todas as mensagens
   */
  async getThread(threadId: number): Promise<Thread> {
    const response = await api.get(`/chat/threads/${threadId}`)
    return response.data.data
  }

  /**
   * Enviar uma mensagem em uma thread
   */
  async sendMessage(threadId: number, params: SendMessageParams): Promise<Mensagem> {
    const response = await api.post(`/chat/threads/${threadId}/messages`, params)
    return response.data.data
  }

  /**
   * Marcar uma mensagem como lida
   */
  async markMessageAsRead(threadId: number, messageId: number): Promise<void> {
    await api.put(`/chat/threads/${threadId}/messages/${messageId}/read`)
  }

  /**
   * Fazer upload de um arquivo
   */
  async uploadFile(file: File): Promise<Anexo> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data.data
  }

  /**
   * Encerrar thread (arquivar conversa)
   */
  async closeThread(threadId: number): Promise<Thread> {
    const response = await api.patch(`/chat/threads/${threadId}/close`)
    return response.data.data
  }

  /**
   * Reabrir thread arquivada
   */
  async reopenThread(threadId: number): Promise<Thread> {
    const response = await api.patch(`/chat/threads/${threadId}/reopen`)
    return response.data.data
  }

  /**
   * Obter URL completa do anexo
   */
  getAttachmentUrl(url: string): string {
    const baseURL = api.defaults.baseURL || ''
    // Remove /api from baseURL if present
    const serverUrl = baseURL.replace('/api', '')
    return `${serverUrl}${url}`
  }

  /**
   * Verificar se o tipo de arquivo é uma imagem
   */
  isImageFile(mimetype: string): boolean {
    return mimetype.startsWith('image/')
  }

  /**
   * Verificar se o tipo de arquivo é um PDF
   */
  isPdfFile(mimetype: string): boolean {
    return mimetype === 'application/pdf'
  }

  /**
   * Formatar tamanho de arquivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }
}

export const chatService = new ChatService()
export default chatService
