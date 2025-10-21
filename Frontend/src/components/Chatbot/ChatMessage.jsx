// Frontend/src/components/Chatbot/ChatMessage.jsx
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const ChatMessage = ({ message, onQuickReply }) => {
  const isBot = message.sender === 'bot';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} items-start gap-2`}>
      {isBot && (
        <div className="w-8 h-8 bg-primaryColor rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm">🤖</span>
        </div>
      )}

      <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} max-w-[75%]`}>
        <div
          className={`rounded-2xl px-4 py-2 shadow-sm ${
            isBot
              ? 'bg-white text-gray-800'
              : 'bg-primaryColor text-white'
          }`}
        >
          <p className="text-sm whitespace-pre-line">{message.text}</p>
        </div>

        {/* Quick Replies */}
        {isBot && message.quickReplies && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => onQuickReply(reply, true)}
                className="bg-blue-50 hover:bg-blue-100 text-primaryColor text-xs px-3 py-1.5 rounded-full border border-blue-200 transition"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Special Data (Doctors, Services, etc.) */}
        {isBot && message.data && message.data.type === 'doctors' && (
          <div className="mt-2 space-y-2 w-full">
            {message.data.items.slice(0, 3).map((doctor) => (
              <Link
                key={doctor._id}
                to={`/doctors/${doctor._id}`}
                className="block bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md hover:border-primaryColor transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={doctor.photo || '/default-doctor.png'}
                    alt={doctor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-800">{doctor.name}</h4>
                    <p className="text-xs text-gray-600">{doctor.specialization}</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-primaryColor"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
            {message.data.items.length > 3 && (
              <Link
                to="/doctors"
                className="block text-center text-sm text-primaryColor hover:text-blue-700 font-medium"
              >
                Ver todos los doctores ({message.data.items.length})
              </Link>
            )}
          </div>
        )}

        <span className="text-xs text-gray-400 mt-1">
          {formatDistance(message.timestamp, new Date(), {
            addSuffix: true,
            locale: es,
          })}
        </span>
      </div>

      {!isBot && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm">👤</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
