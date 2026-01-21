import { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../config';
import { authContext } from '../../context/AuthContext';
import HashLoader from 'react-spinners/HashLoader';

const TwoFactorSetup = () => {
    const { user, token } = useContext(authContext);
    const [step, setStep] = useState(user?.twoFactorEnabled ? 'enabled' : 'intro'); // intro, setup, verify, success, enabled
    const [qrCode, setQrCode] = useState(null);
    const [verifyCode, setVerifyCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleStartSetup = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/auth/2fa/setup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setQrCode(data.qrImageUrl);
            setStep('setup');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (verifyCode.length !== 6) return toast.error('El código debe tener 6 dígitos');
        
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/auth/2fa/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: verifyCode })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setRecoveryCodes(data.recoveryCodes);
            setStep('success');
            toast.success('¡2FA Activado correctamente!');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!window.confirm('¿Estás seguro de desactivar la autenticación de dos pasos? Tu cuenta será menos segura.')) return;

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/auth/2fa/disable`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) throw new Error('Error al desactivar');
            
            setStep('intro');
            toast.info('2FA Desactivado');
            // Idealmente actualizar el contexto aquí si es necesario
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-headingColor">Seguridad de la Cuenta</h2>
            
            {/* Paso 0: Introducción o Estado Activo */}
            {step === 'intro' && (
                <div className="text-center py-8">
                    <img src="https://img.icons8.com/color/96/000000/security-checked--v1.png" alt="Security" className="mx-auto mb-4 w-20 h-20"/>
                    <h3 className="text-xl font-semibold mb-2">Protege tu cuenta con Autenticación de Dos Pasos (2FA)</h3>
                    <p className="text-textColor mb-6">
                        Añade una capa extra de seguridad. Requeriremos un código de tu celular cada vez que inicies sesión.
                    </p>
                    <button 
                        onClick={handleStartSetup}
                        disabled={loading}
                        className="btn bg-primaryColor text-white py-3 px-8 rounded-full font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                    >
                        {loading ? <HashLoader size={20} color="#fff" /> : 'Activar Seguridad 2FA'}
                    </button>
                </div>
            )}

            {/* Paso 1: Escanear QR */}
            {step === 'setup' && (
                <div className="flex flex-col items-center">
                    <h3 className="text-lg font-bold mb-4">1. Escanea este código QR</h3>
                    <p className="text-sm text-textColor mb-4">Usa Google Authenticator, Authy o Microsoft Authenticator.</p>
                    
                    <div className="p-4 border-2 border-primaryColor rounded-xl mb-6 bg-gray-50">
                        <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                    </div>

                    <h3 className="text-lg font-bold mb-2">2. Ingresa el código de 6 dígitos</h3>
                    <input 
                        type="text" 
                        maxLength="6"
                        className="form-input text-center text-2xl tracking-widest w-40 mb-4 border-b-2 border-primaryColor focus:outline-none"
                        placeholder="000000"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g,''))}
                    />

                    <button 
                        onClick={handleVerify}
                        disabled={loading || verifyCode.length !== 6}
                        className="btn bg-primaryColor w-full max-w-xs text-white"
                    >
                         {loading ? <HashLoader size={20} color="#fff" /> : 'Verificar y Activar'}
                    </button>
                    <button onClick={() => setStep('intro')} className="text-textColor text-sm mt-4 underline">Cancelar</button>
                </div>
            )}

            {/* Paso 2: Éxito y Códigos de Recuperación */}
            {step === 'success' && (
                <div className="bg-green-50 p-6 rounded-lg text-center border border-green-200">
                    <h3 className="text-xl font-bold text-green-700 mb-2">¡Todo listo! 2FA Activado</h3>
                    <p className="text-green-800 mb-4">Guarda estos códigos de recuperación en un lugar seguro. Los necesitarás si pierdes tu teléfono.</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-6 max-w-xs mx-auto">
                        {recoveryCodes.map((code, idx) => (
                            <div key={idx} className="bg-white px-2 py-1 rounded border border-green-300 font-mono text-center font-bold text-gray-700">
                                {code}
                            </div>
                        ))}
                    </div>

                    <button onClick={() => setStep('enabled')} className="btn bg-green-600 text-white w-full">Entendido, finalizar</button>
                </div>
            )}

            {/* Estado: Activado */}
            {step === 'enabled' && (
                <div className="flex flex-col items-center py-8">
                     <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl">🛡️</span>
                     </div>
                     <h3 className="text-xl font-bold text-green-700 mb-2">Tu cuenta está blindada</h3>
                     <p className="text-textColor mb-6 text-center max-w-md">
                        La autenticación de dos pasos está activa. Se requerirá un código temporal cada vez que inicies sesión en un dispositivo nuevo.
                     </p>
                     
                     <div className="border-t pt-6 w-full max-w-md">
                        <button 
                            onClick={handleDisable}
                            disabled={loading}
                            className="w-full border border-red-500 text-red-500 hover:bg-red-50 py-2 rounded-lg font-medium transition"
                        >
                            {loading ? 'Procesando...' : 'Desactivar 2FA (No recomendado)'}
                        </button>
                     </div>
                </div>
            )}
        </div>
    );
};

export default TwoFactorSetup;
