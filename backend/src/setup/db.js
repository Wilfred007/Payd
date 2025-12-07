import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/payrol_system';
  await mongoose.connect(uri, {
    autoIndex: true,
  });
  console.log('Mongo connected');
}
