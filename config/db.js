const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/krishisetu';
        const conn = await mongoose.connect(mongoUri, {
            // Connection pool size for better performance
            maxPoolSize: 10,
            minPoolSize: 2,
            // Enable query caching
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 5000,
            // Faster connection
            family: 4
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Set mongoose to use lean queries by default for better performance
        mongoose.set('strictQuery', false);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
