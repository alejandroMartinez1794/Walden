import { createContext } from 'react';

const parseStoredJSON = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (err) {
    console.warn('No se pudo parsear auth user en storage:', err);
    return null;
  }
};

const fromSession = (key) => sessionStorage.getItem(key);

export const initialState = {
  user: parseStoredJSON(fromSession('user')),
  role: fromSession('role') || null,
  token: fromSession('token') || null,
  authProvider: fromSession('authProvider') || null,
};

export const authContext = createContext(initialState);
