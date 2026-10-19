import { useContext } from 'react';
import { authContext } from '../context/authContext';

const useAuthToken = () => {
    const { token } = useContext(authContext);
    return token;
};

export { useAuthToken };
