// Frontend/src/components/Chatbot/quickActions.js
import { useNavigate } from 'react-router-dom';

// Acciones especiales del chatbot
export const handleQuickAction = (action, navigate, user) => {
  const actions = {
    'Agendar cita': () => {
      navigate('/doctors');
      return true;
    },
    'Agendar una cita': () => {
      navigate('/doctors');
      return true;
    },
    'Ver doctores': () => {
      navigate('/doctors');
      return true;
    },
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
