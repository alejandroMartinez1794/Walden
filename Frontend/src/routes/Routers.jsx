import React from 'react'
import Home from '../pages/Home'
import Testimonios from '../pages/Testimonios';
import Services from '../pages/Services';
import Login from '../pages/Login';
import Signup from '../pages/Singup';
import Contact from '../pages/Contact';
import DoctorDetails from '../pages/Doctors/DoctorsDetails';
import InformedConsent from '../pages/Legal/InformedConsent';
import Myaccount from '../Dashboard/user-account/MyAccount';
import Dashboard from '../Dashboard/doctor-account/Dashboard';
import PsychologyDashboard from '../Dashboard/psychology/PsychologyDashboard';
import PatientList from '../Dashboard/psychology/PatientList';
import PatientFile from '../Dashboard/psychology/patients/PatientFile';
import NewPatientForm from '../Dashboard/psychology/patients/NewPatientForm';
import ClinicalHistoryForm from '../Dashboard/psychology/patients/ClinicalHistoryForm';
import ClinicalHistoryList from '../Dashboard/psychology/clinical-history/ClinicalHistoryList';
import AssessmentSelector from '../Dashboard/psychology/assessments/AssessmentSelector';
import PHQ9Form from '../Dashboard/psychology/assessments/PHQ9Form';
import GAD7Form from '../Dashboard/psychology/assessments/GAD7Form';
import PCL5Form from '../Dashboard/psychology/assessments/PCL5/PCL5Form';
import OCIRForm from '../Dashboard/psychology/assessments/OCIR/OCIRForm';
import SUDSForm from '../Dashboard/psychology/assessments/CBT/SUDSForm';
import ThoughtRecordForm from '../Dashboard/psychology/assessments/CBT/ThoughtRecordForm';
import CognitiveDistortionsForm from '../Dashboard/psychology/assessments/CBT/CognitiveDistortionsForm';
import CoreBeliefsForm from '../Dashboard/psychology/assessments/CBT/CoreBeliefsForm';
import AvoidanceBehaviorsForm from '../Dashboard/psychology/assessments/CBT/AvoidanceBehaviorsForm';
import BehavioralActivationForm from '../Dashboard/psychology/assessments/CBT/BehavioralActivationForm';
import CaseFormulationForm from '../Dashboard/psychology/assessments/CBT/CaseFormulationForm';
import WHO5Form from '../Dashboard/psychology/assessments/WHO5Form';
import AUDITForm from '../Dashboard/psychology/assessments/AUDITForm';
import PHQ15Form from '../Dashboard/psychology/assessments/PHQ15Form';
import PCPTSD5Form from '../Dashboard/psychology/assessments/PCPTSD5Form';
import K10Form from '../Dashboard/psychology/assessments/K10Form';
import K6Form from '../Dashboard/psychology/assessments/K6Form';
import LicenseLocked from '../Dashboard/psychology/assessments/LicenseLocked';
import SessionForm from '../Dashboard/psychology/sessions/SessionForm';

import GoogleAuthRedirect from '../pages/GoogleAuthRedirect'; // ✅ IMPORTACIÓN
import DataProtection from '../pages/Legal/DataProtection';
import TermsOfService from '../pages/Legal/TermsOfService';

import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute';

const Routers = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/doctors/:id" element={<DoctorDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/testimonios" element={<Testimonios />} />
            <Route path="/data-protection" element={<DataProtection />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/consentimiento" element={<InformedConsent />} />
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
            
            {/* Nuevo Paciente */}
            <Route
                path="/psychology/patients/new"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <NewPatientForm />
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
                path="/psychology/clinical-history/new"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <ClinicalHistoryForm />
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
            
            <Route
                path="/psychology/patients/:patientId/case-formulation"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <CaseFormulationForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/psychology/assessments/case-formulation"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <CaseFormulationForm />
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
                        <LicenseLocked instrument="BDI-II (Beck Depression Inventory-II)" />
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
                        <LicenseLocked instrument="BAI (Beck Anxiety Inventory)" />
                    </ProtectedRoute>
                }
            />

            {/* WHO-5 */}
            <Route
                path="/psychology/assessments/who5"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <WHO5Form />
                    </ProtectedRoute>
                }
            />

            {/* AUDIT */}
            <Route
                path="/psychology/assessments/audit"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <AUDITForm />
                    </ProtectedRoute>
                }
            />

            {/* PHQ-15 */}
            <Route
                path="/psychology/assessments/phq15"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <PHQ15Form />
                    </ProtectedRoute>
                }
            />

            {/* PC-PTSD-5 */}
            <Route
                path="/psychology/assessments/pc-ptsd-5"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <PCPTSD5Form />
                    </ProtectedRoute>
                }
            />

            {/* K10 */}
            <Route
                path="/psychology/assessments/k10"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <K10Form />
                    </ProtectedRoute>
                }
            />

            {/* K6 */}
            <Route
                path="/psychology/assessments/k6"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <K6Form />
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

            {/* Herramientas TCC abiertas (no propietarias) */}
            <Route
                path="/psychology/assessments/cbt/suds"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <SUDSForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/psychology/assessments/cbt/thought-record"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <ThoughtRecordForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/psychology/assessments/cbt/distortions"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <CognitiveDistortionsForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/psychology/assessments/cbt/core-beliefs"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <CoreBeliefsForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/psychology/assessments/cbt/avoidance"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <AvoidanceBehaviorsForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/psychology/assessments/cbt/behavioral-activation"
                element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <BehavioralActivationForm />
                    </ProtectedRoute>
                }
            />
            
            {/* ✅ NUEVA RUTA PARA REDIRECCIÓN DESDE GOOGLE */}
            <Route path="/google-auth-redirect" element={<GoogleAuthRedirect />} />
        </Routes>
    );
};

export default Routers;
