import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContextProvider } from './context/AuthContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google'; // ✅ nuevo

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}> {/* ✅ nuevo */}
      <BrowserRouter>
        <AuthContextProvider>
          <ToastContainer 
            theme="dark" 
            position="top-right" 
            autoClose={3000} 
            closeOnClick 
            pauseOnHover={false} // corregido typo: pauseOnMover => pauseOnHover
          />
          <App />
        </AuthContextProvider>
      </BrowserRouter>  
    </GoogleOAuthProvider>
  </React.StrictMode>
);
