# 🔐 Secrets Management - Production Setup Guide

## Overview

El proyecto usa un sistema unificado de gestión de secretos con soporte para múltiples backends:
- **Local (.env)** - Desarrollo
- **AWS Secrets Manager** - Producción recomendado
- **HashiCorp Vault** - Enterprise
- **Azure Key Vault** - Azure cloud
- **Google Secret Manager** - GCP

## 🚀 Quick Start (Local Development)

Desarrollo usa archivos `.env.local` por defecto:

```bash
# Backend usa .env.local automáticamente
cd backend
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

**No se requiere configuración adicional para desarrollo.**

## ☁️ Production Setup

### Opción 1: AWS Secrets Manager (Recomendado)

#### 1. Instalar dependencias
```bash
cd backend
npm install @aws-sdk/client-secrets-manager
```

#### 2. Crear secreto en AWS
```bash
# Via AWS CLI
aws secretsmanager create-secret \
  --name Basileiás/production \
  --description "Basileiás production secrets" \
  --secret-string '{
    "JWT_SECRET_KEY": "your-jwt-secret-here",
    "MONGO_URL": "mongodb+srv://...",
    "GOOGLE_CLIENT_ID": "...",
    "GOOGLE_CLIENT_SECRET": "...",
    "EMAIL_PASSWORD": "...",
    "ENCRYPTION_KEY": "..."
  }' \
  --region us-east-1
```

O via AWS Console:
1. Go to **AWS Secrets Manager**
2. Create new secret → **Other type of secret**
3. Key/value pairs:
   - `JWT_SECRET_KEY`: (tu valor)
   - `MONGO_URL`: (tu valor)
   - etc.
4. Name: `Basileiás/production`
5. Region: `us-east-1` (o tu región)

#### 3. Configurar credenciales AWS

**Opción A: IAM Role (recomendado para EC2/ECS/Lambda)**
```bash
# No se requiere configuración, el rol IAM provee credenciales automáticas
# Asegúrate que el rol tenga el policy:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:Basileiás/production-*"
    }
  ]
}
```

**Opción B: Variables de entorno (para testing)**
```bash
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_REGION=us-east-1
```

#### 4. Configurar backend
```bash
# .env (en producción)
SECRETS_BACKEND=aws
AWS_REGION=us-east-1
AWS_SECRET_NAME=Basileiás/production
NODE_ENV=production
```

#### 5. Verificar
```bash
npm start
# Logs mostrarán: "✅ All required secrets validated"
```

---

### Opción 2: HashiCorp Vault (Enterprise)

#### 1. Instalar dependencias
```bash
npm install node-vault
```

#### 2. Configurar Vault
```bash
# Iniciar servidor Vault (desarrollo)
vault server -dev

# Escribir secretos
vault kv put secret/Basileiás/config \
  JWT_SECRET_KEY="..." \
  MONGO_URL="..." \
  GOOGLE_CLIENT_ID="..."
```

#### 3. Configurar backend
```bash
# .env
SECRETS_BACKEND=vault
VAULT_ADDR=https://vault.tu-empresa.com
VAULT_TOKEN=hvs.XXXXXXXXXXXXXXXXXXXXXX
VAULT_PATH=secret/Basileiás
NODE_ENV=production
```

---

### Opción 3: Azure Key Vault

#### 1. Instalar dependencias
```bash
npm install @azure/keyvault-secrets @azure/identity
```

#### 2. Crear Key Vault
```bash
# Via Azure CLI
az keyvault create \
  --name Basileiás-kv \
  --resource-group Basileiás-rg \
  --location eastus

# Agregar secretos
az keyvault secret set \
  --vault-name Basileiás-kv \
  --name JWT-SECRET-KEY \
  --value "tu-secret-aqui"
```

#### 3. Configurar backend
```bash
# .env
SECRETS_BACKEND=azure
AZURE_KEY_VAULT_NAME=Basileiás-kv
NODE_ENV=production
```

---

### Opción 4: Google Secret Manager

#### 1. Instalar dependencias
```bash
npm install @google-cloud/secret-manager
```

#### 2. Crear secretos
```bash
# Via gcloud CLI
gcloud secrets create JWT_SECRET_KEY \
  --data-file=/tmp/jwt-secret.txt \
  --project=Basileiás-prod

