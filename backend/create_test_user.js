import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/UserSchema.js';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const createUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to DB');

        const email = 'pepito.perez@gmail.com';
        const password = 'Password123!';
        
        // Check if exists
        const existing = await User.findOne({ email });
        if (existing) {
            console.log('User already exists, updating password...');
            const salt = await bcrypt.genSalt(10);
            existing.password = await bcrypt.hash(password, salt);
            await existing.save();
            console.log('Password updated to:', password);
        } else {
            console.log('Creating new user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                email,
                password: hashedPassword,
                name: 'Pepito Perez',
                role: 'paciente',
                gender: 'Male',
                bloodType: 'O+',
                photo: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                authProvider: 'local',
                emailVerified: true // Important to bypass email verification check
            });

            await newUser.save();
            console.log('User created successfully!');
            
            // Verify immediate login
            const savedUser = await User.findOne({ email }).select('+password');
            const match = await bcrypt.compare(password, savedUser.password);
            console.log(`Self-check password match: ${match}`);
        }
        
        console.log(`Credentials: ${email} / ${password}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createUser();
