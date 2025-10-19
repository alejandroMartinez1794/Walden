import express from 'express';
import {
    updateDoctor,
    deleteDoctor,
    getAllDoctor,
    getSingleDoctor,
    getDoctorProfile,
    getDoctorAppointments,
    confirmDoctorAppointment,
    cancelDoctorAppointment,
    rescheduleDoctorAppointment,
}   from "../Controllers/doctorController.js";

import { authenticate, restrict } from "../auth/verifyToken.js";

import reviewRouter from './review.js'

const router = express.Router();

// Nested routes
router.use('/:doctorId/reviews', reviewRouter);
 
router.get ("/:id", getSingleDoctor);
router.get ("/", getAllDoctor);
router.put ("/:id", authenticate, restrict(['doctor']), updateDoctor);
router.delete ("/:id", authenticate, restrict(['doctor']), deleteDoctor);

router.get ("/profile/me", authenticate, restrict(['doctor']), getDoctorProfile);

// Appointments endpoints for doctor dashboard
router.get("/appointments", authenticate, restrict(['doctor']), getDoctorAppointments);
router.patch("/appointments/:id/confirm", authenticate, restrict(['doctor']), confirmDoctorAppointment);
router.patch("/appointments/:id/cancel", authenticate, restrict(['doctor']), cancelDoctorAppointment);
router.patch("/appointments/:id/reschedule", authenticate, restrict(['doctor']), rescheduleDoctorAppointment);

export default router;
