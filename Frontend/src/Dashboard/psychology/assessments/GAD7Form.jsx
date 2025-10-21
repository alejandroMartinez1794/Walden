// Frontend/src/Dashboard/psychology/assessments/GAD7Form.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BASE_URL } from '../../../config';
import Loading from '../../../components/Loader/Loading';
import Error from '../../../components/Error/Error';
import { toast } from 'react-toastify';

const GAD7Form = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient: '',
    testDate: new Date().toISOString().split('T')[0],
    responses: Array(7).fill(0),
  });

  const questions = [
    'Sentirse nervioso, ansioso o con los nervios de punta',
    'No poder parar o controlar la preocupación',
    'Preocuparse demasiado por diferentes cosas',
    'Dificultad para relajarse',
    'Estar tan inquieto que es difícil permanecer quieto',
    'Molestarse o irritarse fácilmente',
    'Sentir miedo como si algo terrible pudiera pasar',
  ];

  const options = [
    { value: 0, label: 'Nunca' },
    { value: 1, label: 'Varios días' },
    { value: 2, label: 'Más de la mitad de los días' },
    { value: 3, label: 'Casi todos los días' },
  ];

  useEffect(() => { (async () => {
    try {
      const authToken = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/psychology/patients`, { headers: { Authorization: `Bearer ${authToken}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setPatients(json.data || []);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  })(); }, []);
  useEffect(() => {
    const preselected = search.get('patient');
    if (preselected) {
      setFormData((d) => ({ ...d, patient: preselected }));
    }
  }, [search]);

  const setResponse = (i, v) => {
    const arr = [...formData.responses];
    arr[i] = Number(v);
    setFormData({ ...formData, responses: arr });
  };

  const total = formData.responses.reduce((s, v) => s + Number(v || 0), 0);
  const severity = total >= 15 ? { label: 'Severa', color: 'text-red-600' }
    : total >= 10 ? { label: 'Moderada', color: 'text-orange-600' }
    : total >= 5 ? { label: 'Leve', color: 'text-yellow-600' }
    : { label: 'Mínima', color: 'text-green-600' };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) return toast.error('Seleccione un paciente');
    try {
      setSubmitting(true);
      const payload = {
        patient: formData.patient,
        testType: 'GAD-7',
        testDate: formData.testDate,
        responses: formData.responses.map((score, idx) => ({ itemNumber: idx + 1, response: score })),
        scores: { total },
        interpretation: { severity: severity.label.toLowerCase() },
      };
      const authToken = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/psychology/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      // Also store clinical measure to enable alerts and summaries
      try {
        await fetch(`${BASE_URL}/clinical/patients/${formData.patient}/measures`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ name: 'GAD-7', responses: formData.responses }),
        });
      } catch (e) { console.warn('Failed to create clinical measure:', e); }
      toast.success('Evaluación GAD-7 guardada');
      navigate(`/psychology/patients/${formData.patient}`);
    } catch (e) { toast.error(e.message); } finally { setSubmitting(false); }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-headingColor">GAD-7</h1>
        <p className="text-textColor mt-1">Generalized Anxiety Disorder 7-item</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Paciente *</label>
          <select className="w-full px-4 py-2 border rounded-lg" value={formData.patient} onChange={(e)=>setFormData({ ...formData, patient: e.target.value })}>
            <option value="">Seleccione un paciente</option>
            {patients.map(p => <option key={p._id} value={p._id}>{p.personalInfo?.fullName}</option>)}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Evaluación *</label>
          <input type="date" className="w-full px-4 py-2 border rounded-lg" value={formData.testDate} onChange={(e)=>setFormData({ ...formData, testDate: e.target.value })} />
        </div>

        <div className="space-y-6 mb-8">
          {questions.map((q, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-900 mb-3">{i+1}. {q}</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {options.map((o) => (
                  <label key={o.value} className={`flex items-center p-3 border rounded-lg cursor-pointer ${formData.responses[i]===o.value? 'border-primaryColor bg-blue-50 ring-2 ring-primaryColor':'border-gray-300 hover:border-gray-400'}`}>
                    <input type="radio" name={`q-${i}`} value={o.value} checked={formData.responses[i]===o.value} onChange={(e)=>setResponse(i, e.target.value)} className="mr-2" />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600">Puntaje total</p>
            <p className="text-2xl font-bold">{total} / 21</p>
          </div>
          <div>
            <p className="text-gray-600">Severidad</p>
            <p className={`text-2xl font-bold ${severity.color}`}>{severity.label}</p>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="bg-primaryColor text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {submitting ? 'Guardando...' : 'Guardar GAD-7'}
        </button>
      </form>
    </div>
  );
};

export default GAD7Form;
