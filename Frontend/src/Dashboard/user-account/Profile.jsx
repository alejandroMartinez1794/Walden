import {useEffect, useState} from 'react';

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
    
    return ( 
        <div className='mt-10'>           
            <form onSubmit={submitHandler}>
                <div className="mb-5">
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none
                        focus:border-b-primaryColor text-[22px] leading-7 text-headingColor
                        placeholder: text-textColor  cursor-pointer"
                        required
                    />
                </div>
                <div className="mb-5">
                    <input
                        type="email"
                        placeholder="Ingresa tu correo"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none
                        focus:border-b-primaryColor text-[22px] leading-7 text-headingColor
                        placeholder: text-textColor  cursor-pointer"
                        aria-readonly
                        readOnly
                    />
                </div>
                <div className="mb-5">
                    <input
                        type="password"
                        placeholder="Contraseña"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none
                        focus:border-b-primaryColor text-[22px] leading-7 text-headingColor
                        placeholder: text-textColor  cursor-pointer"
                        
                    />
                </div>

                <div className="mb-5">
                    <input
                        type="text"
                        placeholder="Tipo de sangre"
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleInputChange}
                        className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none
                        focus:border-b-primaryColor text-[22px] leading-7 text-headingColor
                        placeholder: text-textColor  cursor-pointer"
                        required
                    />
                </div>

                <div className="mb-5 flex items-center justify-between">

                    <label
                        className="text-headingColor font-bold text-[16px] leading-7"
                    >
                        Género:
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="text-textColor font-semibold text-[15px] leading-7 px-4 py-3
                            focus:outline-none"
                        >
                            <option value="">Selecciona</option>
                            <option value="Male">Masculino</option>
                            <option value="female">Femenino</option>
                            <option value="other">Otro</option>

                        </select>
                    </label>
                </div>

                <div className="mb-5 flex items-center gap-3">

                    {(previewUrl || formData.photo) && (
                        <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center
                        justify-center">
                            <img 
                                src={previewUrl || formData.photo} 
                                alt="" 
                                className="w-full rounded-full"
                            />
                        </figure>
                    )}

                    <div className="relative w-[130px] h-[50px]">
                        <input
                            type="file"
                            name="photo"
                            id="customfile"
                            onChange={handleFileInputChange}
                            disabled={photoUploading}
                            accept=".jpg,.jpeg,.png,image/*"
                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <label
                            htmlFor="customfile"
                            className={`absolute top-0 left-0 w-full h-full flex items-center px-[0.75rem] py-[0.375rem]
                            text-[15px] leading-6 overflow-hidden bg-[#0066ff48] text-headingColor font-semibold rounded-lg
                            truncate ${photoUploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {photoUploading ? 'Subiendo...' : 'Subir foto'}
                        </label>    
                    </div>
                </div>

                <div className='mt-7'>
                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-3"
                    >
                        {loading ? (
                            <HashLoader size={25} color="#ffffff"/> 
                        )   : ( 
                            'Guardar cambios'
                        )}

                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;