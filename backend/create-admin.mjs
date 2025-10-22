import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const defaultAdmin = {
  fullName: 'Administrador FaceRec',
  email: process.env.DEFAULT_ADMIN_LOGIN || '@administrador',
  password: process.env.DEFAULT_ADMIN_PASSWORD || '@administrador',
};

async function main() {
  const fullName = process.env.ADMIN_NAME || defaultAdmin.fullName;
  const emailRaw = process.env.ADMIN_EMAIL || defaultAdmin.email;
  const email = String(emailRaw || '').trim().toLowerCase();
  const passwordRaw = process.env.ADMIN_PASSWORD || defaultAdmin.password;

  if (!email || !passwordRaw) {
    throw new Error('ADMIN_EMAIL e ADMIN_PASSWORD precisam estar definidos ou usar os padrões.');
  }

  const hash = await bcrypt.hash(passwordRaw, 10);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  });

  try {
    const [rows] = await connection.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length > 0) {
      const userId = rows[0].id;
      await connection.execute(
        `UPDATE users
         SET full_name = ?, password_hash = ?, role = 'admin', subject = NULL, school = NULL, updated_at = NOW()
         WHERE id = ?`,
        [fullName, hash, userId]
      );
      console.log(`✅ Usuário admin atualizado (ID ${userId}).`);
    } else {
      const [result] = await connection.execute(
        `INSERT INTO users (full_name, email, password_hash, role, subject, school)
         VALUES (?, ?, ?, 'admin', NULL, NULL)`,
        [fullName, email, hash]
      );
      console.log(`✅ Usuário admin criado (ID ${result.insertId}).`);
    }
  } finally {
    await connection.end();
  }

  console.log('ℹ️  Credenciais padrão:');
  console.log(`   Email: ${email}`);
  console.log(`   Senha: ${passwordRaw}`);
}

main().catch((err) => {
  console.error('❌ Erro ao criar/atualizar admin:', err.message);
  process.exitCode = 1;
});
