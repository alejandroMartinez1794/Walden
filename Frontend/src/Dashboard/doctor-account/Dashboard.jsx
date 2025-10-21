import { useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader/Loading';
import Error from '../../components/Error/Error';
import useGetProfile  from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Tabs from './Tabs';
import starIcon from '../../assets/images/Star.png';
import DoctorAbout from './../../pages/Doctors/DoctorAbout';
import Profile from './Profile';
import AppointmentsElite from './AppointmentsElite';
import DoctorInsightsElite from './DoctorInsightsElite';


const Dashboard = () => {

    const { data, loading, error } = useGetProfile(
        `${BASE_URL}/doctors/profile/me`
    );

    const [tab, setTab] = useState('overview');

    return (
        <section>
            <div className='max-w-[1170px] px-5 mx-auto'>
                {loading && !error && <Loader />}
                {error && !loading && <Error />}
            
                {!loading && !error && data && (
                    <div className='grid lg:grid-cols-3 gap-[30px] lg:gap-[50px]'>
                        <Tabs tab={tab} setTab={setTab}/>
                        <div className='lg:col-span-2'>
                            {data.isApproved === 'pending' && (
                                <div className='flex p-4 mb-4 text-yellow-800 bg-yellow-50 rounded-lg'>
                                    <svg
                                        aria-hidden="true"
                                        className="flex-shrink-0 w-5 h-5"
                                        fill="currentColor"
                                        viewBox= "0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule= "evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 
                                            0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                            clipRule= "evenodd"
                                        ></path>
                                    </svg>

                                    <span className='sr-only'>Info</span>
                                    <div className='ml-3 text-sm font-medium'>
                                        To get approved, please complete your profile. we&apos;ll 
                                        review manually and approve within 3 days.
                                    </div>

                                </div>
                            )}

                            <div className='mt-8'>
                                {tab === 'overview' && (
                                    <div>
                                        {/* Psychology System Card - NUEVO */}
                                        <div className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-2xl p-6 text-white">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                        </svg>
                                                        <div>
                                                            <h2 className="text-2xl font-bold">🧠 Sistema de Psicología Clínica</h2>
                                                            <p className="text-purple-100 text-sm">Terapia Cognitivo-Conductual (TCC) Profesional</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-purple-50 mb-4">
                                                        Sistema avanzado para gestión de pacientes, sesiones SOAP, evaluaciones estandarizadas (PHQ-9, BDI-II), 
                                                        registro de pensamientos automáticos, planes de tratamiento y gráficas de evolución.
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">✅ Notas SOAP</span>
                                                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">✅ PHQ-9 / BDI-II</span>
                                                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">✅ Pensamientos Automáticos</span>
                                                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">✅ Alertas de Riesgo</span>
                                                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">✅ Gráficas de Evolución</span>
                                                    </div>
                                                </div>
                                                <Link 
                                                    to="/psychology/dashboard"
                                                    className="ml-6 bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                                                >
                                                    Acceder al Sistema
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-4 mb-10'>
                                            <figure className='max-w-[200px] max-h-[200px]'>
                                                <img src={data?.photo} alt="" className='w-full'/> 
                                            </figure>
                                            <div>
                                                <span className='bg-[#CCF0F3] text-irisBlueColor py-1 px-4 lg:py-2 lg:px-6 rounded text-[12px]
                                                leading-4 lg:text-[16px] lg:leading-6 font-semibold'>
                                                    {data.specialization}
                                                </span>

                                                <h3 className='text-[22px] leading-9 font-bold text-headingColor mt-3'>
                                                    {data.name}
                                                </h3>

                                                <div className='flex items-center gap-[6px]'>
                                                    <span className='flex items-center gap-[6px] text-headingColor text-[14px] leading-5
                                                    lg:text-[16px] lg:leading-6 font-semibold'>
                                                        <img src={starIcon} alt=""/>
                                                        {data.averageRating}
                                                    </span> 
                                                    <span className='text-textColor text-[14px] leading-5 lg:text-[16px] lg:leading-6 
                                                    font-semibold'>
                                                        {data.totalRating}
                                                    </span> 
                                                </div>
                                                <p className='text_para font-[15px] lg:max-w-[390px] leading-6'>
                                                    {data?.bio}
                                                </p>
                                            </div>                                    
                                        </div>
                                        <DoctorAbout
                                            name={data.name}
                                            about={data.about}
                                            qualifications={data.qualifications}
                                            experiences={data.experiences}
                                        />
                                    </div>
                                )}

                                {tab === 'appointments' && (
                                    <AppointmentsElite appointments={data.appointments}/>
                                )}
                                {tab === 'settings' && <Profile doctorData={data}/>}
                                {tab === 'doctor-insights' && <DoctorInsightsElite />}
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </section>
    )
};



export default Dashboard;