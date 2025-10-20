// frontend/LiveAttendance.jsx
import React, { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';
import api, { apiOrigin, buildUploadsUrl } from '@/lib/api';

const SOCKET_BASE = import.meta.env.VITE_SOCKET_BASE || apiOrigin || (typeof window !== 'undefined' ? window.location.origin : '');
const CLASSROOM_CODE = import.meta.env.VITE_CLASSROOM_CODE || '3AT.I';
const CAM_STREAM = import.meta.env.VITE_CAM_STREAM_URL || 'http://localhost:8080/stream';

export default function LiveAttendance() {
  const [students, setStudents] = useState([]);
  const [presentIds, setPresentIds] = useState(new Set());
  const [lessonId, setLessonId] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: classroom } = await api.get(`/classrooms/by-code/${encodeURIComponent(CLASSROOM_CODE)}`);
        if (!mounted) return;
        const normalizedStudents = (classroom.students || []).map((student) => ({
          ...student,
          profile_picture: buildUploadsUrl(student.profile_picture),
        }));
        setStudents(normalizedStudents);

        const { data: lesson } = await api.get('/lessons/current', {
          params: { classroom_code: CLASSROOM_CODE },
        });
        if (!mounted) return;
        setLessonId(lesson.lesson_id);

        if (!lesson.lesson_id) return;
        const { data: snapshot } = await api.get('/attendance/state', {
          params: { lesson_id: lesson.lesson_id },
        });
        if (!mounted) return;
        setPresentIds(new Set((snapshot.presence || []).map((entry) => entry.user_id)));
      } catch (error) {
        const message = error.response?.data?.error || error.message;
        console.error('Erro ao buscar dados de presença ao vivo:', message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_BASE, { transports: ['websocket'] });
    socket.on('connect', () => {
      // se no futuro segmentar por sala:
      // socket.emit('join:classroom', CLASSROOM_CODE);
    });
    socket.on('attendance:present', (evt) => {
      // evt = { lesson_id, user_id, confidence, ts }
      setPresentIds(prev => {
        const n = new Set(prev);
        n.add(evt.user_id);
        return n;
      });
    });
    return () => socket.disconnect();
  }, []);

  const present = useMemo(() => students.filter(s => presentIds.has(s.user_id)), [students, presentIds]);
  const absent  = useMemo(() => students.filter(s => !presentIds.has(s.user_id)), [students, presentIds]);

  return (
    <div className="p-4 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 rounded-2xl shadow p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">3AT.I — Presença ao vivo</h2>
          <div className="text-sm opacity-70">{present.length}/{students.length} presentes</div>
        </div>
        {/* Stream MJPEG (ESP32) */}
        <div className="overflow-hidden rounded-xl border">
          <img src={CAM_STREAM} alt="Transmissão ao vivo" className="w-full object-contain" />
        </div>
      </div>

      <div className="rounded-2xl shadow p-3">
        <h3 className="font-semibold mb-2">Presentes ({present.length})</h3>
        <ul className="space-y-1 max-h-60 overflow-auto pr-1">
          {present.map(s => (
            <li key={s.user_id} className="flex items-center gap-2">
              {s.profile_picture && <img src={s.profile_picture} className="h-6 w-6 rounded-full object-cover" />}
              <span>{s.full_name}</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100">Presente</span>
            </li>
          ))}
          {present.length === 0 && <div className="text-sm opacity-60">Ainda ninguém marcado</div>}
        </ul>

        <h3 className="font-semibold mt-4 mb-2">Faltantes ({absent.length})</h3>
        <ul className="space-y-1 max-h-60 overflow-auto pr-1">
          {absent.map(s => (
            <li key={s.user_id} className="flex items-center gap-2">
              {s.profile_picture && <img src={s.profile_picture} className="h-6 w-6 rounded-full object-cover" />}
              <span>{s.full_name}</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-100">Sem detecção</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
