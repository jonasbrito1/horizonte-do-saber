<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class ContentManager {
    private $contentFile;

    public function __construct() {
        $this->contentFile = __DIR__ . '/../data/site-content.json';
        $this->ensureDataDirectory();
    }

    private function ensureDataDirectory() {
        $dataDir = dirname($this->contentFile);
        if (!file_exists($dataDir)) {
            mkdir($dataDir, 0755, true);
        }
    }

    private function getDefaultContent() {
        return [
            'hero' => [
                'titulo' => 'Horizonte do Saber',
                'subtitulo' => 'Educação de Qualidade que Transforma Vidas',
                'descricao' => 'Uma escola comprometida com a excelência educacional, formando cidadãos preparados para os desafios do futuro com valores sólidos e conhecimento de qualidade.',
                'imagem_fundo' => '/images/hero-bg.jpg',
                'botao_texto' => 'Conheça Nossa Escola',
                'cor_primaria' => '#3B82F6',
                'cor_secundaria' => '#8B5CF6'
            ],
            'sobre' => [
                'titulo' => 'Nossa História',
                'descricao' => 'Há mais de 25 anos dedicados à educação de qualidade, a Escola Horizonte do Saber se consolidou como referência em ensino fundamental, oferecendo um ambiente acolhedor e estimulante para o desenvolvimento integral de nossos alunos.',
                'anos_experiencia' => '25',
                'alunos_formados' => '5000+',
                'missao' => 'Proporcionar educação de excelência, formando cidadãos críticos, éticos e preparados para os desafios do futuro.',
                'visao' => 'Ser reconhecida como referência em educação transformadora, contribuindo para uma sociedade mais justa e desenvolvida.',
                'valores' => ['Excelência Acadêmica', 'Valores Éticos', 'Inovação Pedagógica', 'Desenvolvimento Integral', 'Compromisso Social'],
                'imagem' => '/images/about-school.jpg'
            ],
            'galeria' => [
                'titulo' => 'Nossa Escola em Imagens',
                'descricao' => 'Conheça nossos espaços e atividades através desta galeria de fotos',
                'fotos' => []
            ],
            'diferenciais' => [
                'titulo' => 'Nossos Diferenciais',
                'descricao' => 'Oferecemos um ensino completo e diferenciado',
                'diferenciais' => [
                    [
                        'titulo' => 'Ensino Personalizado',
                        'descricao' => 'Turmas pequenas com acompanhamento individualizado para cada aluno',
                        'icone' => 'Users'
                    ],
                    [
                        'titulo' => 'Tecnologia Educacional',
                        'descricao' => 'Laboratórios modernos e recursos tecnológicos integrados ao aprendizado',
                        'icone' => 'Monitor'
                    ],
                    [
                        'titulo' => 'Atividades Extracurriculares',
                        'descricao' => 'Ampla variedade de atividades culturais, esportivas e artísticas',
                        'icone' => 'Activity'
                    ],
                    [
                        'titulo' => 'Preparação para o Futuro',
                        'descricao' => 'Metodologia focada no desenvolvimento de competências do século XXI',
                        'icone' => 'BookOpen'
                    ]
                ]
            ],
            'servicos' => [
                'titulo' => 'Nossos Serviços',
                'descricao' => 'Oferecemos um ensino completo e diferenciado',
                'servicos' => []
            ],
            'depoimentos' => [
                'titulo' => 'O Que Dizem Sobre Nós',
                'depoimentos' => []
            ],
            'contato' => [
                'titulo' => 'Entre em Contato',
                'endereco' => "Rua da Educação, 123\nJardim do Saber\nSão Paulo - SP\nCEP: 01234-567",
                'telefone' => '(11) 3456-7890',
                'whatsapp' => '(11) 99876-5432',
                'email' => 'contato@horizontedosaber.edu.br',
                'horario_funcionamento' => "Segunda a Sexta: 7h às 18h\nSábado: 8h às 12h"
            ],
            'footer' => [
                'titulo' => 'Horizonte do Saber',
                'descricao' => 'Transformando vidas através da educação.',
                'email' => 'contato@horizontedosaber.edu.br',
                'telefone' => '(11) 3456-7890',
                'endereco' => 'São Paulo, SP',
                'links_rapidos' => [],
                'links_academicos' => [],
                'redes_sociais' => [],
                'copyright' => 'Todos os direitos reservados.'
            ],
            'configuracoes' => [
                'nome_escola' => 'Horizonte do Saber',
                'slogan' => 'Educação que Transforma',
                'ano_fundacao' => '1998',
                'cor_primaria' => '#3B82F6',
                'cor_secundaria' => '#8B5CF6',
                'mostrar_mascotes' => true,
                'modo_escuro' => false
            ]
        ];
    }

    private function loadContent() {
        if (!file_exists($this->contentFile)) {
            $defaultContent = $this->getDefaultContent();
            $this->saveContent($defaultContent);
            return $defaultContent;
        }

        $content = file_get_contents($this->contentFile);
        return json_decode($content, true);
    }

    private function saveContent($content) {
        $json = json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        file_put_contents($this->contentFile, $json);
    }

    public function getPublicContent() {
        $content = $this->loadContent();

        return [
            'success' => true,
            'data' => $content,
            'timestamp' => time()
        ];
    }

    public function updateContent($newContent) {
        $this->saveContent($newContent);

        return [
            'success' => true,
            'message' => 'Conteúdo atualizado com sucesso',
            'data' => $newContent,
            'timestamp' => time()
        ];
    }

    public function clearCache() {
        // In PHP, we don't need to clear cache as file is read each time
        return [
            'success' => true,
            'message' => 'Cache limpo com sucesso',
            'timestamp' => time()
        ];
    }
}

// Handle the request
$contentManager = new ContentManager();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    if ($method === 'GET') {
        if (strpos($path, '/public') !== false) {
            echo json_encode($contentManager->getPublicContent());
        } else {
            echo json_encode($contentManager->getPublicContent());
        }
    } else if ($method === 'POST') {
        if (strpos($path, '/cache/clear') !== false) {
            echo json_encode($contentManager->clearCache());
        } else {
            $input = json_decode(file_get_contents('php://input'), true);
            if ($input) {
                echo json_encode($contentManager->updateContent($input));
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Dados inválidos'
                ]);
            }
        }
    } else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método não permitido'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor: ' . $e->getMessage()
    ]);
}
?>