import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Download,
  Check,
  CheckCheck,
  Loader2,
  Users,
  CheckCircle,
  Archive
} from 'lucide-react';
import toast from 'react-hot-toast';
import chatService, { Thread, Mensagem, Anexo, CreateThreadParams } from '../services/chatService';

interface ChatInterfaceProps {
  userType: 'professor' | 'responsavel';
  alunos?: { id: number; nome: string; turma_nome?: string }[];
  professores?: { id: number; nome: string }[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userType, alunos = [], professores = [] }) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [mensagemTexto, setMensagemTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [newThreadData, setNewThreadData] = useState<{
    destinatario_id: number;
    aluno_id?: number;
    assunto: string;
  }>({
    destinatario_id: 0,
    aluno_id: undefined,
    assunto: ''
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      scrollToBottom();
      markMessagesAsRead(selectedThread);
    }
  }, [selectedThread]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadThreads = async () => {
    try {
      setLoading(true);
      const data = await chatService.getThreads();
      setThreads(data);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast.error('Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async (threadId: number) => {
    try {
      const thread = await chatService.getThread(threadId);
      setSelectedThread(thread);
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
      toast.error('Erro ao carregar conversa');
    }
  };

  const markMessagesAsRead = async (thread: Thread) => {
    try {
      const unreadMessages = thread.mensagens.filter(
        (msg) => !msg.lida && msg.remetente_id !== user.id
      );

      for (const msg of unreadMessages) {
        await chatService.markMessageAsRead(thread.id, msg.id);
      }

      // Atualizar thread local
      if (unreadMessages.length > 0) {
        loadThreads();
      }
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };

  const handleCreateThread = async () => {
    if (!newThreadData.destinatario_id || !newThreadData.assunto) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const thread = await chatService.createThread(newThreadData as CreateThreadParams);
      setThreads([thread, ...threads]);
      setSelectedThread(thread);
      setShowNewThreadModal(false);
      setNewThreadData({
        destinatario_id: 0,
        aluno_id: undefined,
        assunto: ''
      });
      toast.success('Conversa criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      toast.error('Erro ao criar conversa');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploadedAnexos: Anexo[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const anexo = await chatService.uploadFile(file);
        uploadedAnexos.push(anexo);
      }

      setAnexos([...anexos, ...uploadedAnexos]);
      toast.success(`${uploadedAnexos.length} arquivo(s) anexado(s)`);
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error.response?.data?.message || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAnexo = (index: number) => {
    setAnexos(anexos.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!selectedThread) return;
    if (!mensagemTexto.trim() && anexos.length === 0) {
      toast.error('Digite uma mensagem ou anexe um arquivo');
      return;
    }

    try {
      setSending(true);
      const newMessage = await chatService.sendMessage(selectedThread.id, {
        mensagem: mensagemTexto.trim(),
        anexos: anexos.length > 0 ? anexos : undefined
      });

      // Atualizar thread local
      setSelectedThread({
        ...selectedThread,
        mensagens: [...selectedThread.mensagens, newMessage]
      });

      // Limpar campos
      setMensagemTexto('');
      setAnexos([]);

      // Atualizar lista de threads
      loadThreads();
      scrollToBottom();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCloseThread = async () => {
    if (!selectedThread) return;

    try {
      await chatService.closeThread(selectedThread.id);
      toast.success('Conversa encerrada com sucesso!');
      loadThreads(); // Recarregar threads
      setSelectedThread(null); // Desselecionar thread
    } catch (error) {
      console.error('Erro ao encerrar conversa:', error);
      toast.error('Erro ao encerrar conversa');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
      <div className="flex h-full">
        {/* Sidebar - Lista de Threads */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header Sidebar */}
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <MessageSquare className="mr-2 text-blue-600" size={24} />
                Conversas
              </h2>
              <button
                onClick={() => setShowNewThreadModal(true)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Nova conversa"
              >
                <MessageSquare size={18} />
              </button>
            </div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`w-full px-3 py-1.5 text-sm rounded-lg flex items-center justify-center transition-colors ${
                showArchived
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Archive className="w-4 h-4 mr-1" />
              {showArchived ? 'Mostrar Abertas' : 'Ver Arquivadas'}
            </button>
          </div>

          {/* Lista de Threads */}
          <div className="flex-1 overflow-y-auto">
            {threads.filter(t => showArchived ? t.status === 'encerrada' : t.status !== 'encerrada').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <MessageSquare size={48} className="mb-2 opacity-50" />
                <p className="text-sm text-center">
                  {showArchived ? 'Nenhuma conversa arquivada' : 'Nenhuma conversa ativa'}
                </p>
                {!showArchived && (
                  <button
                    onClick={() => setShowNewThreadModal(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Iniciar conversa
                  </button>
                )}
              </div>
            ) : (
              threads
                .filter(t => showArchived ? t.status === 'encerrada' : t.status !== 'encerrada')
                .map((thread) => {
                const ultimaMensagem = thread.mensagens[thread.mensagens.length - 1];
                const naoLidas = thread.mensagens.filter(
                  (m) => !m.lida && m.remetente_id !== user.id
                ).length;

                return (
                  <div
                    key={thread.id}
                    onClick={() => loadThread(thread.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                      selectedThread?.id === thread.id
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {thread.assunto}
                          </h3>
                          {naoLidas > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                              {naoLidas}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {thread.participantes_info
                            .filter((p) => p.id !== user.id)
                            .map((p) => p.nome)
                            .join(', ')}
                        </p>
                        {thread.aluno_nome && (
                          <p className="text-xs text-purple-600 mb-1">
                            Sobre: {thread.aluno_nome}
                          </p>
                        )}
                        {ultimaMensagem && (
                          <p className="text-sm text-gray-600 truncate">
                            {ultimaMensagem.remetente_id === user.id && 'Você: '}
                            {ultimaMensagem.mensagem || '📎 Anexo'}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 ml-2">
                        {ultimaMensagem && formatTime(ultimaMensagem.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedThread ? (
            <>
              {/* Header Chat */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{selectedThread.assunto}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedThread.participantes_info
                      .filter((p) => p.id !== user.id)
                      .map((p) => p.nome)
                      .join(', ')}
                  </p>
                  {selectedThread.aluno_nome && (
                    <p className="text-xs text-purple-600 mt-1">
                      Sobre: {selectedThread.aluno_nome}
                    </p>
                  )}
                  {selectedThread.status === 'encerrada' && (
                    <span className="inline-flex items-center mt-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                      <Archive className="w-3 h-3 mr-1" />
                      Conversa Encerrada
                    </span>
                  )}
                </div>
                {selectedThread.status !== 'encerrada' && (
                  <button
                    onClick={handleCloseThread}
                    className="ml-4 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center transition-colors"
                    title="Encerrar conversa (mover para histórico)"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Encerrar
                  </button>
                )}
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e5e7eb\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
                {selectedThread.mensagens.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p className="text-sm">Nenhuma mensagem ainda. Inicie a conversa!</p>
                  </div>
                ) : (
                  <>
                    {selectedThread.mensagens.map((msg, index) => {
                      const isOwn = msg.remetente_id === user.id;
                      const showDate =
                        index === 0 ||
                        formatDate(msg.created_at) !==
                          formatDate(selectedThread.mensagens[index - 1].created_at);

                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-600 shadow-sm">
                                {formatDate(msg.created_at)}
                              </span>
                            </div>
                          )}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] ${
                                isOwn
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white text-gray-900'
                              } rounded-lg shadow-md p-3`}
                            >
                              {!isOwn && (
                                <p className="text-xs font-semibold mb-1 opacity-75">
                                  {msg.remetente_nome}
                                </p>
                              )}
                              {msg.mensagem && (
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {msg.mensagem}
                                </p>
                              )}
                              {msg.anexos && msg.anexos.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {msg.anexos.map((anexo, i) => (
                                    <div
                                      key={i}
                                      className={`rounded-lg overflow-hidden ${
                                        isOwn ? 'bg-blue-600' : 'bg-gray-100'
                                      } p-2`}
                                    >
                                      {chatService.isImageFile(anexo.mimetype) ? (
                                        <img
                                          src={chatService.getAttachmentUrl(anexo.url)}
                                          alt={anexo.originalname}
                                          className="max-w-full rounded cursor-pointer"
                                          onClick={() => window.open(chatService.getAttachmentUrl(anexo.url), '_blank')}
                                        />
                                      ) : (
                                        <a
                                          href={chatService.getAttachmentUrl(anexo.url)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center space-x-2 hover:opacity-80"
                                        >
                                          {chatService.isPdfFile(anexo.mimetype) ? (
                                            <FileText size={24} />
                                          ) : (
                                            <FileText size={24} />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                              {anexo.originalname}
                                            </p>
                                            <p className="text-xs opacity-75">
                                              {chatService.formatFileSize(anexo.size)}
                                            </p>
                                          </div>
                                          <Download size={18} />
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center justify-end mt-1 space-x-1">
                                <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {formatTime(msg.created_at)}
                                </span>
                                {isOwn && (
                                  msg.lida ? (
                                    <CheckCheck size={14} className="text-blue-100" />
                                  ) : (
                                    <Check size={14} className="text-blue-100" />
                                  )
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white">
                {/* Anexos Preview */}
                {anexos.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {anexos.map((anexo, index) => (
                      <div
                        key={index}
                        className="relative bg-gray-100 rounded-lg p-2 flex items-center space-x-2"
                      >
                        {chatService.isImageFile(anexo.mimetype) ? (
                          <ImageIcon size={20} className="text-blue-600" />
                        ) : (
                          <FileText size={20} className="text-blue-600" />
                        )}
                        <span className="text-sm text-gray-700 max-w-xs truncate">
                          {anexo.originalname}
                        </span>
                        <button
                          onClick={() => handleRemoveAnexo(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-end space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Anexar arquivo"
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <Paperclip size={24} />
                    )}
                  </button>
                  <textarea
                    value={mensagemTexto}
                    onChange={(e) => setMensagemTexto(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    rows={1}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || (!mensagemTexto.trim() && anexos.length === 0)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Enviar"
                  >
                    {sending ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <Send size={24} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
              <div className="text-center">
                <MessageSquare size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Selecione uma conversa</p>
                <p className="text-sm">ou inicie uma nova conversa</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nova Thread */}
      <AnimatePresence>
        {showNewThreadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Nova Conversa</h3>
                <button
                  onClick={() => setShowNewThreadModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {userType === 'responsavel' ? 'Professor' : 'Responsável'}
                  </label>
                  <select
                    value={newThreadData.destinatario_id}
                    onChange={(e) =>
                      setNewThreadData({
                        ...newThreadData,
                        destinatario_id: Number(e.target.value)
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Selecione...</option>
                    {userType === 'responsavel'
                      ? professores.map((prof) => (
                          <option key={prof.id} value={prof.id}>
                            {prof.nome}
                          </option>
                        ))
                      : alunos.map((aluno) => (
                          <option key={aluno.id} value={aluno.id}>
                            Responsável de {aluno.nome}
                          </option>
                        ))}
                  </select>
                </div>

                {alunos.length > 0 && userType === 'responsavel' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sobre o aluno (opcional)
                    </label>
                    <select
                      value={newThreadData.aluno_id || ''}
                      onChange={(e) =>
                        setNewThreadData({
                          ...newThreadData,
                          aluno_id: e.target.value ? Number(e.target.value) : undefined
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      {alunos.map((aluno) => (
                        <option key={aluno.id} value={aluno.id}>
                          {aluno.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assunto
                  </label>
                  <input
                    type="text"
                    value={newThreadData.assunto}
                    onChange={(e) =>
                      setNewThreadData({ ...newThreadData, assunto: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Dúvida sobre lição de casa"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowNewThreadModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateThread}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Criar Conversa
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInterface;
