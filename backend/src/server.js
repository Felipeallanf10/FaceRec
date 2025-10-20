// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

import { installRealtime } from './server_realtime.mjs';

import { installAttendanceRoutes, installFaceRoutes } from './server_attendance_routes.mjs';

import http from 'http';

const app = express();
const server = http.createServer(app);

async function getUserWithClasses(userId, externalConn = null) {
  const conn = externalConn || await pool.getConnection();
  try {
    const [users] = await conn.execute(
      `SELECT id, full_name, email, role, subject, school, phone, cpf, profile_picture, created_at, updated_at
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) return null;

    const user = users[0];
    const [classesRows] = await conn.execute(
      'SELECT class_name FROM teacher_classes WHERE user_id = ? ORDER BY class_name',
      [userId]
    );

    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      subject: user.subject,
      school: user.school,
      phone: user.phone,
      cpf: user.cpf,
      profile_picture: user.profile_picture,
      photoURL: user.profile_picture,
      created_at: user.created_at,
      updated_at: user.updated_at,
      classes: classesRows.map((row) => row.class_name),
    };
  } finally {
    if (!externalConn) conn.release();
  }
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeClassList(rawClasses) {
  if (!rawClasses) return [];
  const items = Array.isArray(rawClasses)
    ? rawClasses
    : String(rawClasses)
        .split(/,|\n/)
        .map((item) => item.trim());

  const seen = new Set();
  return items
    .map((item) => String(item || '').trim())
    .filter((item) => {
      if (!item) return false;
      if (seen.has(item.toLowerCase())) return false;
      seen.add(item.toLowerCase());
      return true;
    });
}

/* ===== CORS (habilita front em Vite) ===== */
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.options('*', cors());

/* ===== Body parser ===== */
app.use(express.json({ limit: '10mb' }));

/* ===== Configuração de uploads ===== */
const uploadsDir = path.join(process.cwd(), 'uploads', 'profile-pics');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Pasta de uploads criada:', uploadsDir);
}

// 🔧 ALTERADO: Servir /uploads SEM CACHE para evitar avatar “fantasma”
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // usa o ID do token (req.user.sub)
    cb(null, `profile-${req.user?.sub || 'anon'}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
    }
  }
});

/* ===== Porta ===== */
const PORT = process.env.PORT || 3001;

/* ===== Fallback de JWT_SECRET em dev ===== */
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET não definido no .env — usando valor TEMPORÁRIO (apenas dev).');
  process.env.JWT_SECRET = 'dev-temp-secret-change-me';
}

/* ===== Middleware de autenticação JWT ===== */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token de acesso requerido' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Erro no token:', err);
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

/* ===== Rotas de teste ===== */
app.get('/', (req, res) => {
  res.send('API funcionando!');
});

app.get('/test', (req, res) => {
  res.json({
    message: 'Server funcionando!',
    timestamp: new Date(),
    port: PORT
  });
});

/* Saúde da API (para checar no navegador) */
app.get('/health', (req, res) => {
  res.json({ ok: true, ts: new Date(), port: PORT });
});

/* ===== Signup ===== */
const handleSignup = async (req, res) => {
  const {
    fullName,
    email,
    password,
    subject,
    school,
    classes,
    phone,
    cpf,
  } = req.body || {};

  if (!fullName || !String(fullName).trim()) {
    return res.status(400).json({ error: 'Nome completo é obrigatório' });
  }
  if (!email || !String(email).trim()) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
  }
  if (!subject || !String(subject).trim()) {
    return res.status(400).json({ error: 'Informe a matéria que leciona' });
  }
  if (!school || !String(school).trim()) {
    return res.status(400).json({ error: 'Informe a escola do professor' });
  }

  const normalizedClasses = normalizeClassList(classes);
  if (normalizedClasses.length === 0) {
    return res.status(400).json({ error: 'Informe pelo menos uma turma atribuída' });
  }

  const conn = await pool.getConnection();
  let transactionStarted = false;

  try {
    const hash = await bcrypt.hash(password, 10);
    await conn.beginTransaction();
    transactionStarted = true;

    const [result] = await conn.execute(
      `INSERT INTO users (full_name, email, password_hash, role, subject, school, phone, cpf)
       VALUES (?, ?, ?, 'professor', ?, ?, ?, ?)` ,
      [
        String(fullName).trim(),
        normalizeEmail(email),
        hash,
        String(subject).trim(),
        String(school).trim(),
        phone ? String(phone).trim() : null,
        cpf ? String(cpf).trim() : null,
      ]
    );

    const userId = result.insertId;

    if (normalizedClasses.length > 0) {
      const placeholders = normalizedClasses.map(() => '(?, ?)').join(', ');
      const values = normalizedClasses.flatMap((className) => [userId, className]);
      await conn.execute(
        `INSERT INTO teacher_classes (user_id, class_name) VALUES ${placeholders}`,
        values
      );
    }

    await conn.commit();
    transactionStarted = false;

    res.status(201).json({ userId, role: 'professor' });
  } catch (err) {
    if (transactionStarted) {
      try { await conn.rollback(); } catch {}
    }

    if (err?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    console.error('Erro no cadastro:', err);
    res.status(500).json({ error: 'Falha no cadastro: ' + err.message });
  } finally {
    conn.release();
  }
};

