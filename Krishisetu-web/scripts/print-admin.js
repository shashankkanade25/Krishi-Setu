const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/krishisetu';
  await mongoose.connect(uri, { family: 4 });
  console.log('Connected to', uri);
  const admin = await User.findOne({ role: 'admin' }).lean();
  if (!admin) {
    console.log('No admin user found');
  } else {
    console.log('Admin found:');
    console.log({ email: admin.email, name: admin.name, _id: admin._id });
  }
  process.exit(0);
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
