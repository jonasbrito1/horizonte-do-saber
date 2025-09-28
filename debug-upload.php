<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Debug - Horizonte do Saber</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .ok { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
        h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Debug - Horizonte do Saber</h1>

        <h2>1. Verificação de Arquivos</h2>
        <?php
        $files_to_check = [
            'index.html' => 'Arquivo principal do React',
            'assets/' => 'Diretório de assets (CSS/JS)',
            'api/content.php' => 'API de conteúdo',
            'api/upload.php' => 'API de upload',
            'uploads/' => 'Diretório de uploads',
            'data/' => 'Diretório de dados'
        ];

        foreach ($files_to_check as $file => $description) {
            $path = __DIR__ . '/' . $file;
            if (file_exists($path)) {
                echo "<div class='status ok'>✅ $file - $description</div>";
            } else {
                echo "<div class='status error'>❌ $file - $description (NÃO ENCONTRADO)</div>";
            }
        }
        ?>

        <h2>2. Conteúdo do index.html</h2>
        <?php
        $index_path = __DIR__ . '/index.html';
        if (file_exists($index_path)) {
            $content = file_get_contents($index_path);
            echo "<div class='status ok'>✅ index.html encontrado (" . strlen($content) . " bytes)</div>";
            echo "<pre>" . htmlspecialchars(substr($content, 0, 500)) . "...</pre>";
        } else {
            echo "<div class='status error'>❌ index.html não encontrado!</div>";
        }
        ?>

        <h2>3. Assets Disponíveis</h2>
        <?php
        $assets_path = __DIR__ . '/assets/';
        if (is_dir($assets_path)) {
            $files = scandir($assets_path);
            echo "<div class='status ok'>✅ Diretório assets encontrado</div>";
            echo "<pre>";
            foreach ($files as $file) {
                if ($file != '.' && $file != '..') {
                    echo "$file\n";
                }
            }
            echo "</pre>";
        } else {
            echo "<div class='status error'>❌ Diretório assets não encontrado!</div>";
        }
        ?>

        <h2>4. Teste da API de Conteúdo</h2>
        <?php
        $api_url = 'http' . (isset($_SERVER['HTTPS']) ? 's' : '') . '://' . $_SERVER['HTTP_HOST'] . '/api/content/public';

        $context = stream_context_create([
            'http' => [
                'timeout' => 10,
                'method' => 'GET'
            ]
        ]);

        $api_response = @file_get_contents($api_url, false, $context);

        if ($api_response !== false) {
            $json_data = json_decode($api_response, true);
            if ($json_data && isset($json_data['success']) && $json_data['success']) {
                echo "<div class='status ok'>✅ API funcionando corretamente</div>";
                echo "<div class='status ok'>Conteúdo: " . (isset($json_data['data']['hero']['titulo']) ? $json_data['data']['hero']['titulo'] : 'N/A') . "</div>";
            } else {
                echo "<div class='status error'>❌ API retornando dados inválidos</div>";
                echo "<pre>" . htmlspecialchars($api_response) . "</pre>";
            }
        } else {
            echo "<div class='status error'>❌ Não foi possível acessar a API</div>";
            echo "<div class='status warning'>URL testada: $api_url</div>";
        }
        ?>

        <h2>5. Informações do Servidor</h2>
        <div class='status ok'>
            <strong>PHP Version:</strong> <?php echo PHP_VERSION; ?><br>
            <strong>Document Root:</strong> <?php echo $_SERVER['DOCUMENT_ROOT']; ?><br>
            <strong>Script Path:</strong> <?php echo __DIR__; ?><br>
            <strong>Request URI:</strong> <?php echo $_SERVER['REQUEST_URI']; ?><br>
            <strong>HTTP Host:</strong> <?php echo $_SERVER['HTTP_HOST']; ?>
        </div>

        <h2>6. Recomendações</h2>
        <div class='status warning'>
            <strong>Se o site estiver em branco:</strong><br>
            1. Verifique se todos os arquivos acima estão presentes<br>
            2. Use o .htaccess simples (.htaccess_simple)<br>
            3. Teste acessar: /index.html diretamente<br>
            4. Verifique no console do navegador se há erros de JavaScript<br>
            5. Limpe o cache do navegador
        </div>

        <div style="margin-top: 20px; text-align: center;">
            <a href="/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">🏠 Voltar ao Site</a>
            <a href="/index.html" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-left: 10px;">📄 Testar index.html</a>
        </div>
    </div>
</body>
</html>