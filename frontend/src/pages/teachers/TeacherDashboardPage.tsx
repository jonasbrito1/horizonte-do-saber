import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  TrendingUp,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  X,
  FileText,
  Award,
  Edit,
  Plus,
  Eye,
  ChevronRight,
  UserCheck,
  UserX
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import mensagensService, { Mensagem, EditMensagemData } from '../../services/mensagensService';
import ChatInterface from '../../components/ChatInterface';
import BulkMessageModal from '../../components/BulkMessageModal';

interface Turma {
  id: number;
  nome: string;
  nivel: string;
  serie: string;
  turno: string;
  ano_letivo: number;
  capacidade_maxima: number;
  status: string;
  alunos_count?: number;
}

interface Aluno {
  id: number;
  nome: string;
  turma_id: number;
  turma_nome?: string;
  numero_matricula: string;
  email_responsavel: string;
  nome_responsavel: string;
  telefone_responsavel: string;
  serie_atual: string;
  turno: string;
  status: string;
  data_nascimento: string;
}

interface Nota {
  id: number;
  aluno_id: number;
  aluno_nome?: string;
  materia: string;
  bimestre: number;
  nota: number;
  nota_maxima: number;
  data_avaliacao: string;
  tipo_avaliacao: string;
  observacao?: string;
}

interface Frequencia {
  id: number;
  aluno_id: number;
  data: string;
  status: 'presente' | 'ausente' | 'justificado';
  presente?: boolean;
  turma_id: number;
  professor_id?: number;
  observacao?: string;
  observacoes?: string;
}

interface Observacao {
  id: number;
  aluno_id: number;
  aluno_nome?: string;
  professor_id: number;
  tipo: 'comportamento' | 'aprendizado' | 'saude' | 'outro';
  descricao: string;
  data: string;
  created_at: string;
}

interface Stats {
  totalTurmas: number;
  totalAlunos: number;
  mensagensNaoLidas: number;
  presencaMediaGeral: number;
}

const TeacherDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'turmas' | 'notas' | 'frequencia' | 'mensagens' | 'observacoes'>('overview');
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunosDaTurma, setAlunosDaTurma] = useState<Aluno[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [frequencias, setFrequencias] = useState<Frequencia[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [observacoes, setObservacoes] = useState<Observacao[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTurmas: 0,
    totalAlunos: 0,
    mensagensNaoLidas: 0,
    presencaMediaGeral: 0
  });
  const [loading, setLoading] = useState(true);

  // Modals
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [showFrequenciaModal, setShowFrequenciaModal] = useState(false);
  const [showObservacaoModal, setShowObservacaoModal] = useState(false);
  const [showViewMessageModal, setShowViewMessageModal] = useState(false);
  const [showBulkMessageModal, setShowBulkMessageModal] = useState(false);
  const [mensagemSelecionada, setMensagemSelecionada] = useState<Mensagem | null>(null);
  const [isRespondendo, setIsRespondendo] = useState(false);
  const [respostaText, setRespostaText] = useState('');

  // Form data
  const [notaFormData, setNotaFormData] = useState({
    aluno_id: 0,
    materia: '',
    bimestre: 1,
    nota: '',
    nota_maxima: 10,
    data_avaliacao: new Date().toISOString().split('T')[0],
    tipo_avaliacao: 'Prova',
    observacao: ''
  });

  const [frequenciaData, setFrequenciaData] = useState({
    data: new Date().toISOString().split('T')[0],
    turma_id: 0
  });

  const [presencas, setPresencas] = useState<{[key: number]: boolean}>({});

  const [observacaoFormData, setObservacaoFormData] = useState({
    aluno_id: 0,
    tipo: 'comportamento' as 'comportamento' | 'aprendizado' | 'saude' | 'outro',
    descricao: '',
    data: new Date().toISOString().split('T')[0]
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar turmas do professor
      const turmasResponse = await api.get(`/turmas?professor_id=${user.id}`);
      const turmasData = turmasResponse.data.data;
      setTurmas(turmasData);

      let todosAlunos: Aluno[] = [];
      let frequenciasDoProfessor: Frequencia[] = [];

      // Buscar todos os alunos das turmas do professor
      if (turmasData.length > 0) {
        try {
          const turmaIds = turmasData.map((t: Turma) => t.id);

          // Buscar alunos (com tratamento de erro individual)
          const alunosPromises = turmaIds.map((id: number) =>
            api.get(`/turmas/${id}/alunos`).catch(err => {
              console.error(`Erro ao buscar alunos da turma ${id}:`, err);
              return { data: { data: [] } };
            })
          );
          const alunosResponses = await Promise.all(alunosPromises);
          todosAlunos = alunosResponses.flatMap(r => r.data.data);
          setAlunos(todosAlunos);

          // Buscar notas (com tratamento de erro)
          try {
            const notasResponse = await api.get('/notas');
            const todasNotas = notasResponse.data.data;
            const notasDoProfessor = todasNotas.filter((n: Nota) =>
              todosAlunos.some((a: Aluno) => a.id === n.aluno_id)
            );
            setNotas(notasDoProfessor);
          } catch (error) {
            console.error('Erro ao buscar notas:', error);
            setNotas([]);
          }

          // Buscar frequências (com tratamento de erro)
          try {
            const frequenciasResponse = await api.get('/frequencias');
            const todasFrequencias = frequenciasResponse.data.data;
            frequenciasDoProfessor = todasFrequencias.filter((f: Frequencia) =>
              turmaIds.includes(f.turma_id)
            );
            setFrequencias(frequenciasDoProfessor);
          } catch (error) {
            console.error('Erro ao buscar frequências:', error);
            setFrequencias([]);
          }

          // Buscar observações (com tratamento de erro)
          try {
            const observacoesResponse = await api.get(`/observacoes?professor_id=${user.id}`);
            setObservacoes(observacoesResponse.data.data || []);
          } catch (error) {
            console.error('Erro ao buscar observações:', error);
            setObservacoes([]);
          }
        } catch (error) {
          console.error('Erro ao processar dados das turmas:', error);
        }
      }

      // Buscar mensagens (com tratamento de erro)
      let mensagensData: Mensagem[] = [];
      try {
        mensagensData = await mensagensService.getMensagens();
        setMensagens(mensagensData);
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        setMensagens([]);
      }

      // Calcular estatísticas
      const mensagensNaoLidas = mensagensData.filter(m => !m.lida && m.destinatario_id === user.id).length;
      const totalPresencas = frequenciasDoProfessor.filter(f => f.status === 'presente' || f.presente === true).length;
      const presencaMedia = frequenciasDoProfessor.length > 0 ? (totalPresencas / frequenciasDoProfessor.length) * 100 : 0;

      setStats({
        totalTurmas: turmasData.length,
        totalAlunos: todosAlunos.length,
        mensagensNaoLidas,
        presencaMediaGeral: presencaMedia
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do dashboard. Algumas informações podem estar incompletas.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTurma = async (turma: Turma) => {
    setSelectedTurma(turma);
    setActiveTab('turmas');

    try {
      const response = await api.get(`/turmas/${turma.id}/alunos`);
      setAlunosDaTurma(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar alunos da turma:', error);
      toast.error('Erro ao carregar alunos da turma');
    }
  };

  const handleAdicionarNota = () => {
    if (!selectedTurma) {
      toast.error('Selecione uma turma primeiro');
      return;
    }
    setNotaFormData({
      ...notaFormData,
      aluno_id: 0
    });
    setShowNotaModal(true);
  };

  const handleSalvarNota = async () => {
    if (!notaFormData.aluno_id || !notaFormData.materia || !notaFormData.nota) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await api.post('/notas', {
        ...notaFormData,
        nota: parseFloat(notaFormData.nota),
        professor_id: user.id
      });
      toast.success('Nota adicionada com sucesso!');
      setShowNotaModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      toast.error('Erro ao adicionar nota');
    }
  };

  const handleRegistrarFrequencia = () => {
    if (!selectedTurma) {
      toast.error('Selecione uma turma primeiro');
      return;
    }
    setFrequenciaData({
      ...frequenciaData,
      turma_id: selectedTurma.id
    });
    setPresencas({});
    setShowFrequenciaModal(true);
  };

  const handleSalvarFrequencia = async () => {
    try {
      const frequenciasParaSalvar = alunosDaTurma.map(aluno => ({
        aluno_id: aluno.id,
        turma_id: selectedTurma!.id,
        professor_id: user.id,
        data: frequenciaData.data,
        status: presencas[aluno.id] ? 'presente' : 'ausente'
      }));

      await Promise.all(
        frequenciasParaSalvar.map(freq => api.post('/frequencias', freq))
      );

      toast.success('Frequência registrada com sucesso!');
      setShowFrequenciaModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Erro ao registrar frequência:', error);
      toast.error('Erro ao registrar frequência');
    }
  };

  const handleAdicionarObservacao = () => {
    if (!selectedTurma) {
      toast.error('Selecione uma turma primeiro');
      return;
    }
    setObservacaoFormData({
      aluno_id: 0,
      tipo: 'comportamento',
      descricao: '',
      data: new Date().toISOString().split('T')[0]
    });
    setShowObservacaoModal(true);
  };

  const handleSalvarObservacao = async () => {
    if (!observacaoFormData.aluno_id || !observacaoFormData.descricao) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await api.post('/observacoes', {
        ...observacaoFormData,
        professor_id: user.id
      });
      toast.success('Observação adicionada com sucesso!');
      setShowObservacaoModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Erro ao adicionar observação:', error);
      toast.error('Erro ao adicionar observação');
    }
  };

  const handleViewMensagem = (mensagem: Mensagem) => {
    setMensagemSelecionada(mensagem);
    setRespostaText(mensagem.resposta || '');
    setIsRespondendo(false);
    setShowViewMessageModal(true);

    // Marcar como lida se não foi lida
    if (!mensagem.lida && mensagem.destinatario_id === user.id) {
      mensagensService.marcarComoLida(mensagem.id).catch(console.error);
    }
  };

  const handleResponderMensagem = async () => {
    if (!mensagemSelecionada || !respostaText.trim()) {
      toast.error('Digite uma resposta');
      return;
    }

    try {
      await mensagensService.responderMensagem(mensagemSelecionada.id, respostaText);
      toast.success('Resposta enviada com sucesso!');
      setShowViewMessageModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Erro ao responder mensagem:', error);
      toast.error('Erro ao enviar resposta');
    }
  };

  const handleCloseMessageModal = () => {
    setShowViewMessageModal(false);
    setMensagemSelecionada(null);
    setIsRespondendo(false);
    setRespostaText('');
  };

  const getNotasAluno = (alunoId: number) => {
    return notas.filter(n => n.aluno_id === alunoId);
  };

  const getMediaAluno = (alunoId: number) => {
    const notasAluno = getNotasAluno(alunoId);
    if (notasAluno.length === 0) return 0;

    const soma = notasAluno.reduce((acc, n) => acc + (n.nota / n.nota_maxima) * 10, 0);
    return soma / notasAluno.length;
  };

  const getFrequenciaAluno = (alunoId: number) => {
    const frequenciasAluno = frequencias.filter(f => f.aluno_id === alunoId);
    if (frequenciasAluno.length === 0) return 0;

    const presentes = frequenciasAluno.filter(f => f.status === 'presente' || f.presente === true).length;
    return (presentes / frequenciasAluno.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Visão Geral do Professor
          </h1>
          <p className="text-gray-600">Bem-vindo, {user.nome}!</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6 overflow-x-auto">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={20} />
                Visão Geral
              </div>
            </button>
            <button
              onClick={() => setActiveTab('turmas')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'turmas'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={20} />
                Turmas e Alunos
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notas')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'notas'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Award size={20} />
                Notas
              </div>
            </button>
            <button
              onClick={() => setActiveTab('frequencia')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'frequencia'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                Frequência
              </div>
            </button>
            <button
              onClick={() => setActiveTab('mensagens')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap relative ${
                activeTab === 'mensagens'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={20} />
                Mensagens
                {stats.mensagensNaoLidas > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.mensagensNaoLidas}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('observacoes')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'observacoes'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText size={20} />
                Observações
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total de Turmas</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalTurmas}</h3>
                  </div>
                  <Users className="text-blue-600" size={40} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total de Alunos</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalAlunos}</h3>
                  </div>
                  <BookOpen className="text-green-600" size={40} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Mensagens Não Lidas</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.mensagensNaoLidas}</h3>
                  </div>
                  <MessageSquare className="text-red-600" size={40} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Presença Média</p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {stats.presencaMediaGeral.toFixed(0)}%
                    </h3>
                  </div>
                  <TrendingUp className="text-purple-600" size={40} />
                </div>
              </motion.div>
            </div>

            {/* Turmas Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Minhas Turmas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {turmas.map((turma) => (
                  <div
                    key={turma.id}
                    onClick={() => handleSelectTurma(turma)}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{turma.nome}</h3>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">{turma.serie} - {turma.turno}</p>
                    <p className="text-sm text-gray-600">Ano Letivo: {turma.ano_letivo}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {alunos.filter(a => a.turma_id === turma.id).length} alunos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mensagens Recentes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Mensagens Recentes</h2>
                <button
                  onClick={() => setActiveTab('mensagens')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Ver todas
                </button>
              </div>
              <div className="space-y-3">
                {mensagens.slice(0, 5).map((mensagem) => (
                  <div
                    key={mensagem.id}
                    onClick={() => handleViewMensagem(mensagem)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      !mensagem.lida ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          {!mensagem.lida && (
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                          )}
                          <h4 className="font-semibold text-gray-900">{mensagem.assunto}</h4>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{mensagem.mensagem}</p>
                        {mensagem.aluno_nome && (
                          <p className="text-xs text-gray-500 mt-1">Aluno: {mensagem.aluno_nome}</p>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(mensagem.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        {mensagem.resposta ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            <CheckCircle size={12} className="mr-1" />
                            Respondida
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                            <Clock size={12} className="mr-1" />
                            Pendente
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {mensagens.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Mail size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Nenhuma mensagem encontrada</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'turmas' && (
          <div>
            {selectedTurma ? (
              <div>
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <button
                        onClick={() => setSelectedTurma(null)}
                        className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-1"
                      >
                        ← Voltar para turmas
                      </button>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedTurma.nome}</h2>
                      <p className="text-gray-600">{selectedTurma.serie} - {selectedTurma.turno}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAdicionarNota}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Adicionar Nota
                      </button>
                      <button
                        onClick={handleRegistrarFrequencia}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Calendar size={18} />
                        Registrar Frequência
                      </button>
                      <button
                        onClick={handleAdicionarObservacao}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                      >
                        <FileText size={18} />
                        Nova Observação
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aluno
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Matrícula
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Responsável
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Média
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Frequência
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {alunosDaTurma.map((aluno) => {
                          const media = getMediaAluno(aluno.id);
                          const freq = getFrequenciaAluno(aluno.id);

                          return (
                            <tr key={aluno.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{aluno.nome}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{aluno.numero_matricula}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{aluno.nome_responsavel}</div>
                                <div className="text-xs text-gray-500">{aluno.email_responsavel}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  media >= 7 ? 'bg-green-100 text-green-800' :
                                  media >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                  media > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {media > 0 ? media.toFixed(1) : '--'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  freq >= 75 ? 'bg-green-100 text-green-800' :
                                  freq >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                  freq > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {freq > 0 ? `${freq.toFixed(0)}%` : '--'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  aluno.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {aluno.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Selecione uma Turma</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {turmas.map((turma) => (
                    <div
                      key={turma.id}
                      onClick={() => handleSelectTurma(turma)}
                      className="border-2 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{turma.nome}</h3>
                      <p className="text-gray-600 mb-1">{turma.serie}</p>
                      <p className="text-gray-600 mb-3">Turno: {turma.turno}</p>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={18} />
                        <span>{alunos.filter(a => a.turma_id === turma.id).length} alunos</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notas' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciar Notas</h2>
              <button
                onClick={handleAdicionarNota}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                disabled={!selectedTurma}
              >
                <Plus size={18} />
                Adicionar Nota
              </button>
            </div>

            {!selectedTurma ? (
              <div className="text-center py-12 text-gray-500">
                <Award size={64} className="mx-auto mb-4 opacity-50" />
                <p>Selecione uma turma na aba "Turmas e Alunos" para gerenciar notas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Notas da turma: {selectedTurma.nome}
                </h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aluno
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matéria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bimestre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nota
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {notas
                      .filter(n => alunosDaTurma.some(a => a.id === n.aluno_id))
                      .map((nota) => {
                        const aluno = alunosDaTurma.find(a => a.id === nota.aluno_id);
                        const notaNormalizada = (nota.nota / nota.nota_maxima) * 10;

                        return (
                          <tr key={nota.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{aluno?.nome}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{nota.materia}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{nota.bimestre}º</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{nota.tipo_avaliacao}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                notaNormalizada >= 7 ? 'bg-green-100 text-green-800' :
                                notaNormalizada >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {nota.nota}/{nota.nota_maxima} ({notaNormalizada.toFixed(1)})
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {new Date(nota.data_avaliacao).toLocaleDateString('pt-BR')}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>

                {notas.filter(n => alunosDaTurma.some(a => a.id === n.aluno_id)).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Nenhuma nota cadastrada para esta turma</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'frequencia' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Controle de Frequência</h2>
              <button
                onClick={handleRegistrarFrequencia}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                disabled={!selectedTurma}
              >
                <Calendar size={18} />
                Registrar Frequência
              </button>
            </div>

            {!selectedTurma ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar size={64} className="mx-auto mb-4 opacity-50" />
                <p>Selecione uma turma na aba "Turmas e Alunos" para gerenciar frequência</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Frequência da turma: {selectedTurma.nome}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alunosDaTurma.map((aluno) => {
                    const freq = getFrequenciaAluno(aluno.id);
                    const frequenciasAluno = frequencias.filter(f => f.aluno_id === aluno.id);
                    const presentes = frequenciasAluno.filter(f => f.status === 'presente' || f.presente === true).length;
                    const faltas = frequenciasAluno.length - presentes;

                    return (
                      <div key={aluno.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{aluno.nome}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Presentes:</span>
                            <span className="font-semibold text-green-600">{presentes}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Faltas:</span>
                            <span className="font-semibold text-red-600">{faltas}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Taxa de Presença:</span>
                            <span className={`font-semibold ${
                              freq >= 75 ? 'text-green-600' :
                              freq >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {freq > 0 ? `${freq.toFixed(0)}%` : '--'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                freq >= 75 ? 'bg-green-600' :
                                freq >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${freq}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mensagens' && (
          <div>
            <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Mensagens</h2>
                <button
                  onClick={() => setShowBulkMessageModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Send size={18} />
                  Enviar Mensagem em Massa
                </button>
              </div>
            </div>

            <ChatInterface
              userType="professor"
              alunos={alunos.map(a => ({
                id: a.id,
                nome: a.nome,
                turma_nome: a.turma_nome
              }))}
            />

            <BulkMessageModal
              isOpen={showBulkMessageModal}
              onClose={() => {
                setShowBulkMessageModal(false);
                loadDashboardData(); // Refresh messages after sending
              }}
              professorId={user.id}
            />
          </div>
        )}

        {activeTab === 'observacoes' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Observações dos Alunos</h2>
              <button
                onClick={handleAdicionarObservacao}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                disabled={!selectedTurma}
              >
                <Plus size={18} />
                Nova Observação
              </button>
            </div>

            {!selectedTurma ? (
              <div className="text-center py-12 text-gray-500">
                <FileText size={64} className="mx-auto mb-4 opacity-50" />
                <p>Selecione uma turma na aba "Turmas e Alunos" para gerenciar observações</p>
              </div>
            ) : (
              <div className="space-y-4">
                {observacoes
                  .filter(obs => alunosDaTurma.some(a => a.id === obs.aluno_id))
                  .map((obs) => {
                    const aluno = alunosDaTurma.find(a => a.id === obs.aluno_id);

                    return (
                      <div key={obs.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{aluno?.nome}</h4>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                              obs.tipo === 'comportamento' ? 'bg-blue-100 text-blue-800' :
                              obs.tipo === 'aprendizado' ? 'bg-green-100 text-green-800' :
                              obs.tipo === 'saude' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {obs.tipo}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(obs.data).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700">{obs.descricao}</p>
                      </div>
                    );
                  })}

                {observacoes.filter(obs => alunosDaTurma.some(a => a.id === obs.aluno_id)).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Nenhuma observação cadastrada para esta turma</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Adicionar Nota */}
        {showNotaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Adicionar Nota</h3>
                <button
                  onClick={() => setShowNotaModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aluno
                  </label>
                  <select
                    value={notaFormData.aluno_id}
                    onChange={(e) => setNotaFormData({...notaFormData, aluno_id: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Selecione um aluno</option>
                    {alunosDaTurma.map((aluno) => (
                      <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Matéria
                    </label>
                    <input
                      type="text"
                      value={notaFormData.materia}
                      onChange={(e) => setNotaFormData({...notaFormData, materia: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Matemática"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bimestre
                    </label>
                    <select
                      value={notaFormData.bimestre}
                      onChange={(e) => setNotaFormData({...notaFormData, bimestre: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>1º Bimestre</option>
                      <option value={2}>2º Bimestre</option>
                      <option value={3}>3º Bimestre</option>
                      <option value={4}>4º Bimestre</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nota
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={notaFormData.nota}
                      onChange={(e) => setNotaFormData({...notaFormData, nota: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nota Máxima
                    </label>
                    <input
                      type="number"
                      value={notaFormData.nota_maxima}
                      onChange={(e) => setNotaFormData({...notaFormData, nota_maxima: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data
                    </label>
                    <input
                      type="date"
                      value={notaFormData.data_avaliacao}
                      onChange={(e) => setNotaFormData({...notaFormData, data_avaliacao: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Avaliação
                  </label>
                  <select
                    value={notaFormData.tipo_avaliacao}
                    onChange={(e) => setNotaFormData({...notaFormData, tipo_avaliacao: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Prova">Prova</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Atividade">Atividade</option>
                    <option value="Seminário">Seminário</option>
                    <option value="Participação">Participação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observação (opcional)
                  </label>
                  <textarea
                    value={notaFormData.observacao}
                    onChange={(e) => setNotaFormData({...notaFormData, observacao: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Digite uma observação sobre a avaliação..."
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowNotaModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarNota}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Send size={18} />
                    Salvar Nota
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal Registrar Frequência */}
        {showFrequenciaModal && selectedTurma && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Registrar Frequência</h3>
                <button
                  onClick={() => setShowFrequenciaModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={frequenciaData.data}
                  onChange={(e) => setFrequenciaData({...frequenciaData, data: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Marque os alunos presentes:</p>
                {alunosDaTurma.map((aluno) => (
                  <div key={aluno.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={presencas[aluno.id] || false}
                      onChange={(e) => setPresencas({...presencas, [aluno.id]: e.target.checked})}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="flex-1 cursor-pointer">
                      <span className="font-medium text-gray-900">{aluno.nome}</span>
                      <span className="text-sm text-gray-500 ml-2">({aluno.numero_matricula})</span>
                    </label>
                    {presencas[aluno.id] ? (
                      <UserCheck className="text-green-600" size={20} />
                    ) : (
                      <UserX className="text-red-600" size={20} />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowFrequenciaModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarFrequencia}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Send size={18} />
                  Salvar Frequência
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal Adicionar Observação */}
        {showObservacaoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Nova Observação</h3>
                <button
                  onClick={() => setShowObservacaoModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aluno
                  </label>
                  <select
                    value={observacaoFormData.aluno_id}
                    onChange={(e) => setObservacaoFormData({...observacaoFormData, aluno_id: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Selecione um aluno</option>
                    {alunosDaTurma.map((aluno) => (
                      <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={observacaoFormData.tipo}
                      onChange={(e) => setObservacaoFormData({...observacaoFormData, tipo: e.target.value as any})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="comportamento">Comportamento</option>
                      <option value="aprendizado">Aprendizado</option>
                      <option value="saude">Saúde</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data
                    </label>
                    <input
                      type="date"
                      value={observacaoFormData.data}
                      onChange={(e) => setObservacaoFormData({...observacaoFormData, data: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={observacaoFormData.descricao}
                    onChange={(e) => setObservacaoFormData({...observacaoFormData, descricao: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Digite a observação sobre o aluno..."
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowObservacaoModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarObservacao}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Send size={18} />
                    Salvar Observação
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal Visualizar/Responder Mensagem */}
        {showViewMessageModal && mensagemSelecionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {isRespondendo ? 'Responder Mensagem' : 'Visualizar Mensagem'}
                </h3>
                <button
                  onClick={handleCloseMessageModal}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                    De: {mensagemSelecionada.remetente_nome}
                  </span>
                  {mensagemSelecionada.aluno_nome && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                      Aluno: {mensagemSelecionada.aluno_nome}
                    </span>
                  )}
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                    {new Date(mensagemSelecionada.created_at).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(mensagemSelecionada.created_at).toLocaleTimeString('pt-BR')}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assunto
                  </label>
                  <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {mensagemSelecionada.assunto}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem
                  </label>
                  <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg min-h-[100px] whitespace-pre-wrap">
                    {mensagemSelecionada.mensagem}
                  </div>
                </div>

                {isRespondendo ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sua Resposta
                    </label>
                    <textarea
                      value={respostaText}
                      onChange={(e) => setRespostaText(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Digite sua resposta..."
                      autoFocus
                    />
                  </div>
                ) : (
                  mensagemSelecionada.resposta && (
                    <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CheckCircle size={18} className="text-green-600 mr-2" />
                        <p className="text-sm font-semibold text-green-800">Sua Resposta</p>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{mensagemSelecionada.resposta}</p>
                      {mensagemSelecionada.respondido_em && (
                        <p className="text-xs text-gray-500 mt-2">
                          Respondido em {new Date(mensagemSelecionada.respondido_em).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(mensagemSelecionada.respondido_em).toLocaleTimeString('pt-BR')}
                        </p>
                      )}
                    </div>
                  )
                )}

                <div className="flex items-center justify-end gap-3 mt-6">
                  {isRespondendo ? (
                    <>
                      <button
                        onClick={() => {
                          setIsRespondendo(false);
                          setRespostaText(mensagemSelecionada.resposta || '');
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleResponderMensagem}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Send size={18} />
                        Enviar Resposta
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleCloseMessageModal}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Fechar
                      </button>
                      {!mensagemSelecionada.resposta && (
                        <button
                          onClick={() => setIsRespondendo(true)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <Send size={18} />
                          Responder
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TeacherDashboardPage;
