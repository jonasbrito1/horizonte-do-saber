import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, User, MapPin, Heart, Phone, DollarSign, FileText, GraduationCap, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { alunoService, turmaService, type Turma } from '../../services/alunoService'

interface StudentFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  turmas: Turma[]
  student?: any // Para edição
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  turmas,
  student
}) => {
  const [moraComOutros, setMoraComOutros] = useState(false)
  const [recebeBolsa, setRecebeBolsa] = useState(false)
  const [possuiConducao, setPossuiConducao] = useState<boolean | null>(null)
  const [selectedTurmaId, setSelectedTurmaId] = useState<number | null>(student?.turma_id || null)
  const [generatedMatricula, setGeneratedMatricula] = useState<string>(student?.numero_matricula || '')
  const [dataNascimento, setDataNascimento] = useState<string>(student?.data_nascimento || '')
  const [idade, setIdade] = useState<number | null>(null)
  const [cpf, setCpf] = useState<string>(student?.cpf || '')

  // Estados para endereço
  const [cep, setCep] = useState<string>(student?.endereco_cep || '')
  const [rua, setRua] = useState<string>(student?.endereco_rua || '')
  const [numero, setNumero] = useState<string>(student?.endereco_numero || '')
  const [bairro, setBairro] = useState<string>(student?.endereco_bairro || '')
  const [cidade, setCidade] = useState<string>(student?.endereco_cidade || '')
  const [estado, setEstado] = useState<string>(student?.endereco_estado || 'AM')
  const [buscandoCep, setBuscandoCep] = useState(false)

  // Estados para telefones
  const [telefoneResponsavel, setTelefoneResponsavel] = useState<string>(student?.telefone_responsavel || '')
  const [telefoneMae, setTelefoneMae] = useState<string>(student?.telefone_mae || '')
  const [telefoneOutro, setTelefoneOutro] = useState<string>(student?.telefone_outro || '')
  const [telefoneEmergencia, setTelefoneEmergencia] = useState<string>(student?.telefone_emergencia || '')

  // Função para formatar CPF: 000.000.000-00
  const formatCPF = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')

    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11)

    // Aplica a máscara
    if (limited.length <= 3) {
      return limited
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)}.${limited.slice(3)}`
    } else if (limited.length <= 9) {
      return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`
    } else {
      return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`
    }
  }

  // Função para lidar com mudança no CPF
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setCpf(formatted)
  }

  // Função para formatar CEP: 00000-000
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const limited = numbers.slice(0, 8)

    if (limited.length <= 5) {
      return limited
    } else {
      return `${limited.slice(0, 5)}-${limited.slice(5)}`
    }
  }

  // Função para buscar CEP na API ViaCEP
  const buscarCEP = async (cepValue: string) => {
    const cepLimpo = cepValue.replace(/\D/g, '')

    // CEP deve ter 8 dígitos
    if (cepLimpo.length !== 8) {
      return
    }

    setBuscandoCep(true)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (data.erro) {
        toast.error('CEP não encontrado')
        return
      }

      // Preencher os campos automaticamente
      setRua(data.logradouro || '')
      setBairro(data.bairro || '')
      setCidade(data.localidade || '')
      setEstado(data.uf || 'AM')

      toast.success('Endereço encontrado!')
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      toast.error('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setBuscandoCep(false)
    }
  }

  // Função para lidar com mudança no CEP
  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value)
    setCep(formatted)

    // Buscar automaticamente quando CEP estiver completo
    if (formatted.replace(/\D/g, '').length === 8) {
      buscarCEP(formatted)
    }
  }

  // Função para formatar Telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const limited = numbers.slice(0, 11)

    if (limited.length <= 2) {
      return limited
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
    } else if (limited.length <= 10) {
      // Telefone fixo: (XX) XXXX-XXXX
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`
    } else {
      // Celular: (XX) XXXXX-XXXX
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`
    }
  }

  // Handlers para telefones
  const handleTelefoneResponsavelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefoneResponsavel(formatTelefone(e.target.value))
  }

  const handleTelefoneMaeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefoneMae(formatTelefone(e.target.value))
  }

  const handleTelefoneOutroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefoneOutro(formatTelefone(e.target.value))
  }

  const handleTelefoneEmergenciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefoneEmergencia(formatTelefone(e.target.value))
  }

  // Gerar matrícula automática quando selecionar a turma
  React.useEffect(() => {
    if (selectedTurmaId && !student) {
      const turma = turmas.find(t => t.id === selectedTurmaId)
      if (turma) {
        // Formato: ANO + SÉRIE + NÚMERO SEQUENCIAL
        // Exemplo: 2025-1A-001, 2025-5B-015
        const ano = new Date().getFullYear()
        const serie = turma.serie?.replace(/[^0-9]/g, '') || turma.nome?.replace(/[^0-9]/g, '') || '0'
        const turmaLetra = turma.nome?.slice(-1) || 'A'
        // Usar timestamp para gerar número único temporário (backend vai gerar o definitivo)
        const sequencial = String(Date.now() % 1000).padStart(3, '0')
        const matricula = `${ano}-${serie}${turmaLetra}-${sequencial}`
        setGeneratedMatricula(matricula)
      }
    }
  }, [selectedTurmaId, turmas, student])

  // Calcular idade quando data de nascimento mudar
  React.useEffect(() => {
    if (dataNascimento) {
      const hoje = new Date()
      const nascimento = new Date(dataNascimento)
      let idadeCalculada = hoje.getFullYear() - nascimento.getFullYear()
      const mes = hoje.getMonth() - nascimento.getMonth()
      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idadeCalculada--
      }
      setIdade(idadeCalculada)
    } else {
      setIdade(null)
    }
  }, [dataNascimento])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const alunoData = {
        // Dados pessoais básicos
        nome: formData.get('nome') as string,
        cpf: formData.get('cpf') as string,
        data_nascimento: formData.get('data_nascimento') as string,
        religiao: formData.get('religiao') as string,

        // Endereço completo
        endereco_rua: formData.get('endereco_rua') as string,
        endereco_numero: formData.get('endereco_numero') as string,
        endereco_bairro: formData.get('endereco_bairro') as string,
        endereco_cidade: formData.get('endereco_cidade') as string,
        endereco_estado: formData.get('endereco_estado') as string,
        endereco_cep: formData.get('endereco_cep') as string,
        possui_conducao: possuiConducao,

        // Informações dos responsáveis
        nome_mae: formData.get('nome_mae') as string,
        nome_pai: formData.get('nome_pai') as string,
        nome_responsavel: formData.get('nome_responsavel') as string,
        telefone_responsavel: formData.get('telefone_responsavel') as string,
        email_responsavel: formData.get('email_responsavel') as string,
        telefone_mae: formData.get('telefone_mae') as string,
        telefone_outro: formData.get('telefone_outro') as string,
        nome_outro_contato: formData.get('nome_outro_contato') as string,

        // Com quem mora
        mora_com: formData.get('mora_com') as string,
        mora_com_outros_desc: moraComOutros ? formData.get('mora_com_outros_desc') as string : null,

        // Informações de saúde
        doenca_grave: formData.get('doenca_grave') as string,
        restricao_alimentar: formData.get('restricao_alimentar') as string,
        restricao_remedio: formData.get('restricao_remedio') as string,
        remedio_uso_continuo: formData.get('remedio_uso_continuo') as string,
        telefone_emergencia: formData.get('telefone_emergencia') as string,
        tipo_sanguineo: formData.get('tipo_sanguineo') as string,
        alergias: formData.get('alergias') as string,

        // Informações sociais
        recebe_bolsa_familia: recebeBolsa,
        numero_nis: recebeBolsa ? formData.get('numero_nis') as string : null,

        // Informações acadêmicas
        serie_atual: formData.get('serie_atual') as string,
        turno: formData.get('turno') as string,
        turma_id: formData.get('turma_id') ? Number(formData.get('turma_id')) : undefined,
        numero_matricula: formData.get('numero_matricula') as string,

        // Informações adicionais
        informacoes_adicionais: formData.get('informacoes_adicionais') as string,
        observacoes: formData.get('observacoes') as string,

        status: 'ativo' as const
      }

      if (student) {
        // Atualizar aluno existente
        await alunoService.updateAluno(student.id, alunoData)
        toast.success('Aluno atualizado com sucesso!')
      } else {
        // Criar novo aluno
        const response = await alunoService.createAluno(alunoData)

        // Verificar se um usuário foi criado para o responsável
        if (response.usuarioCriado && response.senhaGerada) {
          toast.success(
            `Aluno cadastrado com sucesso!\n\n✅ Conta criada para responsável:\nEmail: ${alunoData.email_responsavel}\nSenha: ${response.senhaGerada}\n\n⚠️ Anote estas credenciais!`,
            {
              duration: 10000,
              style: {
                background: '#10b981',
                color: '#fff',
                minWidth: '400px',
                whiteSpace: 'pre-line'
              }
            }
          )
        } else {
          toast.success('Aluno cadastrado com sucesso!')
        }
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar dados do aluno')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <GraduationCap className="w-6 h-6 mr-2" />
                  {student ? 'Editar Aluno' : 'Ficha de Matrícula - Novo Aluno'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Body com layout em 2 colunas */}
            <div className="bg-white px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ===== COLUNA ESQUERDA ===== */}
                <div className="space-y-6">
                  {/* DADOS PESSOAIS */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary-600" />
                      Dados Pessoais do Aluno
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          name="nome"
                          required
                          defaultValue={student?.nome}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Nome completo do aluno"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CPF
                          </label>
                          <input
                            type="text"
                            name="cpf"
                            value={cpf}
                            onChange={handleCPFChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="000.000.000-00"
                            maxLength={14}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data de Nascimento *
                          </label>
                          <input
                            type="date"
                            name="data_nascimento"
                            required
                            value={dataNascimento}
                            onChange={(e) => setDataNascimento(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Display age when calculated */}
                      {idade !== null && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-700">
                              🎂 Idade do Aluno:
                            </span>
                            <span className="text-lg font-bold text-blue-800">
                              {idade} {idade === 1 ? 'ano' : 'anos'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Religião
                          </label>
                          <input
                            type="text"
                            name="religiao"
                            defaultValue={student?.religiao}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Religião (opcional)"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número de Matrícula (Automático)
                          </label>
                          <input
                            type="text"
                            name="numero_matricula"
                            value={generatedMatricula}
                            readOnly
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                            placeholder="Selecione a turma para gerar"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ENDEREÇO */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                      Endereço
                    </h4>

                    <div className="space-y-3">
                      {/* CEP - Primeiro campo para busca automática */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CEP {buscandoCep && <span className="text-blue-600 text-xs">(buscando...)</span>}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="endereco_cep"
                            value={cep}
                            onChange={handleCEPChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="00000-000"
                            maxLength={9}
                          />
                          {buscandoCep && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Digite o CEP para preencher automaticamente o endereço
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rua/Avenida
                          </label>
                          <input
                            type="text"
                            name="endereco_rua"
                            value={rua}
                            onChange={(e) => setRua(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Nome da rua"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número
                          </label>
                          <input
                            type="text"
                            name="endereco_numero"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Nº"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bairro
                          </label>
                          <input
                            type="text"
                            name="endereco_bairro"
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Bairro"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cidade
                          </label>
                          <input
                            type="text"
                            name="endereco_cidade"
                            value={cidade}
                            onChange={(e) => setCidade(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Cidade"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                          </label>
                          <select
                            name="endereco_estado"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="">UF</option>
                            <option value="AC">AC</option>
                            <option value="AL">AL</option>
                            <option value="AP">AP</option>
                            <option value="AM">AM</option>
                            <option value="BA">BA</option>
                            <option value="CE">CE</option>
                            <option value="DF">DF</option>
                            <option value="ES">ES</option>
                            <option value="GO">GO</option>
                            <option value="MA">MA</option>
                            <option value="MT">MT</option>
                            <option value="MS">MS</option>
                            <option value="MG">MG</option>
                            <option value="PA">PA</option>
                            <option value="PB">PB</option>
                            <option value="PR">PR</option>
                            <option value="PE">PE</option>
                            <option value="PI">PI</option>
                            <option value="RJ">RJ</option>
                            <option value="RN">RN</option>
                            <option value="RS">RS</option>
                            <option value="RO">RO</option>
                            <option value="RR">RR</option>
                            <option value="SC">SC</option>
                            <option value="SP">SP</option>
                            <option value="SE">SE</option>
                            <option value="TO">TO</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tem Condução?
                          </label>
                          <div className="flex gap-3 mt-2">
                            <label className="flex items-center text-sm">
                              <input
                                type="radio"
                                name="possui_conducao"
                                checked={possuiConducao === true}
                                onChange={() => setPossuiConducao(true)}
                                className="mr-1"
                              />
                              Sim
                            </label>
                            <label className="flex items-center text-sm">
                              <input
                                type="radio"
                                name="possui_conducao"
                                checked={possuiConducao === false}
                                onChange={() => setPossuiConducao(false)}
                                className="mr-1"
                              />
                              Não
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* INFORMAÇÕES ACADÊMICAS - MATRÍCULA NA TURMA */}
                  <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-5 border-2 border-primary-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-primary-600" />
                      Matrícula na Turma
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🎓 Selecione a Turma para Matrícula *
                        </label>
                        <select
                          name="turma_id"
                          value={selectedTurmaId || ''}
                          onChange={(e) => setSelectedTurmaId(e.target.value ? Number(e.target.value) : null)}
                          required
                          className="w-full px-3 py-2.5 text-sm border-2 border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                        >
                          <option value="">📚 Escolha a turma do aluno</option>
                          {turmas.map((turma) => (
                            <option key={turma.id} value={turma.id}>
                              {turma.nome} - {turma.serie} ({turma.turno || 'Turno não definido'}) - {turma.ano_letivo || new Date().getFullYear()}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-600 mt-1">
                          A matrícula será gerada automaticamente após selecionar a turma
                        </p>
                      </div>

                      {selectedTurmaId && (
                        <div className="bg-white rounded-lg p-4 border border-primary-200">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Série
                              </label>
                              <input
                                type="text"
                                name="serie_atual"
                                value={turmas.find(t => t.id === selectedTurmaId)?.serie || ''}
                                readOnly
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Turno
                              </label>
                              <input
                                type="text"
                                name="turno"
                                value={turmas.find(t => t.id === selectedTurmaId)?.turno || ''}
                                readOnly
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700 capitalize"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Ano Letivo
                              </label>
                              <input
                                type="text"
                                value={turmas.find(t => t.id === selectedTurmaId)?.ano_letivo || new Date().getFullYear()}
                                readOnly
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                              />
                            </div>
                          </div>

                          {generatedMatricula && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-green-700">
                                  ✓ Matrícula Gerada:
                                </span>
                                <span className="text-sm font-bold text-green-800">
                                  {generatedMatricula}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ===== COLUNA DIREITA ===== */}
                <div className="space-y-6">
                  {/* DADOS DOS RESPONSÁVEIS */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-primary-600" />
                      Dados dos Responsáveis
                    </h4>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome da Mãe
                          </label>
                          <input
                            type="text"
                            name="nome_mae"
                            defaultValue={student?.nome_mae}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Nome completo"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do Pai
                          </label>
                          <input
                            type="text"
                            name="nome_pai"
                            defaultValue={student?.nome_pai}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Nome completo"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Responsável Principal (Para Conta de Acesso)
                        </label>
                        <input
                          type="text"
                          name="nome_responsavel"
                          defaultValue={student?.nome_responsavel}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Nome do responsável que terá acesso ao sistema"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Este nome será usado para criar a conta de acesso do Portal dos Responsáveis
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefone Principal *
                          </label>
                          <input
                            type="tel"
                            name="telefone_responsavel"
                            required
                            value={telefoneResponsavel}
                            onChange={handleTelefoneResponsavelChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefone da Mãe
                          </label>
                          <input
                            type="tel"
                            name="telefone_mae"
                            value={telefoneMae}
                            onChange={handleTelefoneMaeChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email do Responsável
                        </label>
                        <input
                          type="email"
                          name="email_responsavel"
                          defaultValue={student?.email_responsavel}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="email@exemplo.com"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Outro Contato (nome)
                          </label>
                          <input
                            type="text"
                            name="nome_outro_contato"
                            defaultValue={student?.nome_outro_contato}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Tio, avó, etc."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefone Outro Contato
                          </label>
                          <input
                            type="tel"
                            name="telefone_outro"
                            value={telefoneOutro}
                            onChange={handleTelefoneOutroChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Aluno Mora Com
                          </label>
                          <select
                            name="mora_com"
                            defaultValue={student?.mora_com}
                            onChange={(e) => setMoraComOutros(e.target.value === 'outros')}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="">Selecione</option>
                            <option value="pais">Pais</option>
                            <option value="avos">Avós</option>
                            <option value="tios">Tios</option>
                            <option value="irmaos">Irmãos</option>
                            <option value="outros">Outros</option>
                          </select>
                        </div>

                        {moraComOutros && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Especifique
                            </label>
                            <input
                              type="text"
                              name="mora_com_outros_desc"
                              defaultValue={student?.mora_com_outros_desc}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="Com quem mora"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* INFORMAÇÕES DE SAÚDE */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-primary-600" />
                      Informações de Saúde
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Já teve alguma doença grave?
                        </label>
                        <textarea
                          name="doenca_grave"
                          rows={2}
                          defaultValue={student?.doenca_grave}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Descreva..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo Sanguíneo
                          </label>
                          <select
                            name="tipo_sanguineo"
                            defaultValue={student?.tipo_sanguineo}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="">Selecione</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tel. Emergência *
                          </label>
                          <input
                            type="tel"
                            name="telefone_emergencia"
                            required
                            value={telefoneEmergencia}
                            onChange={handleTelefoneEmergenciaChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alergias
                        </label>
                        <input
                          type="text"
                          name="alergias"
                          defaultValue={student?.alergias}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Liste as alergias"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Restrição Alimentar
                        </label>
                        <input
                          type="text"
                          name="restricao_alimentar"
                          defaultValue={student?.restricao_alimentar}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Restrições alimentares"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Restrição a Remédios
                        </label>
                        <input
                          type="text"
                          name="restricao_remedio"
                          defaultValue={student?.restricao_remedio}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Remédios que não pode tomar"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Remédio de Uso Contínuo
                        </label>
                        <input
                          type="text"
                          name="remedio_uso_continuo"
                          defaultValue={student?.remedio_uso_continuo}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Medicamentos de uso contínuo"
                        />
                      </div>
                    </div>
                  </div>

                  {/* INFORMAÇÕES SOCIAIS */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
                      Informações Sociais
                    </h4>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Recebe Bolsa Família?
                          </label>
                          <div className="flex gap-3 mt-2">
                            <label className="flex items-center text-sm">
                              <input
                                type="radio"
                                name="recebe_bolsa_familia"
                                checked={recebeBolsa === true}
                                onChange={() => setRecebeBolsa(true)}
                                className="mr-1"
                              />
                              Sim
                            </label>
                            <label className="flex items-center text-sm">
                              <input
                                type="radio"
                                name="recebe_bolsa_familia"
                                checked={recebeBolsa === false}
                                onChange={() => setRecebeBolsa(false)}
                                className="mr-1"
                              />
                              Não
                            </label>
                          </div>
                        </div>

                        {recebeBolsa && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Número do NIS
                            </label>
                            <input
                              type="text"
                              name="numero_nis"
                              defaultValue={student?.numero_nis}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="00000000000"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* INFORMAÇÕES ADICIONAIS (full width) */}
              <div className="mt-6 bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary-600" />
                  Informações Adicionais
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Informações Adicionais sobre a Criança/Aluno
                    </label>
                    <textarea
                      name="informacoes_adicionais"
                      rows={3}
                      defaultValue={student?.informacoes_adicionais}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Informações relevantes sobre comportamento, aprendizagem, necessidades especiais, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observações Gerais
                    </label>
                    <textarea
                      name="observacoes"
                      rows={2}
                      defaultValue={student?.observacoes}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Outras observações importantes"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-sm"
              >
                {student ? '✓ Atualizar Aluno' : '✓ Cadastrar Aluno'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StudentFormModal
