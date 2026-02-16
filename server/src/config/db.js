import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is not set');
  }
  await mongoose.connect(env.mongoUri);
  console.log('MongoDB connected');
};
