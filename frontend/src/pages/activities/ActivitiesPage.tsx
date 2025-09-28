import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  Calendar,
  X,
  Save,
  Upload,
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

interface Activity {
  id: number
  titulo: string
  descricao: string
  data_atividade: string
  local: string
  tipo: string
  participantes: string
  fotos: ActivityPhoto[]
  status: 'ativo' | 'inativo'
  created_at: string
  updated_at: string
}

interface ActivityPhoto {
  id: number
  url: string
  legenda?: string
  ordem: number
}

interface ActivityFormData {
  titulo: string
  descricao: string
  data_atividade: string
  local: string
  tipo: string
  participantes: string
  status: 'ativo' | 'inativo'
}

const ActivitiesPage: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [tipoFilter, setTipoFilter] = useState<string>('todos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [currentImages, setCurrentImages] = useState<ActivityPhoto[]>([])
  const [formData, setFormData] = useState<ActivityFormData>({
    titulo: '',
    descricao: '',
    data_atividade: '',
    local: '',
    tipo: '',
    participantes: '',
    status: 'ativo'
  })

  const itemsPerPage = 9

  const activityTypes = [
    'Projeto Pedagógico',
    'Evento Esportivo',
    'Festival Cultural',
    'Excursão Educativa',
    'Atividade Artística',
    'Apresentação',
    'Feira de Ciências',
    'Recreio Dirigido',
    'Outros'
  ]

  // Fetch activities
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', searchTerm, statusFilter, tipoFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'todos' && { status: statusFilter }),
        ...(tipoFilter !== 'todos' && { tipo: tipoFilter })
      })
      const response = await api.get(`/activities?${params}`)
      return response.data
    }
  })

  // Create activity mutation
  const createActivityMutation = useMutation({
    mutationFn: async (data: ActivityFormData) => {
      return await api.post('/activities', data)
    },
    onSuccess: async (response) => {
      if (selectedImages.length > 0) {
        await uploadImages(response.data.id)
      }
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Atividade criada com sucesso!')
      resetForm()
      setIsModalOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar atividade')
    }
  })

  // Update activity mutation
  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ActivityFormData }) => {
      return await api.put(`/activities/${id}`, data)
    },
    onSuccess: async (response) => {
      if (selectedImages.length > 0) {
        await uploadImages(response.data.id)
      }
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Atividade atualizada com sucesso!')
      resetForm()
      setIsModalOpen(false)
      setIsEditing(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar atividade')
    }
  })

  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/activities/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Atividade removida com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover atividade')
    }
  })

  const uploadImages = async (activityId: number) => {
    try {
      const formData = new FormData()
      selectedImages.forEach((file, index) => {
        formData.append('images', file)
        formData.append(`ordem_${index}`, index.toString())
      })

      await api.post(`/activities/${activityId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Erro ao fazer upload das imagens')
    }
  }

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      data_atividade: '',
      local: '',
      tipo: '',
      participantes: '',
      status: 'ativo'
    })
    setSelectedActivity(null)
    setSelectedImages([])
    setIsEditing(false)
  }

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity)
    setFormData({
      titulo: activity.titulo,
      descricao: activity.descricao,
      data_atividade: activity.data_atividade.split('T')[0],
      local: activity.local,
      tipo: activity.tipo,
      participantes: activity.participantes,
      status: activity.status
    })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isEditing && selectedActivity) {
      updateActivityMutation.mutate({ id: selectedActivity.id, data: formData })
    } else {
      createActivityMutation.mutate(formData)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja remover esta atividade?')) {
      deleteActivityMutation.mutate(id)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedImages([...selectedImages, ...files])
    }
  }

  const removeSelectedImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index))
  }

  const openImageModal = (activity: Activity, imageIndex: number = 0) => {
    setCurrentImages(activity.fotos)
    setSelectedImageIndex(imageIndex)
    setImageModalOpen(true)
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev < currentImages.length - 1 ? prev + 1 : 0
    )
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev > 0 ? prev - 1 : currentImages.length - 1
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativo' },
      inativo: { bg: 'bg-red-100', text: 'text-red-800', label: 'Inativo' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inativo

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const filteredActivities = activities.data || []
  const totalPages = Math.ceil((activities.total || 0) / itemsPerPage)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Atividades</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as atividades e eventos da escola
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}
          className="mt-4 sm:mt-0 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Atividade</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar atividades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="todos">Todos os Tipos</option>
              {activityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity: Activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* Activity Image */}
            <div className="relative h-48 bg-gray-200">
              {activity.fotos && activity.fotos.length > 0 ? (
                <img
                  src={activity.fotos[0].url}
                  alt={activity.titulo}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openImageModal(activity, 0)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera className="w-12 h-12" />
                </div>
              )}

              {/* Photo count badge */}
              {activity.fotos && activity.fotos.length > 0 && (
                <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                  <ImageIcon className="w-3 h-3" />
                  <span>{activity.fotos.length}</span>
                </div>
              )}

              {/* Status badge */}
              <div className="absolute top-3 left-3">
                {getStatusBadge(activity.status)}
              </div>
            </div>

            {/* Activity Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 truncate">{activity.titulo}</h3>
                <div className="relative">
                  <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {activity.descricao}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(activity.data_atividade).toLocaleDateString('pt-BR')}
                </div>
                {activity.local && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {activity.local}
                  </div>
                )}
                {activity.participantes && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {activity.participantes}
                  </div>
                )}
              </div>

              {activity.tipo && (
                <div className="mb-4">
                  <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                    {activity.tipo}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(activity)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remover</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Activity Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {isEditing ? 'Editar Atividade' : 'Nova Atividade'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título da Atividade *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.titulo}
                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data da Atividade *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.data_atividade}
                        onChange={(e) => setFormData({ ...formData, data_atividade: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Atividade
                      </label>
                      <select
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Selecione um tipo</option>
                        {activityTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Local
                      </label>
                      <input
                        type="text"
                        value={formData.local}
                        onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Participantes
                    </label>
                    <input
                      type="text"
                      value={formData.participantes}
                      onChange={(e) => setFormData({ ...formData, participantes: e.target.value })}
                      placeholder="Ex: 1º A, 2º B, Todos os alunos"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fotos da Atividade
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Clique para selecionar fotos ou arraste aqui
                        </span>
                      </label>
                    </div>

                    {/* Selected Images Preview */}
                    {selectedImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        {selectedImages.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeSelectedImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createActivityMutation.isPending || updateActivityMutation.isPending}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {createActivityMutation.isPending || updateActivityMutation.isPending
                        ? 'Salvando...'
                        : 'Salvar'
                      }
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
        {imageModalOpen && currentImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            onClick={() => setImageModalOpen(false)}
          >
            <div className="relative max-w-4xl max-h-full p-4">
              <img
                src={currentImages[selectedImageIndex]?.url}
                alt="Activity"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Navigation buttons */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Close button */}
              <button
                onClick={() => setImageModalOpen(false)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Image counter */}
              {currentImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
                  {selectedImageIndex + 1} / {currentImages.length}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ActivitiesPage