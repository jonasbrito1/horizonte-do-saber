import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSiteContentAPI } from '../hooks/useSiteContentAPI'

// Define the structure of site content
export interface SiteContent {
  hero: {
    titulo: string
    subtitulo: string
    descricao: string
    imagem_fundo?: string
    botao_texto?: string
    cor_primaria?: string
    cor_secundaria?: string
  }
  sobre: {
    titulo: string
    descricao: string
    anos_experiencia?: string
    alunos_formados?: string
    missao?: string
    visao?: string
    valores?: string[]
    imagem?: string
  }
  galeria: {
    titulo: string
    descricao?: string
    fotos?: Array<{
      url: string
      titulo?: string
      descricao?: string
      id?: string
    }>
  }
  servicos: {
    titulo: string
    descricao?: string
    servicos?: Array<{
      titulo: string
      icone: string
      descricao: string
    }>
  }
  diferenciais: {
    titulo: string
    descricao?: string
    diferenciais?: Array<{
      titulo: string
      descricao: string
      icone?: string
    }>
  }
  depoimentos: {
    titulo: string
    depoimentos?: Array<{
      nome: string
      cargo: string
      depoimento: string
      foto?: string
    }>
  }
  contato: {
    titulo: string
    endereco: string
    telefone: string
    whatsapp?: string
    email: string
    horario_funcionamento?: string
    mapa_url?: string
    mapa_embed_url?: string
    mapa_latitude?: string
    mapa_longitude?: string
    mapa_zoom?: number
    instagram?: string
    facebook?: string
  }
  footer: {
    titulo?: string
    descricao?: string
    email?: string
    telefone?: string
    endereco?: string
    links_rapidos?: Array<{
      nome: string
      href: string
    }>
    links_academicos?: Array<{
      nome: string
      href: string
    }>
    redes_sociais?: {
      facebook?: string
      instagram?: string
      whatsapp?: string
      youtube?: string
    }
    copyright?: string
    politica_privacidade?: string
    termos_uso?: string
  }
  configuracoes: {
    // Logos
    logo_principal?: string
    logo_alternativo?: string
    favicon?: string

    // Informações da escola
    nome_escola: string
    slogan?: string
    ano_fundacao?: string
    cnpj?: string
    codigo_inep?: string

    // Cores do site
    cor_primaria?: string
    cor_secundaria?: string
    cor_accent?: string
    cor_texto?: string
    cor_fundo?: string

    // Cores do gradiente da seção principal
    gradiente_cor1?: string
    gradiente_cor2?: string
    gradiente_cor3?: string

    // Mascotes
    mascote_hori?: string
    mascote_horizon?: string
    mostrar_mascotes?: boolean

    // Configurações adicionais
    modo_escuro?: boolean
    fonte_principal?: string
    tamanho_fonte?: string
  }
}

