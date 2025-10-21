import { useEffect, useState } from 'react';

const useFetchData = (url) => {
    const [data, setData] = useState([]); // Inicializar como array vacío
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                console.log("🔑 Token desde localStorage (useFetchData):", token);
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const result = await res.json();

                if (!res.ok) {
                    throw new Error(result.message + ' 🤢');
                }

                setData(result.data || []); // Asegurarse de que siempre sea un array
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return {
        data,
        loading,
        error,
    };
};

export default useFetchData;