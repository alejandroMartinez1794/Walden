// Frontend/src/Dashboard/psychology/clinical-history/ClinicalHistoryList.jsx
import { useState, useEffect } from 'react';
import { BASE_URL } from '../../../config';
import { Link } from 'react-router-dom';
import Loading from '../../../components/Loader/Loading';
import Error from '../../../components/Error/Error';
import { useAuthToken } from '../../../hooks/useAuthToken';

const ClinicalHistoryList = () => {
  const token = useAuthToken();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/psychology/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setPatients(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-headingColor flex items-center gap-3">
          📋 Historias Clínicas
        </h1>
        <p className="text-textColor mt-2">
          Gestión de historias clínicas psicológicas (TCC)
        </p>
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 border-l-4 border-primaryColor rounded-lg p-6 mb-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-primaryColor mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-primaryColor mb-2">¿Qué es la Historia Clínica?</h3>
            <p className="text-sm text-gray-700">
              La historia clínica psicológica es el documento fundamental donde registras el motivo de consulta, 
              antecedentes, factores de riesgo, formulación cognitivo-conductual y plan de tratamiento. 
              Es esencial para la trazabilidad clínica y continuidad del cuidado.
            </p>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {patients.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No hay pacientes registrados</p>
            <Link 
              to="/psychology/patients/new"
              className="inline-block mt-4 bg-primaryColor text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              Crear Primer Paciente
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Edad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnóstico Principal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado Historia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => {
                  const primaryDx = patient.clinicalInfo?.diagnoses?.find(d => d.type === 'primary');
                  const hasHistory = patient.clinicalHistory || patient.hasClinicalHistory;
                  
                  return (
                    <tr key={patient._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primaryColor rounded-full flex items-center justify-center text-white font-bold">
                            {patient.personalInfo?.fullName?.charAt(0) || '?'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.personalInfo?.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.personalInfo?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.personalInfo?.age || '-'} años
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {primaryDx ? (
                            <>
                              <span className="font-medium">{primaryDx.code}</span>
                              <br />
                              <span className="text-gray-600 text-xs">{primaryDx.description}</span>
                            </>
                          ) : (
                            <span className="text-gray-400 italic">Sin diagnóstico</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasHistory ? (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Completa
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/psychology/clinical-history/${patient._id}`}
                          className="bg-primaryColor text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all inline-flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          {hasHistory ? 'Editar' : 'Crear'} Historia
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {patients.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Total: {patients.length} paciente{patients.length !== 1 ? 's' : ''} • 
          Historias completas: {patients.filter(p => p.clinicalHistory || p.hasClinicalHistory).length}
        </div>
      )}
    </div>
  );
};

export default ClinicalHistoryList;
