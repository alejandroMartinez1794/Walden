import { createContext, useContext, useEffect, useReducer } from "react";

const parseStoredJSON = (value) => {
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch (err) {
        console.warn('❗ No se pudo parsear auth user en storage:', err);
        return null;
    }
};

const getFromSessionFirst = (key) => {
    const fromSession = sessionStorage.getItem(key);
    if (fromSession !== null) return fromSession;
    return localStorage.getItem(key);
};

const initialState = {
    user: parseStoredJSON(getFromSessionFirst('user')),
    role: getFromSessionFirst('role') || null,
    token: getFromSessionFirst('token') || null,
    authProvider: getFromSessionFirst('authProvider') || null,
};

export const authContext = createContext(initialState);

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

        // Limpieza de restos previos en localStorage (evita sesiones persistentes antiguas)
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('authProvider');
    }, [state]);

    return (
        <authContext.Provider
            value={{
                user: state.user,
                token: state.token,
                role: state.role,
                authProvider: state.authProvider,
                dispatch,
            }}
        >
            {children}
        </authContext.Provider>
    );
};