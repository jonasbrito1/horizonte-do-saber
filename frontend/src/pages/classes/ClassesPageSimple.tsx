import React from 'react'
import { Users, Plus, BookOpen, Calendar } from 'lucide-react'

const ClassesPage: React.FC = () => {
  const mockClasses = [
    {
      id: 1,
      nome: "1º Ano A",
      nivel: "Fundamental I",
      serie: "1º ano",
      turno: "manha",
      ano_letivo: "2024",
      capacidade_maxima: 25,
      status: "ativo",
      professor_responsavel: {
        id: 1,
        nome: "Prof. Maria Silva"
      },
      alunos_count: 20
    },
    {
      id: 2,
      nome: "2º Ano B",
      nivel: "Fundamental I",
      serie: "2º ano",
      turno: "tarde",
      ano_letivo: "2024",
      capacidade_maxima: 30,
      status: "ativo",
      professor_responsavel: {
        id: 2,
        nome: "Prof. João Santos"
      },
      alunos_count: 28
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Turmas</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as turmas e classes da escola
          </p>
        </div>
        <button className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Nova Turma</span>
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClasses.map((classItem) => (
          <div key={classItem.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border">
            {/* Class Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{classItem.nome}</h3>
                    <p className="text-sm text-gray-500">{classItem.nivel} - {classItem.serie}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Ativo
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {classItem.turno === 'manha' ? 'Manhã' : 'Tarde'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {classItem.alunos_count} / {classItem.capacidade_maxima} alunos
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ano Letivo: {classItem.ano_letivo}
                </div>
                {classItem.professor_responsavel && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {classItem.professor_responsavel.nome}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0">
              <div className="flex space-x-2 mt-4">
                <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                  Editar
                </button>
                <button className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                  Ver Alunos
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state if no classes */}
      {mockClasses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma turma encontrada</h3>
          <p className="text-gray-500 mb-6">Comece criando sua primeira turma</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5 inline mr-2" />
            Nova Turma
          </button>
        </div>
      )}
    </div>
  )
}

export default ClassesPage