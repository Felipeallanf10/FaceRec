// backend/src/server_realtime.mjs
import { Server as IOServer } from 'socket.io';

export function installRealtime(app, server, pool) {
  const io = new IOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] } // ajuste conforme seu front
  });

  // Guarda referência para emitir em outros handlers se necessário
  app.set('io', io);

  // Helpers simples
  async function ensureLessonForToday(classroom_code) {
    // 1) classroom
    const [cr] = await pool.execute(
      'SELECT id FROM classrooms WHERE code = ? LIMIT 1',
      [classroom_code]
    );
    if (cr.length === 0) throw new Error('classroom_not_found');
    const classroom_id = cr[0].id;

    // 2) lesson (uma por dia por sala)
    const [ls] = await pool.execute(
      `SELECT id FROM lessons WHERE classroom_id = ? AND date = CURDATE() LIMIT 1`,
      [classroom_id]
    );
    if (ls.length > 0) return { classroom_id, lesson_id: ls[0].id };

    const [ins] = await pool.execute(
      `INSERT INTO lessons (classroom_id, date, start_time) VALUES (?, CURDATE(), CURTIME())`,
      [classroom_id]
    );
    return { classroom_id, lesson_id: ins.insertId };
  }

  // Rotas utilitárias
  app.get('/api/classrooms/by-code/:code', async (req, res) => {
    try {
      const code = req.params.code;
      const [rows] = await pool.execute(
        `SELECT c.id AS classroom_id, c.code, u.id AS user_id, u.full_name, u.profile_picture
         FROM classrooms c
         JOIN enrollments e ON e.classroom_id = c.id
         JOIN users u ON u.id = e.user_id
         WHERE c.code = ?
         ORDER BY u.full_name`,
        [code]
      );
      const classroom_id = rows[0]?.classroom_id || null;
      const students = rows.map(r => ({
        user_id: r.user_id,
        full_name: r.full_name,
        profile_picture: r.profile_picture
      }));
      res.json({ classroom_id, code, students });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  app.get('/api/lessons/current', async (req, res) => {
    try {
      const code = req.query.classroom_code;
      const info = await ensureLessonForToday(code);
      res.json(info);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  app.get('/api/attendance/state', async (req, res) => {
    try {
      const lesson_id = req.query.lesson_id;
      const [rows] = await pool.execute(
        `SELECT ap.user_id, ap.first_seen_at, ap.last_seen_at, ap.confidence_avg
         FROM attendance_presence ap
         WHERE ap.lesson_id = ?`,
        [lesson_id]
      );
      res.json({ lesson_id, presence: rows });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  // Hook: quando o kit anterior recebe /api/attendance, consolidamos e emitimos.
  // Se você quiser fazer tudo aqui, pode duplicar a rota. Abaixo expomos um utilitário
  // que você pode chamar no handler já existente.
  app.post('/api/_internal/consolidate', async (req, res) => {
    try {
      const { user_id, confidence, classroom_code } = req.body || {};
      if (!user_id || !classroom_code) return res.status(400).json({ error: 'missing_fields' });

      const { lesson_id } = await ensureLessonForToday(classroom_code);

      // Upsert em attendance_presence
      await pool.execute(
        `INSERT INTO attendance_presence (lesson_id, user_id, first_seen_at, last_seen_at, confidence_avg, hits)
         VALUES (?, ?, NOW(), NOW(), ?, 1)
         ON DUPLICATE KEY UPDATE
           last_seen_at = NOW(),
           confidence_avg = (confidence_avg * hits + VALUES(confidence_avg)) / (hits + 1),
           hits = hits + 1`,
        [lesson_id, user_id, confidence ?? 0.0]
      );

      // Emite evento realtime
      io.emit('attendance:present', { lesson_id, user_id, confidence: confidence ?? null, ts: Date.now() });

      res.json({ ok: true, lesson_id });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  io.on('connection', (socket) => {
    // Você pode segmentar por sala (room) por turma, se quiser
    socket.on('join:classroom', (code) => {
      socket.join(`class:${code}`);
    });
  });
}
