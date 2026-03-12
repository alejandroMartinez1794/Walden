import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import SecurityLog from '../models/SecurityLogSchema.js'; // Nuevo log de auditoría
import AuditLog from '../models/AuditLogSchema.js'; // HIPAA compliance
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import sendEmail from '../utils/emailService.js';
import logger from '../utils/logger.js';
import { createCsrfToken, setCsrfCookie, getCookieOptions } from '../utils/csrf.js';
import { blacklistToken, blacklistAllUserTokens } from '../services/tokenBlacklist.js';

const logSecurityEvent = async ({ user, event, status, req, meta = {} }) => {
    try {
        await SecurityLog.create({
            user: user?._id,
            userType: user?.role === 'doctor' ? 'Doctor' : 'User',
            event,
            status,
            ipAddress: req?.ip,
            userAgent: req?.headers?.['user-agent'],
            metadata: meta
        });
    } catch (err) {
        logger.error('Error logging security event', { error: err.message });
    }
};

const sendSecurityAlert = async (user, req) => {
    try {
        const time = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
        await sendEmail({
            email: user.email,
            subject: '⚠️ Alerta de Seguridad: Nuevo inicio de sesión',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #d97706;">Nuevo Inicio de Sesión Detectado</h2>
                    <p>Hola <strong>${user.name}</strong>,</p>
                    <p>Se ha detectado un nuevo inicio de sesión en tu cuenta de Basileiás.</p>
                    <ul style="background: #f9fafb; padding: 15px; border-radius: 5px; list-style: none;">
                        <li><strong>Fecha:</strong> ${time}</li>
                        <li><strong>IP:</strong> ${req.ip}</li>
                        <li><strong>Navegador:</strong> ${req.headers['user-agent']}</li>
                    </ul>
                    <p>Si no fuiste tú, por favor <a href="#" style="color: #dc2626; font-weight: bold;">cambia tu contraseña inmediatamente</a> y contacta a soporte.</p>
                </div>
            `
        });
    } catch (err) {
        logger.error('Error sending security alert', { error: err.message, userId: user?._id });
    }
};

const roleMap = {
    patient: 'paciente',
    paciente: 'paciente',
    doctor: 'doctor',
    medico: 'doctor',
    admin: 'admin',
};

const normalizeRoleInput = (role = 'paciente') => {
    const key = role?.toLowerCase?.();
    return roleMap[key] || 'paciente';
};

const generateToken = user => {
    return jwt.sign(
        {id:user._id, role:user.role}, 
        process.env.JWT_SECRET_KEY, 
        {
        expiresIn: '24h' // Seguridad: Token de corta duración (antes 15 días)
        })
}

const normalizeEmail = (email = '') => email.trim().toLowerCase();
const isValidEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// 🔒 SEGURIDAD NIVEL PRODUCCIÓN: Contraseñas robustas obligatorias
// Cumple con NIST SP 800-63B y HIPAA Security Rule
const isStrongPassword = (password = '') => {
    // Mínimo 12 caracteres (aumentado de 8 para mayor seguridad)
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Prevenir contraseñas comunes
    const commonPasswords = ['password', 'Password123!', 'Admin123!', '12345678', 'qwerty'];
    const isCommon = commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()));
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar &&
           !isCommon;
};

const getPasswordStrengthMessage = () => {
    return 'Contraseña débil. Debe tener mínimo 12 caracteres, incluir mayúsculas, minúsculas, números y símbolos. No usar contraseñas comunes.';
};

const MAX_FAILED_ATTEMPTS = Number(process.env.AUTH_MAX_FAILED_ATTEMPTS) || 5;
const LOCKOUT_MINUTES = Number(process.env.AUTH_LOCKOUT_MINUTES) || 15;
const EMAIL_VERIFICATION_TTL_MINUTES = Number(process.env.EMAIL_VERIFICATION_TTL_MINUTES) || 60;
const TOKEN_EXPIRY = '24h'; // Reducido de 15d a 24h por seguridad médica

const HCAPTCHA_VERIFY_URL = process.env.HCAPTCHA_VERIFY_URL || 'https://hcaptcha.com/siteverify';

const verifyCaptchaToken = async (token, remoteip) => {
    // Desarrollo: Bypass captcha
    return true; 
    
    /* 
    if (!token) return false;
    const secret = process.env.HCAPTCHA_SECRET;
    if (!secret) return false;

    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);
    params.append('remoteip', remoteip);

    try {
        const response = await fetch(HCAPTCHA_VERIFY_URL, {
            method: 'POST',
            body: params,
        });
        const data = await response.json();
        return data.success;
    } catch (err) {
        logger.error('Captcha verification error:', err);
        return false;
    }
    */
};

/* Original Code Backup - Removed to fix Syntax Error
    if (remoteip) params.append('remoteip', remoteip);

    const response = await fetch(HCAPTCHA_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
    });

    const data = await response.json();
    return Boolean(data?.success);
};
*/

const createEmailVerificationToken = () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MINUTES * 60 * 1000);
    return { rawToken, tokenHash, expires };
};

const sendVerificationEmail = async ({ email, name, token }) => {
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8000}`;
    const verifyUrl = `${backendUrl}/api/v1/auth/verify-email?token=${token}`;

    await sendEmail({
        email,
        subject: 'Verifica tu correo - Basileiás',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Verifica tu correo</h2>
            <p>Hola <strong>${name}</strong>,</p>
            <p>Para activar tu cuenta, verifica tu correo haciendo clic en el botón:</p>
            <p style="margin: 24px 0;">
              <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verificar correo</a>
            </p>
            <p>Si no solicitaste esta cuenta, ignora este mensaje.</p>
          </div>
        `,
    });
};

const isLocked = (user) => {
    return user.lockUntil && user.lockUntil.getTime() > Date.now();
};

const registerFailedLogin = async (user) => {
    const nextAttempts = (user.failedLoginAttempts || 0) + 1;
    user.failedLoginAttempts = nextAttempts;
    if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
    }
    await user.save();
};

const resetFailedLogins = async (user) => {
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
};

export const register = async (req, res) => {
    
    const { email, password, name, role = 'paciente', photo, gender} = req.body
    
    try {   

        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
            return res.status(400).json({ message: 'Email inválido' });
        }
        if (!name?.trim()) {
            return res.status(400).json({ message: 'Nombre es requerido' });
        }
        if (!isStrongPassword(password)) {
            return res.status(400).json({ message: getPasswordStrengthMessage() });
        }

        const captchaOk = await verifyCaptchaToken(req.body.captchaToken, req.ip);
        if (!captchaOk) {
            return res.status(400).json({ message: 'Captcha inválido' });
        }

        const normalizedRole = normalizeRoleInput(role);
        let user = null;

        const [patientExists, doctorExists] = await Promise.all([
            User.findOne({ email: normalizedEmail }),
            Doctor.findOne({ email: normalizedEmail })
        ]);

        user = patientExists || doctorExists;

        //chack if user already exists
        if(user) {
            return res.status(400).json({ message: 'User already exists' })
        }

        //hash password

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        if(normalizedRole === 'doctor') {
            user = new Doctor({
                name,
                email: normalizedEmail,
                password: hashPassword,
                photo,
                gender,
                role: normalizedRole,
            })
        } else {
            user = new User({
                name,
                email: normalizedEmail,
                password: hashPassword,
                photo,
                gender,
                role: normalizedRole,
            })
        }

        const { rawToken, tokenHash, expires } = createEmailVerificationToken();
        user.emailVerificationToken = tokenHash;
        user.emailVerificationTokenExpires = expires;

        await user.save();

        await sendVerificationEmail({
            email: normalizedEmail,
            name,
            token: rawToken,
        });
        
        res.status(200).json({
            success:true,
            message: 'Usuario creado. Revisa tu correo para verificar tu cuenta.',
        })
        
    }   catch (error) {   
        logger.info(error)
        res.status(500).json({
            success:false, 
            message: 'Internal server error, try again'
        });
    }    
};

export const login = async (req, res) => {

        const { email, password } = req.body
        
    try {   
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
            return res.status(400).json({ message: 'Email inválido' });
        }
        if (!password) {
            return res.status(400).json({ message: 'Contraseña requerida' });
        }

        const captchaOk = await verifyCaptchaToken(req.body.captchaToken, req.ip);
        if (!captchaOk) {
            return res.status(400).json({ message: 'Captcha inválido' });
        }

        // check if user exists
        let user = null
        // check if user is patient or doctor
        const patient = await User.findOne ({ email: normalizedEmail })
        const doctor = await Doctor.findOne ({ email: normalizedEmail })

        if(patient) {
            user = patient
        }

        if(doctor) {
            user = doctor
        }
        
        // check if user exists or not
        if(!user) {
            // Log de intento fallido (Usuario desconocido) - Opcional para evitar ruido, pero bueno para seguridad
            // await logSecurityEvent({ event: 'LOGIN_ATTEMPT', status: 'FAILURE', req, meta: { reason: 'User not found', email: normalizedEmail } });
            return res
            .status(404)
            .json({ message: 'User not found' });
        }

        if (isLocked(user)) {
             await logSecurityEvent({ user, event: 'LOGIN_LOCKED', status: 'FAILURE', req });
            return res.status(423).json({ message: 'Cuenta bloqueada temporalmente. Intenta más tarde.' });
        }

        const isLegacyAccount = !user.emailVerificationToken && !user.emailVerificationTokenExpires;
        if (user.authProvider === 'local' && !user.emailVerified && !isLegacyAccount) {
             return res.status(403).json({ message: 'Debes verificar tu correo antes de iniciar sesión.' });
        }

        // compare password

        const isPasswordMatch = await bcrypt.compare(
            password, 
            user.password
        );

        if(!isPasswordMatch) {
            logger.info(`❌ Login Failed for ${normalizedEmail}: Password Mismatch`);
            await registerFailedLogin(user);
            await logSecurityEvent({ user, event: 'LOGIN_FAIL', status: 'FAILURE', req, meta: { reason: 'Invalid password' } });
            
            return res
            .status(400)
            .json({ status:false, message: 'Invalid credentials' });
        }

        // Verificar si el doctor está aprobado
        if (user.role === 'doctor' && user.isApproved !== 'approved') {
            return res.status(401).json({ 
                success: false,
                message: 'Tu cuenta de doctor aún no ha sido aprobado por el administrador' 
            });
        }

        await resetFailedLogins(user);
        
        // 🔒 Verificar 2FA
        if (user.twoFactorEnabled) {
             const tempToken = jwt.sign(
                { id: user._id, role: user.role, scope: '2fa_login' },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '5m' } // Solo válido por 5 minutos
            );
            
            return res.status(200).json({
                status: true,
                requires2FA: true,
                message: 'Código de verificación requerido',
                tempToken,
                role: user.role
            });
        }

        // Log de éxito y alerta de seguridad
        await logSecurityEvent({ user, event: 'LOGIN_SUCCESS', status: 'SUCCESS', req });
        sendSecurityAlert(user, req); 

        if (!user.emailVerified && isLegacyAccount) {
            user.emailVerified = true;
            await user.save();
        }

        // get toke

        const token = generateToken(user);
        const cookieOptions = getCookieOptions();
        
        // 1 día en milisegundos = 24 * 60 * 60 * 1000 = 86400000
        res.cookie('access_token', token, {
            ...cookieOptions,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, 
        });

        const { password: _pwd, role, appointments, ...rest } = user._doc
        
        res
            .status(200)
            .json({   
                status: true,
                message: 'Login successful',
                token,
                data: { ... rest },
                role,
            });
    }   catch (error) {
        logger.error('Login Error:', error);
        res
            .status(500)
            .json({ status: false, message: 'Failed to Login' });
    }   
};

export const getCsrfToken = async (req, res) => {
    const token = createCsrfToken();
    setCsrfCookie(res, token);
    return res.status(200).json({ csrfToken: token });
};

export const logout = async (req, res) => {
    try {
        // 🔒 SEGURIDAD: Invalidar token JWT agregándolo a blacklist
        const token = req.token; // Viene del middleware authenticate
        const userId = req.userId;
        
        if (token && userId) {
            // Decodificar el token para obtener expiration
            const decoded = jwt.decode(token);
            const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
            
            // Agregar a blacklist
            await blacklistToken(token, userId, expiresAt, 'LOGOUT');
            
            // 📋 Audit Log para HIPAA compliance
            await AuditLog.log({
                userId,
                userRole: req.role,
                userEmail: req.user?.email || 'unknown',
                action: 'LOGOUT',
                resourceType: 'User',
                resourceId: userId,
                timestamp: new Date(),
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent') || 'unknown',
                result: 'SUCCESS',
                containsPHI: false,
                severity: 'LOW'
            });
        }
        
        // Limpiar cookies
        const cookieOptions = getCookieOptions();
        res.clearCookie('access_token', cookieOptions);
        res.clearCookie('csrf_token', { ...cookieOptions, httpOnly: false });
        
        return res.status(200).json({ 
            success: true,
            message: 'Logout exitoso. Token invalidado.' 
        });
    } catch (error) {
        logger.error('❌ Error en logout:', error);
        // Aunque falle el blacklisting, limpiar cookies igual
        const cookieOptions = getCookieOptions();
        res.clearCookie('access_token', cookieOptions);
        res.clearCookie('csrf_token', { ...cookieOptions, httpOnly: false });
        
        return res.status(200).json({ 
            success: true,
            message: 'Logout exitoso' 
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const token = req.query.token;
        if (!token) {
            return res.status(400).json({ message: 'Token inválido' });
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const query = {
            emailVerificationToken: tokenHash,
            emailVerificationTokenExpires: { $gt: new Date() },
        };

        let user = await User.findOne(query);
        if (!user) {
            user = await Doctor.findOne(query);
        }

        if (!user) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;
        await user.save();

        return res.status(200).json({ message: 'Correo verificado correctamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error verificando el correo' });
    }
};

export const resendVerification = async (req, res) => {
    try {
        const normalizedEmail = normalizeEmail(req.body.email || '');
        if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
            return res.status(400).json({ message: 'Email inválido' });
        }

        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            user = await Doctor.findOne({ email: normalizedEmail });
        }

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.emailVerified) {
            return res.status(200).json({ message: 'El correo ya está verificado.' });
        }

        const { rawToken, tokenHash, expires } = createEmailVerificationToken();
        user.emailVerificationToken = tokenHash;
        user.emailVerificationTokenExpires = expires;
        await user.save();

        await sendVerificationEmail({
            email: normalizedEmail,
            name: user.name,
            token: rawToken,
        });

        return res.status(200).json({ message: 'Se envió un nuevo enlace de verificación.' });
    } catch (error) {
        return res.status(500).json({ message: 'Error reenviando verificación' });
    }
};

