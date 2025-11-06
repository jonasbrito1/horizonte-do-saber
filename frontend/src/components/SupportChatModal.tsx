import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Loader2,
  Check,
  CheckCheck,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import chatService, { Thread, Mensagem } from '../services/chatService';

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportChatModal: React.FC<SupportChatModalProps> = ({ isOpen, onClose }) => {
  const [thread, setThread] = useState<Thread | null>(null);
  const [mensagemTexto, setMensagemTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (isOpen) {
      loadOrCreateSupportThread();
    }
  }, [isOpen]);

  useEffect(() => {
    if (thread) {
      scrollToBottom();
      markMessagesAsRead();
    }
  }, [thread?.mensagens]);

  useEffect(() => {
    // Focar no input quando o modal abrir
    if (isOpen && !loading) {
      inputRef.current?.focus();
    }
  }, [isOpen, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadOrCreateSupportThread = async () => {
    try {
      setLoading(true);

      // Buscar todas as threads do usuário
      const threads = await chatService.getThreads();

      // Procurar por uma thread de suporte (com admin ID 1, sem aluno_id)
      const supportThread = threads.find(
        (t) =>
          t.participantes.includes(1) && // Admin/Suporte tem ID 1
          t.participantes.includes(user.id) &&
          !t.aluno_id // Thread de suporte não tem aluno associado
      );

      if (supportThread) {
        // Carregar thread existente com todas as mensagens
        const fullThread = await chatService.getThread(supportThread.id);
        setThread(fullThread);
      } else {
        // Criar nova thread de suporte
        const newThread = await chatService.createThread({
          destinatario_id: 1, // ID do admin/suporte
          assunto: 'Suporte Técnico'
        });
        setThread(newThread);
      }
    } catch (error: any) {
      console.error('Erro ao carregar chat de suporte:', error);
      toast.error('Erro ao carregar chat de suporte');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!thread) return;

    try {
      const unreadMessages = thread.mensagens.filter(
        (msg) => !msg.lida && msg.remetente_id !== user.id
      );

      for (const msg of unreadMessages) {
        await chatService.markMessageAsRead(thread.id, msg.id);
      }

      // Atualizar thread local
      if (unreadMessages.length > 0) {
        setThread({
          ...thread,
          mensagens: thread.mensagens.map((msg) =>
            unreadMessages.find((um) => um.id === msg.id)
              ? { ...msg, lida: true }
              : msg
          )
        });
      }
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!mensagemTexto.trim() || !thread || sending) return;

    try {
      setSending(true);

      const novaMensagem = await chatService.sendMessage(thread.id, {
        mensagem: mensagemTexto.trim()
      });

      // Atualizar thread local com nova mensagem
      setThread({
        ...thread,
        mensagens: [...thread.mensagens, novaMensagem],
        updated_at: new Date().toISOString()
      });

      setMensagemTexto('');
      setTimeout(scrollToBottom, 100);
    } catch (error: any) {
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

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Mostrar apenas hora se for hoje
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      // Mostrar data e hora se for de outro dia
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-white">
                <h2 className="text-lg font-bold">Suporte Técnico</h2>
                <p className="text-xs text-blue-100">
                  {loading ? 'Carregando...' : 'Online'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : thread && thread.mensagens.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhuma mensagem ainda</p>
                <p className="text-sm">Envie uma mensagem para iniciar a conversa com o suporte</p>
              </div>
            ) : (
              <div className="space-y-4">
                {thread?.mensagens.map((msg) => {
                  const isMyMessage = msg.remetente_id === user.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isMyMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        {!isMyMessage && (
                          <p className="text-xs font-semibold mb-1 opacity-75">
                            {msg.remetente_nome}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.mensagem}
                        </p>
                        <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                          isMyMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>{formatMessageTime(msg.created_at)}</span>
                          {isMyMessage && (
                            msg.lida ? (
                              <CheckCheck className="w-4 h-4" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={mensagemTexto}
                onChange={(e) => setMensagemTexto(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={loading || sending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!mensagemTexto.trim() || loading || sending}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Nossa equipe responderá o mais breve possível
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SupportChatModal;
