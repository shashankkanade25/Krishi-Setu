const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/krishisetu')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

async function setupAdmin() {
    try {
        console.log('\n🔧 Setting up Admin Account...\n');
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        
        if (existingAdmin) {
            console.log('⚠️  Admin account already exists:');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Name: ${existingAdmin.name}\n`);
            
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            readline.question('Do you want to create another admin? (y/n): ', async (answer) => {
                readline.close();
                if (answer.toLowerCase() !== 'y') {
                    console.log('\n✅ Setup cancelled\n');
                    process.exit(0);
                }
                await createAdmin();
            });
        } else {
            await createAdmin();
        }
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

async function createAdmin() {
    try {
        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            email: process.env.ADMIN_EMAIL || 'admin@krishisetu.com',
            password: process.env.ADMIN_PASSWORD || 'admin123',
            role: 'admin',
            isVerified: true,
            notifications: {
                email: true,
                sms: false,
                inApp: true
            }
        });
        
        console.log('✅ Admin account created successfully!\n');
        console.log('📧 Login Credentials:');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
        console.log(`\n⚠️  IMPORTANT: Please change the password after first login!\n`);
        console.log('🌐 Access admin dashboard at: http://localhost:5000/admin\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
}

// Run setup
setupAdmin();
