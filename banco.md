-- Criação do banco de dados
CREATE DATABASE sistema_facerec;
USE sistema_facerec;

-- Tabela de usuários (administrador e professor)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    cpf VARCHAR(14) UNIQUE,
    tipo ENUM('administrador', 'professor') NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de turmas
CREATE TABLE turmas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    criado_por INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
);

-- Relacionamento de professores com turmas
CREATE TABLE turmas_professores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    turma_id INT NOT NULL,
    professor_id INT NOT NULL,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de alunos (com suporte a reconhecimento facial)
CREATE TABLE alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    cpf VARCHAR(14) UNIQUE,
    turma_id INT NOT NULL,
    foto VARCHAR(255), -- caminho da imagem ou link
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE
);
