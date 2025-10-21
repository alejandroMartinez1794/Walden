import React from 'react';

import Doctorcard from "../../components/Doctors/Doctorcard"
import { doctors } from "../../assets/data/doctors";
import Testimonial from "../../components/Testimonial/testimonial";
import { BASE_URL } from '../../config';
import useFetchData from '../../hooks/useFetchData';
import Loader from '../../components/Loader/Loading'
import Error from '../../components/Error/Error'
import { useEffect, useState } from 'react';

const Doctors = () => {
    const [query, setQuery] = useState('');
    const [debounceQuery, setDebounceQuery] = useState('');

    const handleSearch = () => {
        setQuery(query.trim())

        console.log('handle search')
    };

    useEffect(() => {

        const timeout = setTimeout(() => {
            setDebounceQuery(query)
        }, 700)

        return () => clearTimeout(timeout)

    },[query])
    

    const { data:doctors,
            loading,
            error,
        } = useFetchData(`${BASE_URL}/doctors?query=${debounceQuery}`); // Fetching data from the backend


    return (
        <>
            <section className="bg-[#fff9ea]">
                <div className='container text-center'>
                    <h2 className='heading'> Find a Doctor </h2>
                    <div className='max-w-[570px] mt-[30px] mx-auto bg-[#0066ff2c] rounded-md flex items-center justify-between'>
                        <input
                            type='text'                            
                            className='py-4 pl-4 pr-2 bg-transparent w-full focus:outline-none cursor-pointer placeholder:text-textColor' 
                            placeholder='Search doctor by name or specifications'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button className='btn mt-0 rounded-[0px] rounded-r-md' onClick={handleSearch}>
                            Search
                        </button>
                    </div>
                </div>
            </section>

            <section>
                <div className='container'>
                    {loading && <Loader />}
                    {error && <Error />}
                        {!loading && !error && doctors && (
                        <div className='grid grid-cols-1 sm:grid-col-2 md:grid-cols-3 lg:grid-col-4 gap-5'>
                            {doctors.map(doctor => (
                                <Doctorcard key={doctor.id} doctor={doctor}/>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section>
                <div className="container">
                    <div className="xl:w-[470px] mx-auto">
                        <h2 className="heading text-center"> What our patient say </h2>
                        <p className="text_para text-center">
                            world-class care for everyone. Our health System offers unmatched, expert health care.
                        </p>
                    </div>

                    <Testimonial />
                </div>    
            </section>
        </>
    );
};

export default Doctors;