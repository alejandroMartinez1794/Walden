import React from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from "../components/Header/header";
import Footer from "../components/Footer/Footer";
import Routers from "../routes/Routers";
import Chatbot from "../components/Chatbot/Chatbot";


const Layout = () => {
    return (
        <>
            <Header />
            <main>
                <Routers/>   
            </main>
            <Footer />  
            <Chatbot />
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
        </>   
    );
};

export default Layout;