-- sql/001_init_schema.sql
-- Schema inicial para controle de professores, admins e logs de presença

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS teacher_classes;
DROP TABLE IF EXISTS attendance_logs;
DROP TABLE IF EXISTS attendance_presence;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS classrooms;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name       VARCHAR(150)    NOT NULL,
  email           VARCHAR(150)    NOT NULL,
  password_hash   VARCHAR(255)    NOT NULL,
  role            ENUM('admin','professor') NOT NULL DEFAULT 'professor',
  subject         VARCHAR(120)    NULL,
  school          VARCHAR(150)    NULL,
  phone           VARCHAR(30)     NULL,
  cpf             VARCHAR(20)     NULL,
  firebase_uid    VARCHAR(191)    NULL,
  profile_picture VARCHAR(500)    NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_firebase (firebase_uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE teacher_classes (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  class_name VARCHAR(120)    NOT NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_teacher_classes_user (user_id),
  UNIQUE KEY uq_teacher_class (user_id, class_name),
  CONSTRAINT fk_teacher_classes_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE classrooms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_user_id BIGINT UNSIGNED NULL,
  name VARCHAR(120) NOT NULL,
  turma VARCHAR(120) DEFAULT NULL,
  periodo VARCHAR(60) DEFAULT NULL,
  total_students INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_classrooms_owner (owner_user_id),
  UNIQUE KEY uq_classroom_owner_name (owner_user_id, name)
);

CREATE TABLE students (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  matricula VARCHAR(100) DEFAULT NULL,
  email VARCHAR(150) DEFAULT NULL,
  telefone VARCHAR(30) DEFAULT NULL,
  classroom_id BIGINT UNSIGNED DEFAULT NULL,
  owner_user_id BIGINT UNSIGNED DEFAULT NULL,
  foto VARCHAR(500) DEFAULT NULL,
  ativo TINYINT(1) DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_students_owner (owner_user_id),
  CONSTRAINT fk_students_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL
);

CREATE TABLE attendance_logs (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  captured_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confidence    FLOAT           NULL,
  device_label  VARCHAR(100)    NULL,
  PRIMARY KEY (id),
  KEY idx_attendance_user_time (user_id, captured_at),
  CONSTRAINT fk_attendance_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
