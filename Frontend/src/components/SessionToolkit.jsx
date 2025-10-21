// Frontend/src/components/SessionToolkit.jsx
import { useState } from 'react';

import { BASE_URL, token } from '../config';

const SessionToolkit = ({ summary, logId, onAccepted }) => {
  const [note, setNote] = useState('');
  if (!summary) return null;
  const { formulation, suggestedInterventions = [], prioritizedTargets = [] } = summary;
  const accept = async (s) => {
    if (!logId) return;
    await fetch(`${BASE_URL}/clinical/suggestions/${logId}/accept`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ accepted: true, clinicianNotes: note }),
    });
    onAccepted && onAccepted();
  };
  return (
    <aside className="border rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Formulación</h3>
      <textarea className="w-full border rounded p-2 mb-3" rows={4} defaultValue={formulation} />
      <h4 className="font-semibold mb-2">Objetivos priorizados</h4>
      <ul className="list-disc pl-6 mb-3 text-sm">
        {prioritizedTargets.map(t => <li key={t.id}>{t.label} — <span className="text-gray-500 text-xs">{t.rationale}</span></li>)}
      </ul>
      <h4 className="font-semibold mb-2">Intervenciones sugeridas</h4>
      <div className="space-y-3">
        {suggestedInterventions.map((s) => (
          <div key={s.id} className="bg-white border rounded p-3">
            <p className="font-medium">{s.name}</p>
            <p className="text-sm text-gray-700">{s.rationale}</p>
            <p className="text-sm mt-1"><strong>Script:</strong> {s.script}</p>
            <p className="text-sm"><strong>Tarea:</strong> {Array.isArray(s.homework) ? s.homework.join('; ') : s.homework}</p>
            <button onClick={() => accept(s)} className="mt-2 bg-primaryColor text-white px-3 py-1 rounded">Aceptar y aplicar</button>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <label className="text-xs text-gray-600">Notas del clínico (opcional)</label>
        <textarea className="w-full border rounded p-2" rows={2} value={note} onChange={(e)=>setNote(e.target.value)} />
      </div>
    </aside>
  );
};

export default SessionToolkit;
