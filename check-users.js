const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/krishisetu').then(async () => {
    console.log('MongoDB Connected');
    
    const users = await User.find({});
    console.log(`\nFound ${users.length} users:\n`);
    
    users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    process.exit(0);
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
