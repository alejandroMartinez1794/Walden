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
  const cookieToken = req.cookies?.access_token;

  if (!authToken || !authToken.startsWith('Bearer ')) {
    if (!cookieToken) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }
  }

  try {
    const token = authToken?.startsWith('Bearer ') ? authToken.split(' ')[1] : cookieToken;
    const secretKey = process.env.JWT_SECRET_KEY;
    const decoded = jwt.verify(token, secretKey);

    // Seguridad Nivel Dios: Verificar que el usuario sigue existiendo en la DB
    // y no ha sido eliminado o baneado después de emitir el token.
    const userExists = await User.findById(decoded.id) || await Doctor.findById(decoded.id);

    if (!userExists) {
        return res.status(401).json({ success: false, message: 'Usuario ya no existe. Acceso denegado.' });
    }

    // Persistir información del usuario
    req.user = decoded; // Mantener payload del token para eficiencia
    req.userId = decoded.id;
    req.role = decoded.role;
    
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

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ success: false, message: 'You are not authorized' });
  }

  next();
};
