import React, { useState, useEffect } from 'react';
import { useClinicalSession } from '../context/ClinicalSessionContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from "../components/Header/header";
import Footer from "../components/Footer/Footer";
import Routers from "../routes/Routers";
import Chatbot from "../components/Chatbot/Chatbot";
import BackButton from "../components/common/BackButton";

const Layout = () => {
  const { crisisFlag } = useClinicalSession();
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(false);

  useEffect(() => {
    // Show/hide emergency banner based on crisis flag
    setShowEmergencyBanner(crisisFlag);
  }, [crisisFlag]);

  return (
    <>
      {showEmergencyBanner && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center p-2 z-50 shadow-lg">
          <div className="flex items-center justify-center space-x-4">
            <span className="font-bold">🚨 ¡Emergencia Psicológica!</span>
            <a 
              href="tel:106" 
              className="bg-yellow-400 text-black px-4 py-1 rounded-full font-bold hover:bg-yellow-300 transition"
            >
              Llama al 106
            </a>
            <button 
              onClick={() => setShowEmergencyBanner(false)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <Header />
      <main style={{ marginTop: showEmergencyBanner ? '50px' : '0' }}>
        <Routers />
        <BackButton />   
      </main>
      <Footer />  
      <Chatbot />
      <ToastContainer 
        position="top-right" 
        autoClose={2500} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        pauseOnHover 
      />
    </>   
  );
};

export default Layout;