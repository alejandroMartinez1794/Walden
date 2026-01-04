import express from 'express';
import {
    updateUser,
    deleteUser,
    getAllUser,
    getSingleUser,
    getUserProfile,
    getMyAppointments,
    getActivePatientsForDoctor,
}   from "../Controllers/userController.js";

import { authenticate, restrict } from "../auth/verifyToken.js";

const router = express.Router();

// Pacientes disponibles para los doctores al agendar
router.get ("/patients/active", authenticate, restrict(['doctor', 'admin']), getActivePatientsForDoctor);

router.get ("/:id", authenticate, restrict(['paciente']), getSingleUser);
router.get ("/", authenticate, restrict(['admin']),  getAllUser);
router.put ("/:id", authenticate, restrict(['paciente']), updateUser);
router.delete ("/:id", authenticate, restrict(['paciente']), deleteUser);

router.get ("/profile/me", authenticate, restrict(['paciente']), getUserProfile);

router.get (
    "/appointments/my-appointments",
    authenticate,
    restrict(['paciente']),
    getMyAppointments);

export default router; 