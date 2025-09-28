import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'content-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'))
    }
  }
})

export const uploadImage = upload.single('image');

export interface SiteContent {
  hero: {
    titulo: string;
    subtitulo: string;
    descricao: string;
    imagem_fundo?: string;
    botao_texto?: string;
    cor_primaria?: string;
    cor_secundaria?: string;
  };
  sobre: {
    titulo: string;
    descricao: string;
    anos_experiencia?: string;
    alunos_formados?: string;
    missao?: string;
    visao?: string;
    valores?: string[];
    imagem?: string;
  };
  galeria: {
    titulo: string;
    descricao?: string;
    fotos?: Array<{
      url: string;
      titulo?: string;
      descricao?: string;
      id?: string;
    }>;
  };
  servicos: {
    titulo: string;
    descricao?: string;
    servicos?: Array<{
      titulo: string;
      icone: string;
      descricao: string;
    }>;
  };
  diferenciais: {
    titulo: string;
    descricao?: string;
    diferenciais?: Array<{
      titulo: string;
      descricao: string;
      icone?: string;
    }>;
  };
  depoimentos: {
    titulo: string;
    depoimentos?: Array<{
      nome: string;
      cargo: string;
      depoimento: string;
      foto?: string;
    }>;
  };
  contato: {
    titulo: string;
    endereco: string;
    telefone: string;
    whatsapp?: string;
    email: string;
    horario_funcionamento?: string;
    mapa_url?: string;
    instagram?: string;
    facebook?: string;
  };
  footer: {
    titulo?: string;
    descricao?: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    links_rapidos?: Array<{
      nome: string;
      href: string;
    }>;
    links_academicos?: Array<{
      nome: string;
      href: string;
    }>;
    redes_sociais?: {
      facebook?: string;
      instagram?: string;
      whatsapp?: string;
      youtube?: string;
    };
    copyright?: string;
    politica_privacidade?: string;
    termos_uso?: string;
  };
  configuracoes: {
    logo_principal?: string;
    logo_alternativo?: string;
    favicon?: string;
    nome_escola: string;
    slogan?: string;
    ano_fundacao?: string;
    cnpj?: string;
    codigo_inep?: string;
    cor_primaria?: string;
    cor_secundaria?: string;
    cor_accent?: string;
    cor_texto?: string;
    cor_fundo?: string;
    gradiente_cor1?: string;
    gradiente_cor2?: string;
    gradiente_cor3?: string;
    mascote_hori?: string;
    mascote_horizon?: string;
    mostrar_mascotes?: boolean;
    modo_escuro?: boolean;
    fonte_principal?: string;
    tamanho_fonte?: string;
  };
}

export class ContentController {
  private contentFilePath = path.join(process.cwd(), 'src', 'data', 'site-content.json');
  private cache: SiteContent | null = null;
  private lastModified = 0;

  constructor() {
    this.ensureDataDirectory();
  }

  private async ensureDataDirectory() {
    try {
      const dataDir = path.dirname(this.contentFilePath);
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
  }

  private getDefaultContent(): SiteContent {
    return {
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
        fotos: []
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
        depoimentos: []
      },
      contato: {
        titulo: 'Entre em Contato',
        endereco: 'Rua da Educação, 123\nJardim do Saber\nSão Paulo - SP\nCEP: 01234-567',
        telefone: '(11) 3456-7890',
        whatsapp: '(11) 99876-5432',
        email: 'contato@horizontedosaber.edu.br',
        horario_funcionamento: 'Segunda a Sexta: 7h às 18h\nSábado: 8h às 12h'
      },
      footer: {
        titulo: 'Horizonte do Saber',
        descricao: 'Transformando vidas através da educação.',
        email: 'contato@horizontedosaber.edu.br',
        telefone: '(11) 3456-7890',
        endereco: 'São Paulo, SP',
        links_rapidos: [],
        links_academicos: [],
        redes_sociais: {},
        copyright: 'Todos os direitos reservados.'
      },
      configuracoes: {
        nome_escola: 'Horizonte do Saber',
        slogan: 'Educação que Transforma',
        ano_fundacao: '1998',
        cor_primaria: '#3B82F6',
        cor_secundaria: '#8B5CF6',
        mostrar_mascotes: true,
        modo_escuro: false
      }
    };
  }

  private async loadContent(): Promise<SiteContent> {
    try {
      const stats = await fs.stat(this.contentFilePath);
      const fileModified = stats.mtime.getTime();

      // Use cache if file hasn't changed
      if (this.cache && fileModified === this.lastModified) {
        return this.cache;
      }

      const fileContent = await fs.readFile(this.contentFilePath, 'utf-8');
      const content = JSON.parse(fileContent);

      this.cache = content;
      this.lastModified = fileModified;

      return content;
    } catch (error) {
      // If file doesn't exist, create it with default content
      const defaultContent = this.getDefaultContent();
      await this.saveContent(defaultContent);
      return defaultContent;
    }
  }

