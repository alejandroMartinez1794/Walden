import {useEffect, useState} from 'react';
import { HiOutlineUserCircle, HiOutlineLockClosed, HiOutlinePhotograph } from 'react-icons/hi';

import uploadImageToCloudinary from '../../utils/uploadCloudinary';
import { BASE_URL } from '../../config';
import { toast } from 'react-toastify';
import HashLoader from 'react-spinners/HashLoader';

const Profile = ({user, onProfileUpdated}) => {
    
    const [selectFile, setSelectFile] = useState (null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);


    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        photo: null,
        gender:"",
        bloodType:"",
    });

    useEffect ( () => {
        setFormData(prev => ({ 
            ...prev,
            name: user?.name || "", 
            email: user?.email || "", 
            photo: user?.photo || null, 
            gender: user?.gender || "", 
            bloodType: user?.bloodType || "",
            password: "",
        }));
    }, [user]);

    const handleInputChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });  
    }
    
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const persistPhoto = async (photoUrl) => {
        if (!user?._id) {
            throw new Error('No se encontró el usuario para actualizar.');
        }

        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/users/${user._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ photo: photoUrl }),
        });

        const result = await res.json();
        if (!res.ok) {
            throw new Error(result.message || 'No se pudo guardar la foto.');
        }

        const updatedUser = result.data;
        if (updatedUser?.photo) {
            setFormData(prev => ({ ...prev, photo: updatedUser.photo }));
        }

        if (typeof onProfileUpdated === 'function') {
            onProfileUpdated(updatedUser);
        }
    };

    const handleFileInputChange = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const previousPhoto = formData.photo;
        const tempUrl = URL.createObjectURL(file);
        setPreviewUrl(tempUrl);
        setSelectFile(file);
        setPhotoUploading(true);

        try {
            const data = await uploadImageToCloudinary(file);
            const uploadedUrl = data?.secure_url || data?.url;

            if (!uploadedUrl) {
                throw new Error('La imagen se cargó pero no devolvió una URL válida.');
            }

            setFormData(prev => ({ ...prev, photo: uploadedUrl }));
            setPreviewUrl(uploadedUrl);
            await persistPhoto(uploadedUrl);
            toast.success('Foto actualizada correctamente');
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            setPreviewUrl(previousPhoto || null);
            setFormData(prev => ({ ...prev, photo: previousPhoto || null }));
            toast.error(error.message || 'No se pudo subir la imagen. Intenta nuevamente.');
        } finally {
            setPhotoUploading(false);
            setSelectFile(null);
            if (tempUrl && tempUrl.startsWith('blob:')) {
                URL.revokeObjectURL(tempUrl);
            }
        }
    };

    const submitHandler = async event => {

        event.preventDefault();

        if (photoUploading) {
            toast.info('Espera a que la foto termine de subir.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch ( `${BASE_URL}/users/${user._id}`, {
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            const { message, data: updatedUser } = result;

            if(!res.ok) {
                throw new Error(message || 'Error al actualizar el perfil');
            }

            if (updatedUser && typeof onProfileUpdated === 'function') {
                onProfileUpdated(updatedUser);
                setFormData(prev => ({ ...prev, photo: updatedUser.photo }));
            }

            setLoading(false)
            toast.success(message)
            // Evita recargar la página; el estado ya se actualizó.

        }   catch (err) {
            toast.error(err.message);
            setLoading(false);
        } 
    };
    
    const roleLabel =
        user?.role === 'doctor'
            ? 'Doctor/a'
            : user?.role === 'admin'
              ? 'Administrador/a'
              : 'Paciente';
    const dateFormatter = new Intl.DateTimeFormat('es-MX', {
        month: 'short',
        year: 'numeric',
    });
    const joinedDate = user?.createdAt ? dateFormatter.format(new Date(user.createdAt)) : 'Sin registro';
    const resolvedPhoto =
        previewUrl ||
        formData.photo ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Paciente')}&background=0A1F44&color=fff`;

    return (
        <div className="mt-10 space-y-8">
            <section className="relative overflow-hidden rounded-[32px] border border-white/30 bg-gradient-to-br from-[#09132a] via-[#0f1d3d] to-[#1d3767] p-8 text-white shadow-[0_30px_80px_rgba(6,10,24,0.65)]">
                <div
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 15% 20%, rgba(59,130,246,0.45), transparent 45%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.35), transparent 40%)',
                    }}
                />
                <div className="relative grid gap-8 lg:grid-cols-[1.2fr,0.8fr] items-center">
                    <div className="space-y-4">
                        <p className="text-xs uppercase tracking-[0.4em] text-white/70">Configuración de perfil</p>
                        <h2 className="text-3xl font-semibold leading-tight">Diseñamos este espacio para mantener tus datos terapéuticos alineados a tu proceso.</h2>
                        <p className="text-base text-white/80">
                            Mantén tu información clínica y de contacto actualizada para que las sesiones, recordatorios y
                            reportes clínicos reflejen tu momento actual.
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Rol</p>
                                <p className="text-lg font-semibold">{roleLabel}</p>
                            </div>
                            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                                <p className="text-xs uppercase tracking-[0.3em] text-white/70">En terapia desde</p>
                                <p className="text-lg font-semibold">{joinedDate}</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative rounded-[28px] border border-white/20 bg-white/5 p-6 backdrop-blur">
                        <div className="flex items-center gap-5">
                            <figure className="h-20 w-20 overflow-hidden rounded-3xl border border-white/40 shadow-lg">
                                <img src={resolvedPhoto} alt={`Foto de ${formData.name || 'paciente'}`} className="h-full w-full object-cover" />
                            </figure>
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-white/70">Perfil activo</p>
                                <p className="text-2xl font-semibold">{formData.name || 'Paciente sin nombre'}</p>
                                <p className="text-white/70">{formData.email || 'Sin correo'}</p>
                            </div>
                        </div>
                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-white/10 p-3 text-center">
                                <p className="text-xs uppercase tracking-[0.35em] text-white/70">Tipo de sangre</p>
                                <p className="text-xl font-semibold">{formData.bloodType || 'N/A'}</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 p-3 text-center">
                                <p className="text-xs uppercase tracking-[0.35em] text-white/70">Género</p>
                                <p className="text-xl font-semibold">{formData.gender || 'Sin definir'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <form onSubmit={submitHandler} className="space-y-8">
                <section className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                    <header className="mb-6 space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-primaryColor/10 p-3 text-primaryColor">
                                <HiOutlineUserCircle className="h-6 w-6" />
                            </div>
                            <div>
                        <p className="text-sm font-semibold text-slate-500">Datos personales</p>
                        <h3 className="text-2xl font-semibold text-slate-900">Identidad terapéutica</h3>
                        <p className="text-sm text-slate-500">Estos datos se muestran en cada interacción clínica y en los reportes enviados por correo.</p>
                            </div>
                        </div>
                    </header>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <label className="space-y-2 text-sm font-medium text-slate-600">
                            Nombre completo
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                                placeholder="Nombre y apellidos"
                                required
                            />
                        </label>
                        <label className="space-y-2 text-sm font-medium text-slate-600">
                            Correo electrónico
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-base text-slate-500"
                                readOnly
                                aria-readonly
                            />
                            <span className="text-xs font-normal text-slate-400">Gestionamos accesos seguros con este correo.</span>
                        </label>
                        <label className="space-y-2 text-sm font-medium text-slate-600">
                            Género percibido
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-base text-slate-900 focus:border-cyan-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                            >
                                <option value="">Selecciona</option>
                                <option value="Male">Masculino</option>
                                <option value="female">Femenino</option>
                                <option value="other">Otro</option>
                            </select>
                        </label>
                        <label className="space-y-2 text-sm font-medium text-slate-600">
                            Tipo de sangre
                            <input
                                type="text"
                                name="bloodType"
                                value={formData.bloodType}
                                onChange={handleInputChange}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                                placeholder="Ej. O+, A-, etc."
                                required
                            />
                        </label>
                    </div>
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                    <header className="mb-6 space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-primaryColor/10 p-3 text-primaryColor">
                                <HiOutlineLockClosed className="h-6 w-6" />
                            </div>
                            <div>
                        <p className="text-sm font-semibold text-slate-500">Seguridad y acceso</p>
                        <h3 className="text-2xl font-semibold text-slate-900">Credenciales del portal</h3>
                        <p className="text-sm text-slate-500">Solo cambia la contraseña si necesitas ajustar tu acceso. Déjala vacía para mantener la actual.</p>
                            </div>
                        </div>
                    </header>
                    <label className="space-y-2 text-sm font-medium text-slate-600">
                        Contraseña
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                            placeholder="••••••••"
                        />
                        <span className="text-xs font-normal text-slate-400">La contraseña debe tener al menos 8 caracteres combinando letras y números.</span>
                    </label>
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                    <header className="mb-6 space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-primaryColor/10 p-3 text-primaryColor">
                                <HiOutlinePhotograph className="h-6 w-6" />
                            </div>
                            <div>
                        <p className="text-sm font-semibold text-slate-500">Foto terapéutica</p>
                        <h3 className="text-2xl font-semibold text-slate-900">Imagen de referencia clínica</h3>
                        <p className="text-sm text-slate-500">Se muestra en tu tablero, mensajes recordatorios y planillas para tu terapeuta.</p>
                            </div>
                        </div>
                    </header>
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                        <figure className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                            <img src={resolvedPhoto} alt={`Foto de ${formData.name || 'paciente'}`} className="h-full w-full object-cover" />
                        </figure>
                        <div className="flex-1 space-y-2 text-sm text-slate-500">
                            <p className="font-semibold text-slate-700">Sube una imagen nítida, de preferencia con fondo neutro.</p>
                            <p>Formato recomendado: JPG o PNG de hasta 5 MB.</p>
                            {photoUploading && <p className="text-cyan-600">Procesando la subida...</p>}
                        </div>
                        <div className="relative w-full max-w-xs">
                            <input
                                type="file"
                                name="photo"
                                id="customfile"
                                onChange={handleFileInputChange}
                                disabled={photoUploading}
                                accept=".jpg,.jpeg,.png,image/*"
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            />
                            <label
                                htmlFor="customfile"
                                className={`flex h-12 w-full items-center justify-center rounded-2xl border border-slate-300 bg-slate-900 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.01] ${photoUploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                            >
                                {photoUploading ? 'Subiendo...' : 'Actualizar foto'}
                            </label>
                        </div>
                    </div>
                </section>

                <div className="rounded-[28px] border border-slate-900/10 bg-slate-900 text-white shadow-[0_25px_70px_rgba(9,12,24,0.55)]">
                    <button
                        disabled={loading || photoUploading}
                        type="submit"
                        className="w-full rounded-[28px] px-6 py-5 text-lg font-semibold transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? <HashLoader size={25} color="#ffffff" /> : 'Guardar cambios' }
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;