app.post('/signup', handleSignup);
app.post('/api/signup', handleSignup);

/* ===== Login ===== */
const handleLogin = async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const normalizedEmail = normalizeEmail(email);
    const [rows] = await pool.execute(
      `SELECT id, password_hash FROM users WHERE email = ?`,
      [normalizedEmail]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });

    const user = rows[0];
    const match = await bcrypt.compare(password || '', user.password_hash);
    if (!match) return res.status(401).json({ error: 'Senha incorreta' });

    const detailedUser = await getUserWithClasses(user.id);
    const tokenPayload = { sub: user.id, role: detailedUser?.role || 'professor' };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    console.log('Login realizado para usuário ID:', user.id);
    res.json({ token, user: detailedUser });
  } catch (err) {
    // Se houver falha de conexão com o DB, oferecer um fallback de administrador
    console.error('Erro no login (DB ou outro):', err?.code || err?.message || err);

    const normalizedEmail = normalizeEmail(email);
    const fallbackAdminEmail = 'admin@facerec.com';
    const fallbackAdminPassword = 'FaceRec@123';

    // Aceita o login fallback se as credenciais coincidirem
    if (normalizedEmail === fallbackAdminEmail && String(password) === fallbackAdminPassword) {
      console.warn('⚠️  Usando fallback de admin (DB inacessível) para:', fallbackAdminEmail);
      const fallbackId = 'fallback-admin';
      const token = jwt.sign({ sub: fallbackId, role: 'admin' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      });

      const fallbackUser = {
        id: fallbackId,
        full_name: 'Administrador (fallback)',
        email: fallbackAdminEmail,
        role: 'admin',
        classes: []
      };

      return res.json({ token, user: fallbackUser });
    }

    res.status(500).json({ error: 'Erro no login: ' + (err?.message || String(err)) });
  }
};

app.post('/login', handleLogin);
app.post('/api/login', handleLogin);

