// Frontend/src/Dashboard/user-account/MedicalHistory.jsx
import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../config';
import uploadImageToCloudinary from '../../utils/uploadCloudinary';

const MedicalHistory = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [records, setRecords] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    type: 'consultation',
    title: '',
    description: '',
    date: new Date().toISOString().substring(0, 10),
    file: null,
  });

  useEffect(() => {
    const fetchRecords = async () => {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/health/records`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setRecords(json.data || []);
    };
    fetchRecords();
  }, []);

  const categories = [
    { id: 'all', label: 'Todos', icon: '📋', color: 'blue' },
    { id: 'consultation', label: 'Consultas', icon: '🩺', color: 'green' },
    { id: 'lab', label: 'Laboratorio', icon: '🧪', color: 'purple' },
    { id: 'prescription', label: 'Recetas', icon: '💊', color: 'orange' }
  ];

  const filteredRecords = activeCategory === 'all' 
    ? records 
    : (records || []).filter(record => record.type === activeCategory);

  const getTypeColor = (type) => {
    const colors = {
      consultation: 'bg-green-100 text-green-800 border-green-200',
      lab: 'bg-purple-100 text-purple-800 border-purple-200',
      prescription: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeLabel = (type) => {
    const labels = {
      consultation: 'Consulta',
      lab: 'Laboratorio',
      prescription: 'Receta'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">📋 Historial Médico</h1>
        <p className="text-blue-100">Consulta tu historial completo de atención médica</p>
      </div>

      {/* Category Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              activeCategory === category.id
                ? `bg-${category.color}-500 border-${category.color}-600 text-white shadow-lg`
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <span className="text-3xl mb-2 block">{category.icon}</span>
              <span className={`font-semibold ${
                activeCategory === category.id ? 'text-white' : 'text-gray-800'
              }`}>
                {category.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Medical Records Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Registros Médicos ({filteredRecords.length})
        </h2>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No hay registros en esta categoría</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div key={record._id} className="border-l-4 border-primaryColor bg-gray-50 rounded-r-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(record.type)}`}>
                      {getTypeLabel(record.type)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(record.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {record.status === 'active' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      Activo
                    </span>
                  )}
                </div>

                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">{record.doctor || 'Profesional'}</span> • {record.specialty || ''}
                  </p>
                  <h3 className="font-bold text-gray-800 text-lg">{record.title || record.diagnosis}</h3>
                </div>

                <p className="text-gray-700 text-sm bg-white p-3 rounded-lg">
                  {record.description || record.notes}
                </p>

                <div className="mt-3 flex gap-2">
                  <button className="text-primaryColor hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver Detalles
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Health Metrics Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Resumen de Salud
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">Presión Arterial</p>
            <p className="text-2xl font-bold text-blue-900">120/80</p>
            <p className="text-xs text-blue-600 mt-1">mmHg - Normal</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800 font-medium mb-2">Frecuencia Cardíaca</p>
            <p className="text-2xl font-bold text-green-900">72</p>
            <p className="text-xs text-green-600 mt-1">bpm - Normal</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-800 font-medium mb-2">IMC</p>
            <p className="text-2xl font-bold text-purple-900">23.5</p>
            <p className="text-xs text-purple-600 mt-1">kg/m² - Normal</p>
          </div>
        </div>
      </div>

  {/* Upload Medical Records */}
  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow-md p-6 border-l-4 border-orange-500">
        <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Subir Documentos Médicos
        </h2>
        <p className="text-gray-700 mb-4">Sube tus análisis, recetas o cualquier documento médico relevante.</p>
        <button
          onClick={() => setShowUpload(true)}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-all shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Subir Documento
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold mb-4">Nuevo Registro Médico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="consultation">Consulta</option>
                  <option value="lab">Laboratorio</option>
                  <option value="prescription">Receta</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Título</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ej: Consulta cardiología"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Notas relevantes..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Archivo (opcional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowUpload(false)} className="px-4 py-2 rounded-lg border">Cancelar</button>
              <button
                disabled={uploading}
                onClick={async () => {
                  try {
                    setUploading(true);
                    let attachments = [];
                    if (form.file) {
                      const uploaded = await uploadImageToCloudinary(form.file);
                      if (uploaded?.secure_url) {
                        attachments.push({ url: uploaded.secure_url, name: form.file.name, type: uploaded.resource_type });
                      }
                    }

                    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                    const res = await fetch(`${BASE_URL}/health/records`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({
                        type: form.type,
                        title: form.title || 'Registro',
                        description: form.description,
                        date: new Date(form.date).toISOString(),
                        attachments,
                      })
                    });
                    if (res.ok) {
                      const list = await fetch(`${BASE_URL}/health/records`, { headers: { Authorization: `Bearer ${token}` } });
                      const json = await list.json();
                      if (list.ok) setRecords(json.data || []);
                      setShowUpload(false);
                      setForm({ type: 'consultation', title: '', description: '', date: new Date().toISOString().substring(0, 10), file: null });
                    }
                  } finally {
                    setUploading(false);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-white ${uploading ? 'bg-gray-400' : 'bg-primaryColor hover:bg-blue-700'}`}
              >
                {uploading ? 'Subiendo...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
