import { useEffect, useState, useContext } from 'react';
import { authContext } from '../../context/AuthContext';

import MyBookings from './MyBookings';
import Profile from './Profile';
import PatientDashboard from './PatientDashboard';
import MedicalHistory from './MedicalHistoryNew';
import Medications from './Medications';
import HealthTracker from './HealthTrackerNew';

import { BASE_URL } from '../../config';

import Loading from '../../components/Loader/Loading';
import Error from '../../components/Error/Error';
import MyCalendar from './MyCalendar';

const MyAccount = () => {
  const { dispatch, token: authToken, role: authRole } = useContext(authContext);
  const [tab, setTab] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingsCount, setBookingsCount] = useState(0);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
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
        console.error('Error al obtener el perfil:', err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${BASE_URL}/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.message || 'No se pudo obtener las citas');
        }

        setBookingsCount(result.data?.length || 0);
      } catch (err) {
        console.error('Error al obtener las citas del usuario:', err.message);
      }
    };

    if (token) {
      fetchBookings();
    }
  }, [token]);

  const handleProfileUpdated = (updatedProfile) => {
    if (!updatedProfile) return;

    setUserData((prev) => {
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
    <section className="bg-gradient-to-br from-[#f5f7fb] to-white py-10">
      <div className="max-w-[1600px] w-full px-6 lg:px-8 xl:px-12 mx-auto">
        {loading && !error && <Loading />}
        {error && !loading && <Error errMessage={error} />}

        {!loading && !error && userData && (
          <div className="w-full space-y-6">
            <div className="flex flex-wrap gap-3 rounded-2xl bg-white/80 p-3 shadow-sm border border-slate-100">
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

            {tab === 'dashboard' && (
              <PatientDashboard
                userData={userData}
                bookingsCount={bookingsCount}
                onUserDataUpdate={handleProfileUpdated}
              />
            )}

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
        )}
      </div>
    </section>
  );
};

export default MyAccount;
