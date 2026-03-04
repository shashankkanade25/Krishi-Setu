require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function verifyUsers() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/krishisetu';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Test credentials
        const testCreds = [
            { email: 'shashankkanade07@gmail.com', password: '1234567890', expectedRole: 'farmer' },
            { email: 'atharvaholsambre1@icloud.com', password: '1234567890', expectedRole: 'customer' }
        ];

        for (const cred of testCreds) {
            console.log('\n--- Checking:', cred.email, '---');
            
            const user = await User.findOne({ email: cred.email }).select('name email role password');
            
            if (!user) {
                console.log('❌ User NOT FOUND');
                continue;
            }

            console.log('✅ User found:');
            console.log('  Name:', user.name);
            console.log('  Email:', user.email);
            console.log('  Role:', user.role);
            console.log('  Has password:', !!user.password);

            // Test password
            try {
                const isMatch = await user.comparePassword(cred.password);
                console.log('  Password match:', isMatch ? '✅ YES' : '❌ NO');
            } catch (err) {
                console.log('  Password check error:', err.message);
            }

            // Check role match
            const normalizedRole = user.role === 'user' ? 'customer' : user.role;
            if (normalizedRole === cred.expectedRole) {
                console.log('  Role match: ✅ YES');
            } else {
                console.log('  Role match: ❌ NO (expected:', cred.expectedRole, ', got:', normalizedRole, ')');
            }
        }

        await mongoose.connection.close();
        console.log('\n✅ Verification complete');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

verifyUsers();