// Default content
const defaultContent: SiteContent = {
  hero: {
    titulo: 'Horizonte do Saber',
    subtitulo: 'Educação de Qualidade que Transforma Vidas',
    descricao: 'Uma escola comprometida com a excelência educacional, formando cidadãos preparados para os desafios do futuro com valores sólidos e conhecimento de qualidade.',
    imagem_fundo: '/images/hero-bg.jpg',
    botao_texto: 'Conheça Nossa Escola',
    cor_primaria: '#3B82F6',
    cor_secundaria: '#8B5CF6'
  },
  sobre: {
    titulo: 'Nossa História',
    descricao: 'Há mais de 25 anos dedicados à educação de qualidade, a Escola Horizonte do Saber se consolidou como referência em ensino fundamental, oferecendo um ambiente acolhedor e estimulante para o desenvolvimento integral de nossos alunos.',
    anos_experiencia: '25',
    alunos_formados: '5000+',
    missao: 'Proporcionar educação de excelência, formando cidadãos críticos, éticos e preparados para os desafios do futuro.',
    visao: 'Ser reconhecida como referência em educação transformadora, contribuindo para uma sociedade mais justa e desenvolvida.',
    valores: ['Excelência Acadêmica', 'Valores Éticos', 'Inovação Pedagógica', 'Desenvolvimento Integral', 'Compromisso Social'],
    imagem: '/images/about-school.jpg'
  },
  galeria: {
    titulo: 'Nossa Escola em Imagens',
    descricao: 'Conheça nossos espaços e atividades através desta galeria de fotos',
    fotos: [
      {
        id: '1',
        url: '/images/galeria/sala-aula-1.jpg',
        titulo: 'Sala de Aula Moderna',
        descricao: 'Nossas salas são equipadas com tecnologia de ponta para um aprendizado eficiente'
      },
      {
        id: '2',
        url: '/images/galeria/biblioteca.jpg',
        titulo: 'Biblioteca Escolar',
        descricao: 'Um espaço acolhedor para leitura e pesquisa com milhares de livros'
      },
      {
        id: '3',
        url: '/images/galeria/laboratorio.jpg',
        titulo: 'Laboratório de Ciências',
        descricao: 'Laboratório completo para experimentos e descobertas científicas'
      },
      {
        id: '4',
        url: '/images/galeria/patio.jpg',
        titulo: 'Pátio de Recreação',
        descricao: 'Área ampla para brincadeiras e socialização entre os alunos'
      },
      {
        id: '5',
        url: '/images/galeria/quadra.jpg',
        titulo: 'Quadra Poliesportiva',
        descricao: 'Espaço dedicado à educação física e atividades esportivas'
      },
      {
        id: '6',
        url: '/images/galeria/atividade-1.jpg',
        titulo: 'Atividades Pedagógicas',
        descricao: 'Momentos especiais de aprendizado em grupo e desenvolvimento'
      },
      {
        id: '7',
        url: '/images/galeria/sala-informatica.jpg',
        titulo: 'Sala de Informática',
        descricao: 'Laboratório de informática com computadores modernos para ensino digital'
      },
      {
        id: '8',
        url: '/images/galeria/refeitorio.jpg',
        titulo: 'Refeitório',
        descricao: 'Espaço amplo e acolhedor para as refeições dos alunos'
      },
      {
        id: '9',
        url: '/images/galeria/sala-musica.jpg',
        titulo: 'Sala de Música',
        descricao: 'Ambiente especializado para educação musical e apresentações artísticas'
      },
      {
        id: '10',
        url: '/images/galeria/jardim.jpg',
        titulo: 'Jardim Educativo',
        descricao: 'Área verde dedicada ao ensino de ciências naturais e sustentabilidade'
      }
    ]
  },
  servicos: {
    titulo: 'Nossos Diferenciais',
    descricao: 'Oferecemos um ensino completo e diferenciado',
    servicos: [
      {
        titulo: 'Ensino Personalizado',
        icone: 'Users',
        descricao: 'Turmas pequenas com acompanhamento individualizado para cada aluno'
      },
      {
        titulo: 'Tecnologia Educacional',
        icone: 'Monitor',
        descricao: 'Laboratórios modernos e recursos tecnológicos integrados ao aprendizado'
      },
      {
        titulo: 'Atividades Extracurriculares',
        icone: 'Camera',
        descricao: 'Ampla variedade de atividades culturais, esportivas e artísticas'
      },
      {
        titulo: 'Preparação para o Futuro',
        icone: 'BookOpen',
        descricao: 'Metodologia focada no desenvolvimento de competências do século XXI'
      }
    ]
  },
  diferenciais: {
    titulo: 'Nossos Diferenciais',
    descricao: 'Oferecemos um ensino completo e diferenciado',
    diferenciais: [
      {
        titulo: 'Ensino Personalizado',
        descricao: 'Turmas pequenas com acompanhamento individualizado para cada aluno',
        icone: 'Users'
      },
      {
        titulo: 'Tecnologia Educacional',
        descricao: 'Laboratórios modernos e recursos tecnológicos integrados ao aprendizado',
        icone: 'Monitor'
      },
      {
        titulo: 'Atividades Extracurriculares',
        descricao: 'Ampla variedade de atividades culturais, esportivas e artísticas',
        icone: 'Activity'
      },
      {
        titulo: 'Preparação para o Futuro',
        descricao: 'Metodologia focada no desenvolvimento de competências do século XXI',
        icone: 'BookOpen'
      }
    ]
  },
  depoimentos: {
    titulo: 'O Que Dizem Sobre Nós',
    depoimentos: [
      {
        nome: 'Maria Silva',
        cargo: 'Mãe de aluna',
        depoimento: 'A Horizonte do Saber transformou a vida da minha filha. O cuidado e a dedicação dos professores são excepcionais.',
        foto: '/images/depoimentos/maria-silva.jpg'
      },
      {
        nome: 'João Santos',
        cargo: 'Ex-aluno',
        depoimento: 'Estudei aqui durante todo o ensino fundamental. As lições aprendidas foram fundamentais para meu sucesso profissional.',
        foto: '/images/depoimentos/joao-santos.jpg'
      },
      {
        nome: 'Ana Costa',
        cargo: 'Responsável',
        depoimento: 'Ambiente acolhedor, ensino de qualidade e valores bem definidos. Recomendo a todos os pais.',
        foto: '/images/depoimentos/ana-costa.jpg'
      }
    ]
  },
  contato: {
    titulo: 'Entre em Contato',
    endereco: 'Rua da Educação, 123\nJardim do Saber\nSão Paulo - SP\nCEP: 01234-567',
    telefone: '(11) 3456-7890',
    whatsapp: '(11) 99876-5432',
    email: 'contato@horizontedosaber.edu.br',
    horario_funcionamento: 'Segunda a Sexta: 7h às 18h\nSábado: 8h às 12h',
    mapa_url: 'https://maps.google.com/?q=Escola+Horizonte+do+Saber',
    instagram: '@horizontedosaber',
    facebook: 'facebook.com/horizontedosaber'
  },
  footer: {
    titulo: 'Horizonte do Saber',
    descricao: 'Transformando vidas através da educação. Oferecemos ensino de qualidade com metodologias inovadoras e professores especializados.',
    email: 'contato@horizontedosaber.edu.br',
    telefone: '(11) 3456-7890',
    endereco: 'São Paulo, SP',
    links_rapidos: [
      { nome: 'Sobre Nós', href: '/#sobre' },
      { nome: 'Galeria', href: '/#galeria' },
      { nome: 'Nossos Diferenciais', href: '/#servicos' },
      { nome: 'Depoimentos', href: '/#depoimentos' },
      { nome: 'Contato', href: '/#contato' }
    ],
    links_academicos: [
      { nome: 'Portal do Aluno', href: '/login' },
      { nome: 'Portal do Professor', href: '/login' },
      { nome: 'Calendário Acadêmico', href: '#' },
      { nome: 'Biblioteca Digital', href: '#' }
    ],
    redes_sociais: {
      facebook: 'https://facebook.com/horizontedosaber',
      instagram: 'https://instagram.com/horizontedosaber',
      whatsapp: '(11) 99876-5432',
      youtube: 'https://youtube.com/@horizontedosaber'
    },
    copyright: 'Todos os direitos reservados.',
    politica_privacidade: 'Política de Privacidade',
    termos_uso: 'Termos de Uso'
  },
  configuracoes: {
    // Logos
    logo_principal: '/images/logo-principal.png',
    logo_alternativo: '/images/logo-alt.png',
    favicon: '/images/favicon.ico',

    // Informações da escola
    nome_escola: 'Horizonte do Saber',
    slogan: 'Educação que Transforma',
    ano_fundacao: '1998',
    cnpj: '12.345.678/0001-90',
    codigo_inep: '35123456',

    // Cores do site
    cor_primaria: '#3B82F6',
    cor_secundaria: '#8B5CF6',
    cor_accent: '#10B981',
    cor_texto: '#1F2937',
    cor_fundo: '#FFFFFF',

    // Cores do gradiente da seção principal
    gradiente_cor1: '#3B82F6',
    gradiente_cor2: '#8B5CF6',
    gradiente_cor3: '#10B981',

    // Mascotes
    mascote_hori: '/images/mascotes/hori.png',
    mascote_horizon: '/images/mascotes/horizon.png',
    mostrar_mascotes: true,

    // Configurações adicionais
    modo_escuro: false,
    fonte_principal: 'Inter',
    tamanho_fonte: 'medium'
  }
}

