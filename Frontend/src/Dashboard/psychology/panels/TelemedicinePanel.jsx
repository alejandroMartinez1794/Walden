import React, { useState } from 'react';

const TelemedicinePanel = () => {
  const [meetingLink, setMeetingLink] = useState('');

  const openMeeting = () => {
    if (!meetingLink) return;
    window.open(meetingLink, '_blank');
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Sala de Telepsicología</h2>
          <p className="text-indigo-100 text-lg max-w-2xl mb-8">
            Conecta con tus pacientes usando tu plataforma preferida (Google Meet, Zoom, Teams).
          </p>
          
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 max-w-md">
            <label className="block text-sm font-medium text-indigo-200 mb-2">Enlace de la Reunión</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="Pega aquí el link de Meet o Zoom..."
                className="flex-1 bg-white/90 text-gray-900 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-white"
              />
              <button 
                onClick={openMeeting}
                className="bg-white text-indigo-600 font-bold px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Abrir
              </button>
            </div>
            <p className="text-xs text-indigo-300 mt-3 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              Se abrirá en una nueva pestaña
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Google Meet</h3>
          <p className="text-sm text-gray-500 mb-4">Ideal para sesiones rápidas y seguras con integración de calendario.</p>
          <a href="https://meet.google.com/new" target="_blank" rel="noreferrer" className="text-blue-600 text-sm font-semibold hover:underline">Crear reunión nueva →</a>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 bg-blue-500 text-white rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.5 6v12l4.5-4.5v-3l-4.5-4.5z"/></svg>
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Zoom</h3>
          <p className="text-sm text-gray-500 mb-4">Recomendado para sesiones grupales o cuando necesitas grabar.</p>
          <a href="https://zoom.us/start/videomeeting" target="_blank" rel="noreferrer" className="text-blue-600 text-sm font-semibold hover:underline">Iniciar Zoom →</a>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Agendar</h3>
          <p className="text-sm text-gray-500 mb-4">Recuerda enviar la invitación por correo al paciente.</p>
        </div>
      </div>
    </div>
  );
};

export default TelemedicinePanel;
