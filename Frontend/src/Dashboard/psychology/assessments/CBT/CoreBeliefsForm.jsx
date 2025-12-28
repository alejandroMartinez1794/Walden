import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { BASE_URL } from '../../../../config';
import Loading from '../../../../components/Loader/Loading';
import Error from '../../../../components/Error/Error';
import { useAuthToken } from '../../../../hooks/useAuthToken';

const CoreBeliefsForm = () => {
  const token = useAuthToken();
  const navigate = useNavigate();
  const [search] = useSearchParams();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient: '',
    testDate: new Date().toISOString().split('T')[0],
    coreBelief: '',
    origin: '',
    evidenceFor: '',
    evidenceAgainst: '',
    impactAreas: '',
    balancedBelief: '',
    behavioralExperiment: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/psychology/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setPatients(json.data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();

    const preselected = search.get('patient');
    if (preselected) setFormData((d) => ({ ...d, patient: preselected }));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) return toast.error('Seleccione un paciente');
    if (!formData.coreBelief.trim()) return toast.error('Escriba la creencia nuclear a trabajar');

    try {
      setSubmitting(true);

      const payload = {
        patient: formData.patient,
        testType: 'Reformulación de creencias nucleares (TCC)',
        testDate: formData.testDate,
        responses: [
          { itemNumber: 1, question: 'Creencia nuclear', response: formData.coreBelief.trim() },
          { itemNumber: 2, question: 'Origen / evidencias tempranas', response: formData.origin.trim() },
          { itemNumber: 3, question: 'Evidencia a favor', response: formData.evidenceFor.trim() },
          { itemNumber: 4, question: 'Evidencia en contra', response: formData.evidenceAgainst.trim() },
          { itemNumber: 5, question: 'Impacto en áreas de vida', response: formData.impactAreas.trim() },
          { itemNumber: 6, question: 'Creencia balanceada / funcional', response: formData.balancedBelief.trim() },
          { itemNumber: 7, question: 'Experimento conductual propuesto', response: formData.behavioralExperiment.trim() },
        ],
        interpretation: {
          severity: 'registro',
          notes: 'Formato abierto de TCC para trabajar creencias nucleares; no propietario.',
        },
      };

      const res = await fetch(`${BASE_URL}/psychology/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success('Registro de creencias guardado');
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-headingColor">Creencias nucleares (TCC)</h1>
        <p className="text-textColor mt-1">Formato abierto para reformular creencias centrales y planear experimentos</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Paciente *</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
            value={formData.patient}
            onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
          >
            <option value="">Seleccione un paciente</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.personalInfo?.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Registro *</label>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
            value={formData.testDate}
            onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
          />
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Uso clínico:</strong> formula creencia nuclear, recopila evidencias, redacta creencia balanceada y diseña experimento conductual.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">1) Creencia nuclear *</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={2}
            value={formData.coreBelief}
            onChange={(e) => setFormData({ ...formData, coreBelief: e.target.value })}
            placeholder='Ej: "No soy suficiente" / "Si fallo, me rechazan"'
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">2) Origen / evidencias tempranas</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={3}
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            placeholder="Contexto familiar, escolar o eventos que reforzaron la creencia"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">3) Evidencia a favor</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={4}
              value={formData.evidenceFor}
              onChange={(e) => setFormData({ ...formData, evidenceFor: e.target.value })}
              placeholder="Hechos observables, no interpretaciones"
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">4) Evidencia en contra</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={4}
              value={formData.evidenceAgainst}
              onChange={(e) => setFormData({ ...formData, evidenceAgainst: e.target.value })}
              placeholder="Datos que contradicen o matizan la creencia"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">5) Impacto en áreas de vida</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={3}
            value={formData.impactAreas}
            onChange={(e) => setFormData({ ...formData, impactAreas: e.target.value })}
            placeholder="Relaciones, trabajo, autocuidado, ocio, salud"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">6) Creencia balanceada / funcional</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={2}
            value={formData.balancedBelief}
            onChange={(e) => setFormData({ ...formData, balancedBelief: e.target.value })}
            placeholder='Ej: "Tengo limitaciones y también capacidades; puedo aprender y mejorar."'
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">7) Experimento conductual</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={3}
            value={formData.behavioralExperiment}
            onChange={(e) => setFormData({ ...formData, behavioralExperiment: e.target.value })}
            placeholder="Acción para poner a prueba la nueva creencia y criterios de éxito"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-primaryColor text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : 'Guardar registro'}
        </button>
      </form>
    </div>
  );
};

export default CoreBeliefsForm;
