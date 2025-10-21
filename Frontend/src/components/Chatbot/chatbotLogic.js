// Frontend/src/components/Chatbot/chatbotLogic.js
import { BASE_URL } from '../../config';

// Intents y palabras clave
const intents = {
  greeting: {
    keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'hi', 'saludos'],
    responses: [
      '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
      '¡Bienvenido! ¿Cómo puedo asistirte?',
      '¡Hola! Estoy aquí para ayudarte con lo que necesites.',
    ],
    quickReplies: ['Agendar cita', 'Ver doctores', 'Servicios'],
  },
  booking: {
    keywords: ['agendar', 'cita', 'turno', 'reservar', 'appointment', 'appointment booking', 'consulta'],
    responses: [
      'Para agendar una cita, puedes:\n\n1. Ir a la sección "Doctores" y seleccionar un especialista\n2. Elegir una fecha y hora disponible\n3. Confirmar tu reserva\n\n¿Te gustaría ver nuestros doctores disponibles?',
    ],
    quickReplies: ['Ver doctores', 'Ver mis citas', 'Cancelar una cita'],
  },
  doctors: {
    keywords: ['doctor', 'doctores', 'especialista', 'medico', 'médico', 'profesional'],
    responses: [
      'Contamos con doctores especializados en diversas áreas. ¿Qué especialidad estás buscando?',
    ],
    quickReplies: ['Cardiología', 'Neurología', 'Dermatología', 'Ginecología'],
    fetchDoctors: true,
  },
  services: {
    keywords: ['servicio', 'servicios', 'que ofrecen', 'especialidades', 'tratamiento'],
    responses: [
      'Medicare ofrece los siguientes servicios:\n\n🩺 Consultas médicas generales\n🧠 Evaluaciones psicológicas\n💊 Medicina interna\n🫀 Cardiología\n🧬 Neurología\n🔬 Análisis clínicos\n\n¿Te interesa algún servicio en particular?',
    ],
    quickReplies: ['Agendar cita', 'Ver doctores', 'Consultar precios'],
  },
  psychology: {
    keywords: ['psicolog', 'ansiedad', 'depresion', 'estres', 'mental', 'terapia', 'salud mental'],
    responses: [
      'Ofrecemos servicios de psicología y salud mental:\n\n✅ Evaluaciones psicológicas (PHQ-9, GAD-7, BDI-II)\n✅ Terapia individual\n✅ Manejo de ansiedad y estrés\n✅ Tratamiento de depresión\n\n¿Necesitas agendar una evaluación?',
    ],
    quickReplies: ['Hacer evaluación', 'Agendar terapia', 'Ver psicólogos'],
  },
  prices: {
    keywords: ['precio', 'costo', 'cuanto cuesta', 'tarifa', 'pago', 'seguro'],
    responses: [
      'Los precios varían según el servicio:\n\n💰 Consulta general: $50-80\n💰 Especialistas: $80-150\n💰 Evaluaciones psicológicas: $60\n\nAceptamos seguros médicos y pagos con tarjeta. ¿Te gustaría agendar una cita?',
    ],
    quickReplies: ['Sí, agendar cita', 'Ver doctores', 'Más información'],
  },
  myBookings: {
    keywords: ['mis citas', 'mi cita', 'mis turnos', 'reservas', 'appointments'],
    responses: [
      'Puedes ver todas tus citas en la sección "Mis Citas" de tu perfil. Allí podrás:\n\n📅 Ver próximas citas\n✏️ Ver detalles\n❌ Cancelar citas si es necesario\n\n¿Necesitas ayuda con alguna cita específica?',
    ],
    quickReplies: ['Ir a mis citas', 'Agendar nueva cita'],
  },
  cancel: {
    keywords: ['cancelar', 'eliminar cita', 'borrar cita', 'no puedo ir'],
    responses: [
      'Para cancelar una cita:\n\n1. Ve a "Mis Citas"\n2. Encuentra la cita que deseas cancelar\n3. Haz clic en "Cancelar"\n\n⚠️ Te recomendamos cancelar con al menos 24 horas de anticipación.',
    ],
    quickReplies: ['Ir a mis citas', 'Agendar nueva cita'],
  },
  contact: {
    keywords: ['contacto', 'telefono', 'email', 'direccion', 'ubicacion', 'donde estan'],
    responses: [
      '📞 Información de contacto:\n\n📱 Teléfono: +1 (555) 123-4567\n📧 Email: info@medicare.com\n📍 Dirección: 123 Health Street, Medical District\n\n🕐 Horario: Lunes a Viernes 8:00 AM - 8:00 PM\n\n¿Necesitas algo más?',
    ],
    quickReplies: ['Agendar cita', 'Ver servicios'],
  },
  help: {
    keywords: ['ayuda', 'help', 'no entiendo', 'que puedes hacer', 'opciones'],
    responses: [
      'Puedo ayudarte con:\n\n🩺 Agendar citas médicas\n👨‍⚕️ Buscar doctores y especialistas\n📋 Información sobre servicios\n💰 Consultar precios\n📅 Gestionar tus citas\n📞 Información de contacto\n\n¿Qué necesitas?',
    ],
    quickReplies: ['Agendar cita', 'Ver doctores', 'Ver servicios', 'Contacto'],
  },
  thanks: {
    keywords: ['gracias', 'thanks', 'muchas gracias', 'perfecto', 'excelente', 'bien'],
    responses: [
      '¡De nada! 😊 Estoy aquí si necesitas algo más.',
      '¡Un placer ayudarte! ¿Hay algo más en lo que pueda asistirte?',
      '¡Genial! Si tienes más preguntas, no dudes en escribirme.',
    ],
    quickReplies: ['Agendar cita', 'Ver doctores'],
  },
  goodbye: {
    keywords: ['adios', 'chao', 'hasta luego', 'bye', 'nos vemos'],
    responses: [
      '¡Hasta pronto! 👋 Que tengas un excelente día.',
      '¡Nos vemos! Cuídate mucho. 💙',
      '¡Adiós! Estoy aquí cuando me necesites.',
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

// Fetch doctors from API
const fetchDoctors = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/doctors`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Error fetching doctors');
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
};

// Función principal para obtener respuesta del chatbot
export const getChatbotResponse = async (userMessage, user) => {
  const intent = detectIntent(userMessage);

  if (intent === 'unknown') {
    return {
      text: 'Lo siento, no estoy seguro de entender tu pregunta. 🤔\n\nPuedo ayudarte con:\n• Agendar citas\n• Buscar doctores\n• Información de servicios\n• Consultar precios\n\n¿Qué te gustaría saber?',
      quickReplies: ['Agendar cita', 'Ver doctores', 'Ver servicios', 'Ayuda'],
    };
  }

  const intentData = intents[intent];
  const response = {
    text: getRandomResponse(intentData.responses),
    quickReplies: intentData.quickReplies || null,
  };

  // Si necesita fetch de doctores
  if (intentData.fetchDoctors) {
    const doctors = await fetchDoctors();
    if (doctors.length > 0) {
      response.text += `\n\nAquí hay algunos de nuestros doctores disponibles:`;
      response.data = {
        type: 'doctors',
        items: doctors,
      };
    }
  }

  return response;
};
