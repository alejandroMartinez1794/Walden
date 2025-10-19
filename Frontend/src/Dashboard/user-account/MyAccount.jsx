import { useEffect, useState, useContext } from 'react';
import { authContext } from '../../context/AuthContext';

import MyBookings from './MyBookings';
import Profile from './Profile';

import { BASE_URL } from '../../config';

import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import MyCalendar from './MyCalendar';


const MyAccount = () => {
  const { dispatch } = useContext(authContext);
  const [tab, setTab] = useState('bookings');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("Fetching user profile...");
        const res = await fetch(`${BASE_URL}/users/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || 'Failed to fetch profile');
        }

        setUserData(result.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err.message); 
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

  return (
    <section>
      <div className='max-w-[1170px] px-5 mx-auto'>
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
                  Blood Type
                  <span className='ml-2 text-headingColor text-[22px] leading-8'>
                    {userData.bloodType || 'N/A'}
                  </span>
                </p>
              </div>

              <div className='mt-[50px] md:mt-[100px]'>
                <button
                  onClick={handleLogout}
                  className='w-full bg-[#181A1E] p-3 text-[16px] leading-7 rounded-md text-white'
                >
                  Logout
                </button>
                <button className='w-full bg-red-600 mt-4 p-3 text-[16px] leading-7 rounded-md text-white'>
                  Delete Account
                </button>
              </div>
            </div>

            {/* Main content */}
            <div className='md:col-span-2 md:px-[30px]'>
              <div className='mb-5'>
                <button
                  onClick={() => setTab('bookings')}
                  className={`${
                    tab === 'bookings' && 'bg-primaryColor text-white'
                  } py-2 mr-4 px-5 rounded-md text-headingColor font-semibold text-[16px] leading-7 border border-solid border-primaryColor`}
                >
                  My Bookings
                </button>
                <button
                  onClick={() => setTab('settings')}
                  className={`${
                    tab === 'settings' && 'bg-primaryColor text-white'
                  } py-2 px-5 rounded-md text-headingColor font-semibold text-[16px] leading-7 border border-solid border-primaryColor`}
                >
                  Profile Settings
                </button>
              </div>

              {tab === 'bookings' && (
                <>
                  <MyBookings />

                  <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-4 text-headingColor">Tu Calendario</h2>
                    <MyCalendar />
                  </div>
                </>
              )}


              {tab === 'settings' && <Profile user={userData} />}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyAccount;