# Dar acceso a la service account
gcloud secrets add-iam-policy-binding JWT_SECRET_KEY \
  --member="serviceAccount:Basileiás@Basileiás-prod.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

#### 3. Configurar backend
```bash
# .env
SECRETS_BACKEND=gcp
GCP_PROJECT_ID=Basileiás-prod
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
NODE_ENV=production
```

---

## 🔑 Required Secrets

Estos secretos DEBEN existir o la app no arrancará:

```javascript
const REQUIRED_SECRETS = [
  'JWT_SECRET_KEY',        // Para autenticación JWT
  'MONGO_URL',             // Conexión MongoDB
  'GOOGLE_CLIENT_ID',      // OAuth2 Google
  'GOOGLE_CLIENT_SECRET',  // OAuth2 Google
  'EMAIL_PASSWORD',        // SMTP para emails
  'ENCRYPTION_KEY'         // Encriptar datos clínicos (HIPAA)
];
```

---

## 🔄 Secret Rotation

### Generar nuevos secretos

```bash
# JWT Secret (256 bits random)
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Encryption Key (256 bits hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Rotación en AWS Secrets Manager

```bash
# Actualizar secreto
aws secretsmanager update-secret \
  --secret-id Basileiás/production \
  --secret-string file://new-secrets.json

# O via AWS Console: Rotate secret immediately
```

### Política de rotación recomendada:
- **JWT_SECRET_KEY**: Cada 90 días
- **ENCRYPTION_KEY**: Cada 90 días (requiere re-encriptación de datos)
- **EMAIL_PASSWORD**: Cada 180 días
- **GOOGLE_CLIENT_SECRET**: Anual o cuando Google lo requiera

---

## 🧪 Testing

```bash
# Test local (usa .env.local)
SECRETS_BACKEND=local npm run start-dev

# Test AWS (requiere credenciales)
SECRETS_BACKEND=aws \
AWS_REGION=us-east-1 \
AWS_SECRET_NAME=Basileiás/production \
npm start
```

---

## 📊 Monitoring

El secrets manager expone endpoint de health:

```bash
GET /api/v1/health

Response:
{
  "secrets": {
    "backend": "aws",
    "cacheSize": 7,
    "requiredSecrets": 6,
    "allValid": true
  }
}
```

---

## 🚨 Security Best Practices

1. **NUNCA commitear .env.local** (ya está en .gitignore)
2. **Usar IAM roles** en producción (no access keys)
3. **Habilitar audit logging** en AWS/Vault/Azure
4. **Rotar secretos cada 90 días**
5. **Usar encryption at rest** (AWS KMS, Azure Key Vault)
6. **Restringir acceso por IP** si es posible
7. **Monitorear accesos** con CloudTrail/Azure Monitor
8. **Separar secretos por ambiente** (dev/staging/prod)

---

## 🐛 Troubleshooting

### Error: "Missing required secret: JWT_SECRET_KEY"
- Verifica que el secreto existe en el backend configurado
- Para AWS: `aws secretsmanager get-secret-value --secret-id Basileiás/production`
- Para local: verifica que `.env.local` contiene `JWT_SECRET_KEY=...`

### Error: "Cannot find module '@aws-sdk/client-secrets-manager'"
```bash
cd backend
npm install @aws-sdk/client-secrets-manager
```

### Error: "UnrecognizedClientException" (AWS)
- Credenciales AWS incorrectas o inexistentes
- Verifica: `aws sts get-caller-identity`
- Configura: `aws configure`

### Cache no se actualiza después de rotación
```bash
# Reiniciar backend o llamar endpoint de refresh
POST /api/v1/admin/secrets/refresh
```

---

## 📚 Resources

- [AWS Secrets Manager Docs](https://docs.aws.amazon.com/secretsmanager/)
- [HashiCorp Vault Docs](https://developer.hashicorp.com/vault/docs)
- [Azure Key Vault Docs](https://learn.microsoft.com/en-us/azure/key-vault/)
- [Google Secret Manager Docs](https://cloud.google.com/secret-manager/docs)

---

**Última actualización:** 24 de enero, 2026  
**Próximos pasos:** Implementar rotación automática de secretos
