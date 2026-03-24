const https = require('https');

https.get('https://basileia-api-86ca3e16b3ad.herokuapp.com/api/v1/calendar/google-auth', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
}).on('error', (e) => {
  console.error(e);
});