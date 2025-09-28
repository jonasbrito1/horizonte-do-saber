import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Save,
  School,
  Users,
  Database,
  Mail,
  Shield,
  Bell,
  Palette,
  Globe,
  Monitor,
  Upload,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SchoolSettings {
  nome: string
  endereco: string
  telefone: string
  email: string
  site: string
  logo: string
  cnpj: string
  diretor: string
}

interface SystemSettings {
  manutencao: boolean
  backup_automatico: boolean
  notificacoes_email: boolean
  notificacoes_sms: boolean
  tema: 'claro' | 'escuro' | 'automatico'
  idioma: string
  fuso_horario: string
  moeda: string
}

interface UserRole {
  id: number
  nome: string
  permissoes: string[]
  descricao: string
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('escola')
  const [loading, setLoading] = useState(false)

  // Estados para configurações
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>({
    nome: '',
    endereco: '',
    telefone: '',
    email: '',
    site: '',
    logo: '',
    cnpj: '',
    diretor: ''
  })

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    manutencao: false,
    backup_automatico: true,
    notificacoes_email: true,
    notificacoes_sms: false,
    tema: 'claro',
    idioma: 'pt-BR',
    fuso_horario: 'America/Sao_Paulo',
    moeda: 'BRL'
  })

  const [userRoles, setUserRoles] = useState<UserRole[]>([])

  const tabs = [
    { id: 'escola', name: 'Escola', icon: School },
    { id: 'sistema', name: 'Sistema', icon: Monitor },
    { id: 'usuarios', name: 'Usuários & Permissões', icon: Users },
    { id: 'notificacoes', name: 'Notificações', icon: Bell },
    { id: 'backup', name: 'Backup & Dados', icon: Database },
    { id: 'seguranca', name: 'Segurança', icon: Shield },
  ]

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // Carregar configurações da escola
      const schoolResponse = await fetch('/api/configuracoes/escola')
      if (schoolResponse.ok) {
        const schoolData = await schoolResponse.json()
        setSchoolSettings(schoolData)
      }

      // Carregar configurações do sistema
      const systemResponse = await fetch('/api/configuracoes/sistema')
      if (systemResponse.ok) {
        const systemData = await systemResponse.json()
        setSystemSettings(systemData)
      }

      // Carregar roles de usuários
      const rolesResponse = await fetch('/api/configuracoes/roles')
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json()
        setUserRoles(rolesData)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const saveSchoolSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/configuracoes/escola', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schoolSettings),
      })

      if (response.ok) {
        toast.success('Configurações da escola salvas com sucesso')
      } else {
        toast.error('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  const saveSystemSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/configuracoes/sistema', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(systemSettings),
      })

      if (response.ok) {
        toast.success('Configurações do sistema salvas com sucesso')
      } else {
        toast.error('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/configuracoes/backup', {
        method: 'POST',
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Backup criado com sucesso')
      } else {
        toast.error('Erro ao criar backup')
      }
    } catch (error) {
      console.error('Erro ao criar backup:', error)
      toast.error('Erro ao criar backup')
    } finally {
      setLoading(false)
    }
  }

  const renderSchoolTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Escola</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Escola
            </label>
            <input
              type="text"
              value={schoolSettings.nome}
              onChange={(e) => setSchoolSettings({...schoolSettings, nome: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nome da escola"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNPJ
            </label>
            <input
              type="text"
              value={schoolSettings.cnpj}
              onChange={(e) => setSchoolSettings({...schoolSettings, cnpj: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço
            </label>
            <input
              type="text"
              value={schoolSettings.endereco}
              onChange={(e) => setSchoolSettings({...schoolSettings, endereco: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Endereço completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="text"
              value={schoolSettings.telefone}
              onChange={(e) => setSchoolSettings({...schoolSettings, telefone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="(00) 0000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={schoolSettings.email}
              onChange={(e) => setSchoolSettings({...schoolSettings, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="contato@escola.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site
            </label>
            <input
              type="url"
              value={schoolSettings.site}
              onChange={(e) => setSchoolSettings({...schoolSettings, site: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://www.escola.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diretor(a)
            </label>
            <input
              type="text"
              value={schoolSettings.diretor}
              onChange={(e) => setSchoolSettings({...schoolSettings, diretor: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nome do diretor"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={saveSchoolSettings}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Salvando...' : 'Salvar Configurações'}</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações do Sistema</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Modo de Manutenção</label>
              <p className="text-sm text-gray-500">Bloqueia o acesso ao sistema para manutenção</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={systemSettings.manutencao}
                onChange={(e) => setSystemSettings({...systemSettings, manutencao: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Backup Automático</label>
              <p className="text-sm text-gray-500">Cria backups automáticos diariamente</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={systemSettings.backup_automatico}
                onChange={(e) => setSystemSettings({...systemSettings, backup_automatico: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema
              </label>
              <select
                value={systemSettings.tema}
                onChange={(e) => setSystemSettings({...systemSettings, tema: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="claro">Claro</option>
                <option value="escuro">Escuro</option>
                <option value="automatico">Automático</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select
                value={systemSettings.idioma}
                onChange={(e) => setSystemSettings({...systemSettings, idioma: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuso Horário
              </label>
              <select
                value={systemSettings.fuso_horario}
                onChange={(e) => setSystemSettings({...systemSettings, fuso_horario: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="America/Sao_Paulo">América/São Paulo</option>
                <option value="America/New_York">América/Nova York</option>
                <option value="Europe/London">Europa/Londres</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moeda
              </label>
              <select
                value={systemSettings.moeda}
                onChange={(e) => setSystemSettings({...systemSettings, moeda: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="BRL">Real (R$)</option>
                <option value="USD">Dólar (US$)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={saveSystemSettings}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Salvando...' : 'Salvar Configurações'}</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Notificações</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Notificações por Email</label>
              <p className="text-sm text-gray-500">Enviar notificações importantes por email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={systemSettings.notificacoes_email}
                onChange={(e) => setSystemSettings({...systemSettings, notificacoes_email: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Notificações por SMS</label>
              <p className="text-sm text-gray-500">Enviar notificações urgentes por SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={systemSettings.notificacoes_sms}
                onChange={(e) => setSystemSettings({...systemSettings, notificacoes_sms: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBackupTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Backup e Dados</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Backup Manual</h4>
            <p className="text-sm text-gray-600">
              Crie um backup completo do sistema incluindo todos os dados
            </p>
            <button
              onClick={createBackup}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{loading ? 'Criando...' : 'Criar Backup'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Restaurar Backup</h4>
            <p className="text-sm text-gray-600">
              Restaure o sistema a partir de um arquivo de backup
            </p>
            <label className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Restaurar Backup</span>
              <input type="file" accept=".json" className="hidden" />
            </label>
          </div>
        </div>

        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Zona de Perigo</h4>
              <p className="text-sm text-red-600 mt-1">
                As ações abaixo são irreversíveis e podem causar perda de dados.
              </p>
              <div className="mt-4 space-y-2">
                <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  <Trash2 className="w-4 h-4" />
                  <span>Limpar Todos os Dados</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Usuários e Permissões</h3>
        <p className="text-gray-600 mb-6">
          Gerencie os tipos de usuário e suas permissões no sistema
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800">
            Esta funcionalidade está em desenvolvimento. Em breve você poderá configurar
            permissões personalizadas para diferentes tipos de usuário.
          </p>
        </div>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Segurança</h3>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800">
            Esta seção permitirá configurar políticas de senha, autenticação de dois fatores,
            logs de auditoria e outras configurações de segurança.
          </p>
        </div>
      </div>
    </div>
  )

  if (loading && !schoolSettings.nome) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
        <p className="text-gray-600">Gerencie as configurações gerais do sistema</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'escola' && renderSchoolTab()}
        {activeTab === 'sistema' && renderSystemTab()}
        {activeTab === 'usuarios' && renderUsersTab()}
        {activeTab === 'notificacoes' && renderNotificationsTab()}
        {activeTab === 'backup' && renderBackupTab()}
        {activeTab === 'seguranca' && renderSecurityTab()}
      </motion.div>
    </div>
  )
}

export default SettingsPage