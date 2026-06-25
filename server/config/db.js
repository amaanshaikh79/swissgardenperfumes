import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGO_URI?.trim();

    if (!mongoURI) {
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ FATAL: MONGO_URI is required in production. Exiting.');
        process.exit(1);
      }
      // Dev-only fallback to a local MongoDB instance.
      mongoURI = 'mongodb://127.0.0.1:27017/swissgarden-perfumes';
      console.warn('⚠️ MONGO_URI is not defined. Falling back to local MongoDB at ' + mongoURI);
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });

    console.log(`✨ MongoDB Connected: ${conn.connection.host}`);

    // Observability: surface runtime errors and disconnects.
    mongoose.connection.on('error', (err) => console.error(`MongoDB runtime error: ${err.message}`));
    mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.error('Fatal: cannot start without a database in production. Exiting.');
      process.exit(1);
    }
    console.error('HINT: Set MONGO_URI in server/.env or your environment variables to a valid MongoDB connection string.');
    console.error('⚠️ Dev mode: continuing without DB.');
  }
};

export default connectDB;
