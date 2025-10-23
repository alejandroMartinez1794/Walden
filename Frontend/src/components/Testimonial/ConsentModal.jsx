import React, { useState } from 'react';
import { createPortal } from 'react-dom';

// Simple anonymization helper: remove emails and phone numbers
export function anonymizeTestimony(text) {
  if (!text) return text;
  // remove emails
  let out = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[ANONIMIZADO]');
  // remove phone numbers (simple patterns)
  out = out.replace(/\+?\d[\d ()\-]{6,}\d/g, '[ANONIMIZADO]');
  return out;
}

const ConsentModal = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [consent, setConsent] = useState(false);
  const [anonymous, setAnonymous] = useState(true);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded p-6 w-[92%] max-w-xl z-10 shadow-lg">
        <h3 className="text-xl font-semibold">Compartir tu testimonio</h3>
        <p className="text-sm text-gray-600 mt-2">Tu testimonio se publicará solo con tu consentimiento. Evita incluir datos sensibles (DNI, direcciones, teléfonos).</p>

        <label className="block mt-4">
          <span className="text-sm">Nombre (opcional)</span>
          <input
            className="w-full border px-3 py-2 rounded mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Ana (opcional)"
          />
        </label>

        <label className="block mt-3">
          <span className="text-sm">Tu experiencia</span>
          <textarea
            className="w-full border px-3 py-2 rounded mt-1 min-h-[120px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe brevemente cómo te ayudó el proceso terapéutico..."
          />
        </label>

        <div className="mt-3 flex items-center gap-3">
          <input id="anon" type="checkbox" checked={anonymous} onChange={() => setAnonymous(!anonymous)} />
          <label htmlFor="anon" className="text-sm">Publicar de forma anónima</label>
        </div>

        <div className="mt-2 flex items-start gap-3">
          <input id="consent" type="checkbox" checked={consent} onChange={() => setConsent(!consent)} />
          <label htmlFor="consent" className="text-sm">
            He leído y doy mi <strong>consentimiento informado</strong> para que este testimonio se publique en la plataforma.
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button className="btn bg-transparent border" onClick={onClose}>Cancelar</button>
          <button
            className="btn"
            disabled={!consent || !text.trim()}
            onClick={() => {
              // prepare payload
              const payload = {
                name: anonymous ? 'Anónimo' : (name.trim() || 'Anónimo'),
                text: anonymizeTestimony(text.trim()),
                createdAt: new Date().toISOString(),
              };
              onSubmit && onSubmit(payload);
              // reset
              setName('');
              setText('');
              setConsent(false);
              setAnonymous(true);
              onClose && onClose();
            }}
          >Enviar testimonio</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConsentModal;
