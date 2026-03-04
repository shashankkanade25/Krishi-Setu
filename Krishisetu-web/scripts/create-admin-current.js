const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/krishisetu';
  await mongoose.connect(uri, { family: 4 });
  console.log('Connected to', uri);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@krishisetu.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log('Admin already exists with email:', adminEmail);
    process.exit(0);
  }

  const admin = await User.create({
    name: 'Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    isVerified: true,
    notifications: { email: true, inApp: true }
  });

  console.log('Created admin:', { email: admin.email });
  process.exit(0);
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
