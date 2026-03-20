// backend/utils/getOAuthClientWithUserTokens.js
import { google } from 'googleapis';
import GoogleToken from '../models/GoogleTokenSchema.js';
import oAuth2Client from '../config/google.js';
import logger from './logger.js';

/**
 * Obtiene un cliente OAuth2 autenticado con los tokens del usuario desde MongoDB
 * @param {string} userId - ID del usuario
 * @returns {oAuth2Client} - Cliente autenticado listo para usar con APIs de Google
 * @throws {Error} - Si no se encuentran los tokens o falla la configuración
 */
export const getOAuthClientWithUserTokens = async (userId) => {
  // Buscar los tokens en la base de datos
  const tokenDoc = await GoogleToken.findOne({ userId });

  // Registro seguro: solo indicamos si se encontró el token, SIN exponer su contenido
  logger.info(`🔍 Búsqueda de token de Google para usuario ${userId}: ${tokenDoc ? 'Encontrado' : 'No encontrado'}`);

  if (!tokenDoc) {
    throw new Error('❌ No se encontraron tokens de Google para este usuario');
  }

  // Crear el cliente OAuth2
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Configurar el cliente con los tokens del usuario
  client.setCredentials({
    access_token: tokenDoc.access_token,
    refresh_token: tokenDoc.refresh_token,
    scope: tokenDoc.scope,
    token_type: tokenDoc.token_type,
    expiry_date: tokenDoc.expiry_date,
  });

  // Persistir automáticamente tokens refrescados
  client.on('tokens', async (tokens) => {
    try {
      const update = {};
      if (tokens.access_token) update.access_token = tokens.access_token;
      if (tokens.refresh_token) update.refresh_token = tokens.refresh_token;
      if (tokens.expiry_date) update.expiry_date = tokens.expiry_date;
      if (Object.keys(update).length > 0) {
        await GoogleToken.findOneAndUpdate(
          { userId },
          { $set: update },
          { new: true, upsert: true }
        );
        logger.info('🔄 Tokens de Google actualizados para usuario', userId);
      }
    } catch (e) {
      logger.warn('⚠️ No se pudo persistir el refresh de tokens:', e.message);
    }
  });

  // Forzar verificación/refresh si es necesario
  try {
    await client.getAccessToken();
  } catch (e) {
    logger.warn('⚠️ No se pudo obtener access token inmediato, continuará en primera llamada:', e.message);
  }

  // Devolver el cliente configurado
  return client;
};