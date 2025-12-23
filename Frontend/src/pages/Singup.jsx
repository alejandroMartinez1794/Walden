import { useState, useContext } from 'react';

import SignupImg from "../assets/images/signup.gif";
import avatar from "../assets/images/doctor-img01.png";
import { Link, useNavigate } from "react-router-dom";
import uploadImageToCloudinary from '../utils/uploadCloudinary';
import { BASE_URL } from '../config';
import { toast } from 'react-toastify';
import HashLoader from 'react-spinners/HashLoader';
import { authContext } from '../context/AuthContext.jsx';
import { getDashboardPath } from '../utils/getDashboardPath';

const Signup   = () => {

    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [loading, setLoading] = useState(false);


    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        photo: null,
        gender:"",
        role:"paciente"
    });

    const navigate = useNavigate();
    const { dispatch } = useContext(authContext);

    const handleInputChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });  
    }
    
    const handleFileInputChange = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const previousPhoto = formData.photo;
        const tempUrl = URL.createObjectURL(file);
        setPhotoPreview(tempUrl);
        setPhotoUploading(true);

        try {
            const data = await uploadImageToCloudinary(file);
            const uploadedUrl = data?.secure_url || data?.url;
            if (!uploadedUrl) {
                throw new Error('La imagen se cargó pero no devolvió una URL válida.');
            }
            setFormData(prev => ({ ...prev, photo: uploadedUrl }));
            setPhotoPreview(uploadedUrl);
            toast.success('Foto subida correctamente');
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            setPhotoPreview(previousPhoto || null);
            setFormData(prev => ({ ...prev, photo: previousPhoto || null }));
            toast.error(error.message || 'No se pudo subir la imagen. Intenta nuevamente.');
        } finally {
            setPhotoUploading(false);
            if (tempUrl && tempUrl.startsWith('blob:')) {
                URL.revokeObjectURL(tempUrl);
            }
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    const autoLoginAfterSignup = async () => {
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password,
            }),
        });

        const loginPayload = await loginRes.json();
        if (!loginRes.ok) {
            throw new Error(loginPayload.message || 'No se pudo iniciar sesión automáticamente.');
        }

        dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
                user: loginPayload.data,
                token: loginPayload.token,
                role: loginPayload.role,
                authProvider: loginPayload.data?.authProvider || 'local',
            },
        });

        return loginPayload;
    };

    const submitHandler = async event => {

        event.preventDefault();

        if (photoUploading) {
            toast.info('Espera a que la imagen termine de subir.');
            return;
        }
        setLoading(true);

        try {
            const res = await fetch ( `${BASE_URL}/auth/register`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const payload = await res.json();
            const successMessage = payload?.message || 'Usuario creado correctamente.';

            if(!res.ok) {
                throw new Error(successMessage);
            }

            toast.success(successMessage);
            const loginResult = await autoLoginAfterSignup();
            const redirectPath = getDashboardPath(loginResult.role);
            navigate(redirectPath, { replace: true });

        }   catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="px-5 xl:px-0">
            <div className="max-w-[1170px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/*----------img box--------*/}
                    <div className="hidden lg:block bg-primaryColor rounded-l-lg">
                        <figure className="rounded-l-lg">
                            <img src={SignupImg} alt="" className="w-full rounded-l-lg"/>
                        </figure>
                    </div>

                    {/*----------sign up form--------*/}
                    <div className="rounded-l-lg lg:pl-16 py-10">
                        <h3 className="text-headingColor text-[22px] leading-9 font-bold mb-10">
                            Create an <span className="text-primaryColor"> account </span>
                        </h3>

                        <form onSubmit={submitHandler}>
                            <div className="mb-5">
                                <input
                                    type="text"
                                    placeholder="Full Name"
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
                                    placeholder="Enter your Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pr-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none
                                    focus:border-b-primaryColor text-[22px] leading-7 text-headingColor
                                    placeholder: text-textColor  cursor-pointer"
                                    required
                                />
                            </div>
                            <div className="mb-5">
                                <input
                                    type="password"
                                    placeholder="password"
                                    name="password"
                                    value={formData.password}
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
                                    Selecciona tu rol:
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="text-textColor font-semibold text-[15px] leading-7 px-4 py-3
                                        focus:outline-none"
                                    >
                                        <option value="paciente">Paciente</option>
                                        <option value="doctor">Doctor</option>

                                    </select>
                                </label>

                                <label
                                    name="role"
                                    className="text-headingColor font-bold text-[16px] leading-7"
                                >
                                    Gender:
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="text-textColor font-semibold text-[15px] leading-7 px-4 py-3
                                        focus:outline-none"
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>

                                    </select>
                                </label>
                            </div>

                            <div className="mb-5 flex items-center gap-3">
                                    <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center
                                    justify-center overflow-hidden">
                                        <img 
                                            src={photoPreview || formData.photo || avatar} 
                                            alt="Foto de perfil" 
                                            className="h-full w-full object-cover"
                                        />
                                    </figure>
                            <div className="relative w-[130px] h-[50px]">
                                    <input
                                        type="file"
                                        name="photo"
                                        id="customfile"
                                        onChange={handleFileInputChange}
                                        accept=".jpg,.jpeg,.png,image/*"
                                        disabled={photoUploading}
                                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <label
                                        htmlFor="customfile"
                                        className="absolute top-0 left-0 w-full h-full flex items-center px-[0.75rem] py-[0.375rem]
                                        text-[15px] leading-6 overflow-hidden bg-[#0066ff48] text-headingColor font-semibold rounded-lg
                                        truncate cursor-pointer"
                                    >
                                        {photoUploading ? 'Subiendo...' : 'Subir foto'}
                                    </label>    
                                </div>
                            </div>

                            <div className='mt-7'>
                                <button
                                    disabled={loading || photoUploading}
                                    type="submit"
                                    className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-3"
                                >
                                    {loading ? (
                                        <HashLoader size={25} color="#ffffff"/> 
                                    )   : ( 
                                        'Sign Up'
                                    )}

                                </button>
                            </div>

                            <p className='mt-8 text-textColor text-center'>
                                Already have an account? 
                                <Link to= "/Login" 
                                className='text-primaryColor font-medium ml-1'> 
                                    Login
                                </Link>
                            </p>

                        </form>

                    </div>

                </div>
            </div>
        </section>
    )
}

export default Signup;
