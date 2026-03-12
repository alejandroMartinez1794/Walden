import { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const GoogleAuthRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useContext(authContext);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const user = queryParams.get('user');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));

        // ✅ 1. Guardar en contexto global
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: parsedUser,
            token,
            role: parsedUser.role,
          },
        });

        // ✅ 2. Guardar token en localStorage para que lo use el hook useFetchData
        localStorage.setItem('token', token);

        // ✅ 3. Mostrar confirmación
        toast.success('Login con Google exitoso ✅');

        // ✅ 4. Redirigir con recarga para que el token esté disponible al inicio
        if (parsedUser.role === 'paciente') {
          window.location.href = '/users/profile/me';
        } else if (parsedUser.role === 'doctor' || parsedUser.role === 'admin') {
          window.location.href = '/doctors/profile/me';
        } else {
          window.location.href = '/home';
        }

      } catch (err) {
        console.error('❌ Error parseando usuario:', err);
        toast.error('No se pudo procesar la autenticación de Google');
        navigate('/login');
      }
    } else {
      toast.error('Faltan datos de autenticación');
      navigate('/login');
    }
  }, [location.search, dispatch, navigate]);

  return <p className="text-center text-lg mt-10">Procesando autenticación con Google...</p>;
};

export default GoogleAuthRedirect;
