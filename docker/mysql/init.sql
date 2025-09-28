-- Inicialização do banco de dados MySQL para Horizonte do Saber
-- Este script é executado automaticamente quando o container MySQL é criado

-- Configurar charset e collation
ALTER DATABASE horizontedosaber CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Configurações de timezone
SET time_zone = '-03:00';

-- Configurações de SQL mode
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- Criar usuário para a aplicação (se não existir)
CREATE USER IF NOT EXISTS 'horizonte_user'@'%' IDENTIFIED BY 'horizonte123';
GRANT ALL PRIVILEGES ON horizontedosaber.* TO 'horizonte_user'@'%';
FLUSH PRIVILEGES;

-- Log de inicialização
SELECT 'Database horizontedosaber initialized successfully!' AS message;