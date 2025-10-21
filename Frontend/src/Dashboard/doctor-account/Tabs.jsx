import React, { useContext } from 'react';
import { BiMenu } from 'react-icons/bi';
import { authContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Tabs = ({ tab, setTab }) => {
    const { dispatch } = useContext(authContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/');
    };

    return (
        <div>
            <span className='lg:hidden'>
                <BiMenu className='w-6 h-6 cursor-pointer' />
            </span>
            <div className='hidden lg:flex flex-col p-[30px] bg-white shadow-panelShadow items-center h-max rounded-md'>
                
                {/* Botón Overview */}
                <button
                    onClick={() => setTab('overview')}
                    className={`${
                        tab === 'overview'
                            ? 'bg-indigo-100 text-primaryColor'
                            : 'bg-transparent text-headingColor'
                    } w-full btn mt-0 rounded-md`}
                >
                    Overview
                </button>

                {/* Botón Appointments */}
                <button
                    onClick={() => setTab('appointments')}
                    className={`${
                        tab === 'appointments'
                            ? 'bg-indigo-100 text-primaryColor'
                            : 'bg-transparent text-headingColor'
                    } w-full btn mt-0 rounded-md`}
                >
                    Appointments
                </button>

                {/* Botón Profile */}
                <button
                    onClick={() => setTab('settings')}
                    className={`${
                        tab === 'settings'
                            ? 'bg-indigo-100 text-primaryColor'
                            : 'bg-transparent text-headingColor'
                    } w-full btn mt-0 rounded-md`}
                >
                    Profile
                </button>

                {/* Botón Psychology Dashboard */}
                <button
                    onClick={() => navigate('/psychology/dashboard')}
                    className="w-full btn mt-0 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 font-semibold flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Psychology (TCC)
                </button>

                {/* Botón para la Nueva Funcionalidad */}
                <button
                    onClick={() => setTab('doctor-insights')}
                    className={`${
                        tab === 'doctor-insights'
                            ? 'bg-indigo-100 text-primaryColor'
                            : 'bg-transparent text-headingColor'
                    } w-full btn mt-0 rounded-md`}
                >
                        Doctor Insights
                </button>

                <div className='mt-[100px] w-full'>
                    {/* Botón Logout */}
                    <button 
                        onClick={handleLogout}
                        className='w-full bg-[#181A1E] p-3 text-[16px] leading-7 rounded-md text-white'
                    >
                        Logout
                    </button>

                    {/* Botón Delete Account */}
                    <button className='w-full bg-red-600 mt-4 p-3 text-[16px] leading-7 rounded-md text-white'>
                        Delete Account
                    </button>     
                </div>
            </div>
        </div>
    );
};

export default Tabs;