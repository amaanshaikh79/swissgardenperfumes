import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const makeAdmin = async (email) => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find and update user
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`❌ User with email ${email} not found`);
            process.exit(1);
        }

        // Update role to admin
        user.role = 'admin';
        await user.save();

        console.log(`✅ Successfully promoted ${user.firstName} ${user.lastName} (${email}) to admin`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

// Get email from command line argument
const email = process.argv[2];
if (!email) {
    console.log('Usage: node makeAdmin.js <email>');
    console.log('Example: node makeAdmin.js adnanshaikh07@gmail.com');
    process.exit(1);
}

makeAdmin(email);
