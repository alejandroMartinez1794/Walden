// Frontend/src/components/Chatbot/Chatbot.jsx
import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authContext } from '../../context/AuthContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { getChatbotResponse } from './chatbotLogic';
import { handleQuickAction } from './quickActions';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useContext(authContext);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Mensaje de bienvenida
      const welcomeMsg = {
        id: Date.now(),
        text: user
          ? `¡Hola ${user.name}! 👋 Bienvenido de nuevo a Basileia. ¿En qué podemos acompañarte hoy?`
          : '¡Hola! 👋 Bienvenido a Basileia (Βασιλειάς). \n\n**¿Es tu primera vez aquí?** \nTe recomendamos escribirnos a **contactobasileia@gmail.com** para recibir una orientación inicial personalizada.\n\nTambién estoy aquí para resolver dudas rápidas sobre nuestros servicios.',
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: [
          'Contacto',
          'Nuestros Servicios',
          'Sobre Basileia',
        ],
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, user]);

  // Exponer función global para abrir el chatbot desde otros componentes
  useEffect(() => {
    window.openChatbot = () => setIsOpen(true);
    return () => {
      try {
        delete window.openChatbot;
      } catch (e) {
        window.openChatbot = undefined;
      }
    };
  }, []);

  const handleSendMessage = async (text, quickReply = false) => {
    // Verificar si es una acción rápida que requiere navegación
    const actionHandled = handleQuickAction(text, navigate, user);

    if (actionHandled) {
      // Si se manejó la acción, cerrar el chatbot después de un breve delay
      setTimeout(() => {
        setIsOpen(false);
      }, 300);
    }

    // Agregar mensaje del usuario
    const userMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simular typing
    setIsTyping(true);

    // Obtener respuesta del bot (con delay para simular thinking)
    setTimeout(async () => {
      const botResponse = await getChatbotResponse(text, user);

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: botResponse.quickReplies || null,
        data: botResponse.data || null,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, quickReply ? 500 : 1000);
  };

  const handleClearChat = () => {
    setMessages([]);
    setIsOpen(false);
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-primaryColor text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all transform hover:scale-110"
          aria-label="Abrir chat"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            1
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-primaryColor to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">🏥</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Basileia Assistant</h3>
                <p className="text-xs opacity-90">Siempre disponible</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-2 transition"
              aria-label="Cerrar chat"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onQuickReply={handleSendMessage}
              />
            ))}

            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <ChatInput onSend={handleSendMessage} />

          {/* Footer */}
          <div className="bg-gray-100 px-4 py-2 text-center text-xs text-gray-500">
            Powered by Basileia AI
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Chatbot;
