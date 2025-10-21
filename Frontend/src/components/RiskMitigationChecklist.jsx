// Frontend/src/components/RiskMitigationChecklist.jsx
import { useState } from 'react';
import { BASE_URL, token } from '../config';

const RiskMitigationChecklist = ({ alert, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    emergencyContact: '',
    safetyPlan: '',
    urgentAppointment: true,
    scheduledAt: new Date().toISOString().slice(0,16),
    notes: '',
  });

  const save = async () => {
    const res = await fetch(`${BASE_URL}/clinical/alerts/${alert._id}/mitigation`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (res.ok) { onUpdated && onUpdated(json.data); onClose && onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Checklist de Mitigación de Riesgo</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="space-y-3">
          <input className="w-full border rounded p-2" placeholder="Contacto de emergencia" value={form.emergencyContact} onChange={(e)=>setForm({...form, emergencyContact:e.target.value})} />
          <textarea className="w-full border rounded p-2" rows={3} placeholder="Plan de seguridad" value={form.safetyPlan} onChange={(e)=>setForm({...form, safetyPlan:e.target.value})} />
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.urgentAppointment} onChange={(e)=>setForm({...form, urgentAppointment:e.target.checked})} /> Programar cita urgente</label>
          <input type="datetime-local" className="w-full border rounded p-2" value={form.scheduledAt} onChange={(e)=>setForm({...form, scheduledAt:e.target.value})} />
          <textarea className="w-full border rounded p-2" rows={2} placeholder="Notas" value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
          <button onClick={save} className="px-4 py-2 rounded bg-red-600 text-white">Guardar acciones</button>
        </div>
      </div>
    </div>
  );
};

export default RiskMitigationChecklist;
