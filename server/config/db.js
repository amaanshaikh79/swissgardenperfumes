import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI?.trim() || 'mongodb://127.0.0.1:27017/swissgarden-perfumes';
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });

    console.log(`✨ MongoDB Connected: ${conn.connection.host}`);
    if (!process.env.MONGO_URI) {
      console.warn('⚠️ MONGO_URI is not defined. Connected to local MongoDB fallback at mongodb://127.0.0.1:27017/swissgarden-perfumes');
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('HINT: Set MONGO_URI in server/.env or your environment variables to a valid MongoDB connection string.');
    process.exit(1);
  }
};

export default connectDB;
