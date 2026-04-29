import React, { Suspense } from 'react';
import Loading from '../components/Loader/Loading';
import Home from '../pages/Home'
const Testimonios = React.lazy(() => import('../pages/Testimonios'));
const Services = React.lazy(() => import('../pages/Services'));
import Login from '../pages/Login';
import Signup from '../pages/Singup';
const Contact = React.lazy(() => import('../pages/Contact'));
const DoctorDetails = React.lazy(() => import('../pages/Doctors/DoctorsDetails'));
const InformedConsent = React.lazy(() => import('../pages/Legal/InformedConsent'));
const Myaccount = React.lazy(() => import('../Dashboard/user-account/MyAccount'));
const Dashboard = React.lazy(() => import('../Dashboard/doctor-account/Dashboard'));
const PsychologyDashboard = React.lazy(() => import('../Dashboard/psychology/PsychologyDashboard'));
const PatientList = React.lazy(() => import('../Dashboard/psychology/PatientList'));
const PatientFile = React.lazy(() => import('../Dashboard/psychology/patients/PatientFile'));
const NewPatientForm = React.lazy(() => import('../Dashboard/psychology/patients/NewPatientForm'));
const ClinicalHistoryForm = React.lazy(() => import('../Dashboard/psychology/patients/ClinicalHistoryForm'));
const ClinicalHistoryList = React.lazy(() => import('../Dashboard/psychology/clinical-history/ClinicalHistoryList'));
const AssessmentSelector = React.lazy(() => import('../Dashboard/psychology/assessments/AssessmentSelector'));
const PHQ9Form = React.lazy(() => import('../Dashboard/psychology/assessments/PHQ9Form'));
const GAD7Form = React.lazy(() => import('../Dashboard/psychology/assessments/GAD7Form'));
const PCL5Form = React.lazy(() => import('../Dashboard/psychology/assessments/PCL5/PCL5Form'));
const OCIRForm = React.lazy(() => import('../Dashboard/psychology/assessments/OCIR/OCIRForm'));
const SUDSForm = React.lazy(() => import('../Dashboard/psychology/assessments/CBT/SUDSForm'));
const ThoughtRecordForm = React.lazy(() => import('../Dashboard/psychology/assessments/CBT/ThoughtRecordForm'));
const CognitiveDistortionsForm = React.lazy(() => import('../Dashboard/psychology/assessments/CBT/CognitiveDistortionsForm'));
const CoreBeliefsForm = React.lazy(() => import('../Dashboard/psychology/assessments/CBT/CoreBeliefsForm'));
const AvoidanceBehaviorsForm = React.lazy(() => import('../Dashboard/psychology/assessments/CBT/AvoidanceBehaviorsForm'));
const BehavioralActivationForm = React.lazy(() => import('../Dashboard/psychology/assessments/CBT/BehavioralActivationForm'));
const CaseFormulationForm = React.lazy(() => import('../Dashboard/psychology/assessments/CBT/CaseFormulationForm'));
const WHO5Form = React.lazy(() => import('../Dashboard/psychology/assessments/WHO5Form'));
const AUDITForm = React.lazy(() => import('../Dashboard/psychology/assessments/AUDITForm'));
const PHQ15Form = React.lazy(() => import('../Dashboard/psychology/assessments/PHQ15Form'));
const PCPTSD5Form = React.lazy(() => import('../Dashboard/psychology/assessments/PCPTSD5Form'));
const K10Form = React.lazy(() => import('../Dashboard/psychology/assessments/K10Form'));
const K6Form = React.lazy(() => import('../Dashboard/psychology/assessments/K6Form'));
const LicenseLocked = React.lazy(() => import('../Dashboard/psychology/assessments/LicenseLocked'));
const SessionForm = React.lazy(() => import('../Dashboard/psychology/sessions/SessionForm'));

import GoogleAuthRedirect from '../pages/GoogleAuthRedirect'; // ✅ IMPORTACIÓN
const DataProtection = React.lazy(() => import('../pages/Legal/DataProtection'));
const TermsOfService = React.lazy(() => import('../pages/Legal/TermsOfService'));

import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute';

const Routers = () => {
    return (
        <Suspense fallback={<Loading />}><Routes>
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
        </Routes></Suspense>
    );
};

export default Routers;
