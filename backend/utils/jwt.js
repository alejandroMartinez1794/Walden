import jwt from 'jsonwebtoken';

export const createJWT = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: '1d', // Puedes cambiar el tiempo de expiración si quieres
  });
};
