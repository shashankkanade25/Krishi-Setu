const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/krishisetu')
.then(() => console.log('✅ Connected'))
.catch(err => console.error('❌ Error:', err));

async function reassignProducts() {
    try {
        console.log('\n🔄 Reassigning products to existing farmers...\n');
        
        // Find all farmers
        const allFarmers = await User.find({ role: 'farmer' });
        console.log(`Found ${allFarmers.length} farmers\n`);
        
        // Show all farmers
        allFarmers.forEach((f, i) => {
            console.log(`${i + 1}. ${f.name} (${f.email}) - ID: ${f._id}`);
        });
        
        // Find the newly created farmers
        const newShasahank = await User.findOne({ email: 'shashank.kanade@krishisetu.com' });
        const newBunty = await User.findOne({ email: 'bunty.thalkar@krishisetu.com' });
        
        // Find any other Shashank or bunty accounts
        const otherShashank = await User.findOne({ 
            name: { $regex: /shashank/i }, 
            email: { $ne: 'shashank.kanade@krishisetu.com' },
            role: 'farmer'
        });
        
        const otherBunty = await User.findOne({ 
            name: { $regex: /bunty/i }, 
            email: { $ne: 'bunty.thalkar@krishisetu.com' },
            role: 'farmer'
        });
        
        console.log('\n📋 Account Summary:');
        console.log('New Shashank:', newShasahank ? `${newShasahank.email} (${newShasahank._id})` : 'Not found');
        console.log('New Bunty:', newBunty ? `${newBunty.email} (${newBunty._id})` : 'Not found');
        console.log('Other Shashank:', otherShashank ? `${otherShashank.email} (${otherShashank._id})` : 'Not found');
        console.log('Other Bunty:', otherBunty ? `${otherBunty.email} (${otherBunty._id})` : 'Not found');
        
        // If there are other accounts, copy products to them
        if (otherShashank && newShasahank) {
            console.log('\n🔄 Copying Shashank products to existing account...');
            const shashankProducts = await Product.find({ farmerId: newShasahank._id });
            
            for (const product of shashankProducts) {
                // Check if already exists
                const exists = await Product.findOne({
                    name: product.name,
                    farmerId: otherShashank._id
                });
                
                if (!exists) {
                    const newProduct = new Product({
                        name: product.name,
                        category: product.category,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        discount: product.discount,
                        stock: product.stock,
                        unit: product.unit,
                        image: product.image,
                        description: product.description,
                        farmerId: otherShashank._id,
                        farmerName: otherShashank.name,
                        status: product.status
                    });
                    await newProduct.save();
                    console.log(`✅ Copied: ${product.name}`);
                }
            }
        }
        
        if (otherBunty && newBunty) {
            console.log('\n🔄 Copying Bunty products to existing account...');
            const buntyProducts = await Product.find({ farmerId: newBunty._id });
            
            for (const product of buntyProducts) {
                // Check if already exists
                const exists = await Product.findOne({
                    name: product.name,
                    farmerId: otherBunty._id
                });
                
                if (!exists) {
                    const newProduct = new Product({
                        name: product.name,
                        category: product.category,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        discount: product.discount,
                        stock: product.stock,
                        unit: product.unit,
                        image: product.image,
                        description: product.description,
                        farmerId: otherBunty._id,
                        farmerName: otherBunty.name,
                        status: product.status
                    });
                    await newProduct.save();
                    console.log(`✅ Copied: ${product.name}`);
                }
            }
        }
        
        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

reassignProducts();
