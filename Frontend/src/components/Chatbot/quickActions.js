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
  };

  return actions[action] ? actions[action]() : false;
};
