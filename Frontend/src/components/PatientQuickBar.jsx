// Frontend/src/components/PatientQuickBar.jsx
import { useState } from 'react';
import { BASE_URL, token } from '../config';
import { toast } from 'react-toastify';

const PatientQuickBar = ({ patientId, onSummary }) => {
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/clinical/patients/${patientId}/clinical-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lookbackDays: 30, includeNotes: true }),
      });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  onSummary && onSummary({ summary: json.data, logId: json.logId });
      toast.success('Formulación clínica generada');
    } catch (e) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center gap-3">
      <button onClick={generate} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Generando…' : 'Generar Formulación (IA)'}
      </button>
    </div>
  );
};

export default PatientQuickBar;
