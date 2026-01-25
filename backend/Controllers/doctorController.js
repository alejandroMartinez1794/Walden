import Booking from '../models/BookingSchema.js';
import Doctor from '../models/DoctorSchema.js';

export const updateDoctor = async (req, res) => {

    const id= req.params.id;

    try {
        const updatedDoctor = await Doctor.findByIdAndUpdate (
            id,
            { $set: req.body },
            { new: true }
        );
        
        if (!updatedDoctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        res
            .status(200)
            .json({
                success: true,
                message: "Successfully updated Doctor",
                data: updatedDoctor,
            });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update" });
    }
};

export const deleteDoctor = async (req, res) => {

    const id= req.params.id;

    try {
        const deletedDoctor = await Doctor.findByIdAndDelete (
            id,
        );
        
        if (!deletedDoctor) {
             return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        res
            .status(200)
            .json({
                success: true,
                message: "Successfully deleted Doctor",
            });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete" });
    }
};


export const getSingleDoctor = async (req, res) => {

    const id = req.params.id;

    try {
        const doctor = await Doctor.findById(id)
            .populate("reviews")
            .select("-password");

        if (!doctor) {
             return res.status(404).json({ success: false, message: "No Doctor found" });
        }

        res
            .status(200)
            .json({
                success: true,
                message: "Doctor found",
                data: doctor,
            });
    } catch (error) {
        res.status(404).json({ success: false, message: "No Doctor found" });
    }
};


export const getAllDoctor = async (req, res) => {

    try {

        const {query} = req.query
        let doctors;

        if (query) {
            doctors = await Doctor.find({
                isApproved:'approved',
                $or: [
                    {name: { $regex: query, $options: "i" }},
                    {specialization: { $regex: query, $options: "i" }},
                ],
            }).select("-password");
        } else {
            doctors = await Doctor.find ({ isApproved: "approved"}).select(
                "-password"
            );
        }
        res
            .status(200)
            .json({
                success: true,
                message: "Doctors found",
                data: doctors,
            });
    } catch (error) {
        res.status(500).json({ success: false, message: "Not found" });
    }
};

export const getDoctorProfile = async (req, res) => {
    const doctorId = req.userId

    try {
        const doctor = await Doctor.findById(doctorId);

        if(!doctor) {
            return res
                .status(404)
                .json({ success: false, message: "Doctor not found" });
        }

        const { password, ...rest } = doctor._doc
        const appointments = await Booking.find({doctor: doctorId})
            .populate('user', 'name email photo phone gender')
            .sort({ appointmentDate: -1 });
    
        res
            .status(200)
            .json({ 
                success: true, 
                message:'Profile info is getting', 
                data: {...rest, appointments }
            });
    
    }   catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Something went wrong, cannot get" });
    }
}

// ✅ Obtener citas del doctor para el dashboard
export const getDoctorAppointments = async (req, res) => {
    try {
        const doctorId = req.userId;
        const doctor = await Doctor.findById(doctorId).select('ticketPrice');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const bookings = await Booking.find({ doctor: doctorId })
            .populate('user', 'name email photo gender')
            .sort({ createdAt: -1 });

        const payload = bookings.map(b => ({
            _id: b._id,
            date: b.appointmentDate ? new Date(b.appointmentDate).toISOString().slice(0,10) : '',
            createdAt: b.createdAt,
            isPaid: false,
            user: b.user ? {
                name: b.user.name,
                email: b.user.email,
                photo: b.user.photo,
                gender: b.user.gender,
            } : null,
            ticketPrice: doctor.ticketPrice || 0,
        }));

        res.status(200).json(payload);
    } catch (err) {
        console.error('getDoctorAppointments error:', err);
        res.status(500).json({ message: 'Failed to fetch appointments' });
    }
};

// ✅ Confirmar cita (respuesta inmediata; UI actualiza estado local)
export const confirmDoctorAppointment = async (req, res) => {
    try {
        const doctorId = req.userId;
        const { id } = req.params;
        const owned = await Booking.findOne({ _id: id, doctor: doctorId });
        if (!owned) return res.status(404).json({ message: 'Appointment not found' });
        // No persistimos estado específico por ahora
        res.status(200).json({ message: 'Appointment confirmed' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to confirm appointment' });
    }
};

// ✅ Cancelar cita (respuesta inmediata; podrías borrar o marcar estado si quieres)
export const cancelDoctorAppointment = async (req, res) => {
    try {
        const doctorId = req.userId;
        const { id } = req.params;
        const owned = await Booking.findOne({ _id: id, doctor: doctorId });
        if (!owned) return res.status(404).json({ message: 'Appointment not found' });
        res.status(200).json({ message: 'Appointment cancelled' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to cancel appointment' });
    }
};

// ✅ Reprogramar cita (actualiza la fecha preservando la hora original)
export const rescheduleDoctorAppointment = async (req, res) => {
    try {
        const doctorId = req.userId;
        const { id } = req.params;
        const { date } = req.body; // YYYY-MM-DD
        const booking = await Booking.findOne({ _id: id, doctor: doctorId });
        if (!booking) return res.status(404).json({ message: 'Appointment not found' });

        const old = new Date(booking.appointmentDate || Date.now());
        const [y,m,d] = date.split('-').map(Number);
        const updated = new Date(old);
        updated.setFullYear(y, (m-1), d);
        booking.appointmentDate = updated;
        await booking.save();

        res.status(200).json({ message: 'Appointment rescheduled' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to reschedule appointment' });
    }
};
