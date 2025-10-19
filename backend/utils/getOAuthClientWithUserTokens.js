// backend/utils/getOAuthClientWithUserTokens.js
import { google } from 'googleapis';
import GoogleToken from '../Models/GoogleTokenSchema.js';
import oAuth2Client from '../config/google.js';

/**
 * Obtiene un cliente OAuth2 autenticado con los tokens del usuario desde MongoDB
 * @param {string} userId - ID del usuario
 * @returns {oAuth2Client} - Cliente autenticado listo para usar con APIs de Google
 * @throws {Error} - Si no se encuentran los tokens o falla la configuración
 */
export const getOAuthClientWithUserTokens = async (userId) => {
  // Buscar los tokens en la base de datos
  const tokenDoc = await GoogleToken.findOne({ userId });

  // Agregar un console.log para verificar si se encontraron los tokens
  console.log("🔍 Token encontrado para el usuario:", userId, tokenDoc);

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

  // Devolver el cliente configurado
  return client;
};