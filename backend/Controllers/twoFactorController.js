import { generateSecret, generateURI, verify } from 'otplib';
import qrcode from 'qrcode';
import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import jwt from 'jsonwebtoken';
import { getCookieOptions } from '../utils/csrf.js';
import SecurityLog from '../models/SecurityLogSchema.js';

const APP_NAME = 'Psiconepsis';

const getUser = async (id) => {
    let user = await User.findById(id).select('+twoFactorSecret');
    if (!user) user = await Doctor.findById(id).select('+twoFactorSecret');
    return user;
};

// 1. Iniciar configuración 2FA (Generar secreto y QR)
export const setup2FA = async (req, res) => {
    try {
        const user = await getUser(req.userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const secret = generateSecret();
        const otpauth = generateURI({ secret, issuer: APP_NAME, label: user.email });
        const qrImageUrl = await qrcode.toDataURL(otpauth);

        // Guardar secreto temporalmente o pedir confirmación inmediata
        // Aquí lo guardaremos pero no lo activaremos hasta confirmar
        user.twoFactorSecret = secret;
        await user.save();

        res.status(200).json({ 
            secret, 
            qrImageUrl,
            message: 'Escanea el código QR con Google Authenticator o Authy' 
        });

    } catch (error) {
        console.error('2FA Setup Error:', error);
        res.status(500).json({ message: 'Error configurando 2FA' });
    }
};

// 2. Verificar token para activar 2FA
export const verify2FA = async (req, res) => {
    const { token } = req.body;
    try {
        const user = await getUser(req.userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const isValid = verify({ token, secret: user.twoFactorSecret });

        if (!isValid) {
            return res.status(400).json({ message: 'Código inválido. Inténtalo de nuevo.' });
        }

        user.twoFactorEnabled = true;
        // Generar códigos de recuperación
        const recoveryCodes = Array.from({ length: 5 }, () => 
            Math.random().toString(36).substring(2, 10).toUpperCase()
        );
        user.twoFactorRecoveryCodes = recoveryCodes;
        
        await user.save();
        await SecurityLog.create({
            user: user._id,
            userType: user.role === 'doctor' ? 'Doctor' : 'User',
            event: '2FA_ENABLED',
            status: 'SUCCESS',
            ipAddress: req.ip
        });

        res.status(200).json({ 
            success: true, 
            message: 'Autenticación de dos pasos activada exitosamente',
            recoveryCodes 
        });

    } catch (error) {
        console.error('2FA Verify Error:', error);
        res.status(500).json({ message: 'Error verificando 2FA' });
    }
};

// 3. Validar 2FA durante Login (Paso 2)
export const validate2FALogin = async (req, res) => {
    const { tempToken, token } = req.body;
    
    try {
        if (!tempToken) return res.status(401).json({ message: 'Token temporal no proporcionado' });

        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET_KEY);
        if (decoded.scope !== '2fa_login') {
            return res.status(401).json({ message: 'Token inválido para esta operación' });
        }

        const user = await getUser(decoded.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const isValid = verify({ token, secret: user.twoFactorSecret });
        
        if (!isValid) {
            // Verificar códigos de recuperación si el token falla
            const recoveryIndex = user.twoFactorRecoveryCodes.indexOf(token);
            if (recoveryIndex === -1) {
                await SecurityLog.create({
                    user: user._id,
                    userType: user.role === 'doctor' ? 'Doctor' : 'User',
                    event: '2FA_LOGIN_FAIL',
                    status: 'FAILURE',
                    ipAddress: req.ip
                });
                return res.status(400).json({ message: 'Código inválido' });
            }
            // Consumir código de recuperación
            user.twoFactorRecoveryCodes.splice(recoveryIndex, 1);
            await user.save();
        }

        // Generar token real (final)
        const finalToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        const cookieOptions = getCookieOptions();
        res.cookie('access_token', finalToken, {
            ...cookieOptions,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        await SecurityLog.create({
            user: user._id,
            userType: user.role === 'doctor' ? 'Doctor' : 'User',
            event: 'LOGIN_SUCCESS',
            status: 'SUCCESS',
            ipAddress: req.ip,
            metadata: { method: '2FA' }
        });

        const { password, twoFactorSecret, twoFactorRecoveryCodes, ...rest } = user._doc;

        res.status(200).json({ 
            status: true,
            message: 'Login exitoso',
            token: finalToken,
            data: { ...rest },
            role: user.role
        });

    } catch (error) {
        console.error('2FA Login Error:', error);
        res.status(500).json({ message: 'Error en validación 2FA' });
    }
};

export const disable2FA = async (req, res) => {
    try {
        const user = await getUser(req.userId);
        user.twoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        user.twoFactorRecoveryCodes = [];
        await user.save();

        await SecurityLog.create({
            user: user._id,
            userType: user.role === 'doctor' ? 'Doctor' : 'User',
            event: '2FA_DISABLED',
            status: 'WARNING',
            ipAddress: req.ip
        });

        res.status(200).json({ message: '2FA desactivado' });
    } catch (error) {
        res.status(500).json({ message: 'Error desactivando 2FA' });
    }
};
