// Frontend/src/components/Chatbot/quickActions.js
// Acciones especiales del chatbot
export const handleQuickAction = (action, navigate, user) => {
  const actions = {
    'Ir a mis citas': () => {
      if (user) {
        navigate(user.role === 'doctor' ? '/doctors/profile/me' : '/users/profile/me');
      }
      return true;
    },
    'Ver mis citas': () => {
      if (user) {
        navigate(user.role === 'doctor' ? '/doctors/profile/me' : '/users/profile/me');
      }
      return true;
    },
    'Ver servicios': () => {
      navigate('/services');
      return true;
    },
    'Información de servicios': () => {
      navigate('/services');
      return true;
    },
    'Hacer evaluación': () => {
      if (user && user.role === 'paciente') {
        navigate('/psychology/assessments');
      }
      return true;
    },
    'Contacto': () => {
      navigate('/contact');
      return true;
    },
    'Ir a Contacto': () => {
      navigate('/contact');
      return true;
    },
    'Agendar cita': () => {
      navigate('/contact');
      return true;
    },
    'Agendar Cita': () => {
        navigate('/contact');
        return true;
    },
    'Nuestros Servicios': () => {
      navigate('/services');
      return true;
    },
    'Ir a Servicios': () => {
        navigate('/services');
        return true;
    },
    'Sobre Basileiás': () => {
       navigate('/home'); 
       return true;
    },
    'Ir a Sobre Nosotros': () => {
        navigate('/home'); 
        return true;
     },
    'Dudas Frecuentes': () => {
        navigate('/home'); 
        return true;
    },
    'Ver Preguntas Frecuentes': () => {
        navigate('/home'); 
        return true;
    },
    'Registrarme': () => {
      navigate('/register');
      return true;
    },
    'Iniciar Sesión': () => {
      navigate('/login');
      return true;
    },
  };

  return actions[action] ? actions[action]() : false;
};
