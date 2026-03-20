
/* eslint-disable react/prop-types */
import React, { useState, useContext } from 'react';
import { BASE_URL } from './../../config';
import { toast } from 'react-toastify';
import { authContext } from './../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SidePanel = ({ doctorId, ticketPrice, timeSlots }) => {
    const { token } = useContext(authContext);
    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [consentGiven, setConsentGiven] = useState(false);
    const navigate = useNavigate();

    const convertTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        let hours12 = parseInt(hours);
        const ampm = hours12 >= 12 ? 'PM' : 'AM';
        hours12 = hours12 % 12 || 12;
        return `${hours12}:${minutes} ${ampm}`;
    };

    const getNextDate = (dayName) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayIndex = days.indexOf(dayName);
        if (dayIndex === -1) return null;

        const today = new Date();
        const currentDayIndex = today.getDay();
        
        let daysUntil = dayIndex - currentDayIndex;
        if (daysUntil <= 0) {
            daysUntil += 7;
        }
        
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntil);
        return nextDate.toISOString().split('T')[0];
    };

    const bookingHandler = async () => {
        if (!selectedSlot) {
            return toast.error("Por favor selecciona un horario disponible");
        }
        
        if (!consentGiven) {
            return toast.error("Debes aceptar el Consentimiento Informado para agendar.");
        }

        if (!token) {
            toast.error("Debes iniciar sesión para agendar");
            return navigate('/login');
        }

        try {
            setLoading(true);
            const date = getNextDate(selectedSlot.day);
            
            const res = await fetch(`${BASE_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    doctorId,
                    date,
                    time: selectedSlot.startingTime,
                    ticketPrice
                })
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message);
            }

            toast.success("¡Cita agendada con éxito! Revisa tu correo.");
            setLoading(false);
            // Opcional: Redirigir a mis citas
            // navigate('/users/profile/me');
        } catch (err) {
            toast.error(err.message);
            setLoading(false);
        }
    };

    return (
        <div className='shadow-panelShadow p-3 lg:p-5 rounded-md bg-white'>
            <div className='flex items-center justify-between'>
                <p className='text__para mt-0 font-semibold'>Precio de Consulta</p>
                <span className='text-[16px] leading-7 lg:text-[22px] lg:leading-8 text-headingColor font-bold'>
                    {ticketPrice} COP
                </span>
            </div>

            <div className='mt-[30px]'>
                <p className='text__para mt-0 font-semibold text-headingColor'>
                    Horarios Disponibles:
                </p>
                
                <ul className='mt-3'>
                    {timeSlots && timeSlots.length > 0 ? (
                        timeSlots.map((item, index) => (
                            <li 
                                key={index} 
                                onClick={() => setSelectedSlot(item)}
                                className={`flex items-center justify-between mb-2 p-2 rounded cursor-pointer transition-all ${
                                    selectedSlot === item 
                                    ? 'bg-primaryColor text-white shadow-md' 
                                    : 'hover:bg-blue-50 text-textColor'
                                }`}
                            >
                                <p className={`text-[15px] leading-6 font-semibold ${selectedSlot === item ? 'text-white' : ''}`}>
                                    {item.day.charAt(0).toUpperCase() + item.day.slice(1)}
                                </p>
                                <p className={`text-[15px] leading-6 font-semibold ${selectedSlot === item ? 'text-white' : ''}`}>
                                    {convertTime(item.startingTime)} - {convertTime(item.endingDate)}
                                </p>
                            </li>
                        ))
                    ) : (
                        <li className='text-center text-gray-500 text-sm'>
                            No hay horarios disponibles por ahora.
                        </li>
                    )}
                </ul>
            </div>

            <div className='mt-[30px]'>
                <p className='text__para mt-0 font-semibold text-headingColor'>
                    Método de Pago:
                </p>
                <select 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className='w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primaryColor'
                >
                    <option value="card">Tarjeta de Crédito/Débito</option>
                    <option value="nequi">Nequi</option>
                    <option value="daviplata">Daviplata</option>
                    <option value="pse">PSE</option>
                </select>
            </div>

            <div className="mt-4">
                <label className="text-[14px] leading-6 text-textColor font-semibold flex items-start gap-2">
                    <input 
                        type="checkbox" 
                        checked={consentGiven} 
                        onChange={(e) => setConsentGiven(e.target.checked)}
                        className="mt-1"
                    />
                    <span>
                        He leído y acepto el <a href="/terms-of-service" target="_blank" className="text-primaryColor underline hover:text-blue-700">Consentimiento Informado y Política de Datos</a> de Colombia.
                    </span>
                </label>
            </div>

            <button
                onClick={bookingHandler}
                disabled={loading || !consentGiven}
                className='btn px-2 w-full rounded-md mt-5 disabled:bg-gray-400 disabled:cursor-not-allowed'
            >
                {loading ? 'Procesando...' : 'Agendar Cita'}
            </button>
        </div>
    );
};

export default SidePanel;