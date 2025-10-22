import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const normalizeLogin = (value) => String(value || '').trim().toLowerCase();

const DEFAULT_ADMIN_LOGIN_RAW = process.env.DEFAULT_ADMIN_LOGIN || '@administrador';
const DEFAULT_ADMIN_LOGIN = normalizeLogin(DEFAULT_ADMIN_LOGIN_RAW);
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || '@administrador';
const DEFAULT_ADMIN_ID = process.env.DEFAULT_ADMIN_ID || 'predefined-admin';
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || 'Administrador do Sistema';

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ msg: 'Usuário criado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro no registro' });
  }
};

export const login = async (req, res) => {
  const { email, login, password } = req.body || {};
  const identifierRaw = email ?? login ?? '';
  const trimmedIdentifier = String(identifierRaw || '').trim();
  const normalizedIdentifier = normalizeLogin(trimmedIdentifier);

  if (!normalizedIdentifier) {
    return res.status(400).json({ error: 'Informe o e-mail ou login' });
  }

  if (normalizedIdentifier === DEFAULT_ADMIN_LOGIN) {
    if (String(password || '') !== String(DEFAULT_ADMIN_PASSWORD)) {
      return res.status(400).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign({ sub: DEFAULT_ADMIN_ID, id: DEFAULT_ADMIN_ID, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({
      token,
      user: {
        id: DEFAULT_ADMIN_ID,
        email: DEFAULT_ADMIN_LOGIN_RAW,
        full_name: DEFAULT_ADMIN_NAME,
        role: 'admin',
      },
    });
  }

  try {
    const user = await User.findOne({ email: trimmedIdentifier });
    if (!user) return res.status(400).json({ error: 'Usuário não encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Senha incorreta' });

    const userId = user._id.toString();
    const tokenPayload = { sub: userId, id: userId };
    if (user.role) tokenPayload.role = user.role;

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        full_name: user.name,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no login' });
  }
};
