import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/UserSchema.js';
import Doctor from './models/DoctorSchema.js';
import Booking from './models/BookingSchema.js';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const createTestBooking = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to DB');

        const user = await User.findOne({ email: 'pepito.perez@gmail.com' });
        if (!user) throw new Error('User pepito.perez@gmail.com not found');

        // Find ANY doctor
        const doctor = await Doctor.findOne({});
        if (!doctor) throw new Error('No doctor found in DB');

        console.log(`Booking for User: ${user.name} with Doctor: ${doctor.name}`);

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);

        const newBooking = new Booking({
            doctor: doctor._id,
            user: user._id,
            ticketPrice: 50000,
            appointmentDate: tomorrow,
            status: 'pending',
            isPaid: false,
            createdAt: new Date(),
        });

        await newBooking.save();
        console.log('Booking created:', newBooking._id);
        
        // Add to user appointments array if needed (though usually handled by virtuals or separate queries)
        user.appointments.push(newBooking._id);
        await user.save();

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createTestBooking();
