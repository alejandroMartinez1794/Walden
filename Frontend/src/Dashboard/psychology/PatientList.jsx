// Frontend/src/Dashboard/psychology/PatientList.jsx
import { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loader/Loading';
import Error from '../../components/Error/Error';
import { useAuthToken } from '../../hooks/useAuthToken';

const PatientList = () => {
  const token = useAuthToken();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, [statusFilter]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const url = statusFilter 
        ? `${BASE_URL}/psychology/patients?status=${statusFilter}`
        : `${BASE_URL}/psychology/patients`;
      
      const response = await fetch(url, {
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

  const filteredPatients = patients.filter(patient => {
    const fullName = patient.personalInfo?.fullName || '';
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      discharged: 'bg-gray-100 text-gray-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      referred: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      active: 'Activo',
      discharged: 'Alta',
      'on-hold': 'En Pausa',
      referred: 'Referido',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getRiskBadge = (riskFactors) => {
    if (!riskFactors) return null;
    const hasRisk = riskFactors.suicidalIdeation || riskFactors.selfHarmHistory;
    if (!hasRisk) return null;
    
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        ⚠️ Riesgo
      </span>
    );
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-headingColor">Mis Pacientes</h1>
          <p className="text-textColor mt-1">Gestión de casos clínicos</p>
        </div>
        <Link 
          to="/psychology/patients/new"
          className="bg-primaryColor text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Paciente
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar paciente</label>
            <input
              type="text"
              placeholder="Nombre del paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado del caso</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="on-hold">En Pausa</option>
              <option value="discharged">Dados de Alta</option>
              <option value="referred">Referidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500">No se encontraron pacientes</p>
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
                    Diagnóstico Principal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Sesión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => {
                  const primaryDx = patient.clinicalInfo?.diagnoses?.find(d => d.type === 'primary');
                  
                  return (
                    <tr key={patient._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {patient.personalInfo?.fullName}
                              {getRiskBadge(patient.clinicalInfo?.riskFactors)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.personalInfo?.email}
                            </div>
                          </div>
                        </div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.lastSessionDate ? (
                          new Date(patient.lastSessionDate).toLocaleDateString('es-ES')
                        ) : (
                          <span className="text-gray-400 italic">Sin sesiones</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(patient.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/psychology/patients/${patient._id}`}
                          className="text-primaryColor hover:text-blue-900 mr-4"
                        >
                          Ver Ficha
                        </Link>
                        <Link
                          to={`/psychology/patients/${patient._id}/clinical-history`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Historia Clínica
                        </Link>
                        <Link
                          to={`/psychology/patients/${patient._id}/session`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Nueva Sesión
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
      <div className="mt-4 text-sm text-gray-600">
        Mostrando {filteredPatients.length} de {patients.length} pacientes
      </div>
    </div>
  );
};

export default PatientList;
