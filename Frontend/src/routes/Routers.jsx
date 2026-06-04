import React, { Suspense } from 'react';
import Loading from '../components/Loader/Loading';
import Home from '../pages/Home'
const Testimonios = React.lazy(() => import('../pages/Testimonios'));
const Services = React.lazy(() => import('../pages/Services'));
import Login from '../pages/Login';
import Signup from '../pages/Singup';
const Contact = React.lazy(() => import('../pages/Contact'));
const DoctorDetails = React.lazy(() => import('../pages/Doctors/DoctorsDetails'));
const CrisisPage = React.lazy(() => import('../pages/public/CrisisPage'));
const EvaluacionesPage = React.lazy(() => import('../pages/public/EvaluacionesPage'));
const AnsiedadPage = React.lazy(() => import('../pages/public/AnsiedadPage'));
const DepresionPage = React.lazy(() => import('../pages/public/DepresionPage'));
const DueloPage = React.lazy(() => import('../pages/public/DueloPage'));
const DueloAnticipadoPage = React.lazy(() => import('../pages/public/DueloAnticipadoPage'));
const CuidadoresPage = React.lazy(() => import('../pages/public/CuidadoresPage'));
const EnfermedadesCronicasPage = React.lazy(() => import('../pages/public/EnfermedadesCronicasPage'));
const ElaPage = React.lazy(() => import('../pages/public/ElaPage'));
const PsicooncologiaPage = React.lazy(() => import('../pages/public/PsicooncologiaPage'));
const RecursosClinicosPage = React.lazy(() => import('../pages/public/RecursosClinicosPage'));
const PsicologiaColombiaPage = React.lazy(() => import('../pages/public/PsicologiaColombiaPage'));
const PsicologiaVirtualPage = React.lazy(() => import('../pages/public/PsicologiaVirtualPage'));
const PsicologiaEnLineaPage = React.lazy(() => import('../pages/public/PsicologiaEnLineaPage'));
const PsicologoBogotaPage = React.lazy(() => import('../pages/public/PsicologoBogotaPage'));
const PsicologoOnlineBogotaPage = React.lazy(() => import('../pages/public/PsicologoOnlineBogotaPage'));
const PsicologoOnlineBogotaAnsiedadPage = React.lazy(() => import('../pages/public/PsicologoOnlineBogotaAnsiedadPage'));
const PsicologoOnlineBogotaDueloPage = React.lazy(() => import('../pages/public/PsicologoOnlineBogotaDueloPage'));
const PsicologoVirtualColombiaPage = React.lazy(() => import('../pages/public/PsicologoVirtualColombiaPage'));
const PsicologoOnlineColombiaPage = React.lazy(() => import('../pages/public/PsicologoOnlineColombiaPage'));
const PsicologoOnlineColombiaAnsiedadPage = React.lazy(() => import('../pages/public/PsicologoOnlineColombiaAnsiedadPage'));
const PsicologoOnlineColombiaDueloPage = React.lazy(() => import('../pages/public/PsicologoOnlineColombiaDueloPage'));
const PsicologoOnlineAnsiedadPage = React.lazy(() => import('../pages/public/PsicologoOnlineAnsiedadPage'));
const PsicologoVirtualDepresionPage = React.lazy(() => import('../pages/public/PsicologoVirtualDepresionPage'));
const PsicologiaOnlineAnsiedadPage = React.lazy(() => import('../pages/public/PsicologiaOnlineAnsiedadPage'));
const PsicologiaOnlineDepresionPage = React.lazy(() => import('../pages/public/PsicologiaOnlineDepresionPage'));
const TerapiaDepresionColombiaPage = React.lazy(() => import('../pages/public/TerapiaDepresionColombiaPage'));
const TerapiaOnlineColombiaPage = React.lazy(() => import('../pages/public/TerapiaOnlineColombiaPage'));
const TerapiaOnlineAnsiedadPage = React.lazy(() => import('../pages/public/TerapiaOnlineAnsiedadPage'));
const TerapiaOnlineDepresionPage = React.lazy(() => import('../pages/public/TerapiaOnlineDepresionPage'));
const TerapiaOnlineBogotaPage = React.lazy(() => import('../pages/public/TerapiaOnlineBogotaPage'));
const TerapiaOnlineBogotaDepresionPage = React.lazy(() => import('../pages/public/TerapiaOnlineBogotaDepresionPage'));
const PsicologoOnlineDueloPage = React.lazy(() => import('../pages/public/PsicologoOnlineDueloPage'));
const GuiaElaCuidadorPage = React.lazy(() => import('../pages/public/GuiaElaCuidadorPage'));
const GuiaDueloAnticipadoPage = React.lazy(() => import('../pages/public/GuiaDueloAnticipadoPage'));
const GuiaPsicooncologiaPage = React.lazy(() => import('../pages/public/GuiaPsicooncologiaPage'));
const GuiaCuidadorAgotamientoPage = React.lazy(() => import('../pages/public/GuiaCuidadorAgotamientoPage'));
const GuiaElaComunicacionPage = React.lazy(() => import('../pages/public/GuiaElaComunicacionPage'));
const GuiaPsicooncologiaCuidadoresPage = React.lazy(() => import('../pages/public/GuiaPsicooncologiaCuidadoresPage'));
const GuiaDueloFamiliaEnfermedadAvanzadaPage = React.lazy(() => import('../pages/public/GuiaDueloFamiliaEnfermedadAvanzadaPage'));
const GuiaCuidadorDescansoPage = React.lazy(() => import('../pages/public/GuiaCuidadorDescansoPage'));
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
// NEW: Import emergency and tools pages
import Emergency from '../pages/Emergency';
const TCC = React.lazy(() => import('../pages/Tools/TCC'));

