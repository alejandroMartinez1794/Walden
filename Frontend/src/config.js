// Prefer VITE_BACKEND_URL (set in Frontend/.env) but fall back to the default local backend port (8000)
export const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';
export const token = localStorage.getItem('token');