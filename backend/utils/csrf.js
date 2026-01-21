// backend/utils/csrf.js
import crypto from 'crypto';

export const createCsrfToken = () => crypto.randomBytes(32).toString('hex');

export const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    sameSite: 'strict',
    secure: isProd,
  };
};

export const setCsrfCookie = (res, token) => {
  const options = getCookieOptions();
  res.cookie('csrf_token', token, { ...options, httpOnly: false });
};

export const verifyCsrf = (req, res, next) => {
  const csrfCookie = req.cookies?.csrf_token;
  const csrfHeader = req.headers['x-csrf-token'];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ message: 'CSRF token inválido' });
  }

  return next();
};