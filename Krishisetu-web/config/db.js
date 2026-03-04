const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Check if already connected (important for serverless)
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB already connected');
            return;
        }

        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/krishisetu';
        const conn = await mongoose.connect(mongoUri, {
            // Connection pool size for better performance
            maxPoolSize: 10,
            minPoolSize: 2,
            // Enable query caching
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 10000, // Increased for serverless
            // Faster connection
            family: 4
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Set mongoose to use lean queries by default for better performance
        mongoose.set('strictQuery', false);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // In serverless, don't exit - let the function retry
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
        throw error;
    }
};

module.exports = connectDB;
