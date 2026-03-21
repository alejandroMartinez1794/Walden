import { useState, useContext } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from '../config';
import { toast } from 'react-toastify';
import { authContext } from '../context/AuthContext.jsx';
import Hashloader from 'react-spinners/HashLoader';
import { getDashboardPath } from '../utils/getDashboardPath';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [captchaToken, setCaptchaToken] = useState(null);

  // States for 2FA
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [otpCode, setOtpCode] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useContext(authContext);
  const hcaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
  const isProduction = import.meta.env.PROD;
  const isCaptchaEnabled = Boolean(hcaptchaSiteKey);

  const normalizeEmail = value => value.trim().toLowerCase();
  const isValidEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return toast.error("Ingresa el código de 6 dígitos");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/2fa/validate`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tempToken,
          token: otpCode
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: result.data,
          token: result.token,
          role: result.role,
          authProvider: result.data?.authProvider || 'local',
        },
      });

      setLoading(false);
      toast.success(result.message);
      const redirectPath = getDashboardPath(result.role);
      navigate(redirectPath, { replace: true });

    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const submitHandler = async event => {
    event.preventDefault();
    setLoading(true);

    const normalizedEmail = normalizeEmail(formData.email);
    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      toast.error('Email inválido');
      setLoading(false);
      return;
    }
    if (!formData.password) {
      toast.error('La contraseña es requerida');
      setLoading(false);
      return;
    }
    if (isProduction && !isCaptchaEnabled) {
      toast.error('Captcha no configurado en producción. Contacta al administrador.');
      setLoading(false);
      return;
    }
    if (isCaptchaEnabled && !captchaToken) {
      toast.error('Completa el captcha');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'post',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password: formData.password,
          captchaToken,
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      // Check for 2FA requirement
      if (result.requires2FA) {
          setTempToken(result.tempToken);
          setShow2FA(true);
          setLoading(false);
          toast.info("Ingresa tu código de autenticación");
          return;
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: result.data,
          token: result.token,
          role: result.role,
          authProvider: result.data?.authProvider || 'local',
        },
      });

      // Obtener CSRF token para requests con cookie (doble submit)
      try {
        const csrfRes = await fetch(`${BASE_URL}/auth/csrf-token`, { credentials: 'include' });
        const csrfPayload = await csrfRes.json();
        if (csrfRes.ok && csrfPayload?.csrfToken) {
          sessionStorage.setItem('csrfToken', csrfPayload.csrfToken);
        }
      } catch (csrfError) {
        console.warn('No se pudo obtener CSRF token:', csrfError.message);
      }

      setLoading(false);
      toast.success(result.message);
      const redirectPath = getDashboardPath(result.role);
      navigate(redirectPath, { replace: true });

    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    // Verificar captcha antes de redirigir a Google
    if (isCaptchaEnabled && !captchaToken) {
      toast.error('Por seguridad, completa el captcha primero.');
      return;
    }
    
    // Usar la constante BASE_URL del frontend en lugar de depender de VITE_BACKEND_URL
    // Evita rutas como /undefined/calendar/google-auth cuando la variable de entorno no está definida
    window.location.href = `${BASE_URL}/calendar/google-auth`;
  };

  if (show2FA) {
      return (
        <section className="px-5 lg:px-0">
          <div className="w-full max-w-[570px] mx-auto rounded-lg shadow-md md:p-10 border border-primaryColor bg-white">
            <h3 className="text-headingColor text-[22px] leading-9 font-bold md-10 text-center">
              🔐 Verificación en Dos Pasos
            </h3>
            <p className="text-center text-textColor mb-6">
              Ingresa el código de 6 dígitos de tu aplicación autenticadora.
            </p>

            <form onSubmit={handle2FASubmit} className="flex flex-col items-center">
              <input 
                type="text" 
                maxLength="6"
                placeholder="000000"
                className="w-40 text-center text-3xl tracking-[0.5em] border-b-2 border-primaryColor focus:outline-none mb-6 font-mono"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g,''))}
                autoFocus
              />

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-2 hover:bg-blue-700 transition"
              >
                {loading ? <Hashloader size={25} color="#fff" /> : "Verificar"}
              </button>
            </form>
          </div>
        </section>
      );
  }

  return (
    <section className="px-5 lg:px-0">
      <div className="w-full max-w-[570px] mx-auto rounded-lg shadow-md md:p-10">
        <h3 className="text-headingColor text-[22px] leading-9 font-bold md-10">
          Hello! <span className="text-primaryColor"> Welcome </span> Back 🎊
        </h3>

        <form className="py-4 md:py-0" onSubmit={submitHandler}>
          <div className="mb-5">
            <input
              type="email"
              placeholder="Enter your Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              className="w-full  py-3 border-b border-solid border-[#0066ff61] focus:outline-none
              focus:border-b-primaryColor text-[22px] leading-7 text-headingColor
              placeholder: text-textColor  cursor-pointer"
              required
            />
          </div>

          <div className="mb-5">
            <input
              type="password"
              placeholder="Enter your Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              maxLength={128}
              className="w-full  py-3 border-b border-solid border-[#0066ff61] focus:outline-none
              focus:border-b-primaryColor text-[22px] leading-7 text-headingColor
              placeholder: text-textColor cursor-pointer"
              required
            />
          </div>

          <div className='mt-7'>
            <button
              type="submit"
              disabled={loading || (isCaptchaEnabled && !captchaToken)}
              className={`w-full text-white text-[18px] leading-[30px] rounded-lg px-4 px-3 ${
                loading || (isCaptchaEnabled && !captchaToken) 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primaryColor hover:bg-blue-700'
              }`}
            >
              {loading ? <Hashloader size={25} color="#fff" /> : "Login"}
            </button>
          </div>

          <div className="mt-5 flex justify-center">
            {hcaptchaSiteKey ? (
              <HCaptcha
                sitekey={hcaptchaSiteKey}
                onVerify={token => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
              />
            ) : (
              <p className="text-sm text-red-500">
                {isProduction
                  ? 'Captcha requerido en producción: configura VITE_HCAPTCHA_SITE_KEY'
                  : 'Captcha desactivado temporalmente por configuración'}
              </p>
            )}
          </div>

          {/* Botón de Google */}
          <div className="mt-5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isCaptchaEnabled && !captchaToken}
              className={`w-full flex items-center justify-center gap-3 py-2 rounded-lg transition border ${
                isCaptchaEnabled && !captchaToken
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-gray-300 text-gray-700 font-medium hover:shadow-md'
              }`}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google icon"
                className={`w-6 h-6 ${isCaptchaEnabled && !captchaToken ? 'opacity-50' : ''}`}
              />
              <span>Continuar con Google</span>
            </button>
          </div>

          <p className='mt-8 text-textColor text-center'>
            Don&apos;t have an account? {" "}
            <Link to="/register" className='text-primaryColor font-medium ml-1'>
              Register
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;