  private async saveContent(content: SiteContent): Promise<void> {
    try {
      await this.ensureDataDirectory();
      const contentJson = JSON.stringify(content, null, 2);
      await fs.writeFile(this.contentFilePath, contentJson, 'utf-8');

      // Update cache
      this.cache = content;
      this.lastModified = Date.now();

      console.log('✅ Content saved successfully');
    } catch (error) {
      console.error('❌ Error saving content:', error);
      throw error;
    }
  }

  // GET /api/content/public - Public content (no auth required)
  public getPublicContent = async (req: Request, res: Response) => {
    try {
      const content = await this.loadContent();

      // Add cache headers to prevent caching issues
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"${Date.now()}"`
      });

      res.json({
        success: true,
        data: content,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error getting public content:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao carregar conteúdo'
      });
    }
  };

  // GET /api/content/public/:section - Get specific section (public)
  public getPublicContentBySection = async (req: Request, res: Response) => {
    try {
      const { section } = req.params;
      const content = await this.loadContent();

      if (!(section in content)) {
        return res.status(404).json({
          success: false,
          message: 'Seção não encontrada'
        });
      }

      // Add cache headers
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"${Date.now()}"`
      });

      res.json({
        success: true,
        data: content[section as keyof SiteContent],
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error getting content section:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao carregar seção'
      });
    }
  };

  // GET /api/content - Get all content (admin only)
  public getAllContent = async (req: Request, res: Response) => {
    try {
      const content = await this.loadContent();

      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      res.json({
        success: true,
        data: content,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error getting all content:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao carregar conteúdo'
      });
    }
  };

  // GET /api/content/:section - Get specific section (admin only)
  public getContentBySection = async (req: Request, res: Response) => {
    try {
      const { section } = req.params;
      const content = await this.loadContent();

      if (!(section in content)) {
        return res.status(404).json({
          success: false,
          message: 'Seção não encontrada'
        });
      }

      res.json({
        success: true,
        data: content[section as keyof SiteContent],
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error getting content section:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao carregar seção'
      });
    }
  };

  // POST /api/content - Create/update content (admin only)
  public createContent = async (req: Request, res: Response) => {
    try {
      const newContent = req.body as SiteContent;

      // Validate that required fields exist
      if (!newContent || typeof newContent !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Dados de conteúdo inválidos'
        });
      }

      await this.saveContent(newContent);

      res.json({
        success: true,
        message: 'Conteúdo atualizado com sucesso',
        data: newContent,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error creating content:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar conteúdo'
      });
    }
  };

  // PUT /api/content/:id - Update content (admin only)
  public updateContent = async (req: Request, res: Response) => {
    try {
      const { section } = req.body;
      const sectionData = req.body.data;

      if (!section || !sectionData) {
        return res.status(400).json({
          success: false,
          message: 'Seção e dados são obrigatórios'
        });
      }

      const content = await this.loadContent();

      if (!(section in content)) {
        return res.status(404).json({
          success: false,
          message: 'Seção não encontrada'
        });
      }

      // Update the specific section
      content[section as keyof SiteContent] = sectionData;

      await this.saveContent(content);

      res.json({
        success: true,
        message: 'Seção atualizada com sucesso',
        data: content,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar conteúdo'
      });
    }
  };

  // DELETE /api/content/:id - Reset content to default (admin only)
  public deleteContent = async (req: Request, res: Response) => {
    try {
      const defaultContent = this.getDefaultContent();
      await this.saveContent(defaultContent);

      res.json({
        success: true,
        message: 'Conteúdo resetado para o padrão',
        data: defaultContent,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error resetting content:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao resetar conteúdo'
      });
    }
  };

  // POST /api/content/cache/clear - Clear content cache (admin only)
  public clearCache = async (req: Request, res: Response) => {
    try {
      this.cache = null;
      this.lastModified = 0;

      res.json({
        success: true,
        message: 'Cache limpo com sucesso',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao limpar cache'
      });
    }
  };

  // POST /api/content/upload - Upload image for content
  public uploadContentImage = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhuma imagem foi enviada'
        });
      }

      const imageUrl = `/uploads/${req.file.filename}`;

      res.json({
        success: true,
        message: 'Imagem enviada com sucesso',
        data: {
          url: imageUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar imagem'
      });
    }
  };
}