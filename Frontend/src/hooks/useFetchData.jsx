import { useEffect, useState, useContext } from 'react';
import { authContext } from '../context/AuthContext';

const useFetchData = (url) => {
    const [data, setData] = useState([]); // Inicializar como array vacío
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useContext(authContext);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (!token) throw new Error('No autenticado');
                console.log("🔑 Token desde contexto (useFetchData):", token);
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
    }, [url, token]);

    return {
        data,
        loading,
        error,
    };
};

export default useFetchData;