// Context type
interface SiteContentContextType {
  content: SiteContent
  updateContent: (section: keyof SiteContent, newContent: any) => void
  resetContent: () => void
  loadContent: (newContent: SiteContent) => void
}

// Create context
const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined)

// Custom hook to use the context
export const useSiteContent = (): SiteContentContextType => {
  const context = useContext(SiteContentContext)
  if (context === undefined) {
    throw new Error('useSiteContent must be used within a SiteContentProvider')
  }
  return context
}

// Provider component
interface SiteContentProviderProps {
  children: ReactNode
}

export const SiteContentProvider: React.FC<SiteContentProviderProps> = ({ children }) => {
  // Initialize state with saved content or default
  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const savedContent = localStorage.getItem('site_content')
      return savedContent ? JSON.parse(savedContent) : defaultContent
    } catch (error) {
      console.warn('Could not load saved content:', error)
      return defaultContent
    }
  })

  const [isLoading, setIsLoading] = useState(false)

  // Load content from API on mount
  useEffect(() => {
    const loadFromAPI = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/content/public', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          }
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            console.log('✅ Conteúdo carregado da API')
            setContent(result.data)
            localStorage.setItem('site_content', JSON.stringify(result.data))
          }
        }
      } catch (error) {
        console.warn('⚠️ Erro ao carregar da API, usando localStorage:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFromAPI()
  }, [])

  // Save to localStorage whenever content changes
  useEffect(() => {
    try {
      localStorage.setItem('site_content', JSON.stringify(content))
    } catch (error) {
      console.warn('Could not save content to localStorage:', error)
    }
  }, [content])

  // Update a specific section and save to API
  const updateContent = async (section: keyof SiteContent, newContent: any) => {
    const updatedContent = {
      ...content,
      [section]: newContent
    }

    setContent(updatedContent)

    // Save to API in background
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedContent)
      })

      if (response.ok) {
        console.log('💾 Conteúdo sincronizado com API')
      } else {
        console.warn('⚠️ Erro ao salvar na API (salvo localmente)')
      }
    } catch (error) {
      console.warn('⚠️ Erro ao salvar na API (salvo localmente):', error)
    }
  }

  // Reset to default content
  const resetContent = async () => {
    setContent(defaultContent)

    // Save to API in background
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultContent)
      })
    } catch (error) {
      console.warn('Erro ao resetar na API:', error)
    }
  }

  // Load complete new content (for imports)
  const loadContent = async (newContent: SiteContent) => {
    setContent(newContent)

    // Save to API in background
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContent)
      })
    } catch (error) {
      console.warn('Erro ao salvar conteúdo importado na API:', error)
    }
  }

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'site_content' && event.newValue) {
        try {
          const newContent = JSON.parse(event.newValue)
          setContent(newContent)
        } catch (error) {
          console.warn('Could not parse storage change:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Periodic sync with API to detect changes from other sessions
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/content/public', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          }
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            const currentContentStr = JSON.stringify(content)
            const apiContentStr = JSON.stringify(result.data)

            if (currentContentStr !== apiContentStr) {
              console.log('🔄 Conteúdo atualizado detectado na API, sincronizando...')
              setContent(result.data)
              localStorage.setItem('site_content', apiContentStr)
            }
          }
        }
      } catch (error) {
        // Silently ignore sync errors to avoid spam
      }
    }, 5000) // Check every 5 seconds for real-time updates

    return () => clearInterval(syncInterval)
  }, [content])

  // Listen for window focus to sync immediately
  useEffect(() => {
    const handleFocus = async () => {
      try {
        const response = await fetch('/api/content/public', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          }
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            const currentContentStr = JSON.stringify(content)
            const apiContentStr = JSON.stringify(result.data)

            if (currentContentStr !== apiContentStr) {
              console.log('🔄 Sincronizando conteúdo ao focar janela...')
              setContent(result.data)
              localStorage.setItem('site_content', apiContentStr)
            }
          }
        }
      } catch (error) {
        // Silently ignore sync errors
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [content])

  const value: SiteContentContextType = {
    content,
    updateContent,
    resetContent,
    loadContent
  }

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  )
}

export default SiteContentContext