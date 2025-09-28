import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Filter,
  Download,
  Search,
  User,
  FileText,
  Edit,
  Trash2,
  Eye,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FinancialStats {
  receita_total: number
  receita_mes_atual: number
  receitas_pendentes: number
  despesas_mes: number
  saldo_atual: number
  mensalidades_vencidas: number
  mensalidades_pagas: number
  inadimplencia_taxa: number
}

interface Transaction {
  id: number
  tipo: 'receita' | 'despesa'
  categoria: string
  descricao: string
  valor: number
  data_vencimento: string
  data_pagamento?: string
  status: 'pago' | 'pendente' | 'vencido'
  aluno_id?: number
  aluno_nome?: string
  observacoes?: string
  created_at: string
}

interface PaymentRecord {
  id: number
  aluno_id: number
  aluno_nome: string
  valor: number
  mes_referencia: string
  data_vencimento: string
  data_pagamento?: string
  status: 'pago' | 'pendente' | 'vencido'
  forma_pagamento?: string
  observacoes?: string
  desconto?: number
  juros?: number
}

type TabType = 'dashboard' | 'mensalidades' | 'receitas' | 'despesas' | 'relatorios'

const FinancialPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [stats, setStats] = useState<FinancialStats>({
    receita_total: 0,
    receita_mes_atual: 0,
    receitas_pendentes: 0,
    despesas_mes: 0,
    saldo_atual: 0,
    mensalidades_vencidas: 0,
    mensalidades_pagas: 0,
    inadimplencia_taxa: 0
  })
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pago' | 'pendente' | 'vencido'>('todos')
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0].slice(0, 7)) // YYYY-MM

  useEffect(() => {
    loadFinancialData()
  }, [])

  const loadFinancialData = async () => {
    try {
      setLoading(true)

      // Load financial statistics
      const statsResponse = await fetch('http://localhost:3008/api/financeiro/stats')
      const statsData = await statsResponse.json()

      if (statsData.success) {
        setStats(statsData.data)
      }

      // Load transactions
      const transactionsResponse = await fetch('http://localhost:3008/api/financeiro/transacoes')
      const transactionsData = await transactionsResponse.json()

      if (transactionsData.success) {
        setTransactions(transactionsData.data)
      }

      // Load payments
      const paymentsResponse = await fetch('http://localhost:3008/api/financeiro/mensalidades')
      const paymentsData = await paymentsResponse.json()

      if (paymentsData.success) {
        setPayments(paymentsData.data)
      }

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
      toast.error('Erro ao carregar dados financeiros')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800'
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'vencido': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago': return <CheckCircle className="w-3 h-3" />
      case 'pendente': return <Clock className="w-3 h-3" />
      case 'vencido': return <AlertCircle className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.aluno_nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || payment.status === statusFilter
    const matchesMonth = payment.mes_referencia.startsWith(dateFilter)

    return matchesSearch && matchesStatus && matchesMonth
  })

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão Financeira</h1>
          <p className="text-gray-600 mt-1">
            Controle completo das finanças da escola
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-green-700 transition-colors">
            <ArrowUpCircle className="w-5 h-5" />
            <span>Nova Receita</span>
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-red-700 transition-colors">
            <ArrowDownCircle className="w-5 h-5" />
            <span>Nova Despesa</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: DollarSign },
              { id: 'mensalidades', name: 'Mensalidades', icon: Receipt },
              { id: 'receitas', name: 'Receitas', icon: TrendingUp },
              { id: 'despesas', name: 'Despesas', icon: TrendingDown },
              { id: 'relatorios', name: 'Relatórios', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Financial Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 rounded-xl p-6"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-900">Receita Mensal</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(stats.receita_mes_atual)}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-red-50 rounded-xl p-6"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-red-900">Despesas Mensais</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(stats.despesas_mes)}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-blue-50 rounded-xl p-6"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-900">Saldo Atual</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(stats.saldo_atual)}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-yellow-50 rounded-xl p-6"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-yellow-900">Inadimplência</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {stats.inadimplencia_taxa.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mensalidades</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pagas este mês:</span>
                      <span className="font-semibold text-green-600">{stats.mensalidades_pagas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vencidas:</span>
                      <span className="font-semibold text-red-600">{stats.mensalidades_vencidas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pendentes:</span>
                      <span className="font-semibold text-yellow-600">
                        {Math.max(0, payments.length - stats.mensalidades_pagas - stats.mensalidades_vencidas)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Receitas Pendentes</h3>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-600">
                      {formatCurrency(stats.receitas_pendentes)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Valores a receber
                    </p>
                  </div>
                </div>

                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita Total</h3>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(stats.receita_total)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Acumulado no ano
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mensalidades Tab */}
          {activeTab === 'mensalidades' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome do aluno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="pago">Pago</option>
                  <option value="pendente">Pendente</option>
                  <option value="vencido">Vencido</option>
                </select>

                <input
                  type="month"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
              </div>

              {/* Payments List */}
              <div className="bg-white border rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Mensalidades ({filteredPayments.length})
                  </h3>
                </div>

                {filteredPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma mensalidade encontrada
                    </h3>
                    <p className="text-gray-500">
                      Ajuste os filtros para ver mais resultados.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredPayments.map((payment, index) => (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900">{payment.aluno_nome}</h4>
                              <p className="text-sm text-gray-600">
                                Ref: {new Date(payment.mes_referencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                              </p>
                              <p className="text-sm text-gray-500">
                                Vencimento: {new Date(payment.data_vencimento).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(payment.valor)}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                              {getStatusIcon(payment.status)}
                              <span className="ml-1 capitalize">{payment.status}</span>
                            </span>
                            {payment.data_pagamento && (
                              <p className="text-xs text-gray-500 mt-1">
                                Pago em: {new Date(payment.data_pagamento).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                              <Receipt className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}
          {(activeTab === 'receitas' || activeTab === 'despesas' || activeTab === 'relatorios') && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'receitas' && 'Gestão de Receitas'}
                {activeTab === 'despesas' && 'Gestão de Despesas'}
                {activeTab === 'relatorios' && 'Relatórios Financeiros'}
              </h3>
              <p className="text-gray-500">
                Esta seção está em desenvolvimento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FinancialPage