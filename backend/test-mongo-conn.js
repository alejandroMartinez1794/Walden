import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const uri = process.env.MONGO_URL;

async function test() {
  try {
    console.log('Connecting to MongoDB with URI:', uri ? '(hidden)' : uri);
    await mongoose.connect(uri, { dbName: 'basileia' });
    console.log('Connected to MongoDB successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Connection error:');
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

test();
