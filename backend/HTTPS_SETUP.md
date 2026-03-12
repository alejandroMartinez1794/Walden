# 🔒 HTTPS/TLS Setup Guide

## Overview

Este documento describe cómo configurar HTTPS/TLS para el backend de Basileiás en desarrollo y producción.

## 📋 Table of Contents

1. [Development Setup (Self-Signed)](#development-setup)
2. [Production Setup (Let's Encrypt)](#production-setup)
3. [Production Setup (Custom Certificates)](#custom-certificates)
4. [Nginx Reverse Proxy](#nginx-setup)
5. [Testing HTTPS](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 🛠️ Development Setup (Self-Signed Certificates)

### 1. Generate Self-Signed Certificates

```bash
cd backend
npm install node-forge
npm run generate-certs
```

Este script genera:
- `backend/certs/dev-cert.pem` - Certificado público
- `backend/certs/dev-key.pem` - Clave privada

**⚠️ Estos certificados son auto-firmados y solo para desarrollo.**

### 2. Start Backend with HTTPS

```bash
# Opción A: Usar script npm
npm run start-https

# Opción B: Variable de entorno
USE_HTTPS=true npm run start-dev
```

### 3. Access Backend

```
https://localhost:8000
```

**Nota:** El navegador mostrará advertencia de seguridad. Esto es normal con certificados auto-firmados. Haz clic en "Avanzado" → "Continuar a localhost".

### 4. Trust Certificate (Opcional)

Para eliminar la advertencia del navegador:

**Windows:**
1. Abrir `backend/certs/dev-cert.pem`
2. Instalar certificado → Máquina local
3. Colocar en "Entidades de certificación raíz de confianza"

**macOS:**
```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain backend/certs/dev-cert.pem
```

**Linux:**
```bash
sudo cp backend/certs/dev-cert.pem /usr/local/share/ca-certificates/Basileiás-dev.crt
sudo update-ca-certificates
```

---

## ☁️ Production Setup (Let's Encrypt)

Let's Encrypt es **gratis, automático y renovable**. Recomendado para producción.

### Prerequisites

- Dominio registrado (ej: `api.Basileiás.com`)
- Servidor con IP pública
- Puerto 80 y 443 abiertos

### Opción A: Certbot + Nginx (Recomendado)

#### 1. Install Certbot

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### 2. Obtain Certificate

```bash
sudo certbot --nginx -d api.Basileiás.com
```

Certbot automáticamente:
- Obtiene certificado de Let's Encrypt
- Configura Nginx
- Configura renovación automática

#### 3. Verify Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Check timer (systemd)
sudo systemctl status certbot.timer
```

Certificados se renuevan automáticamente cada 60 días.

### Opción B: Certbot Standalone (Sin Nginx)

Si vas a usar Node.js directamente (sin reverse proxy):

```bash
# Stop backend temporarily
sudo systemctl stop Basileiás-backend

# Obtain certificate (standalone)
sudo certbot certonly --standalone -d api.Basileiás.com

# Start backend
sudo systemctl start Basileiás-backend
```

Certificados se guardan en:
```
/etc/letsencrypt/live/api.Basileiás.com/
├── fullchain.pem  (certificado completo)
├── privkey.pem    (clave privada)
├── chain.pem      (CA chain)
└── cert.pem       (certificado solo)
```

#### Configure Backend

```bash
# .env (producción)
NODE_ENV=production
USE_HTTPS=true
SSL_CERT_PATH=/etc/letsencrypt/live
DOMAIN=api.Basileiás.com
PORT=443
```

#### Setup Renewal Hook

```bash
sudo nano /etc/letsencrypt/renewal-hooks/post/restart-backend.sh
```

```bash
#!/bin/bash
systemctl restart Basileiás-backend
```

```bash
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/restart-backend.sh
```

### Opción C: Certbot DNS Challenge (Wildcards)

Para obtener certificado wildcard (`*.Basileiás.com`):

```bash
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/cloudflare.ini \
  -d Basileiás.com \
  -d *.Basileiás.com
```

---

## 🔐 Production Setup (Custom Certificates)

Si tienes certificados comerciales (DigiCert, Comodo, etc.):

### 1. Place Certificates

```bash
mkdir -p backend/certs
chmod 700 backend/certs

# Copy files
cp /path/to/server.key backend/certs/server.key
cp /path/to/server.crt backend/certs/server.crt
cp /path/to/ca-bundle.crt backend/certs/ca.crt  # Optional

# Secure permissions
chmod 600 backend/certs/server.key
chmod 644 backend/certs/server.crt
```

### 2. Configure Backend

```bash
# .env (producción)
NODE_ENV=production
USE_HTTPS=true
SSL_CERT_PATH=./certs
PORT=443
```

---

## 🌐 Nginx Reverse Proxy Setup (Recommended)

Nginx como reverse proxy es la configuración **más robusta para producción**.

### Why Nginx?

- ✅ Manejo de HTTPS más eficiente que Node.js
- ✅ HTTP/2 support
- ✅ Static file serving
- ✅ Load balancing
- ✅ Rate limiting a nivel de red
- ✅ Zero-downtime deployments

### 1. Install Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 2. Configure Nginx

```bash
# Copy template
sudo cp backend/config/nginx.conf /etc/nginx/sites-available/Basileiás

# Create symlink
sudo ln -s /etc/nginx/sites-available/Basileiás /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default
```

### 3. Edit Configuration

```bash
sudo nano /etc/nginx/sites-available/Basileiás
```

Cambiar:
- `server_name api.Basileiás.com` → Tu dominio
- Rutas de certificados SSL
- Upstream servers si usas múltiples instancias

### 4. Test & Reload

```bash
# Test syntax
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

### 5. Configure Backend

Con Nginx, el backend corre en HTTP (Nginx maneja HTTPS):

```bash
# .env (producción con Nginx)
NODE_ENV=production
USE_HTTPS=false  # Nginx maneja SSL
PORT=8000
TRUST_PROXY=true  # Confiar en headers X-Forwarded-*
```

### 6. Setup Systemd Service

```bash
sudo nano /etc/systemd/system/Basileiás-backend.service
```

```ini
[Unit]
Description=Basileiás Backend API
After=network.target mongodb.service

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/Basileiás/backend
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=Basileiás

# Environment
Environment=NODE_ENV=production
EnvironmentFile=/opt/Basileiás/backend/.env

[Install]
WantedBy=multi-user.target
```

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable Basileiás-backend

# Start service
sudo systemctl start Basileiás-backend

# Check status
sudo systemctl status Basileiás-backend

# View logs
sudo journalctl -u Basileiás-backend -f
```

---

## 🧪 Testing HTTPS

### Test Certificate

```bash
# Test SSL/TLS configuration
curl -I https://api.Basileiás.com

# Check certificate details
openssl s_client -connect api.Basileiás.com:443 -servername api.Basileiás.com

# Test with SSL Labs (online)
# https://www.ssllabs.com/ssltest/analyze.html?d=api.Basileiás.com
```

### Test Security Headers

```bash
curl -I https://api.Basileiás.com/api/v1/health
```

Verificar headers:
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Test Backend Health

```bash
# Health check
curl https://api.Basileiás.com/api/v1/health

# Test API endpoint
curl -X POST https://api.Basileiás.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

---

## 🐛 Troubleshooting

### Error: "Certificate not found"

**Causa:** Certificados no existen en la ruta configurada.

**Solución:**
```bash
# Verificar rutas
ls -la /etc/letsencrypt/live/api.Basileiás.com/
ls -la backend/certs/

# Regenerar certificados de desarrollo
npm run generate-certs
```

### Error: "EACCES: permission denied"

**Causa:** Node.js no puede leer certificados o bind puerto 443.

**Solución:**
```bash
# Opción A: Dar permisos a Node
sudo setcap 'cap_net_bind_service=+ep' $(which node)

# Opción B: Usar puerto >1024 y redirect con iptables
sudo iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 8443

# Opción C: Usar Nginx (recomendado)
```

### Error: "SSL_ERROR_RX_RECORD_TOO_LONG"

**Causa:** Backend está en HTTP pero navegador intenta HTTPS.

**Solución:**
```bash
# Verificar que USE_HTTPS=true en .env
echo $USE_HTTPS

# Reiniciar backend
npm restart
```

### Certificate Expired

**Causa:** Let's Encrypt certificados expiran cada 90 días.

**Solución:**
```bash
# Renovar manualmente
sudo certbot renew

# Verificar auto-renewal
sudo certbot renew --dry-run
sudo systemctl status certbot.timer
```

### Browser Shows "Not Secure"

**Causa:** Certificado auto-firmado (desarrollo) o chain incompleto.

**Solución:**
```bash
# Desarrollo: Normal, ignorar o instalar cert en OS
# Producción: Verificar fullchain.pem incluye intermediate certs

openssl s_client -connect api.Basileiás.com:443 -showcerts
```

### Nginx 502 Bad Gateway

**Causa:** Backend no responde o no está corriendo.

**Solución:**
```bash
# Verificar backend
curl http://localhost:8000/api/v1/health

# Ver logs
sudo journalctl -u Basileiás-backend -n 50

# Reiniciar
sudo systemctl restart Basileiás-backend
```

---

## 📊 Monitoring SSL Certificates

### Manual Check

```bash
# Check expiration
echo | openssl s_client -connect api.Basileiás.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Automated Monitoring

**Opción A: Cron + Email**
```bash
# Check daily and email if <30 days
0 0 * * * /usr/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

**Opción B: Monitoring service**
- Uptime Robot (free)
- SSL Labs Monitoring
- Datadog / New Relic

---

## 🔐 Security Best Practices

1. **Always use HTTPS in production** - No exceptions
2. **Use Let's Encrypt** - Free, automatic, trusted
3. **Enable HSTS** - Force HTTPS for 1 year minimum
4. **TLS 1.3 only** - Disable older versions
5. **Strong ciphers** - Use Mozilla Modern config
6. **Certificate pinning** - For mobile apps (opcional)
7. **Monitor expiration** - Automated alerts
8. **Private key security** - chmod 600, never commit
9. **Regular updates** - Keep Nginx/OpenSSL updated
10. **Test regularly** - SSL Labs, SecurityHeaders.com

---

## 📚 Resources

- [Let's Encrypt Docs](https://letsencrypt.org/docs/)
- [Mozilla SSL Configuration](https://ssl-config.mozilla.org/)
- [Nginx HTTPS Guide](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [SecurityHeaders.com](https://securityheaders.com/)

---

**Last Updated:** January 24, 2026  
**Next Review:** Configure HTTPS in production environment
