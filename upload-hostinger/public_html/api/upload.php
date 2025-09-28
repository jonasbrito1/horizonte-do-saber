<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class ImageUploader {
    private $uploadDir;
    private $allowedTypes;
    private $maxFileSize;

    public function __construct() {
        $this->uploadDir = __DIR__ . '/../uploads/';
        $this->allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        $this->maxFileSize = 5 * 1024 * 1024; // 5MB

        // Ensure upload directory exists
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    public function uploadImage() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return [
                'success' => false,
                'message' => 'Método não permitido'
            ];
        }

        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            return [
                'success' => false,
                'message' => 'Nenhuma imagem foi enviada ou erro no upload'
            ];
        }

        $file = $_FILES['image'];

        // Validate file size
        if ($file['size'] > $this->maxFileSize) {
            return [
                'success' => false,
                'message' => 'Arquivo muito grande. Máximo permitido: 5MB'
            ];
        }

        // Validate file type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $this->allowedTypes)) {
            return [
                'success' => false,
                'message' => 'Tipo de arquivo não permitido. Use: JPG, PNG, GIF ou WebP'
            ];
        }

        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'content-' . time() . '-' . uniqid() . '.' . $extension;
        $filePath = $this->uploadDir . $filename;

        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            // Set proper permissions
            chmod($filePath, 0644);

            return [
                'success' => true,
                'message' => 'Imagem enviada com sucesso',
                'data' => [
                    'url' => '/uploads/' . $filename,
                    'filename' => $filename,
                    'originalName' => $file['name'],
                    'size' => $file['size']
                ],
                'timestamp' => time()
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Erro ao salvar arquivo no servidor'
            ];
        }
    }
}

// Handle the request
try {
    $uploader = new ImageUploader();
    echo json_encode($uploader->uploadImage());
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor: ' . $e->getMessage()
    ]);
}
?>