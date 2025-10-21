// src/pages/GoogleCallback.jsx
import { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useContext(authContext);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const user = query.get('user');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(parsedUser));

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            token,
            user: parsedUser,
            role: parsedUser.role,
          },
        });

        toast.success('Login con Google exitoso');
        navigate('/home');
      } catch (err) {
        toast.error('Error al procesar la autenticación con Google');
        navigate('/login');
      }
    } else {
      toast.error('No se encontraron datos de autenticación');
      navigate('/login');
    }
  }, [location, dispatch, navigate]);

  return null;
};

export default GoogleCallback;