/* ===== Sync Firebase → MariaDB ===== */
app.post('/api/sync-firebase-user', async (req, res) => {
  const { firebaseEmail, firebaseDisplayName, firebaseUid, firebasePhotoURL } = req.body;

  try {
    console.log('🔄 Sincronizando usuário do Firebase:', firebaseEmail);

    const normalizedEmail = normalizeEmail(firebaseEmail);

    const [existingUsers] = await pool.execute(
      `SELECT id, full_name, email, profile_picture FROM users WHERE email = ?`,
      [normalizedEmail]
    );

    let userId;

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log('✅ Usuário já existe no MariaDB, ID:', userId);

      let needsUpdate = false;
      let updateFields = [];
      let updateValues = [];

      if (firebaseDisplayName && existingUsers[0].full_name !== firebaseDisplayName) {
        updateFields.push('full_name = ?');
        updateValues.push(firebaseDisplayName);
        needsUpdate = true;
      }

      // Atualiza foto apenas se não há foto personalizada (não começar com /uploads)
      if (firebasePhotoURL && (!existingUsers[0].profile_picture || !existingUsers[0].profile_picture.startsWith('/uploads'))) {
        updateFields.push('profile_picture = ?');
        updateValues.push(firebasePhotoURL);
        needsUpdate = true;
      }

      if (needsUpdate) {
        updateValues.push(userId);
        await pool.execute(
          `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
          updateValues
        );
        console.log('📝 Dados atualizados no MariaDB');
      }
    } else {
      console.log('➕ Criando novo usuário no MariaDB...');
      const [result] = await pool.execute(
        `INSERT INTO users (full_name, email, password_hash, firebase_uid, profile_picture, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          firebaseDisplayName || 'Usuário Firebase',
          normalizedEmail,
          'firebase_auth',
          firebaseUid,
          firebasePhotoURL || null
        ]
      );
      userId = result.insertId;
      console.log('✅ Novo usuário criado no MariaDB, ID:', userId);
    }

    const token = jwt.sign(
      { sub: userId, email: normalizedEmail, firebase: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('🎫 Token JWT gerado para usuário ID:', userId);

    res.json({
      success: true,
      token,
      userId,
      message: 'Usuário sincronizado com sucesso'
    });

  } catch (err) {
    console.error('❌ Erro ao sincronizar usuário:', err);
    res.status(500).json({ error: 'Erro ao sincronizar usuário: ' + err.message });
  }
});

/* ===== Perfil do usuário ===== */
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Buscando perfil para usuário ID:', req.user.sub);
    const user = await getUserWithClasses(req.user.sub);

    if (!user) {
      console.log('Usuário não encontrado no banco:', req.user.sub);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    console.log('Perfil encontrado:', user);
    res.json(user);
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/* ===== Atualizar perfil ===== */
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  const {
    full_name,
    phone,
    cpf,
    school,
    subject,
    classes,
  } = req.body || {};

  try {
    console.log('Atualizando perfil para usuário ID:', req.user.sub);
    console.log('Novos dados:', { full_name, phone, cpf, school, subject, classes });

    if (!full_name || String(full_name).trim().length < 2) {
      return res.status(400).json({ error: 'Nome deve ter pelo menos 2 caracteres' });
    }
    const normalizedClasses = typeof classes === 'undefined' ? null : normalizeClassList(classes);

    const conn = await pool.getConnection();
    let transactionStarted = false;

    try {
      await conn.beginTransaction();
      transactionStarted = true;

      const [result] = await conn.execute(
        `UPDATE users 
         SET full_name = ?, phone = ?, cpf = ?, school = ?, subject = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          String(full_name).trim(),
          phone || null,
          cpf || null,
          school ? String(school).trim() : null,
          subject ? String(subject).trim() : null,
          req.user.sub,
        ]
      );

      if (result.affectedRows === 0) {
        await conn.rollback();
        transactionStarted = false;
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      if (normalizedClasses !== null) {
        await conn.execute('DELETE FROM teacher_classes WHERE user_id = ?', [req.user.sub]);
        if (normalizedClasses.length > 0) {
          const placeholders = normalizedClasses.map(() => '(?, ?)').join(', ');
          const values = normalizedClasses.flatMap((className) => [req.user.sub, className]);
          await conn.execute(
            `INSERT INTO teacher_classes (user_id, class_name) VALUES ${placeholders}`,
            values
          );
        }
      }

      await conn.commit();
      transactionStarted = false;

      const updatedUser = await getUserWithClasses(req.user.sub, conn);
      res.json({
        message: 'Perfil atualizado com sucesso',
        user: updatedUser,
      });
    } catch (err) {
      if (transactionStarted) {
        try { await conn.rollback(); } catch {}
      }
      throw err;
    } finally {
      // getUserWithClasses não libera a conexão quando recebe externalConn
      if (conn) conn.release();
    }
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/* ===== Alterar senha ===== */
app.put('/api/user/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    console.log('Alterando senha para usuário ID:', req.user.sub);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
    }

    const [rows] = await pool.execute(
      `SELECT password_hash FROM users WHERE id = ?`,
      [req.user.sub]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match) return res.status(401).json({ error: 'Senha atual incorreta' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.execute(
      `UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`,
      [newHash, req.user.sub]
    );

    console.log('Senha alterada com sucesso');
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error('Erro ao alterar senha:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/* ===== Excluir conta ===== */
app.delete('/api/user/account', authenticateToken, async (req, res) => {
  const { password } = req.body;

  try {
    console.log('Excluindo conta para usuário ID:', req.user.sub);

    if (!password) return res.status(400).json({ error: 'Senha é obrigatória para excluir a conta' });

    const [rows] = await pool.execute(
      `SELECT password_hash FROM users WHERE id = ?`,
      [req.user.sub]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) return res.status(401).json({ error: 'Senha incorreta' });

    await pool.execute(`DELETE FROM users WHERE id = ?`, [req.user.sub]);

    console.log('Conta excluída com sucesso');
    res.json({ message: 'Conta excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir conta:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/* ===== DEBUG: Rota temporária para listar usuários ===== */
app.get('/debug/users', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, email, full_name, created_at FROM users LIMIT 10');
    res.json({ users: rows, total: rows.length });
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ===== Rota para migração da tabela (adicionar coluna profile_picture) ===== */
// Endpoint simples para migração (sem autenticação para facilitar)
app.get('/api/migrate-database', async (req, res) => {
  try {
    console.log('🔧 Iniciando migração da coluna profile_picture...');
    
    // Verifica se a coluna já existe
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'profile_picture'
    `, [process.env.DB_NAME]);
    
    if (columns.length > 0) {
      console.log('✅ Coluna profile_picture já existe');
      return res.json({ 
        success: true, 
        message: 'Coluna profile_picture já existe na tabela users',
        alreadyExists: true
      });
    }
    
    // Adiciona a coluna
    await pool.execute(`
      ALTER TABLE users 
      ADD COLUMN profile_picture VARCHAR(500) NULL AFTER password_hash
    `);
    
    console.log('✅ Coluna profile_picture adicionada com sucesso');
    
    res.json({ 
      success: true, 
      message: 'Coluna profile_picture adicionada com sucesso!',
      alreadyExists: false
    });
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/admin/migrate-profile-pictures', async (req, res) => {
  try {
    // Verifica se a coluna já existe
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'profile_picture'
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (columns.length === 0) {
      // Adiciona a coluna se não existir
      await pool.execute(`
        ALTER TABLE users 
        ADD COLUMN profile_picture VARCHAR(255) NULL 
        AFTER firebase_uid
      `);
      console.log('✅ Coluna profile_picture adicionada com sucesso');
      res.json({ success: true, message: 'Coluna profile_picture adicionada' });
    } else {
      res.json({ success: true, message: 'Coluna profile_picture já existe' });
    }
  } catch (err) {
    console.error('Erro na migração:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ===== Importação de CSV (recebe JSON com 'alunos' e 'salas' do frontend) ===== */
app.post('/api/admin/import', authenticateToken, async (req, res) => {
  // Apenas admins podem importar
  try {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' });

    const { alunos, salas } = req.body || {};
    if (!Array.isArray(alunos) || alunos.length === 0) {
      return res.status(400).json({ error: 'Campo "alunos" é obrigatório e deve ser um array não vazio' });
    }

    const conn = await pool.getConnection();
    let transactionStarted = false;
    try {
      // Criar tabelas necessárias se não existirem (versão resiliente)
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS classrooms (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(120) NOT NULL,
          turma VARCHAR(120) DEFAULT NULL,
          periodo VARCHAR(60) DEFAULT NULL,
          total_students INT DEFAULT 0,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await conn.execute(`
        CREATE TABLE IF NOT EXISTS students (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(150) NOT NULL,
          matricula VARCHAR(100) DEFAULT NULL,
          email VARCHAR(150) DEFAULT NULL,
          telefone VARCHAR(30) DEFAULT NULL,
          classroom_id BIGINT UNSIGNED DEFAULT NULL,
          foto VARCHAR(500) DEFAULT NULL,
          ativo TINYINT(1) DEFAULT 1,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_students_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await conn.beginTransaction();
      transactionStarted = true;

      // Inserir salas (ou reutilizar existentes)
      const salaIdMap = new Map(); // mapa: frontend sala.id -> db classroom.id
      if (Array.isArray(salas)) {
        for (const sala of salas) {
          const name = String(sala.nome || '').trim();
          if (!name) continue;

          // Verifica existência por nome + turma
          const [existing] = await conn.execute(
            'SELECT id FROM classrooms WHERE name = ? LIMIT 1',
            [name]
          );
          if (existing.length > 0) {
            salaIdMap.set(sala.id, existing[0].id);
          } else {
            const [result] = await conn.execute(
              'INSERT INTO classrooms (name, turma, periodo, total_students) VALUES (?, ?, ?, ?)',
              [name, sala.turma || null, sala.periodo || null, sala.totalAlunos || 0]
            );
            salaIdMap.set(sala.id, result.insertId);
          }
        }
      }

      // Inserir alunos
      let inserted = 0;
      for (const aluno of alunos) {
        if (!aluno || !aluno.nome) continue;
        const classroomDbId = salaIdMap.get(aluno.salaId) || null;
        await conn.execute(
          `INSERT INTO students (nome, matricula, email, telefone, classroom_id, foto, ativo)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            String(aluno.nome).trim(),
            aluno.matricula || null,
            aluno.email || null,
            aluno.telefone || null,
            classroomDbId,
            aluno.foto || null,
            aluno.ativo ? 1 : 0
          ]
        );
        inserted += 1;
      }

      // Atualiza contagem de alunos nas salas
      for (const [frontendId, dbId] of salaIdMap.entries()) {
        const [cntRows] = await conn.execute('SELECT COUNT(*) as cnt FROM students WHERE classroom_id = ?', [dbId]);
        const cnt = cntRows?.[0]?.cnt || 0;
        await conn.execute('UPDATE classrooms SET total_students = ? WHERE id = ?', [cnt, dbId]);
      }

      await conn.commit();
      transactionStarted = false;

      res.json({ success: true, inserted, classroomsImported: Array.from(salaIdMap.values()).length });
    } catch (err) {
      if (transactionStarted) {
        try { await conn.rollback(); } catch (e) {}
      }
      console.error('Erro na importação CSV:', err);
      res.status(500).json({ error: 'Falha ao importar dados: ' + err.message });
    } finally {
      if (conn) conn.release();
    }
  } catch (err) {
    console.error('Erro no endpoint de importação:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ===== Upload de foto de perfil ===== */
// 🔧 ALTERADO: resposta com cache-bust e deleção de arquivo anterior robusta
app.post('/api/user/profile-picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const userId = req.user.sub;
    const relPath = `/uploads/profile-pics/${req.file.filename}`;

    // Buscar foto antiga para deletar
    const [oldPictureRows] = await pool.execute(
      'SELECT profile_picture FROM users WHERE id = ?',
      [userId]
    );
    const oldPic = oldPictureRows?.[0]?.profile_picture || null;

    // Atualizar no banco
    await pool.execute(
      'UPDATE users SET profile_picture = ?, updated_at = NOW() WHERE id = ?',
      [relPath, userId]
    );

    // Deletar foto antiga se existir e não for externa
    if (oldPic && !oldPic.includes('googleusercontent.com')) {
      const rel = oldPic.startsWith('/') ? oldPic.slice(1) : oldPic; // 🔧 NOVO: remove / inicial
      const abs = path.join(process.cwd(), rel);
      // segurança: garante que está dentro da pasta de uploads de profile-pics
      if (abs.startsWith(uploadsDir) && fs.existsSync(abs)) {
        try { fs.unlinkSync(abs); } catch {}
      }
    }

    // 🔧 NOVO: retorna URL com versão para quebrar cache
    res.json({
      success: true,
      profilePictureUrl: `${relPath}?v=${Date.now()}`,
      message: 'Foto de perfil atualizada com sucesso'
    });

  } catch (err) {
    console.error('Erro no upload da foto:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🔧 NOVO: DELETE da foto de perfil (zera DB e apaga arquivo local)
app.delete('/api/user/profile-picture', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;

    const [rows] = await pool.execute(
      'SELECT profile_picture FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

    const current = rows[0]?.profile_picture || null;

    // Zera no banco
    await pool.execute(
      'UPDATE users SET profile_picture = NULL, updated_at = NOW() WHERE id = ?',
      [userId]
    );

    // Apaga arquivo físico se local
    if (current && !current.includes('googleusercontent.com')) {
      const rel = current.startsWith('/') ? current.slice(1) : current;
      const abs = path.join(process.cwd(), rel);
      if (abs.startsWith(uploadsDir) && fs.existsSync(abs)) {
        try { fs.unlinkSync(abs); } catch {}
      }
    }

    res.json({ success: true, profilePictureUrl: null, message: 'Foto de perfil removida' });
  } catch (err) {
    console.error('Erro ao remover foto:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


// 🔌 Rotas de reconhecimento e realtime
installFaceRoutes(app, pool);
installAttendanceRoutes(app, pool);
installRealtime(app, server, pool);

/* ===== Middlewares de erro e 404 ===== */
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.use((req, res) => {
  console.log('Rota não encontrada:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Rota não encontrada' });
});

/* ===== Sobe o servidor + ping no DB ===== */
server.listen(PORT, async () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
  console.log('📅 Iniciado em:', new Date().toLocaleString('pt-BR'));

  try {
    console.log('🔍 Testando conexão ao banco de dados...');
    console.log({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT 1 as ok');
      if (rows?.[0]?.ok === 1) {
        console.log('✅ Banco de dados conectado com sucesso!');
      } else {
        console.warn('⚠️ Banco respondeu, mas sem o resultado esperado (SELECT 1)');
      }
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco de dados');
    console.error('Código:', err?.code || '(sem código)');
    console.error('Mensagem:', err?.message || '(sem mensagem)');
    if (err?.sqlState) console.error('SQL State:', err.sqlState);
    console.error('Config usada:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });
    console.error('Sugestões: verifique as credenciais em backend/.env, permissões do usuário no MySQL, e se o servidor MySQL está acessível a partir deste host.');
  }
});

/* ===== Tratamento global de erros não capturados ===== */
process.on('uncaughtException', (err) => {
  console.error('Erro não capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Promise rejeitada não tratada:', err);
  process.exit(1);
});
