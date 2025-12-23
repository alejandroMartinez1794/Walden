import { useEffect, useState, useContext } from 'react';
import { authContext } from '../../context/AuthContext';

import MyBookings from './MyBookings';
import Profile from './Profile';
import PatientDashboard from './PatientDashboard';
import MedicalHistory from './MedicalHistoryNew';
import HealthTracker from './HealthTrackerNew';
import SessionPrepPanel from './SessionPrepPanel';

import { BASE_URL } from '../../config';

import Loading from '../../components/Loader/Loading';
import ErrorState from '../../components/Error/Error';
import MyCalendar from './MyCalendar';

const MyAccount = () => {
  const { dispatch, token: authToken, role: authRole, authProvider } = useContext(authContext);
  const [tab, setTab] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingsCount, setBookingsCount] = useState(0);

  const resolvedToken = authToken || localStorage.getItem('token');

  useEffect(() => {
    if (!resolvedToken) {
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${BASE_URL}/users/profile/me`, {
          headers: {
            Authorization: `Bearer ${resolvedToken}`,
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
  }, [resolvedToken]);

  useEffect(() => {
    if (!resolvedToken) {
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await fetch(`${BASE_URL}/bookings`, {
          headers: {
            Authorization: `Bearer ${resolvedToken}`,
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

    fetchBookings();
  }, [resolvedToken]);

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
          authProvider: mergedProfile?.authProvider || authProvider || localStorage.getItem('authProvider') || 'local',
        },
      });

      return mergedProfile;
    });
  };

  return (
    <section className="bg-gradient-to-br from-[#f5f7fb] to-white py-10">
      <div className="max-w-[1600px] w-full px-6 lg:px-8 xl:px-12 mx-auto">
        {loading && !error && <Loading />}
        {error && !loading && <ErrorState errMessage={error} />}

        {!loading && !error && userData && (
          <div className="w-full space-y-6">
            <div className="sticky top-[76px] sm:top-[82px] md:top-[88px] lg:top-[96px] xl:top-[104px] z-50">
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-xl backdrop-blur">
                <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setTab('dashboard')}
                className={`${
                  tab === 'dashboard'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm hover:bg-slate-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                } inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold leading-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20`}
              >
                Principal
              </button>
              <button
                onClick={() => setTab('bookings')}
                className={`${
                  tab === 'bookings'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm hover:bg-slate-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                } inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold leading-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20`}
              >
                Citas
              </button>
              <button
                onClick={() => setTab('settings')}
                className={`${
                  tab === 'settings'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm hover:bg-slate-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                } inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold leading-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20`}
              >
                Perfil
              </button>
              <button
                onClick={() => setTab('history')}
                className={`${
                  tab === 'history'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm hover:bg-slate-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                } inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold leading-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20`}
              >
                Historial
              </button>
              <button
                onClick={() => setTab('health')}
                className={`${
                  tab === 'health'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm hover:bg-slate-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                } inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold leading-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20`}
              >
                Salud
              </button>
                </div>
              </div>
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
                <div className="mt-10">
                  <SessionPrepPanel userData={userData} onUserDataUpdate={handleProfileUpdated} />
                </div>
              </>
            )}

            {tab === 'settings' && (
              <Profile user={userData} onProfileUpdated={handleProfileUpdated} />
            )}

            {tab === 'history' && <MedicalHistory userId={userData._id} />}

            {tab === 'health' && <HealthTracker />}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyAccount;
