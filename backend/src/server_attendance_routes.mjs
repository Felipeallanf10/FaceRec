// backend/src/server_attendance_routes.mjs
import jwt from 'jsonwebtoken';

export function installFaceRoutes(app, pool) {
  // Retorna pessoas com foto de perfil para o serviço Python baixar
  app.get('/api/known-faces', async (req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT id, full_name AS name, profile_picture
        FROM users
        WHERE profile_picture IS NOT NULL AND profile_picture <> ''
      `);
      // Gera URL absoluta (backend já serve /uploads sem cache)
      const base = `${req.protocol}://${req.get('host')}`;
      const faces = rows.map(r => ({
        user_id: r.id,
        name: r.name,
        photo_url: r.profile_picture?.startsWith('http')
          ? r.profile_picture
          : `${base}${r.profile_picture.startsWith('/') ? '' : '/'}${r.profile_picture}`
      }));
      res.json({ faces });
    } catch (err) {
      console.error('known-faces error', err);
      res.status(500).json({ error: 'internal_error' });
    }
  });
}

export function installAttendanceRoutes(app, pool) {
  // Protegido por API key simples (dispositivo/serviço Python)
  app.post('/api/attendance', async (req, res) => {
    try {
      const apiKey = req.get('X-API-Key') || '';
      if (!process.env.API_KEY || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'unauthorized' });
      }

      const { user_id, confidence, device_label } = req.body || {};
      if (!user_id) return res.status(400).json({ error: 'user_id required' });

      // Gravamos um "debounce" de 1 minuto no próprio SQL
      await pool.execute(
        `INSERT INTO attendance_logs (user_id, confidence, device_label, captured_at)
         SELECT ?, ?, ?, NOW()
         FROM DUAL
         WHERE NOT EXISTS (
           SELECT 1 FROM attendance_logs
           WHERE user_id = ? AND captured_at >= (NOW() - INTERVAL 1 MINUTE)
         )`,
        [user_id, confidence ?? null, device_label ?? null, user_id]
      );

      res.json({ ok: true });
    } catch (err) {
      console.error('attendance error', err);
      res.status(500).json({ error: 'internal_error' });
    }
  });
}
