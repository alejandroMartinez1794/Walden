import React from 'react'
import Home from '../pages/Home'
import Testimonios from '../pages/Testimonios';
import Services from '../pages/Services';
import Login from '../pages/Login';
import Signup from '../pages/Singup';
import Contact from '../pages/Contact';
import Doctors from '../pages/Doctors/Doctors';
import DoctorDetails from '../pages/Doctors/DoctorsDetails';
import Myaccount from '../Dashboard/user-account/MyAccount';
import Dashboard from '../Dashboard/doctor-account/Dashboard';
import PsychologyDashboard from '../Dashboard/psychology/PsychologyDashboard';
import PatientList from '../Dashboard/psychology/PatientList';
import PatientFile from '../Dashboard/psychology/patients/PatientFile';
import ClinicalHistoryForm from '../Dashboard/psychology/patients/ClinicalHistoryForm';
import ClinicalHistoryList from '../Dashboard/psychology/clinical-history/ClinicalHistoryList';
import AssessmentSelector from '../Dashboard/psychology/assessments/AssessmentSelector';
import PHQ9Form from '../Dashboard/psychology/assessments/PHQ9Form';
import BDIIIForm from '../Dashboard/psychology/assessments/BDIIIForm';
import GAD7Form from '../Dashboard/psychology/assessments/GAD7Form';
import BAIForm from '../Dashboard/psychology/assessments/BAI/BAIForm';
import PCL5Form from '../Dashboard/psychology/assessments/PCL5/PCL5Form';
import OCIRForm from '../Dashboard/psychology/assessments/OCIR/OCIRForm';
import SessionForm from '../Dashboard/psychology/sessions/SessionForm';

import GoogleAuthRedirect from '../pages/GoogleAuthRedirect'; // ✅ IMPORTACIÓN

import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute';

const Routers = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorDetails />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Register" element={<Signup />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/Services" element={<Services />} />
            <Route path="/testimonios" element={<Testimonios />} />
            <Route
                path="/users/profile/me"
                element={
                    <ProtectedRoute allowedRoles={['paciente']}>
                        <Myaccount />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/doctors/profile/me"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            {/* Alias to support previous link */}
            <Route
                path="/dashboard/doctor"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            
            {/* Dashboard de Psicología (TCC) */}
            <Route
                path="/psychology/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <PsychologyDashboard />
                    </ProtectedRoute>
                }
            />
            
            {/* Lista de Pacientes */}
            <Route
                path="/psychology/patients"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <PatientList />
                    </ProtectedRoute>
                }
            />
            
            {/* Expediente de Paciente */}
            <Route
                path="/psychology/patients/:id"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <PatientFile />
                    </ProtectedRoute>
                }
            />

            {/* Historia clínica */}
            <Route
                path="/psychology/clinical-history"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <ClinicalHistoryList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/psychology/clinical-history/:patientId"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <ClinicalHistoryForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/psychology/patients/:patientId/clinical-history"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <ClinicalHistoryForm />
                    </ProtectedRoute>
                }
            />
            
            {/* Nueva Sesión */}
            <Route
                path="/psychology/patients/:patientId/session"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <SessionForm />
                    </ProtectedRoute>
                }
            />
            
            {/* Nueva Sesión Sin Paciente Pre-seleccionado */}
            <Route
                path="/psychology/sessions/new"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <SessionForm />
                    </ProtectedRoute>
                }
            />
            
            {/* Selector de Evaluaciones */}
            <Route
                path="/psychology/assessments/new"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <AssessmentSelector />
                    </ProtectedRoute>
                }
            />
            
            {/* Evaluación PHQ-9 */}
            <Route
                path="/psychology/assessments/phq9"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <PHQ9Form />
                    </ProtectedRoute>
                }
            />
            
            {/* Evaluación BDI-II */}
            <Route
                path="/psychology/assessments/bdi-ii"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <BDIIIForm />
                    </ProtectedRoute>
                }
            />

            {/* Evaluación GAD-7 */}
            <Route
                path="/psychology/assessments/gad7"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <GAD7Form />
                    </ProtectedRoute>
                }
            />

            {/* Evaluación BAI */}
            <Route
                path="/psychology/assessments/bai"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <BAIForm />
                    </ProtectedRoute>
                }
            />

            {/* Evaluación PCL-5 */}
            <Route
                path="/psychology/assessments/pcl5"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <PCL5Form />
                    </ProtectedRoute>
                }
            />

            {/* Evaluación OCI-R */}
            <Route
                path="/psychology/assessments/ocir"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <OCIRForm />
                    </ProtectedRoute>
                }
            />
            
            {/* ✅ NUEVA RUTA PARA REDIRECCIÓN DESDE GOOGLE */}
            <Route path="/google-auth-redirect" element={<GoogleAuthRedirect />} />
        </Routes>
    );
};

export default Routers;
