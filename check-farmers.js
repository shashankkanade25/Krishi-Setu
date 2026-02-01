const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/krishisetu')
.then(() => console.log('✅ Connected'))
.catch(err => console.error('❌ Error:', err));

async function checkFarmers() {
    try {
        console.log('\n👥 All Farmers in Database:\n');
        const farmers = await User.find({ role: 'farmer' });
        
        if (farmers.length === 0) {
            console.log('❌ No farmers found!');
            process.exit(0);
        }
        
        for (const farmer of farmers) {
            console.log(`Name: ${farmer.name}`);
            console.log(`Email: ${farmer.email}`);
            console.log(`ID: ${farmer._id}`);
            
            const productCount = await Product.countDocuments({ farmerId: farmer._id });
            console.log(`Products: ${productCount}`);
            console.log('─'.repeat(60));
        }
        
        console.log('\n📦 Sample Products:\n');
        const products = await Product.find().limit(5).populate('farmerId', 'name email');
        products.forEach(p => {
            console.log(`${p.name} - by ${p.farmerName} (Farmer ID: ${p.farmerId?._id})`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkFarmers();
