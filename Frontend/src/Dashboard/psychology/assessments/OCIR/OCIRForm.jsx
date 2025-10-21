// Frontend/src/Dashboard/psychology/assessments/OCIR/OCIRForm.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BASE_URL } from '../../../../config';
import Loading from '../../../../components/Loader/Loading';
import Error from '../../../../components/Error/Error';
import { toast } from 'react-toastify';

const OCIRForm = () => {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient: '',
    testDate: new Date().toISOString().split('T')[0],
    responses: Array(18).fill(0),
  });

  // OCI-R uses 0-4 Likert
  const options = [
    { value: 0, label: 'Nunca' },
    { value: 1, label: 'Rara vez' },
    { value: 2, label: 'A veces' },
    { value: 3, label: 'Frecuentemente' },
    { value: 4, label: 'Siempre' },
  ];

  const questions = [
    'Me lavo las manos con más frecuencia o por más tiempo de lo necesario',
    'Verifico cosas más de lo necesario',
    'Encuentro difícil controlar pensamientos no deseados',
    'Me molesta tener que arreglar las cosas en un cierto orden',
    'Evito usar cosas que otros han tocado',
    'Siento la necesidad de repetir ciertas acciones',
    'Me molesta tener que hcer las cosas con precisión',
    'Me preocupa contaminarme con gérmenes o suciedad',
    'Me molesta tener pensamientos violentos o aterradores',
    'Siento la necesidad de poner las cosas en un orden especial',
    'Verifico repetidamente puertas, ventanas, electrodomésticos',
    'Me preocupa perder cosas de valor',
    'Me esfuerzo por recordar cosas con detalles exactos',
    'Me molesta cuando las cosas no están ordenadas como me gusta',
    'Me preocupa tocar cosas que otras personas han tocado',
    'Debo repetir ciertas palabras, frases o números',
    'Me molesta tener pensamientos no deseados sobre hacer daño',
    'Me molesta cuando los objetos no están alineados correctamente',
  ];

  useEffect(() => {
    fetchPatients();
    const preselected = search.get('patient');
    if (preselected) setFormData(d => ({ ...d, patient: preselected }));
  }, []);

  const fetchPatients = async () => {
    try {
      const authToken = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/psychology/patients`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPatients(data.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (index, value) => {
    const next = [...formData.responses];
    next[index] = parseInt(value);
    setFormData({ ...formData, responses: next });
  };

  const total = formData.responses.reduce((a, b) => a + b, 0);
  const severity = total >= 36 ? 'Severa' : total >= 28 ? 'Moderada' : total >= 21 ? 'Leve' : 'Mínima';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) return toast.error('Seleccione un paciente');

    try {
      setSubmitting(true);
      const payload = {
        patient: formData.patient,
        testType: 'OCI-R',
        testDate: formData.testDate,
        responses: formData.responses.map((score, i) => ({
          itemNumber: i + 1,
          question: questions[i],
          response: score,
        })),
        scores: { total },
        interpretation: { severity: severity.toLowerCase(), notes: `OCI-R: ${total}/72 (${severity})` },
      };

      const res = await fetch(`${BASE_URL}/psychology/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success('Evaluación OCI-R guardada');
      navigate(`/psychology/patients/${formData.patient}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-headingColor">OCI-R</h1>
        <p className="text-textColor mt-1">Obsessive-Compulsive Inventory-Revised</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Paciente *</label>
          <select
            value={formData.patient}
            onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Seleccione un paciente</option>
            {patients.map(p => (
              <option key={p._id} value={p._id}>{p.personalInfo?.fullName}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
          <input
            type="date"
            value={formData.testDate}
            onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div className="space-y-6 mb-8">
          {questions.map((q, i) => (
            <div key={i} className="p-4 rounded-lg bg-gray-50">
              <label className="block text-sm font-medium text-gray-900 mb-3">{i + 1}. {q}</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {options.map(opt => (
                  <label key={opt.value} className={`flex items-center p-3 border rounded-lg cursor-pointer ${formData.responses[i] === opt.value ? 'border-primaryColor bg-blue-50 ring-2 ring-primaryColor' : 'border-gray-300 hover:border-gray-400'}`}>
                    <input
                      type="radio"
                      name={`q-${i}`}
                      value={opt.value}
                      checked={formData.responses[i] === opt.value}
                      onChange={(e) => handleResponseChange(i, e.target.value)}
                      className="mr-2"
                      required
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Puntaje Total</p>
          <p className="text-5xl font-bold text-primaryColor mb-2">{total}<span className="text-2xl text-gray-500">/72</span></p>
          <p className="text-lg font-semibold">Severidad {severity}</p>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 border border-gray-300 rounded-lg">Cancelar</button>
          <button type="submit" disabled={submitting} className="bg-primaryColor text-white px-6 py-3 rounded-lg disabled:opacity-50">
            {submitting ? 'Guardando...' : 'Guardar Evaluación'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OCIRForm;
