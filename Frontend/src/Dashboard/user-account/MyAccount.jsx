import { useEffect, useState, useContext } from 'react';
import { authContext } from '../../context/AuthContext';

import MyBookings from './MyBookings';
import Profile from './Profile';
import PatientDashboard from './PatientDashboard';
import MedicalHistory from './MedicalHistoryNew';
import Medications from './Medications';
import HealthTracker from './HealthTrackerNew';

import { BASE_URL } from '../../config';

import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import MyCalendar from './MyCalendar';


const MyAccount = () => {
  const { dispatch, token: authToken, role: authRole } = useContext(authContext);
  const [tab, setTab] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("Obteniendo perfil del usuario...");
        const res = await fetch(`${BASE_URL}/users/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || 'No se pudo obtener el perfil');
        }

        setUserData(result.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener el perfil:", err.message); 
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleProfileUpdated = updatedProfile => {
    if (!updatedProfile) return;

    setUserData(prev => {
      const mergedProfile = { ...(prev || {}), ...updatedProfile };

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: mergedProfile,
          token: authToken || localStorage.getItem('token'),
          role: authRole || localStorage.getItem('role'),
        },
      });

      return mergedProfile;
    });
  };

  return (
    <section>
      <div className='max-w-[1170px] px-5 mx-auto'>
        {/* Botón Logout prominente en la parte superior (mobile y desktop) */}
        {!loading && !error && userData && (
          <div className='flex justify-end mb-5'>
            <button
              onClick={handleLogout}
              className='bg-red-500 hover:bg-red-600 px-6 py-2 text-[14px] leading-6 rounded-md text-white font-semibold transition-all'
            >
              Cerrar sesión
            </button>
          </div>
        )}

        {loading && !error && <Loading />}
        {error && !loading && <Error errMessage={error} />}

        {!loading && !error && userData && (
          <div className='grid md:grid-cols-3 gap-10'>
            {/* Sidebar */}
            <div className='pb-[50px] px-[30px] rounded-md'>
              <div className='flex items-center justify-center'>
                <figure className='w-[100px] h-[100px] rounded-full border-2 border-solid border-primaryColor'>
                  <img
                    src={userData.photo || '/default-avatar.png'}
                    alt=''
                    className='w-full h-full rounded-full object-cover'
                  />
                </figure>
              </div>

              <div className='text-center mt-4'>
                <h3 className='text-[18px] leading-[30px] text-headingColor font-bold'>
                  {userData.name}
                </h3>
                <p className='text-textColor text-[15px] leading-6 font-medium'>
                  {userData.email}
                </p>
                <p className='text-textColor text-[15px] leading-6 font-medium'>
                  Tipo de sangre
                  <span className='ml-2 text-headingColor text-[22px] leading-8'>
                    {userData.bloodType || 'N/D'}
                  </span>
                </p>
              </div>

              <div className='mt-[50px] md:mt-[100px]'>
                <button
                  onClick={handleLogout}
                  className='w-full bg-[#181A1E] p-3 text-[16px] leading-7 rounded-md text-white'
                >
                  Cerrar sesión
                </button>
                <button className='w-full bg-red-600 mt-4 p-3 text-[16px] leading-7 rounded-md text-white'>
                  Eliminar cuenta
                </button>
              </div>
            </div>

            {/* Main content */}
            <div className='md:col-span-2 md:px-[30px]'>
              <div className='mb-5 flex gap-2 flex-wrap'>
                <button
                  onClick={() => setTab('dashboard')}
                  className={`${
                    tab === 'dashboard' && 'bg-primaryColor text-white'
                  } py-2 px-5 rounded-md text-headingColor font-semibold text-[16px] leading-7 border border-solid border-primaryColor hover:bg-primaryColor hover:text-white transition-all`}
                >
                  Panel
                </button>
                <button
                  onClick={() => setTab('bookings')}
                  className={`${
                    tab === 'bookings' && 'bg-primaryColor text-white'
                  } py-2 px-5 rounded-md text-headingColor font-semibold text-[16px] leading-7 border border-solid border-primaryColor hover:bg-primaryColor hover:text-white transition-all`}
                >
                  Mis citas
                </button>
                <button
                  onClick={() => setTab('settings')}
                  className={`${
                    tab === 'settings' && 'bg-primaryColor text-white'
                  } py-2 px-5 rounded-md text-headingColor font-semibold text-[16px] leading-7 border border-solid border-primaryColor hover:bg-primaryColor hover:text-white transition-all`}
                >
                  Configuración de perfil
                </button>
                <button
                  onClick={() => setTab('history')}
                  className={`${
                    tab === 'history' && 'bg-primaryColor text-white'
                  } py-2 px-5 rounded-md text-headingColor font-semibold text-[16px] leading-7 border border-solid border-primaryColor hover:bg-primaryColor hover:text-white transition-all`}
                >
                  Historial médico
                </button>
                  <button
                    onClick={() => setTab('medications')}
                    className={`${
                      tab === 'medications' && 'bg-primaryColor text-white'
                    } py-2 px-5 rounded-md text-headingColor font-semibold text-[16px] leading-7 border border-solid border-primaryColor hover:bg-primaryColor hover:text-white transition-all`}
                  >
                    Medicamentos
                  </button>
                    <button
                      onClick={() => setTab('health')}
                      className={`${
                        tab === 'health' && 'bg-primaryColor text-white'
                      } py-2 px-5 rounded-md text-headingColor font-semibold text-[16px] leading-7 border border-solid border-primaryColor hover:bg-primaryColor hover:text-white transition-all`}
                    >
                      Seguimiento de salud
                    </button>
              </div>

              {tab === 'dashboard' && <PatientDashboard userData={userData} />}

              {tab === 'bookings' && (
                <>
                  <MyBookings />

                  <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-4 text-headingColor">Tu Calendario</h2>
                    <MyCalendar />
                  </div>
                </>
              )}


              {tab === 'settings' && (
                <Profile user={userData} onProfileUpdated={handleProfileUpdated} />
              )}

              {tab === 'history' && <MedicalHistory userId={userData._id} />}

              {tab === 'medications' && <Medications />}

              {tab === 'health' && <HealthTracker />}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyAccount;