import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute';

const Routers = () => {
    return (
        <Suspense fallback={<Loading />}><Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/doctors/:id" element={<DoctorDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Navigate to="/servicios" replace />} />
            <Route path="/servicios" element={<Services />} />
            <Route path="/testimonios" element={<Testimonios />} />
            <Route path="/data-protection" element={<DataProtection />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/consentimiento" element={<InformedConsent />} />
            {/* NEW: Emergency route - accessible to all */}
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/crisis" element={<CrisisPage />} />
            <Route path="/ansiedad" element={<AnsiedadPage />} />
            <Route path="/depresion" element={<DepresionPage />} />
            <Route path="/duelo" element={<DueloPage />} />
            <Route path="/duelo-anticipado" element={<DueloAnticipadoPage />} />
            <Route path="/cuidadores" element={<CuidadoresPage />} />
            <Route path="/ela" element={<ElaPage />} />
            <Route path="/psicooncologia" element={<PsicooncologiaPage />} />
            <Route path="/recursos-clinicos" element={<RecursosClinicosPage />} />
            <Route path="/psicologia-colombia" element={<PsicologiaColombiaPage />} />
            <Route path="/psicologia-virtual" element={<PsicologiaVirtualPage />} />
            <Route path="/psicologia-en-linea" element={<PsicologiaEnLineaPage />} />
            <Route path="/psicologo-bogota" element={<PsicologoBogotaPage />} />
            <Route path="/psicologo-online-bogota" element={<PsicologoOnlineBogotaPage />} />
            <Route path="/psicologo-online-bogota-ansiedad" element={<PsicologoOnlineBogotaAnsiedadPage />} />
            <Route path="/psicologo-online-bogota-duelo" element={<PsicologoOnlineBogotaDueloPage />} />
            <Route path="/psicologo-virtual-colombia" element={<PsicologoVirtualColombiaPage />} />
            <Route path="/psicologo-online-colombia" element={<PsicologoOnlineColombiaPage />} />
            <Route path="/psicologo-online-colombia-ansiedad" element={<PsicologoOnlineColombiaAnsiedadPage />} />
            <Route path="/psicologo-online-colombia-duelo" element={<PsicologoOnlineColombiaDueloPage />} />
            <Route path="/psicologo-online-ansiedad" element={<PsicologoOnlineAnsiedadPage />} />
            <Route path="/psicologo-virtual-depresion" element={<PsicologoVirtualDepresionPage />} />
            <Route path="/psicologia-online-ansiedad" element={<PsicologiaOnlineAnsiedadPage />} />
            <Route path="/psicologia-online-depresion" element={<PsicologiaOnlineDepresionPage />} />
            <Route path="/terapia-depresion-colombia" element={<TerapiaDepresionColombiaPage />} />
            <Route path="/terapia-online-colombia" element={<TerapiaOnlineColombiaPage />} />
            <Route path="/terapia-online-ansiedad" element={<TerapiaOnlineAnsiedadPage />} />
            <Route path="/terapia-online-depresion" element={<TerapiaOnlineDepresionPage />} />
            <Route path="/terapia-online-bogota" element={<TerapiaOnlineBogotaPage />} />
            <Route path="/terapia-online-bogota-depresion" element={<TerapiaOnlineBogotaDepresionPage />} />
            <Route path="/psicologo-online-duelo" element={<PsicologoOnlineDueloPage />} />
            <Route path="/guia-agotamiento-cuidador" element={<GuiaCuidadorAgotamientoPage />} />
            <Route path="/guia-ela-comunicacion" element={<GuiaElaComunicacionPage />} />
            <Route path="/guia-ela-cuidadores" element={<GuiaElaCuidadorPage />} />
            <Route path="/guia-duelo-anticipado" element={<GuiaDueloAnticipadoPage />} />
            <Route path="/guia-duelo-familia-enfermedad-avanzada" element={<GuiaDueloFamiliaEnfermedadAvanzadaPage />} />
            <Route path="/guia-descanso-cuidador" element={<GuiaCuidadorDescansoPage />} />
            <Route path="/guia-psicooncologia-cuidadores" element={<GuiaPsicooncologiaCuidadoresPage />} />
            <Route path="/guia-psicooncologia" element={<GuiaPsicooncologiaPage />} />
            <Route path="/enfermedades-cronicas" element={<EnfermedadesCronicasPage />} />
            <Route path="/evaluaciones" element={<EvaluacionesPage />} />
            <Route path="/herramientas-tcc" element={<TCC />} />
            {/* NEW: Tools route - requires authentication */}
            <Route
                path="/tools/tcc"
                element={
                    <ProtectedRoute allowedRoles={['paciente', 'patient', 'doctor']}>
                        <TCC />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/users/profile/me"
                element={
                    <ProtectedRoute allowedRoles={['paciente', 'patient']}>
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
