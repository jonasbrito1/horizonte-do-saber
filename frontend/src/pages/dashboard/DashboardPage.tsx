import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'

// Interfaces
interface DashboardStats {
  total_alunos: number
  total_professores: number
  total_turmas: number
  mensalidades_pendentes: number
  receita_mes: number
  frequencia_media: number
}

interface RecentActivity {
  id: number
  type: string
  description: string
  time: string
  user?: string
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    total_alunos: 0,
    total_professores: 0,
    total_turmas: 0,
    mensalidades_pendentes: 0,
    receita_mes: 0,
    frequencia_media: 0
  })
  const [loading, setLoading] = useState(true)

  // Fetch real data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch dashboard statistics
        const response = await fetch('http://localhost:3008/api/dashboard/stats')
        const data = await response.json()

        if (data.success) {
          setStats({
            total_alunos: data.data.total_alunos,
            total_professores: data.data.total_professores,
            total_turmas: data.data.total_turmas,
            mensalidades_pendentes: data.data.mensalidades_pendentes,
            receita_mes: data.data.receita_mes,
            frequencia_media: data.data.frequencia_media
          })
        }

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
        // Keep default values (0) on error
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const activities: RecentActivity[] = [
    {
      id: 1,
      type: 'success',
      description: 'Novo aluno matriculado: Ana Silva',
      time: 'há 2 horas',
      user: 'João Oliveira'
    },
    {
      id: 2,
      type: 'info',
      description: 'Reunião de pais agendada para 25/09',
      time: 'há 4 horas',
      user: 'Maria Santos'
    },
    {
      id: 3,
      type: 'warning',
      description: 'Mensalidade em atraso - Turma 2º B',
      time: 'há 1 dia',
      user: 'Sistema'
    },
    {
      id: 4,
      type: 'success',
      description: 'Notas lançadas - Matemática 3º A',
      time: 'há 1 dia',
      user: 'Prof. Carlos'
    },
    {
      id: 5,
      type: 'info',
      description: 'Backup do sistema realizado',
      time: 'há 2 dias',
      user: 'Sistema'
    }
  ]

  const [performanceData, setPerformanceData] = useState<any[]>([])

  // Fetch performance data based on real turmas
  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await fetch('http://localhost:3008/api/turmas')
        const data = await response.json()

        if (data.success) {
          const performance = data.data.map((turma: any) => ({
            turma: turma.nome,
            media: (Math.random() * 2 + 7.5).toFixed(1), // Random grade between 7.5-9.5
            frequencia: Math.floor(Math.random() * 10 + 90), // Random attendance between 90-100%
            alunos: turma.alunos_count
          }))
          setPerformanceData(performance)
        }
      } catch (error) {
        console.error('Erro ao carregar dados de performance:', error)
      }
    }

    fetchPerformanceData()
  }, [])

  // Mock data for demonstration (replace with real data)
  const enrollmentData = [
    { name: 'Jan', alunos: Math.max(stats.total_alunos - 5, 0), receita: Math.max((stats.total_alunos - 5) * 420, 0) },
    { name: 'Fev', alunos: Math.max(stats.total_alunos - 3, 0), receita: Math.max((stats.total_alunos - 3) * 420, 0) },
    { name: 'Mar', alunos: Math.max(stats.total_alunos - 1, 0), receita: Math.max((stats.total_alunos - 1) * 420, 0) },
    { name: 'Abr', alunos: stats.total_alunos, receita: stats.receita_mes },
    { name: 'Mai', alunos: stats.total_alunos, receita: stats.receita_mes },
    { name: 'Jun', alunos: stats.total_alunos, receita: stats.receita_mes }
  ]

  const statusData = [
    { name: 'Ativo', value: stats.total_alunos, color: '#10b981' },
    { name: 'Inativo', value: 0, color: '#ef4444' },
    { name: 'Transferido', value: 0, color: '#f59e0b' }
  ]

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
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {user?.nome}! 👋
          </h1>
          <p className="text-gray-600">
            Bem-vindo ao painel administrativo do Horizonte do Saber
          </p>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'Total de Alunos',
            value: stats.total_alunos,
            icon: Users,
            color: 'bg-blue-500',
            trend: '+5.2%',
            trendUp: true
          },
          {
            title: 'Professores',
            value: stats.total_professores,
            icon: UserCheck,
            color: 'bg-green-500',
            trend: '+2.1%',
            trendUp: true
          },
          {
            title: 'Turmas Ativas',
            value: stats.total_turmas,
            icon: BookOpen,
            color: 'bg-purple-500',
            trend: '0%',
            trendUp: null
          },
          {
            title: 'Receita Mensal',
            value: `R$ ${stats.receita_mes.toLocaleString('pt-BR')}`,
            icon: DollarSign,
            color: 'bg-yellow-500',
            trend: '+12.5%',
            trendUp: true
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                {stat.trend && (
                  <div className={`flex items-center mt-2 text-sm ${
                    stat.trendUp === true ? 'text-green-600' : stat.trendUp === false ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <TrendingUp className={`w-4 h-4 mr-1 ${
                      stat.trendUp === false ? 'rotate-180' : ''
                    }`} />
                    {stat.trend}
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Enrollment Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tendência de Matrículas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="alunos" 
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status dos Alunos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Performance and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance por Turma
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turma" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="media" fill="#3b82f6" name="Média" />
              <Bar yAxisId="right" dataKey="frequencia" fill="#10b981" name="Frequência (%)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Atividades Recentes
          </h3>
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-100' :
                  activity.type === 'warning' ? 'bg-yellow-100' :
                  activity.type === 'info' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {activity.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : activity.type === 'warning' ? (
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  ) : activity.type === 'info' ? (
                    <Calendar className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Novo Aluno', icon: Users, href: '/dashboard/students?action=new', color: 'bg-blue-500' },
            { title: 'Nova Turma', icon: BookOpen, href: '/dashboard/classes?action=new', color: 'bg-green-500' },
            { title: 'Lançar Notas', icon: GraduationCap, href: '/dashboard/grades', color: 'bg-purple-500' },
            { title: 'Relatórios', icon: TrendingUp, href: '/dashboard/reports', color: 'bg-yellow-500' }
          ].map((action, index) => (
            <a
              key={action.title}
              href={action.href}
              className="group p-4 rounded-lg border-2 border-gray-200 hover:border-primary-300 transition-all duration-200 hover:shadow-md"
            >
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                {action.title}
              </h4>
            </a>
          ))}
        </div>
      </motion.div>

      {/* Alerts */}
      {stats.mensalidades_pendentes > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <h4 className="text-yellow-800 font-medium">
                Atenção: {stats.mensalidades_pendentes} mensalidades pendentes
              </h4>
              <p className="text-yellow-700 text-sm">
                Existem mensalidades em atraso que precisam de atenção.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default DashboardPage