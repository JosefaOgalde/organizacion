-- Schema de referencia para Organización + Portal CLA
-- Se implementará con migraciones Laravel (Paso 2)

CREATE DATABASE IF NOT EXISTS organizacion
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE organizacion;

-- Clientes (Trendseeker, ECR, ADL, etc.)
CREATE TABLE clientes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  nombre VARCHAR(191) NOT NULL,
  abrev VARCHAR(16) NOT NULL,
  tipo ENUM('full-time', 'freelance', 'oportunidad', 'personal') NOT NULL DEFAULT 'freelance',
  color_border CHAR(7) NULL,
  color_bg CHAR(7) NULL,
  color_text CHAR(7) NULL,
  agente VARCHAR(191) NULL,
  resumen TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- Proyectos segmentados bajo un cliente (ej: CLA bajo ADL)
CREATE TABLE proyectos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT UNSIGNED NOT NULL,
  codigo VARCHAR(16) NOT NULL,
  nombre VARCHAR(191) NOT NULL,
  resumen TEXT NULL,
  identidad_pdf VARCHAR(255) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  UNIQUE KEY uk_cliente_codigo (cliente_id, codigo)
);

-- Tareas del organizador
CREATE TABLE tareas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT UNSIGNED NOT NULL,
  proyecto_id BIGINT UNSIGNED NULL,
  titulo VARCHAR(255) NOT NULL,
  fecha DATE NULL,
  hora_inicio TIME NULL,
  hora_fin TIME NULL,
  completada TINYINT(1) NOT NULL DEFAULT 0,
  pendiente TINYINT(1) NOT NULL DEFAULT 0,
  prioridad ENUM('alta', 'media', 'baja') DEFAULT 'media',
  notas TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE SET NULL
);

-- Certificados CLA (Paso posterior)
CREATE TABLE certificados_cla (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  participante VARCHAR(191) NOT NULL,
  fase TINYINT UNSIGNED NOT NULL,
  tipo ENUM('aprobacion', 'participacion', 'final') NOT NULL,
  especializacion VARCHAR(191) NULL,
  fecha_emision DATE NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- Datos iniciales de ejemplo
INSERT INTO clientes (slug, nombre, abrev, tipo, agente, resumen) VALUES
  ('trendseeker', 'Trendseeker - Talk', 'TS', 'full-time', 'Community Manager + WordPress', 'Redes y WordPress'),
  ('desafio-latam', 'Desafío Latam', 'ADL', 'freelance', 'Diseño freelance', 'Encargos esporádicos'),
  ('herramientas', 'Herramientas', 'HER', 'freelance', 'Herramientas internas', 'Proyectos de herramientas y utilidades');

INSERT INTO proyectos (cliente_id, codigo, nombre, resumen, identidad_pdf) VALUES
  (2, 'CLA', 'Caja Los Andes', 'Programa IA — certificados modulares', 'CLA/identidad/manual-marca-caja-los-andes.pdf'),
  (3, 'TEND', 'Tendencias', 'Análisis y seguimiento de tendencias', 'tendencias/identidad/manual-marca-tendencias.pdf');
