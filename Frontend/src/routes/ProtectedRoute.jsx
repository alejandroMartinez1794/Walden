// eslint-disable react/prop-types

import {useContext} from 'react';
import {Navigate} from 'react-router-dom';
import {authContext} from '../context/AuthContext';

const ProtectedRoute = ({children, allowedRoles}) => {
    const { token, role } = useContext(authContext);

    // 👑 ADMIN: Acceso total a todas las rutas (tratado como doctor)
    const normalizedRole = role?.toLowerCase();
    const isAdmin = normalizedRole === 'admin';
    
    // Si es admin, agregar 'doctor' a los roles permitidos para acceso completo
    const effectiveAllowedRoles = isAdmin 
        ? [...allowedRoles, 'doctor', 'admin']
        : allowedRoles;

    const isAllowed = effectiveAllowedRoles.includes(role);
    const accessibleRoute =
        token && isAllowed ? children : <Navigate to="/login" replace={true} />;
    
    return accessibleRoute;
};

export default ProtectedRoute;