// Frontend/src/Dashboard/user-account/MedicalHistory.jsx
import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../config';
import uploadImageToCloudinary from '../../utils/uploadCloudinary';
import { toast } from 'react-toastify';
import {
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiOutlineBeaker,
  HiOutlineTag,
  HiOutlinePlus,
  HiOutlineHeart,
  HiOutlineScale,
} from 'react-icons/hi';

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
    files: [],
  });

  useEffect(() => {
    const fetchRecords = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/health/records`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setRecords(json.data || []);
    };
    fetchRecords();
  }, []);

  const categories = [
    { id: 'all', label: 'Todos', icon: HiOutlineTag },
    { id: 'consultation', label: 'Consultas', icon: HiOutlineDocumentText },
    { id: 'lab', label: 'Laboratorio', icon: HiOutlineBeaker },
    { id: 'prescription', label: 'Recetas', icon: HiOutlineClipboardList },
  ];

  const filteredRecords = activeCategory === 'all' 
    ? records 
    : (records || []).filter(record => record.type === activeCategory);

  const getTypeColor = (type) => {
    const colors = {
      consultation: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
      lab: 'bg-violet-50 text-violet-700 border border-violet-100',
      prescription: 'bg-amber-50 text-amber-700 border border-amber-100',
    };
    return colors[type] || 'bg-slate-100 text-slate-700 border border-slate-200';
  };

  const getTypeLabel = (type) => {
    const labels = {
      consultation: 'Consulta',
      lab: 'Laboratorio',
      prescription: 'Receta',
      other: 'Otro'
    };
    return labels[type] || type;
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const maxSize = 5 * 1024 * 1024;
    const invalidFiles = selectedFiles.filter(f => f.size > maxSize);
    if (invalidFiles.length > 0) {
      toast.error('Algunos archivos superan el límite de 5 MB');
      return;
    }
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const invalidTypes = selectedFiles.filter(f => !allowedTypes.includes(f.type));
    if (invalidTypes.length > 0) {
      toast.error('Solo se permiten archivos JPG, PNG o PDF');
      return;
    }
    setForm({ ...form, files: selectedFiles });
  };

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error('El título es obligatorio');
      return;
    }

    try {
      setUploading(true);
      let attachments = [];
      
      // Upload multiple files
      if (form.files.length > 0) {
        toast.info(`Subiendo ${form.files.length} archivo(s)...`);
        for (let file of form.files) {
          const uploaded = await uploadImageToCloudinary(file);
          if (uploaded?.secure_url) {
            attachments.push({ url: uploaded.secure_url, name: file.name, type: uploaded.resource_type });
          }
        }
        toast.success(`${attachments.length} archivo(s) cargado(s)`);
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/health/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: form.type,
          title: form.title,
          description: form.description,
          date: new Date(form.date).toISOString(),
          attachments,
        })
      });
      const json = await res.json();
      if (res.ok) {
        const list = await fetch(`${BASE_URL}/health/records`, { headers: { Authorization: `Bearer ${token}` } });
        const listJson = await list.json();
        if (list.ok) setRecords(listJson.data || []);
        setShowUpload(false);
        setForm({ type: 'consultation', title: '', description: '', date: new Date().toISOString().substring(0, 10), files: [] });
        toast.success('Registro médico creado con éxito');
      } else {
        toast.error(json.message || 'No se pudo crear el registro');
      }
    } catch (error) {
      toast.error('Error al subir los archivos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primaryColor/10 p-3 text-primaryColor">
              <HiOutlineClipboardList className="h-7 w-7" />
            </div>
            <div className="max-w-2xl space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Historial</p>
              <h1 className="text-2xl font-semibold leading-tight text-slate-900 text-pretty">Historial médico</h1>
              <p className="text-sm leading-relaxed text-slate-600 text-pretty">
                Consulta y organiza tus registros (consultas, laboratorio y recetas) en un solo lugar.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-700">
            👩‍⚕️ Registros publicados por tu profesional
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${
                  activeCategory === category.id
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <Icon className="text-base" />
                {category.label}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white/95 p-6 shadow-2xl shadow-slate-900/10 ring-1 ring-white/40">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900/10 p-2 text-slate-900">
                <HiOutlineDocumentText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Registros</p>
                <p className="mt-1 text-sm text-slate-600">
                  {filteredRecords.length} {filteredRecords.length === 1 ? 'registro' : 'registros'} en esta vista
                </p>
              </div>
            </div>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-8 text-center">
            <svg className="mx-auto mb-4 h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm leading-relaxed text-slate-600 text-pretty">No hay registros en esta categoría.</p>
            <p className="mt-2 text-xs text-slate-500">Tu profesional los publicará aquí cuando estén listos.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {filteredRecords.map((record) => (
              <div
                key={record._id}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getTypeColor(record.type)}`}>
                      {getTypeLabel(record.type)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(record.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {record.status === 'active' && (
                    <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                      Activo
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{record.doctor || 'Profesional'}</span>
                    {record.specialty ? <span> · {record.specialty}</span> : null}
                  </p>
                  <h3 className="mt-2 text-base font-semibold leading-snug text-slate-900 text-pretty">
                    {record.title || record.diagnosis}
                  </h3>
                </div>

                <p className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-700 text-pretty">
                  {record.description || record.notes}
                </p>

                {record.attachments && record.attachments.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs text-slate-500">Adjuntos ({record.attachments.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {record.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-300"
                        >
                          {att.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300"
                    type="button"
                  >
                    Ver detalles
                  </button>
                  <button
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300"
                    type="button"
                  >
                    Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-white/95 p-6 shadow-2xl shadow-slate-900/10 ring-1 ring-white/40">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900/10 p-2 text-slate-900">
              <HiOutlineClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Resumen</p>
              <p className="mt-1 text-sm text-slate-600">Indicadores de referencia</p>
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-white p-2 text-slate-900 shadow-sm">
                <HiOutlineHeart className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Presión arterial</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">120/80</p>
            <p className="mt-1 text-xs text-slate-500">mmHg · Normal</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-white p-2 text-slate-900 shadow-sm">
                <HiOutlineHeart className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Frecuencia cardíaca</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">72</p>
            <p className="mt-1 text-xs text-slate-500">bpm · Normal</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-white p-2 text-slate-900 shadow-sm">
                <HiOutlineScale className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">IMC</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">23.5</p>
            <p className="mt-1 text-xs text-slate-500">kg/m² · Normal</p>
          </div>
        </div>
      </div>
      {/* Modal deshabilitado en vista paciente (solo lectura) */}
    </div>
  );
};

export default MedicalHistory;
