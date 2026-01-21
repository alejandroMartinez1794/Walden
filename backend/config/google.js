// backend/config/google.js

import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import GoogleToken from '../models/GoogleTokenSchema.js'; // Usamos el modelo que ya tienes

// Asegura que las credenciales reales se carguen aun cuando este módulo se importe
// antes que index.js configure dotenv.
const envFile = fs.existsSync('.env.local') ? '.env.local' : '.env';
dotenv.config({ path: envFile, override: false });

// Crear cliente OAuth2 con las credenciales de Google
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Función para cargar el token - SE EJECUTA SOLO CUANDO SE NECESITA (lazy)
const loadSavedToken = async () => {
  try {
    const tokenDoc = await GoogleToken.findOne().maxTimeMS(2000).lean();
    if (tokenDoc) {
      oAuth2Client.setCredentials({
        access_token: tokenDoc.access_token,
        refresh_token: tokenDoc.refresh_token,
        scope: tokenDoc.scope,
        token_type: tokenDoc.token_type,
        expiry_date: tokenDoc.expiry_date,
      });
    }
  } catch (err) {
    // Silencioso - el token se cargará cuando haga falta
  }
};

// LAZY LOADING: No se ejecuta al importar, solo cuando se usa Google Calendar
// Los endpoints de calendar llamarán esto cuando sea necesario

export { loadSavedToken };
export default oAuth2Client;
