import { useContext } from 'react';
import { authContext } from '../context/AuthContext';

const useAuthToken = () => {
    const { token } = useContext(authContext);
    return token;
};

export { useAuthToken };
