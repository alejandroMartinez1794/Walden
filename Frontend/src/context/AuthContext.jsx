import { createContext, useContext, useEffect, useReducer } from "react";

const parseStoredJSON = (value) => {
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch (err) {
        console.warn('❗ No se pudo parsear auth user en localStorage:', err);
        return null;
    }
};

const initialState = {
    user: parseStoredJSON(localStorage.getItem('user')),
    role: localStorage.getItem('role') || null,
    token: localStorage.getItem('token') || null,
    authProvider: localStorage.getItem('authProvider') || null,
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
        localStorage.setItem("user", JSON.stringify(state.user));
        if (state.token) {
            localStorage.setItem("token", state.token);
        } else {
            localStorage.removeItem("token");
        }
        if (state.role) {
            localStorage.setItem("role", state.role);
        } else {
            localStorage.removeItem("role");
        }
        if (state.authProvider) {
            localStorage.setItem('authProvider', state.authProvider);
        } else {
            localStorage.removeItem('authProvider');
        }

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