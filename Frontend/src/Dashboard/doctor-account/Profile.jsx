import { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";
import { BASE_URL } from "../../config";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";


const Profile = ({doctorData}) => {
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        bio: "",
        gender: "",
        specialization: "",
        ticketPrice: 0, 
        qualifications:[],
        experiences: [],
        timeSlots: [],
        about: " ",
        photo: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setFormData({
            name: doctorData?.name || "",
            email: doctorData?.email || "",
            phone: doctorData?.phone || "",
            bio: doctorData?.bio || "",
            gender: doctorData?.gender || "",
            specialization: doctorData?.specialization || "",
            ticketPrice: doctorData?.ticketPrice ?? 0,
            qualifications: doctorData?.qualifications || [],
            experiences: doctorData?.experiences || [],
            timeSlots: doctorData?.timeSlots || [],
            about: doctorData?.about || "",
            photo: doctorData?.photo || null,
        });
        setPreviewUrl(null);
    }, [doctorData]);

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);


    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const persistPhoto = async (photoUrl) => {
        if (!doctorData?._id) return;
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/doctors/${doctorData._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ photo: photoUrl }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'No se pudo guardar la foto del perfil.');
        }
        const updatedDoctor = result.data;
        if (updatedDoctor?.photo) {
            setFormData(prev => ({ ...prev, photo: updatedDoctor.photo }));
        }
    };

    const handleFileInputChange = async event => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const previousPhoto = formData.photo;
        const tempUrl = URL.createObjectURL(file);
        setPreviewUrl(tempUrl);
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
            toast.success('Foto de perfil actualizada');
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            setPreviewUrl(previousPhoto || null);
            setFormData(prev => ({ ...prev, photo: previousPhoto || null }));
            toast.error(error.message || 'No se pudo subir la imagen. Inténtalo nuevamente.');
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

    const updateProfileHandler = async e => {
        e.preventDefault();

        if (photoUploading) {
            toast.info('Espera a que se termine de subir la foto.');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`${BASE_URL}/doctors/${doctorData._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            toast.success(result.message);
            if (result.data) {
                setFormData(prev => ({ ...prev, ...result.data }));
            }
    
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

        // reusable function to add items to the form data

    const addItem = (key, item) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            [key]: [...prevFormData[key], item],
        }));
    };

    // reusable input change function

    const handleReusableInputChangeFunc = (key, index, event) => {

        const { name, value } = event.target;

        setFormData(prevFormData => {
            const updateItems = [...prevFormData[key]];

            updateItems[index][name] = value

            return {	
                ...prevFormData,
                [key]: updateItems,
            };
        });
    }    

    // reusable function to delete items from the form data

    const deleteItem = (key, index) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            [key]: prevFormData[key].filter((_, i) => i !== index),
        }));
    };

    const addQualification = e => {
        e.preventDefault();

        addItem("qualifications", { 
            startingDate: "",
            endingDate: "", 
            degree: "Master" , 
            university: "Los Libertadores",
        });
    };

    const handleQualificationChange = (event, index) => {
        handleReusableInputChangeFunc("qualifications", index, event)
    };

    const deleteQualification = (e, index) => {
        e.preventDefault();
        deleteItem("qualifications", index)
    }

    const addExperience = e => {
        e.preventDefault();

        addItem("experiences", { 
            startingDate: " " ,
            endingDate: " ", 
            position: "Senior Surgeon ", 
            hospital: " Reina Sofia"
        });
    };

    const handleExperienceChange = (event, index) => {
        handleReusableInputChangeFunc("experiences", index, event)
    };

    const deleteExperience = (e, index) => {
        e.preventDefault();
        deleteItem("experiences", index)
    }

    const addTimeSlot = e => {
        e.preventDefault();

        addItem("timeSlots", {
            day: "Sunday" , 
            startingTime: "10:00", 
            endingDate: "04:30"});
    };

    const handleTimeSlotChange = (event, index) => {
        handleReusableInputChangeFunc("timeSlots", index, event)
    };

    const deleteTimeSlot = (e, index) => {
        e.preventDefault();
        deleteItem("timeSlots", index)
    }

    const resolvedPhoto =
        previewUrl ||
        formData.photo ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Doctor')}&background=0F172A&color=fff&size=256`;

    return (
        <div>
            <h2 className="text-headingColor font-bold text-[24px] leading-9 mb-10">Profile Information</h2>
            <form>
                <div className="mb-5">
                    <p className="form_label">Name*</p>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange}
                        placeholder="Enter your name" 
                        className="form_input"
                    />
                </div>
                <div className="mb-5">
                    <p className="form_label">Email*</p>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange}
                        placeholder="Email" 
                        className="form_input"
                    />
                </div>
                <div className="mb-5">
                    <p className="form_label">Phone*</p>
                    <input 
                        type="text" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange}
                        placeholder="Phone number" 
                        className="form_input"
                    />
                </div>
                <div className="mb-5">
                    <p className="form_label">Bio*</p>
                    <input 
                        type="text" 
                        name="bio" 
                        value={formData.bio} 
                        onChange={handleInputChange}
                        placeholder="Bio" 
                        className="form_input"
                        maxLength={100}
                    />
                </div>
                <div className="mb-5">
                    <div className="grid grid-cols-3 gap-5 mb-[30px]">
                        <div>
                            <p className="form_label">Gender*</p>
                            <select 
                                name="gender" 
                                value={formData.gender} 
                                onChange={handleInputChange} 
                                className="form_input py-3.5"
                            >
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>                                
                        </div>
                        <div>
                            <p className="form_label">specialization*</p>
                            <select 
                                name="specialization" 
                                value={formData.specialization} 
                                onChange={handleInputChange} 
                                className="form_input py-3.5"
                            >
                                <option value="">Select</option>
                                <option value="surgeon">Surgeon</option>
                                <option value="neurologist">Neurologist</option>
                                <option value="dermatologist">Dermatologist</option>
                            </select>                                
                        </div>
                        <div>
                            <p className="form_label">Ticket Price*</p>
                            <input 
                                type="number"
                                placeholder="100" 
                                name="ticketPrice" 
                                value={formData.ticketPrice}
                                className="form_input"
                                onChange={handleInputChange}
                            />
                        </div>    
                    </div>        
                </div>
                <div className="mb-5">
                    <p className="form_label"> Qualifications*</p>
                    {formData.qualifications?.map((item, index) => (
                        <div key={index}>
                            <div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <p className="form_label">Starting Date*</p>
                                        <input 
                                            type="date" 
                                            name="startingDate" 
                                            value={item.startingDate}
                                            className="form_input"
                                            onChange={(e) => handleQualificationChange(e, index)}
                                        />
                                    </div>
                                    <div>
                                        <p className="form_label">Ending Date*</p>
                                        <input 
                                            type="date" 
                                            name="endingDate" 
                                            value={item.endingDate}
                                            className="form_input"
                                            onChange={(e) => handleQualificationChange(e, index)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5 mt-5">
                                    <div>
                                        <p className="form_label">Degree*</p>
                                        <input 
                                            type="text" 
                                            name="degree" 
                                            value={item.degree}
                                            className="form_input"
                                            onChange={(e) => handleQualificationChange(e, index)}
                                        />
                                    </div>
                                    <div>
                                        <p className="form_label">University*</p>
                                        <input 
                                            type="text" 
                                            name="university" 
                                            value={item.university}
                                            className="form_input"
                                            onChange={(e) => handleQualificationChange(e, index)}
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={e=>deleteQualification(e,index)}
                                    className="bg-red-600 p-2 rounded-full text-white text-[18px] mt-2 mb-[30px] 
                                    cursor-pointer"
                                >
                                    <AiOutlineDelete />
                                </button>
                            </div>                    
                        </div>
                    ))}
                    <button 
                        onClick={addQualification}
                        className="bg-[#000] py-2 px-5 rounded text-white h-fit cursor-pointer"
                    >
                        Add Qualification
                    </button>                        
                </div>
                <div className="mb-5">
                    <p className="form_label"> Experiences*</p>
                    {formData.experiences?.map((item, index) => (
                        <div key={index}>
                            <div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <p className="form_label">Starting Date*</p>
                                        <input 
                                            type="date" 
                                            name="startingDate" 
                                            value={item.startingDate}
                                            className="form_input"
                                            onChange={(e) => handleExperienceChange(e, index)}
                                        />
                                    </div>
                                    <div>
                                        <p className="form_label">Ending Date*</p>
                                        <input 
                                            type="date" 
                                            name="endingDate" 
                                            value={item.endingDate}
                                            className="form_input"
                                            onChange={(e) => handleExperienceChange(e, index)}

                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5 mt-5">
                                    <div>
                                        <p className="form_label">Position*</p>
                                        <input 
                                            type="text" 
                                            name="position" 
                                            value={item.position}
                                            className="form_input"
                                            onChange={(e) => handleExperienceChange(e, index)}

                                        />
                                    </div>
                                    <div>
                                        <p className="form_label">Hospital*</p>
                                        <input 
                                            type="text" 
                                            name="hospital" 
                                            value={item.hospital}
                                            className="form_input"
                                            onChange={(e) => handleExperienceChange(e, index)}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={e=>deleteExperience(e,index)}
                                    className="bg-red-600 p-2 rounded-full text-white text-[18px] mt-2 mb-[30px] cursor-pointer">
                                    <AiOutlineDelete />
                                    </button>
                            </div>                    
                        </div>
                    ))}
                    <button onClick={addExperience} className="bg-[#000] py-2 px-5 rounded text-white h-fit cursor-pointer">
                        Add Experience
                    </button>                        
                </div>
                <div className="mb-5">
                    <p className="form_label"> Time Slots*</p>
                    {formData.timeSlots?.map((item, index) => (
                        <div key={index}>
                            <div>
                                <div className="grid grid-cols-2 md:grid-cols-4 mb-[30px] gap-5">
                                    <div>
                                        <p className="form_label">Day*</p>
                                        <select 
                                            name="day" 
                                            value={item.day} 
                                            className="form_input py-3.5"
                                            onChange={(e) => handleTimeSlotChange(e, index)}
                                        >

                                        <option value="">Select</option>
                                        <option value="saturday">Saturday</option>
                                        <option value="sunday">Sunday</option>
                                        <option value="monday">Monday</option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">Wednesday</option>
                                        <option value="thursday">Thursday</option>
                                        <option value="friday">Friday</option>
                                        </select>    
                                    </div>
                                    <div>
                                        <p className="form_label">Starting Time*</p>
                                        <input 
                                            type="time" 
                                            name="startingTime" 
                                            value={item.startingTime}
                                            className="form_input"
                                            onChange={(e) => handleTimeSlotChange(e, index)}

                                        />
                                    </div>
                                    <div>
                                        <p className="form_label">Ending Date*</p>
                                        <input 
                                            type="time" 
                                            name="endingDate" 
                                            value={item.endingDate}
                                            className="form_input"
                                            onChange={(e) => handleTimeSlotChange(e, index)}
                                        />

                                    </div>
                                    <div onClick={e=> deleteTimeSlot(e, index)} className="flex items-center">
                                        <button className="bg-red-600 p-2 rounded-full text-white text-[18px] cursor-pointer mt-6">
                                        <AiOutlineDelete />
                                        </button>
                                    </div>
                                </div>
                            </div>                    
                        </div>
                    ))}
                    <button onClick={addTimeSlot} className="bg-[#000] py-2 px-5 rounded text-white h-fit cursor-pointer">
                        Add TimeSlot
                    </button>                        
                </div>
                <div className="mb-5">
                    <p className="form_label">About*</p>
                    <textarea 
                        name="about" 
                        rows={5} 
                        value={formData.about} 
                        placeholder="Write about you" 
                        onChange={handleInputChange}
                        className="form_input"
                    ></textarea>
                </div>
                <div className="mb-5">
                    <div className="flex items-center gap-5">
                        <figure className="w-[70px] h-[70px] rounded-full border border-dashed border-primaryColor/60 flex items-center justify-center overflow-hidden bg-slate-50 p-1">
                            <img
                                src={resolvedPhoto}
                                alt={`Foto de ${formData.name || 'doctor'}`}
                                className="h-full w-full object-contain"
                            />
                        </figure>
                        <div className="space-y-1 text-sm text-slate-500">
                            <p className="font-semibold text-slate-700">Elige un retrato profesional en formato JPG o PNG.</p>
                            {photoUploading && <p className="text-primaryColor">Procesando la imagen...</p>}
                        </div>
                    </div>

                    <div className="relative mt-4 w-[160px] h-[48px]">
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
                            className={`absolute top-0 left-0 w-full h-full flex items-center justify-center px-4 py-2 text-[15px] leading-6 overflow-hidden rounded-lg font-semibold ${photoUploading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#0066ff] text-white cursor-pointer hover:bg-[#004fbe]'}`}
                        >
                            {photoUploading ? 'Subiendo...' : 'Actualizar foto'}
                        </label>    
                    </div>
                </div>
                <div className="mt-7">
                    <button
                        type="submit"
                        onClick={updateProfileHandler}
                        disabled={photoUploading || submitting}
                        className="bg-primaryColor text-white text-[18px]
                    leading-[30px] w-full py-3 px-4 rounded-lg disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {submitting ? <HashLoader size={22} color="#ffffff" /> : 'Update Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;