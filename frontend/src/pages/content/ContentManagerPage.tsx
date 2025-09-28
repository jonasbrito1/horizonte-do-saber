import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save,
  Upload,
  Image as ImageIcon,
  Eye,
  RefreshCw,
  Home,
  BookOpen,
  Camera,
  MessageSquare,
  MapPin,
  Settings,
  Edit3,
  Trash2,
  Plus,
  X,
  ArrowLeft,
  Check,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSiteContent } from '../../context/SiteContentContext'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const ContentManagerPage: React.FC = () => {
  const { user } = useAuth()
  const { content, updateContent, resetContent } = useSiteContent()
  const navigate = useNavigate()

  const [activeSection, setActiveSection] = useState('hero')
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValues, setTempValues] = useState<any>({})
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const sections = [
    {
      id: 'hero',
      title: 'Seção Principal',
      icon: Home,
      description: 'Título, subtítulo e texto principal da página inicial',
      color: 'bg-blue-500'
    },
    {
      id: 'sobre',
      title: 'Sobre Nós',
      icon: BookOpen,
      description: 'História, missão, visão e informações da escola',
      color: 'bg-green-500'
    },
    {
      id: 'servicos',
      title: 'Nossos Diferenciais',
      icon: Settings,
      description: 'Serviços e diferenciais oferecidos pela escola',
      color: 'bg-purple-500'
    },
    {
      id: 'galeria',
      title: 'Galeria de Fotos',
      icon: Camera,
      description: 'Fotos e imagens da escola e atividades',
      color: 'bg-yellow-500'
    },
    {
      id: 'diferenciais',
      title: 'Nossos Diferenciais',
      icon: Settings,
      description: 'Diferenciais e vantagens da escola',
      color: 'bg-orange-500'
    },
    {
      id: 'depoimentos',
      title: 'Depoimentos',
      icon: MessageSquare,
      description: 'Avaliações e comentários de pais e alunos',
      color: 'bg-pink-500'
    },
    {
      id: 'contato',
      title: 'Informações de Contato',
      icon: MapPin,
      description: 'Endereço, telefones, email e redes sociais',
      color: 'bg-red-500'
    },
    {
      id: 'footer',
      title: 'Rodapé do Site',
      icon: Settings,
      description: 'Informações do rodapé, links e redes sociais',
      color: 'bg-indigo-500'
    },
    {
      id: 'configuracoes',
      title: 'Configurações Gerais',
      icon: Settings,
      description: 'Logos, cores, mascotes e configurações gerais do site',
      color: 'bg-gray-600'
    }
  ]

  const handleSave = (section: string, field: string, value: any) => {
    const updatedSection = { ...content[section as keyof typeof content] }
    updatedSection[field as keyof typeof updatedSection] = value
    updateContent(section as keyof typeof content, updatedSection)
    toast.success('Conteúdo salvo com sucesso!')
  }

  const handleImageUpload = (section: string, field: string, file: File) => {
    // Convert image to base64 data URL for cross-session persistence
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string

      // Compress large images before saving
      if (file.size > 1024 * 1024) { // If larger than 1MB
        compressImage(imageDataUrl, 0.8, (compressedDataUrl) => {
          handleSave(section, field, compressedDataUrl)
          toast.success('Imagem comprimida e carregada com sucesso!')
        })
      } else {
        handleSave(section, field, imageDataUrl)
        toast.success('Imagem carregada com sucesso!')
      }
    }
    reader.readAsDataURL(file)
  }

  const compressImage = (dataUrl: string, quality: number, callback: (compressedDataUrl: string) => void) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions (max 1920x1080)
      let { width, height } = img
      const maxWidth = 1920
      const maxHeight = 1080

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
      callback(compressedDataUrl)
    }

    img.src = dataUrl
  }

  const handleArrayAdd = (section: string, field: string, newItem: any) => {
    const currentSection = content[section as keyof typeof content]
    const currentArray = currentSection[field as keyof typeof currentSection] as any[] || []
    const updatedArray = [...currentArray, newItem]
    handleSave(section, field, updatedArray)
  }

  const handleArrayRemove = (section: string, field: string, index: number) => {
    const currentSection = content[section as keyof typeof content]
    const currentArray = currentSection[field as keyof typeof currentSection] as any[]
    const updatedArray = currentArray.filter((_, i) => i !== index)
    handleSave(section, field, updatedArray)
  }

  const handleArrayUpdate = (section: string, field: string, index: number, updatedItem: any) => {
    const currentSection = content[section as keyof typeof content]
    const currentArray = [...(currentSection[field as keyof typeof currentSection] as any[])]
    currentArray[index] = updatedItem
    handleSave(section, field, currentArray)
  }

  const renderField = (section: string, field: string, value: any, label: string, type: 'text' | 'textarea' | 'image' | 'array' | 'color') => {
    const fieldId = `${section}-${field}`
    const isEditing = editingField === fieldId

    if (type === 'image') {
      return (
        <div key={fieldId} className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
          <div className="space-y-3">
            {value && (
              <div className="relative">
                <img src={value} alt={label} className="w-full max-w-md h-32 object-cover rounded-lg" />
                <button
                  onClick={() => handleSave(section, field, '')}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(section, field, file)
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      )
    }

    if (type === 'array' && field === 'fotos') {
      return (
        <div key={fieldId} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <button
              onClick={() => {
                if (value && value.length >= 10) {
                  toast.error('Máximo de 10 fotos permitido')
                  return
                }
                const novaFoto = {
                  id: Date.now().toString(),
                  url: '',
                  titulo: '',
                  descricao: ''
                }
                handleArrayAdd(section, field, novaFoto)
                toast.success('Campo de foto adicionado! Preencha os dados abaixo.')
              }}
              disabled={value && value.length >= 10}
              className={`px-4 py-2 text-white text-sm rounded-lg flex items-center shadow-sm transition-colors ${
                value && value.length >= 10
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Foto {value ? `(${value.length}/10)` : '(0/10)'}
            </button>
          </div>
          {/* Organized photo management layout */}
          <div className="space-y-6">
            {(value || []).map((foto: any, index: number) => {
              // Handle both old format (string) and new format (object)
              const fotoData = typeof foto === 'string' ? { url: foto, titulo: '', descricao: '' } : foto

              return (
                <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                        Foto #{index + 1}
                      </div>
                      {fotoData.titulo && (
                        <div className="text-gray-600 font-medium">
                          {fotoData.titulo}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleArrayRemove(section, field, index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover foto"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Preview da foto */}
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                      <div className="relative">
                        {fotoData.url ? (
                          <img
                            src={fotoData.url}
                            alt={fotoData.titulo || `Foto ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <Camera className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm">Adicione uma foto</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Campos de informação */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título da Foto *
                        </label>
                        <input
                          type="text"
                          value={fotoData.titulo || ''}
                          onChange={(e) => {
                            const updatedFoto = { ...fotoData, titulo: e.target.value }
                            handleArrayUpdate(section, field, index, updatedFoto)
                          }}
                          placeholder="Ex: Sala de Aula Moderna"
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descrição da Foto
                        </label>
                        <textarea
                          value={fotoData.descricao || ''}
                          onChange={(e) => {
                            const updatedFoto = { ...fotoData, descricao: e.target.value }
                            handleArrayUpdate(section, field, index, updatedFoto)
                          }}
                          placeholder="Descreva o que aparece na foto..."
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Imagem da Foto
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Upload de arquivo</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onload = (event) => {
                                    const imageDataUrl = event.target?.result as string

                                    // Compress large images before saving
                                    if (file.size > 1024 * 1024) { // If larger than 1MB
                                      compressImage(imageDataUrl, 0.8, (compressedDataUrl) => {
                                        const updatedFoto = { ...fotoData, url: compressedDataUrl }
                                        handleArrayUpdate(section, field, index, updatedFoto)
                                        toast.success('Foto da galeria comprimida e carregada com sucesso!')
                                      })
                                    } else {
                                      const updatedFoto = { ...fotoData, url: imageDataUrl }
                                      handleArrayUpdate(section, field, index, updatedFoto)
                                      toast.success('Foto da galeria carregada com sucesso!')
                                    }
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                              className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Ou URL da imagem</label>
                            <input
                              type="url"
                              value={fotoData.url}
                              onChange={(e) => {
                                const updatedFoto = { ...fotoData, url: e.target.value }
                                handleArrayUpdate(section, field, index, updatedFoto)
                              }}
                              placeholder="https://exemplo.com/foto.jpg"
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {(!value || value.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhuma foto adicionada ainda</p>
                <p className="text-sm">Clique em "Adicionar Foto" para começar</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    if (type === 'array' && field === 'depoimentos') {
      return (
        <div key={fieldId} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <button
              onClick={() => {
                const nome = prompt('Nome da pessoa:')
                const cargo = prompt('Cargo/função:')
                const depoimento = prompt('Depoimento:')
                if (nome && cargo && depoimento) {
                  handleArrayAdd(section, field, { nome, cargo, depoimento })
                }
              }}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" />
              Adicionar
            </button>
          </div>
          <div className="space-y-3">
            {(value || []).map((item: any, index: number) => (
              <div key={index} className="bg-white p-3 rounded border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">{item.nome}</p>
                    <p className="text-xs text-gray-600">{item.cargo}</p>
                  </div>
                  <button
                    onClick={() => handleArrayRemove(section, field, index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-700 italic">"{item.depoimento}"</p>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (type === 'array' && (field === 'links_rapidos' || field === 'links_academicos')) {
      return (
        <div key={fieldId} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <button
              onClick={() => {
                const nome = prompt('Nome do link:')
                const href = prompt('URL do link (ex: /#sobre, /login, https://...):')
                if (nome && href) {
                  handleArrayAdd(section, field, { nome, href })
                  toast.success('Link adicionado com sucesso!')
                }
              }}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" />
              Adicionar Link
            </button>
          </div>
          <div className="space-y-3">
            {(value || []).map((item: any, index: number) => (
              <div key={index} className="bg-white p-3 rounded border">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">Nome</label>
                        <input
                          type="text"
                          value={item.nome || ''}
                          onChange={(e) => handleArrayUpdate(section, field, index, { ...item, nome: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                          placeholder="Nome do link"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">URL</label>
                        <input
                          type="text"
                          value={item.href || ''}
                          onChange={(e) => handleArrayUpdate(section, field, index, { ...item, href: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                          placeholder="/#sobre, /login, https://..."
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleArrayRemove(section, field, index)}
                    className="ml-3 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {(!value || value.length === 0) && (
              <p className="text-gray-500 text-sm text-center py-4">
                Nenhum link configurado. Clique em "Adicionar Link" para começar.
              </p>
            )}
          </div>
        </div>
      )
    }

    if (type === 'array' && (field === 'servicos' || field === 'diferenciais')) {
      return (
        <div key={fieldId} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <button
              onClick={() => {
                const titulo = prompt('Título do item:')
                const descricao = prompt('Descrição do item:')
                const icone = prompt('Ícone (ex: Users, Monitor, Camera):') || 'Star'
                if (titulo && descricao) {
                  handleArrayAdd(section, field, { titulo, descricao, icone })
                  toast.success('Item adicionado com sucesso!')
                }
              }}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" />
              {field === 'servicos' ? 'Adicionar Serviço' : 'Adicionar Diferencial'}
            </button>
          </div>
          <div className="space-y-3">
            {(value || []).map((item: any, index: number) => (
              <div key={index} className="bg-white p-4 rounded border">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                      {field === 'servicos' ? 'Serviço' : 'Diferencial'} #{index + 1}
                    </div>
                    {item.titulo && (
                      <div className="text-gray-600 font-medium">
                        {item.titulo}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleArrayRemove(section, field, index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Título</label>
                    <input
                      type="text"
                      value={item.titulo || ''}
                      onChange={(e) => handleArrayUpdate(section, field, index, { ...item, titulo: e.target.value })}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Título do item"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Descrição</label>
                    <textarea
                      value={item.descricao || ''}
                      onChange={(e) => handleArrayUpdate(section, field, index, { ...item, descricao: e.target.value })}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Descrição do item"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Ícone (nome do ícone Lucide)</label>
                    <input
                      type="text"
                      value={item.icone || ''}
                      onChange={(e) => handleArrayUpdate(section, field, index, { ...item, icone: e.target.value })}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Users, Monitor, Camera, BookOpen, etc."
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!value || value.length === 0) && (
              <p className="text-gray-500 text-sm text-center py-4">
                Nenhum item configurado. Clique em "Adicionar {field === 'servicos' ? 'Serviço' : 'Diferencial'}" para começar.
              </p>
            )}
          </div>
        </div>
      )
    }

    if (type === 'color') {
      return (
        <div key={fieldId} className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleSave(section, field, e.target.value)}
              className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleSave(section, field, e.target.value)}
              placeholder="#000000"
              className="flex-1 p-2 border border-gray-300 rounded text-sm font-mono"
            />
            <div
              className="w-12 h-12 rounded border border-gray-300"
              style={{ backgroundColor: value || '#000000' }}
            />
          </div>
        </div>
      )
    }

    return (
      <div key={fieldId} className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {!isEditing ? (
            <button
              onClick={() => {
                setEditingField(fieldId)
                setTempValues({ ...tempValues, [fieldId]: value })
              }}
              className="text-blue-500 hover:text-blue-700"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  handleSave(section, field, tempValues[fieldId])
                  setEditingField(null)
                  setTempValues({ ...tempValues, [fieldId]: undefined })
                }}
                className="text-green-500 hover:text-green-700"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setEditingField(null)
                  setTempValues({ ...tempValues, [fieldId]: undefined })
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          type === 'textarea' ? (
            <textarea
              value={tempValues[fieldId] || ''}
              onChange={(e) => setTempValues({ ...tempValues, [fieldId]: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={tempValues[fieldId] || ''}
              onChange={(e) => setTempValues({ ...tempValues, [fieldId]: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          )
        ) : (
          <div className="text-sm text-gray-900 bg-white p-2 rounded border min-h-[2.5rem] whitespace-pre-wrap">
            {value || <span className="text-gray-400 italic">Clique no ícone de edição para adicionar conteúdo</span>}
          </div>
        )}
      </div>
    )
  }

  const renderSectionContent = () => {
    const section = sections.find(s => s.id === activeSection)
    if (!section) return null

    const sectionData = content[activeSection as keyof typeof content]

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${section.color}`}>
              <section.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              <p className="text-gray-600">{section.description}</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => window.open('/', '_blank')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Visualizar Site</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {activeSection === 'hero' && (
            <>
              {renderField('hero', 'titulo', sectionData.titulo, 'Título Principal', 'text')}
              {renderField('hero', 'subtitulo', sectionData.subtitulo, 'Subtítulo', 'text')}
              {renderField('hero', 'descricao', sectionData.descricao, 'Descrição', 'textarea')}
              {renderField('hero', 'botao_texto', sectionData.botao_texto, 'Texto do Botão', 'text')}
              {renderField('hero', 'imagem_fundo', sectionData.imagem_fundo, 'Imagem de Fundo', 'image')}
            </>
          )}

          {activeSection === 'sobre' && (
            <>
              {renderField('sobre', 'titulo', sectionData.titulo, 'Título da Seção', 'text')}
              {renderField('sobre', 'descricao', sectionData.descricao, 'Descrição da Escola', 'textarea')}
              {renderField('sobre', 'anos_experiencia', sectionData.anos_experiencia, 'Anos de Experiência', 'text')}
              {renderField('sobre', 'alunos_formados', sectionData.alunos_formados, 'Alunos Formados', 'text')}
              {renderField('sobre', 'imagem', sectionData.imagem, 'Imagem da Seção', 'image')}
            </>
          )}

          {activeSection === 'galeria' && (
            <>
              {renderField('galeria', 'titulo', sectionData.titulo, 'Título da Galeria', 'text')}
              {renderField('galeria', 'descricao', sectionData.descricao, 'Descrição da Galeria', 'textarea')}
              {renderField('galeria', 'fotos', sectionData.fotos, 'Fotos da Galeria', 'array')}
            </>
          )}

          {activeSection === 'servicos' && (
            <>
              {renderField('servicos', 'titulo', sectionData.titulo, 'Título da Seção', 'text')}
              {renderField('servicos', 'descricao', sectionData.descricao, 'Descrição da Seção', 'textarea')}
              {renderField('servicos', 'servicos', sectionData.servicos, 'Lista de Serviços', 'array')}
            </>
          )}

          {activeSection === 'diferenciais' && (
            <>
              {renderField('diferenciais', 'titulo', sectionData.titulo, 'Título da Seção', 'text')}
              {renderField('diferenciais', 'descricao', sectionData.descricao, 'Descrição da Seção', 'textarea')}
              {renderField('diferenciais', 'diferenciais', sectionData.diferenciais, 'Lista de Diferenciais', 'array')}
            </>
          )}

          {activeSection === 'depoimentos' && (
            <>
              {renderField('depoimentos', 'titulo', sectionData.titulo, 'Título da Seção', 'text')}
              {renderField('depoimentos', 'depoimentos', sectionData.depoimentos, 'Lista de Depoimentos', 'array')}
            </>
          )}

          {activeSection === 'contato' && (
            <>
              {/* Informações Básicas */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField('contato', 'titulo', sectionData.titulo, 'Título da Seção', 'text')}
                  {renderField('contato', 'endereco', sectionData.endereco, 'Endereço Completo', 'textarea')}
                  {renderField('contato', 'telefone', sectionData.telefone, 'Telefone Principal', 'text')}
                  {renderField('contato', 'whatsapp', sectionData.whatsapp, 'WhatsApp', 'text')}
                  {renderField('contato', 'email', sectionData.email, 'E-mail de Contato', 'text')}
                  {renderField('contato', 'horario_funcionamento', sectionData.horario_funcionamento, 'Horário de Funcionamento', 'textarea')}
                </div>
              </div>

              {/* Configuração do Google Maps */}
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">📍 Configuração do Google Maps</h3>

                {/* Método 1: Link direto do Google Maps */}
                <div className="bg-green-100 p-3 rounded-md mb-4">
                  <h4 className="text-sm font-semibold text-green-800 mb-2">
                    🔗 Método 1: Link Direto do Google Maps (Mais Fácil)
                  </h4>
                  <div className="space-y-2">
                    <p className="text-xs text-green-700">
                      <strong>Como obter o link:</strong>
                    </p>
                    <ol className="text-xs text-green-600 space-y-1 ml-4">
                      <li>1. Acesse <a href="https://maps.google.com" target="_blank" className="underline">Google Maps</a></li>
                      <li>2. Pesquise pelo endereço da escola</li>
                      <li>3. Clique em "Compartilhar" → "Incorporar um mapa"</li>
                      <li>4. Copie apenas a URL que aparece em src="..." (exemplo abaixo)</li>
                      <li>5. Cole o link no campo abaixo</li>
                    </ol>
                    <div className="bg-white p-2 rounded border text-xs text-gray-600 font-mono">
                      Exemplo: https://www.google.com/maps/embed?pb=!1m18...
                    </div>
                    {renderField('contato', 'mapa_embed_url', sectionData.mapa_embed_url, 'Link de Incorporação do Google Maps', 'url')}
                  </div>
                </div>

                {/* Método 2: Coordenadas manuais */}
                <div className="bg-green-100 p-3 rounded-md">
                  <h4 className="text-sm font-semibold text-green-800 mb-2">
                    📍 Método 2: Coordenadas Manuais (Avançado)
                  </h4>
                  <div className="space-y-2">
                    <p className="text-xs text-green-700">
                      <strong>Como obter coordenadas:</strong>
                    </p>
                    <ol className="text-xs text-green-600 space-y-1 ml-4">
                      <li>1. Acesse Google Maps e pesquise pelo endereço</li>
                      <li>2. Clique com botão direito no local exato</li>
                      <li>3. Copie as coordenadas (ex: -23.550520, -46.633308)</li>
                      <li>4. Cole nos campos abaixo</li>
                    </ol>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      {renderField('contato', 'mapa_latitude', sectionData.mapa_latitude, 'Latitude (ex: -23.550520)', 'text')}
                      {renderField('contato', 'mapa_longitude', sectionData.mapa_longitude, 'Longitude (ex: -46.633308)', 'text')}
                      {renderField('contato', 'mapa_zoom', sectionData.mapa_zoom, 'Zoom (10-20)', 'number')}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-600 mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                  💡 <strong>Dica:</strong> Use o Método 1 (Link direto) para resultados mais rápidos. O Método 2 é para configurações avançadas.
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">📱 Redes Sociais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField('contato', 'instagram', sectionData.instagram, 'Instagram (@usuario)', 'text')}
                  {renderField('contato', 'facebook', sectionData.facebook, 'Facebook (URL completa)', 'text')}
                </div>
              </div>
            </>
          )}

          {activeSection === 'footer' && (
            <>
              {/* Informações Básicas do Rodapé */}
              <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-indigo-800 mb-3">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField('footer', 'titulo', sectionData.titulo, 'Título do Rodapé', 'text')}
                  {renderField('footer', 'descricao', sectionData.descricao, 'Descrição da Escola', 'textarea')}
                  {renderField('footer', 'email', sectionData.email, 'E-mail Principal', 'text')}
                  {renderField('footer', 'telefone', sectionData.telefone, 'Telefone Principal', 'text')}
                  {renderField('footer', 'endereco', sectionData.endereco, 'Endereço Resumido', 'text')}
                </div>
              </div>

              {/* Links Rápidos */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Links Rápidos</h3>
                {renderField('footer', 'links_rapidos', sectionData.links_rapidos, 'Links de Navegação', 'array')}
              </div>

              {/* Links Acadêmicos */}
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Links Acadêmicos</h3>
                {renderField('footer', 'links_academicos', sectionData.links_academicos, 'Links para Portais', 'array')}
              </div>

              {/* Redes Sociais */}
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">Redes Sociais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-purple-700">Facebook</label>
                    <input
                      type="text"
                      defaultValue={sectionData.redes_sociais?.facebook || ''}
                      onBlur={(e) => {
                        const updatedSection = { ...sectionData }
                        if (!updatedSection.redes_sociais) updatedSection.redes_sociais = {}
                        updatedSection.redes_sociais.facebook = e.target.value
                        handleSave('footer', 'redes_sociais', updatedSection.redes_sociais)
                      }}
                      className="w-full px-3 py-2 border border-purple-200 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-purple-700">Instagram</label>
                    <input
                      type="text"
                      defaultValue={sectionData.redes_sociais?.instagram || ''}
                      onBlur={(e) => {
                        const updatedSection = { ...sectionData }
                        if (!updatedSection.redes_sociais) updatedSection.redes_sociais = {}
                        updatedSection.redes_sociais.instagram = e.target.value
                        handleSave('footer', 'redes_sociais', updatedSection.redes_sociais)
                      }}
                      className="w-full px-3 py-2 border border-purple-200 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-purple-700">WhatsApp</label>
                    <input
                      type="text"
                      defaultValue={sectionData.redes_sociais?.whatsapp || ''}
                      onBlur={(e) => {
                        const updatedSection = { ...sectionData }
                        if (!updatedSection.redes_sociais) updatedSection.redes_sociais = {}
                        updatedSection.redes_sociais.whatsapp = e.target.value
                        handleSave('footer', 'redes_sociais', updatedSection.redes_sociais)
                      }}
                      className="w-full px-3 py-2 border border-purple-200 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-purple-700">YouTube</label>
                    <input
                      type="text"
                      defaultValue={sectionData.redes_sociais?.youtube || ''}
                      onBlur={(e) => {
                        const updatedSection = { ...sectionData }
                        if (!updatedSection.redes_sociais) updatedSection.redes_sociais = {}
                        updatedSection.redes_sociais.youtube = e.target.value
                        handleSave('footer', 'redes_sociais', updatedSection.redes_sociais)
                      }}
                      className="w-full px-3 py-2 border border-purple-200 rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Informações Legais */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Informações Legais</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderField('footer', 'copyright', sectionData.copyright, 'Texto de Copyright', 'text')}
                  {renderField('footer', 'politica_privacidade', sectionData.politica_privacidade, 'Política de Privacidade', 'text')}
                  {renderField('footer', 'termos_uso', sectionData.termos_uso, 'Termos de Uso', 'text')}
                </div>
              </div>
            </>
          )}

          {activeSection === 'configuracoes' && (
            <>
              {/* Informações da Escola */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Informações da Escola</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField('configuracoes', 'nome_escola', sectionData.nome_escola, 'Nome da Escola', 'text')}
                  {renderField('configuracoes', 'slogan', sectionData.slogan, 'Slogan', 'text')}
                  {renderField('configuracoes', 'ano_fundacao', sectionData.ano_fundacao, 'Ano de Fundação', 'text')}
                  {renderField('configuracoes', 'cnpj', sectionData.cnpj, 'CNPJ', 'text')}
                  {renderField('configuracoes', 'codigo_inep', sectionData.codigo_inep, 'Código INEP', 'text')}
                </div>
              </div>

              {/* Logos */}
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Logos do Site</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderField('configuracoes', 'logo_principal', sectionData.logo_principal, 'Logo Principal', 'image')}
                  {renderField('configuracoes', 'logo_alternativo', sectionData.logo_alternativo, 'Logo Alternativo', 'image')}
                  {renderField('configuracoes', 'favicon', sectionData.favicon, 'Favicon', 'image')}
                </div>
              </div>

              {/* Cores do Site */}
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">Cores do Site</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderField('configuracoes', 'cor_primaria', sectionData.cor_primaria, 'Cor Primária', 'color')}
                  {renderField('configuracoes', 'cor_secundaria', sectionData.cor_secundaria, 'Cor Secundária', 'color')}
                  {renderField('configuracoes', 'cor_accent', sectionData.cor_accent, 'Cor de Destaque', 'color')}
                  {renderField('configuracoes', 'cor_texto', sectionData.cor_texto, 'Cor do Texto', 'color')}
                  {renderField('configuracoes', 'cor_fundo', sectionData.cor_fundo, 'Cor de Fundo', 'color')}
                </div>
              </div>

              {/* Gradiente da Seção Principal */}
              <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-indigo-800 mb-3">Gradiente da Seção Principal</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderField('configuracoes', 'gradiente_cor1', sectionData.gradiente_cor1, 'Cor 1 do Gradiente', 'color')}
                  {renderField('configuracoes', 'gradiente_cor2', sectionData.gradiente_cor2, 'Cor 2 do Gradiente', 'color')}
                  {renderField('configuracoes', 'gradiente_cor3', sectionData.gradiente_cor3, 'Cor 3 do Gradiente', 'color')}
                </div>
                <div className="mt-4 p-4 rounded-lg border-2 border-dashed border-indigo-300">
                  <p className="text-sm text-indigo-700 mb-2">Preview do Gradiente:</p>
                  <div
                    className="w-full h-16 rounded-lg"
                    style={{
                      background: `linear-gradient(to bottom right, ${sectionData.gradiente_cor1 || '#3B82F6'}, ${sectionData.gradiente_cor2 || '#8B5CF6'}, ${sectionData.gradiente_cor3 || '#10B981'})`
                    }}
                  />
                </div>
              </div>

              {/* Mascotes */}
              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">Mascotes da Escola</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderField('configuracoes', 'mascote_hori', sectionData.mascote_hori, 'Mascote Hori', 'image')}
                  {renderField('configuracoes', 'mascote_horizon', sectionData.mascote_horizon, 'Mascote Horizon', 'image')}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mostrar_mascotes"
                      checked={sectionData.mostrar_mascotes || false}
                      onChange={(e) => handleSave('configuracoes', 'mostrar_mascotes', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="mostrar_mascotes" className="text-sm font-medium text-gray-700">
                      Mostrar mascotes no site
                    </label>
                  </div>
                </div>
              </div>

              {/* Configurações Adicionais */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Configurações Adicionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="modo_escuro"
                      checked={sectionData.modo_escuro || false}
                      onChange={(e) => handleSave('configuracoes', 'modo_escuro', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="modo_escuro" className="text-sm font-medium text-gray-700">
                      Modo Escuro
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fonte Principal</label>
                    <select
                      value={sectionData.fonte_principal || 'Inter'}
                      onChange={(e) => handleSave('configuracoes', 'fonte_principal', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Poppins">Poppins</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (!user || user.nivel !== 'administrador') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Apenas administradores podem acessar esta página.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Conteúdo</h1>
                <p className="text-gray-600">Edite o conteúdo do site da escola</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  resetContent()
                  toast.success('Conteúdo restaurado para o padrão!')
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restaurar Padrão</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-900">Seções do Site</h3>
              </div>
              <div className="p-2 space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded ${
                      activeSection === section.id ? 'bg-blue-100' : section.color
                    }`}>
                      <section.icon className={`w-4 h-4 ${
                        activeSection === section.id ? 'text-blue-600' : 'text-white'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{section.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{section.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderSectionContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentManagerPage