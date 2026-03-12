// Frontend/src/components/Chatbot/chatbotLogic.js
import { BASE_URL } from '../../config';

// Intents y palabras clave
const intents = {
  greeting: {
    keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'hi', 'saludos', 'quiubo', 'que mas', 'bien o no', 'inicio', 'empezar'],
    responses: [
      '¡Hola! 👋 Bienvenido a Basileia (Βασιλειάς), tu espacio de terapia digital basado en evidencia (TCC).\n\nSi es tu primera vez aquí, te invitamos a escribirnos directamente a: **contactobasileia@gmail.com** para orientarte mejor.\n\n¿En qué podemos ayudarte hoy? Puedo explicarte nuestros servicios, cómo trabajamos o resolver tus dudas.',
    ],
    quickReplies: ['Contacto', 'Nuestros Servicios', 'Sobre Basileia', 'Dudas Frecuentes'],
  },
  about: {
    keywords: ['sobre', 'que es', 'quienes son', 'tcc', 'enfoque', 'filosofia', 'metodo', 'cognitivo', 'conductual', 'ciencia'],
    responses: [
      '**Sobre Basileia y la TCC** 🧠\n\nNuestra práctica se basa en la **Terapia Cognitivo-Conductual (TCC)**, el modelo con mayor respaldo científico para tratar ansiedad y depresión.\n\nEntendemos que pensamientos, emociones y conductas están conectados. Trabajamos contigo para modificar patrones disfuncionales y recuperar tu equilibrio, usando técnicas validadas como reestructuración cognitiva y exposición gradual.\n\nPuedes leer más en la sección "Sobre Nosotros".',
    ],
    quickReplies: ['Ver Servicios', 'Ir a Sobre Nosotros', 'Contacto'],
  },
  services: {
    keywords: ['servicio', 'servicios', 'que ofrecen', 'especialidades', 'tratamiento', 'que hacen', 'depresion', 'ansiedad', 'huerfanas', 'duelo', 'adolescentes'],
    responses: [
      '**Nuestros Servicios Especializados:**\n\n1. **Enfermedades Huérfanas**: Apoyo a pacientes y cuidadores.\n2. **Depresión y Ánimo**: Transformación de patrones negativos.\n3. **Ansiedad y Estrés**: Técnicas de manejo y exposición.\n4. **Psicoterapia Individual**: Autoconocimiento para adultos.\n5. **TCC para Adolescentes**: Habilidades emocionales y resiliencia.\n6. **Crisis y Duelo**: Acompañamiento empático inmediato.\n\n¿Te interesa alguno en particular? Escríbenos.',
    ],
    quickReplies: ['Ir a Servicios', 'Contacto', 'Agendar Cita'],
  },
  faq_general: {
    keywords: ['como funciona', 'virtual', 'presencial', 'distancia', 'remoto', 'online'],
    responses: [
      '**¿Cómo funciona la atención?** 💻\n\nLas sesiones son principalmente **virtuales** a través de nuestra plataforma segura, adaptándonos a tus objetivos. Algunos profesionales ofrecen atención presencial bajo cita previa.\n\nPuedes iniciar tu proceso desde cualquier lugar.',
    ],
    quickReplies: ['Ver Preguntas Frecuentes', 'Contacto'],
  },
  faq_crisis: {
    keywords: ['crisis', 'urgencia', 'emergencia', 'riesgo', 'suicidio', 'morir', 'ayuda urgente', 'urgente'],
    responses: [
      '⚠️ **Atención en Crisis**\n\nSi estás en riesgo vital o emergencia inmediata, por favor acude directamente a **Urgencias** de tu localidad.\n\nNosotros ofrecemos acompañamiento clínico prioritario para crisis emocionales y duelos, pero no reemplazamos a los servicios de emergencia médica.',
    ],
    quickReplies: ['Contacto', 'Ver Recursos'],
  },
  faq_new_patients: {
    keywords: ['nuevo', 'primera vez', 'empezar', 'quiero cita', 'paciente nuevo'],
    responses: [
      '**¿Eres nuevo paciente?** ¡Bienvenido! 🌟\n\nSí, nuestro equipo está abierto a nuevos procesos. Lo mejor para empezar es que nos escribas a **contactobasileia@gmail.com** contándonos brevemente tu caso para asignarte el profesional ideal.\n\nTambién puedes registrarte en la plataforma.',
    ],
    quickReplies: ['Contacto', 'Registrarme'],
  },
  contact: {
    keywords: ['contacto', 'telefono', 'email', 'direccion', 'ubicacion', 'donde estan', 'llamar', 'correo', 'ayuda', 'soporte', 'escribir'],
    responses: [
      '📞 **Contacto Directo**\n\nEstamos listos para escucharte. Al ser tu primera vez o si tienes dudas específicas, el mejor canal es:\n\n📧 **Email**: contactobasileia@gmail.com\n📏 **Ubicación**: Bogotá, Colombia\n\nEscríbenos y te responderemos a la brevedad.',
    ],
    quickReplies: ['Ir a Contacto'],
  },
  booking: {
    keywords: ['agendar', 'cita', 'turno', 'reservar', 'appointment', 'appointment booking', 'consulta', 'sacar cita'],
    responses: [
      'Para agendar, por favor contáctanos por correo (**contactobasileia@gmail.com**) si es tu primera vez, o inicia sesión si ya eres paciente.\n\nTe guiaremos para encontrar el horario que más te convenga.',
    ],
    quickReplies: ['Contacto', 'Iniciar Sesión'],
  },
  thanks: {
    keywords: ['gracias', 'thanks', 'muchas gracias', 'perfecto', 'excelente', 'bien', 'listo', 'todo bien'],
    responses: [
      '¡Con gusto! Recuerda: ante cualquier duda, un correo a **contactobasileia@gmail.com** es la vía más rápida. ¡Cuídate!',
    ],
    quickReplies: ['Contacto', 'Cerrar chat'],
  },
  goodbye: {
    keywords: ['adios', 'chao', 'hasta luego', 'bye', 'nos vemos', 'suerte'],
    responses: [
      '¡Hasta luego! Recuerda escribirnos si necesitas iniciar tu proceso. 👋',
    ],
  },
};

// Detectar intent basado en el mensaje
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();

  for (const [intentName, intentData] of Object.entries(intents)) {
    for (const keyword of intentData.keywords) {
      if (lowerMessage.includes(keyword)) {
        return intentName;
      }
    }
  }

  return 'unknown';
};

// Obtener una respuesta aleatoria del array
const getRandomResponse = (responses) => {
  return responses[Math.floor(Math.random() * responses.length)];
};

// Función principal para obtener respuesta del chatbot
export const getChatbotResponse = async (userMessage, user) => {
  const intent = detectIntent(userMessage);

  if (intent === 'unknown') {
    return {
      text: 'No estoy seguro de entender tu consulta específica. \n\nRecuerda que para **información detallada, dudas clínicas o agendamiento**, lo mejor es escribirnos directamente a: **contactobasileia@gmail.com**.\n\nPuedo hablarte sobre:\n- Nuestros Servicios\n- Qué es la TCC\n- Atención en crisis',
      quickReplies: ['Nuestros Servicios', 'Sobre Basileia', 'Contacto'],
    };
  }

  const intentData = intents[intent];
  const response = {
    text: getRandomResponse(intentData.responses),
    quickReplies: intentData.quickReplies || null,
  };

  return response;
};
