// Frontend/src/components/Chatbot/chatbotLogic.js
import { BASE_URL } from '../../config';

// Intents y palabras clave
const intents = {
  greeting: {
    keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'hi', 'saludos', 'quiubo', 'que mas', 'bien o no'],
    responses: [
      '¡Hola! 👋 Soy PsicoBot, tu asistente virtual en Psiconepsis. ¿En qué vuelta te puedo ayudar hoy?',
      '¡Quiubo! Bienvenido a Psiconepsis. ¿Qué necesitas? Estoy aquí para guiarte.',
      '¡Hola! Espero que estés teniendo un día bacano. ¿Cómo te puedo colaborar?',
    ],
    quickReplies: ['Agendar cita', 'Ver especialistas', 'Servicios', 'Precios'],
  },
  booking: {
    keywords: ['agendar', 'cita', 'turno', 'reservar', 'appointment', 'appointment booking', 'consulta', 'sacar cita'],
    responses: [
      '¡De una! Para agendar es súper fácil:\n\n1. Ve a la sección "Doctores".\n2. Elige al especialista que más te trame.\n3. Selecciona la hora que te sirva.\n\n¿Quieres que te muestre los doctores de una vez?',
    ],
    quickReplies: ['Ver doctores', 'Ver mis citas', 'Cancelar cita'],
  },
  doctors: {
    keywords: ['doctor', 'doctores', 'especialista', 'medico', 'médico', 'profesional', 'psicologo', 'psiquiatra'],
    responses: [
      'Tenemos un equipo de primera. ¿Qué tipo de especialista estás buscando? Tenemos psicólogos, psiquiatras y médicos generales.',
    ],
    quickReplies: ['Psicología', 'Psiquiatría', 'Medicina General', 'Ver todos'],
    fetchDoctors: true,
  },
  services: {
    keywords: ['servicio', 'servicios', 'que ofrecen', 'especialidades', 'tratamiento', 'que hacen'],
    responses: [
      'En Psiconepsis nos encargamos de tu salud integral con:\n\n🧠 Psicología Clínica (TCC)\n💊 Psiquiatría\n🩺 Medicina General\n📹 Telepsicología Segura\n\nTodo con la mejor tecnología y seguridad. ¿Te interesa algo en específico?',
    ],
    quickReplies: ['Agendar cita', 'Ver doctores', 'Telepsicología'],
  },
  security: {
    keywords: ['seguridad', 'privacidad', 'datos', 'seguro', 'encriptado', 'confidencial'],
    responses: [
      '¡Tranquilo! Aquí la seguridad es lo primero. Usamos "PsicoNepsis Shield":\n\n🔒 Encriptación AES-256 (Nivel militar)\n🛡️ Auditoría clínica inmutable\n🤐 Confidencialidad total\n\nTus secretos están a salvo con nosotros, ni nosotros podemos leerlos.',
    ],
    quickReplies: ['Ver política de datos', 'Agendar cita segura'],
  },
  psychology: {
    keywords: ['ansiedad', 'depresion', 'estres', 'triste', 'ayuda mental', 'terapia', 'tusa', 'mal'],
    responses: [
      'Entiendo, a veces la vida se pone pesada. En Psiconepsis tenemos expertos en:\n\n✅ Manejo de ansiedad y estrés\n✅ Depresión\n✅ Terapia de pareja\n✅ Crecimiento personal\n\nNo tienes que pasar por esto solo. ¿Te gustaría hablar con alguien?',
    ],
    quickReplies: ['Agendar con Psicólogo', 'Hacer test de ansiedad', 'Urgencia'],
  },
  prices: {
    keywords: ['precio', 'costo', 'cuanto cuesta', 'tarifa', 'pago', 'billete', 'plata', 'vale'],
    responses: [
      'Manejamos tarifas justas para que te cuides:\n\n💰 Consulta General: $50.000 - $80.000\n💰 Especialistas: $80.000 - $150.000\n💰 Terapia TCC: $100.000\n\nPuedes pagar con Nequi, Daviplata o Tarjeta. ¿Te animas?',
    ],
    quickReplies: ['Agendar cita', 'Ver doctores'],
  },
  payment: {
    keywords: ['pagar', 'nequi', 'daviplata', 'tarjeta', 'efectivo', 'metodos de pago'],
    responses: [
      'Recibimos de todo para que no te vares:\n\n💳 Tarjetas Débito/Crédito\n📱 Nequi y Daviplata\n🏦 PSE\n\nEl pago se hace al confirmar la cita. ¡Fácil y rápido!',
    ],
    quickReplies: ['Agendar cita'],
  },
  myBookings: {
    keywords: ['mis citas', 'mi cita', 'mis turnos', 'reservas', 'cuando me toca'],
    responses: [
      'Revisa tus vueltas en "Mi Perfil" -> "Mis Citas". Ahí ves fecha, hora y hasta puedes entrar a la videollamada si es virtual.',
    ],
    quickReplies: ['Ir a mis citas', 'Agendar nueva'],
  },
  contact: {
    keywords: ['contacto', 'telefono', 'email', 'direccion', 'ubicacion', 'donde estan', 'llamar'],
    responses: [
      '📞 Contáctanos de una:\n\n📱 WhatsApp: +57 300 123 4567\n📧 Email: psiconepsis@gmail.com\n📍 Sede Principal: Calle 123 # 45-67, Bogotá\n\n¡Estamos atentos!',
    ],
    quickReplies: ['Agendar cita', 'Ver mapa'],
  },
  insult: {
    keywords: ['bobo', 'estupido', 'idiota', 'mierda', 'puta', 'malparido', 'gonorrea'],
    responses: [
      'Epa, bájele al tono. Aquí estamos para ayudar con buena vibra. Respeto ante todo, parcero. ✌️',
      'Oye, tranqui. No hay necesidad de esas palabras. ¿En qué te puedo ayudar de buena manera?',
    ],
  },
  thanks: {
    keywords: ['gracias', 'thanks', 'muchas gracias', 'perfecto', 'excelente', 'bien', 'listo', 'todo bien'],
    responses: [
      '¡Con gusto! Pa\' las que sea. 😎',
      '¡A la orden! Cuídate mucho.',
      '¡Todo bien! Aquí estamos firmes.',
    ],
    quickReplies: ['Agendar cita', 'Cerrar chat'],
  },
  goodbye: {
    keywords: ['adios', 'chao', 'hasta luego', 'bye', 'nos vemos', 'suerte'],
    responses: [
      '¡La buena! Que tengas un día chimba. 👋',
      '¡Chao pues! Cuídate.',
      '¡Nos pillamos! Vuelve cuando quieras.',
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
