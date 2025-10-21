// backend/config/google.js

import { google } from 'googleapis';
import dotenv from 'dotenv';
import GoogleToken from '../Models/GoogleTokenSchema.js'; // Usamos el modelo que ya tienes

dotenv.config();

// Crear cliente OAuth2 con las credenciales de Google
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Función para cargar el token de un usuario (por ahora cargamos uno general)
const loadSavedToken = async () => {
  try {
    // Aquí se puede mejorar para filtrar por `userId` si lo tienes
    const tokenDoc = await GoogleToken.findOne(); // Mejora: usar .findOne({ userId: ... }) cuando lo integres a usuarios

    if (tokenDoc) {
      oAuth2Client.setCredentials({
        access_token: tokenDoc.access_token,
        refresh_token: tokenDoc.refresh_token,
        scope: tokenDoc.scope,
        token_type: tokenDoc.token_type,
        expiry_date: tokenDoc.expiry_date,
      });
      console.log('✅ Token de Google cargado desde MongoDB');
    } else {
      console.warn('⚠️ No hay token guardado, primero debes autenticar vía Google');
    }
  } catch (err) {
    console.error('❌ Error al cargar el token de Google:', err);
  }
};

// Llamamos automáticamente al importar
loadSavedToken();

export default oAuth2Client;
