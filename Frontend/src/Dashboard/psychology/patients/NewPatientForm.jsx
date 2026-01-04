import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../../config';
import { useAuthToken } from '../../../hooks/useAuthToken';
import { toast } from 'react-toastify';

const NewPatientForm = () => {
  const token = useAuthToken();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      dateOfBirth: '',
      gender: 'prefer-not-to-say',
      phone: '',
      email: '',
      address: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    },
    clinicalInfo: {
      referralSource: '',
      chiefComplaint: ''
    }
  });

  const handleChange = (e, section, subSection = null) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (subSection) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subSection]: {
              ...prev[section][subSection],
              [name]: value
            }
          }
        };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/psychology/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      toast.success('Paciente creado exitosamente');
      navigate(`/psychology/patients/${result.data._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-headingColor">Nuevo Paciente</h1>
        <p className="text-textColor">Registrar un nuevo paciente manualmente (sin cuenta de usuario obligatoria)</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Personal */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            👤 Información Personal
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.personalInfo.fullName}
                onChange={(e) => handleChange(e, 'personalInfo')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
              <input
                type="date"
                name="dateOfBirth"
                required
                value={formData.personalInfo.dateOfBirth}
                onChange={(e) => handleChange(e, 'personalInfo')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Opcional)</label>
              <input
                type="email"
                name="email"
                placeholder="Para vincular con cuenta existente"
                value={formData.personalInfo.email}
                onChange={(e) => handleChange(e, 'personalInfo')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Si el email coincide con un usuario registrado, se vinculará automáticamente.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.personalInfo.phone}
                onChange={(e) => handleChange(e, 'personalInfo')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
              <select
                name="gender"
                value={formData.personalInfo.gender}
                onChange={(e) => handleChange(e, 'personalInfo')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
                <option value="prefer-not-to-say">Prefiero no decir</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                name="address"
                value={formData.personalInfo.address}
                onChange={(e) => handleChange(e, 'personalInfo')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Contacto de Emergencia */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🚑 Contacto de Emergencia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.personalInfo.emergencyContact.name}
                onChange={(e) => handleChange(e, 'personalInfo', 'emergencyContact')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relación</label>
              <input
                type="text"
                name="relationship"
                value={formData.personalInfo.emergencyContact.relationship}
                onChange={(e) => handleChange(e, 'personalInfo', 'emergencyContact')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.personalInfo.emergencyContact.phone}
                onChange={(e) => handleChange(e, 'personalInfo', 'emergencyContact')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Información Inicial */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📋 Datos de Ingreso
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de Consulta (Queja Principal)</label>
              <textarea
                name="chiefComplaint"
                rows="3"
                value={formData.clinicalInfo.chiefComplaint}
                onChange={(e) => handleChange(e, 'clinicalInfo')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuente de Referencia</label>
              <input
                type="text"
                name="referralSource"
                placeholder="Ej: Dr. General, Familiar, Publicidad..."
                value={formData.clinicalInfo.referralSource}
                onChange={(e) => handleChange(e, 'clinicalInfo')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primaryColor text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Guardando...' : 'Crear Expediente'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPatientForm;
