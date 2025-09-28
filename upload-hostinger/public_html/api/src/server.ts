import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import userRoutes from './routes/users';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5177',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads)
app.use('/uploads', express.static('uploads'));

// API Routes
// app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Basic auth route for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Mock login - replace with real authentication
  if (email === 'admin@horizontedosaber.com' && password === 'admin123') {
    res.json({
      user: {
        id: 1,
        nome: 'Administrador',
        email: 'admin@horizontedosaber.com',
        tipo: 'admin'
      },
      token: 'mock-jwt-token-12345'
    });
  } else {
    res.status(401).json({
      message: 'Credenciais inválidas'
    });
  }
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token === 'mock-jwt-token-12345') {
    res.json({
      id: 1,
      nome: 'Administrador',
      email: 'admin@horizontedosaber.com',
      tipo: 'admin'
    });
  } else {
    res.status(401).json({
      message: 'Token inválido'
    });
  }
});

// Mock content endpoint
app.get('/api/content/:section', (req, res) => {
  const { section } = req.params;

  // Mock content data
  const mockContent = {
    hero: {
      title: 'Horizonte do Saber',
      subtitle: 'Educação de Excelência',
      description: 'Formando cidadãos conscientes e preparados para o futuro.',
      backgroundImage: '/uploads/hero-bg.jpg',
      buttonText: 'Saiba Mais'
    },
    about: {
      title: 'Nossa História',
      description: 'Com mais de 20 anos de experiência em educação, o Horizonte do Saber tem o compromisso de oferecer ensino de qualidade.',
      yearsExperience: '20+',
      studentsFormed: '1000+',
      image: '/uploads/about-image.jpg'
    },
    gallery: {
      title: 'Galeria de Fotos',
      description: 'Conheça nossa estrutura e atividades',
      photos: [
        { id: 1, url: '/uploads/gallery1.jpg', alt: 'Sala de aula' },
        { id: 2, url: '/uploads/gallery2.jpg', alt: 'Laboratório' },
        { id: 3, url: '/uploads/gallery3.jpg', alt: 'Biblioteca' }
      ]
    },
    services: {
      title: 'Nossos Valores',
      description: 'Valores que norteiam nossa educação',
      values: [
        'Excelência Acadêmica',
        'Formação Integral',
        'Inovação Pedagógica',
        'Compromisso Social'
      ]
    },
    testimonials: {
      title: 'Depoimentos',
      testimonials: [
        {
          id: 1,
          name: 'Maria Silva',
          text: 'Excelente escola, meu filho evoluiu muito!',
          rating: 5
        }
      ]
    },
    contact: {
      title: 'Contato',
      address: 'Rua das Flores, 123 - Centro',
      phone: '(11) 1234-5678',
      email: 'contato@horizontedosaber.com',
      hours: 'Segunda a Sexta: 7h às 18h'
    }
  };

  res.json(mockContent[section as keyof typeof mockContent] || {});
});

// Update content endpoint
app.put('/api/content/:section', (req, res) => {
  const { section } = req.params;
  const content = req.body;

  // Mock update - in real app, save to database
  console.log(`Updating ${section}:`, content);

  res.json({
    message: 'Conteúdo atualizado com sucesso',
    section,
    content
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5177'}`);
});

export default app;