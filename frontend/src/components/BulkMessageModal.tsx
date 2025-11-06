import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Users,
  GraduationCap,
  BookOpen,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BulkMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  professorId: number;
}

interface Turma {
  id: number;
  nome: string;
  alunos_count: number;
}

interface Aluno {
  id: number;
  nome: string;
  responsavel_id?: number;
  responsavel_nome?: string;
}

type DestinatarioTipo = 'responsaveis' | 'alunos' | 'turmas' | 'todos_responsaveis';

const BulkMessageModal: React.FC<BulkMessageModalProps> = ({ isOpen, onClose, professorId }) => {
  const [destinatarioTipo, setDestinatarioTipo] = useState<DestinatarioTipo>('responsaveis');
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<number | null>(null);
  const [destinatariosSelecionados, setDestinatariosSelecionados] = useState<number[]>([]);
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTurmas();
    }
  }, [isOpen]);

  useEffect(() => {
    if (turmaSelecionada) {
      loadAlunosDaTurma(turmaSelecionada);
    } else {
      setAlunos([]);
    }
  }, [turmaSelecionada]);

  const loadTurmas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/turmas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTurmas(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      toast.error('Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  };

  const loadAlunosDaTurma = async (turmaId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/alunos?turma_id=${turmaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAlunos(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      toast.error('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const handleDestinatarioToggle = (id: number) => {
    setDestinatariosSelecionados(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelecionarTodos = () => {
    if (destinatarioTipo === 'turmas') {
      setDestinatariosSelecionados(turmas.map(t => t.id));
    } else if (destinatarioTipo === 'alunos' || destinatarioTipo === 'responsaveis') {
      setDestinatariosSelecionados(alunos.map(a => a.id));
    }
  };

  const handleDesmarcarTodos = () => {
    setDestinatariosSelecionados([]);
  };

  const handleEnviarMensagens = async () => {
    if (!assunto.trim()) {
      toast.error('Por favor, insira um assunto');
      return;
    }

    if (!mensagem.trim()) {
      toast.error('Por favor, insira uma mensagem');
      return;
    }

    if (destinatarioTipo !== 'todos_responsaveis' && destinatariosSelecionados.length === 0) {
      toast.error('Por favor, selecione pelo menos um destinatário');
      return;
    }

    try {
      setSending(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/chat/bulk-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          destinatario_tipo: destinatarioTipo,
          destinatarios: destinatariosSelecionados,
          turma_id: turmaSelecionada,
          assunto,
          mensagem
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Mensagens enviadas com sucesso para ${data.data.total_enviadas} destinatário(s)!`);
        onClose();
        // Resetar formulário
        setAssunto('');
        setMensagem('');
        setDestinatariosSelecionados([]);
        setTurmaSelecionada(null);
      } else {
        toast.error(data.message || 'Erro ao enviar mensagens');
      }
    } catch (error: any) {
      console.error('Erro ao enviar mensagens:', error);
      toast.error('Erro ao enviar mensagens');
    } finally {
      setSending(false);
    }
  };

  const getDestinatariosCount = () => {
    if (destinatarioTipo === 'todos_responsaveis') {
      return 'Todos os responsáveis';
    }
    return `${destinatariosSelecionados.length} selecionado(s)`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-white">
                <h2 className="text-xl font-bold">Enviar Mensagens em Massa</h2>
                <p className="text-sm text-blue-100">
                  Envie comunicados para múltiplos destinatários
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Tipo de Destinatário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Para quem deseja enviar?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setDestinatarioTipo('responsaveis');
                    setDestinatariosSelecionados([]);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    destinatarioTipo === 'responsaveis'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Users className="w-6 h-6 mb-2 text-blue-600" />
                  <div className="text-sm font-medium">Responsáveis da Turma</div>
                </button>

                <button
                  onClick={() => {
                    setDestinatarioTipo('todos_responsaveis');
                    setDestinatariosSelecionados([]);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    destinatarioTipo === 'todos_responsaveis'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Users className="w-6 h-6 mb-2 text-green-600" />
                  <div className="text-sm font-medium">Todos os Responsáveis</div>
                </button>

                <button
                  onClick={() => {
                    setDestinatarioTipo('turmas');
                    setDestinatariosSelecionados([]);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    destinatarioTipo === 'turmas'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <BookOpen className="w-6 h-6 mb-2 text-purple-600" />
                  <div className="text-sm font-medium">Por Turmas</div>
                </button>

                <button
                  onClick={() => {
                    setDestinatarioTipo('alunos');
                    setDestinatariosSelecionados([]);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    destinatarioTipo === 'alunos'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <GraduationCap className="w-6 h-6 mb-2 text-orange-600" />
                  <div className="text-sm font-medium">Alunos Específicos</div>
                </button>
              </div>
            </div>

            {/* Seleção de Turma (se necessário) */}
            {(destinatarioTipo === 'responsaveis' || destinatarioTipo === 'alunos') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione a Turma
                </label>
                <select
                  value={turmaSelecionada || ''}
                  onChange={(e) => setTurmaSelecionada(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma turma...</option>
                  {turmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome} ({turma.alunos_count} alunos)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Lista de Destinatários */}
            {destinatarioTipo !== 'todos_responsaveis' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Selecione os Destinatários
                  </label>
                  <div className="space-x-2">
                    <button
                      onClick={handleSelecionarTodos}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Selecionar Todos
                    </button>
                    <button
                      onClick={handleDesmarcarTodos}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      Desmarcar Todos
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <>
                      {destinatarioTipo === 'turmas' && (
                        <div className="divide-y">
                          {turmas.map((turma) => (
                            <label
                              key={turma.id}
                              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={destinatariosSelecionados.includes(turma.id)}
                                onChange={() => handleDestinatarioToggle(turma.id)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="ml-3 text-sm">
                                {turma.nome} ({turma.alunos_count} alunos)
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {(destinatarioTipo === 'alunos' || destinatarioTipo === 'responsaveis') && turmaSelecionada && (
                        <div className="divide-y">
                          {alunos.map((aluno) => (
                            <label
                              key={aluno.id}
                              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={destinatariosSelecionados.includes(aluno.id)}
                                onChange={() => handleDestinatarioToggle(aluno.id)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="ml-3 text-sm">
                                {aluno.nome}
                                {destinatarioTipo === 'responsaveis' && aluno.responsavel_nome && (
                                  <span className="text-gray-500"> - Resp: {aluno.responsavel_nome}</span>
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {(destinatarioTipo === 'alunos' || destinatarioTipo === 'responsaveis') && !turmaSelecionada && (
                        <div className="text-center text-gray-500 py-8 text-sm">
                          Selecione uma turma primeiro
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Assunto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assunto
              </label>
              <input
                type="text"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                placeholder="Ex: Reunião de Pais, Comunicado Importante..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Mensagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem
              </label>
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={6}
                placeholder="Digite sua mensagem aqui..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {mensagem.length} caracteres
              </p>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Resumo:</strong> Você enviará esta mensagem para{' '}
                  <strong>{getDestinatariosCount()}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                disabled={sending}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarMensagens}
                disabled={sending || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Enviar Mensagens</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BulkMessageModal;
