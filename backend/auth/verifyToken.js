// backend/auth/verifyToken.js
import jwt from 'jsonwebtoken';
import Doctor from '../models/DoctorSchema.js';
import User from '../models/UserSchema.js';
import { isTokenBlacklisted } from '../services/tokenBlacklist.js';

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
  const cookieToken = req.cookies?.access_token;

  if (!authToken || !authToken.startsWith('Bearer ')) {
    if (!cookieToken) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }
  }

  try {
    const token = authToken?.startsWith('Bearer ') ? authToken.split(' ')[1] : cookieToken;
    const secretKey = process.env.JWT_SECRET_KEY;
    
    // 🔒 SEGURIDAD: Verificar si el token está en blacklist (logout, password change, etc.)
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token has been revoked. Please login again.' 
      });
    }
    
    const decoded = jwt.verify(token, secretKey);

    // Seguridad Nivel Dios: Verificar que el usuario sigue existiendo en la DB
    // y no ha sido eliminado o baneado después de emitir el token.
    const userExists = await User.findById(decoded.id) || await Doctor.findById(decoded.id);

    if (!userExists) {
        return res.status(401).json({ success: false, message: 'Usuario ya no existe. Acceso denegado.' });
    }

    // Persistir información del usuario (enriquecer con email de DB)
    req.user = {
      ...decoded,
      email: userExists.email  // ✅ Agregar email para audit logs
    };
    req.userId = decoded.id;
    req.role = decoded.role;
    
    // Guardar el token para posible blacklisting posterior
    req.token = token;
    
    // Opcional: Pasar el objeto de usuario actualizado si se requiere información fresca
    // req.currentUser = userExists; 

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

  // 👑 SUPER ADMIN: El rol 'admin' tiene acceso a TODAS las rutas automáticamente
  if (userRole === 'admin') {
    return next();
  }

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ success: false, message: 'You are not authorized' });
  }

  next();
};
