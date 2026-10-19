import PropTypes from 'prop-types';
import { useEffect, useMemo, useReducer } from "react";

import { authContext, initialState } from './authContext';
const authReducer = (state, action) => {

    switch (action.type) {
        case "LOGIN_START":
            return {
                user: null,
                role: null,
                token: null,
                authProvider: null,
            };
        case "LOGIN_SUCCESS":
            return {
                user: action.payload.user,
                token: action.payload.token,
                role: action.payload.role,
                authProvider: action.payload.authProvider,
            };    
        case "LOGOUT":
            return {
                user: null,
                role: null,
                token: null,
                authProvider: null,
            };
        default:
            return state;
    }
};

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const contextValue = useMemo(() => ({
        user: state.user,
        token: state.token,
        role: state.role,
        authProvider: state.authProvider,
        dispatch,
    }), [state.user, state.token, state.role, state.authProvider, dispatch]);

    useEffect(() => {
        sessionStorage.setItem("user", JSON.stringify(state.user));
        if (state.token) {
            sessionStorage.setItem("token", state.token);
        } else {
            sessionStorage.removeItem("token");
        }
        if (state.role) {
            sessionStorage.setItem("role", state.role);
        } else {
            sessionStorage.removeItem("role");
        }
        if (state.authProvider) {
            sessionStorage.setItem('authProvider', state.authProvider);
        } else {
            sessionStorage.removeItem('authProvider');
        }

    }, [state]);

    return (
        <authContext.Provider
            value={contextValue}
        >
            {children}
        </authContext.Provider>
    );
};

AuthContextProvider.propTypes = {
    children: PropTypes.node,
};