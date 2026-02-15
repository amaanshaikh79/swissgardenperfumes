import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✨ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('HINT: If you are running on Render, ensure you have set the MONGO_URI environment variable to a valid MongoDB Atlas connection string (not localhost).');
    process.exit(1);
  }
};

export default connectDB;
