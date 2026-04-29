import { google } from 'googleapis';
import dotenv from 'dotenv';

// Mock process.env for the test if not loaded
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
// Use the exact value from Heroku config provided earlier
process.env.GOOGLE_REDIRECT_URI = 'https://basileia-api-86ca3e16b3ad.herokuapp.com/api/v1/calendar/google/callback';

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
];

const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
});

console.log('Generado Redirect URI:', process.env.GOOGLE_REDIRECT_URI);
console.log('Auth URL:', url);

// Decode the URL to verify the redirect_uri param
const urlObj = new URL(url);
console.log('Param redirect_uri:', urlObj.searchParams.get('redirect_uri'));
