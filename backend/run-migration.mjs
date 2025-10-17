import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

(async () => {
  try {
    const required = ['DB_HOST', 'DB_USER', 'DB_NAME'];
    const missing = required.filter((key) => !process.env[key] || !process.env[key].trim());
    if (missing.length > 0) {
      throw new Error(`Variáveis de ambiente faltando: ${missing.join(', ')}`);
    }

    const sqlPath = path.resolve(__dirname, 'sql', '001_init_schema.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      multipleStatements: true,
    });

    console.log(`🚀 Executando migração em ${process.env.DB_NAME} usando ${sqlPath}`);
    await connection.query(sqlContent);
    await connection.end();
    console.log('✅ Migração executada com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao executar migração:', err.message);
    process.exitCode = 1;
  }
})();
