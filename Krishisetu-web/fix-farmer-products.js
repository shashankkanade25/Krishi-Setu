const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/krishisetu')
.then(() => console.log('✅ Connected'))
.catch(err => console.error('❌ Error:', err));

async function fixProducts() {
    try {
        // Find the actual farmer account
        const actualFarmer = await User.findOne({ email: 'shashankkanade07@gmail.com' });
        
        if (!actualFarmer) {
            console.log('❌ Farmer account shashankkanade07@gmail.com not found!');
            process.exit(1);
        }
        
        console.log(`✅ Found farmer: ${actualFarmer.name} (${actualFarmer.email})`);
        console.log(`   Farmer ID: ${actualFarmer._id}\n`);
        
        // Find the seeded account
        const seededFarmer = await User.findOne({ email: 'shashank.kanade@krishisetu.com' });
        
        if (!seededFarmer) {
            console.log('❌ Seeded farmer account not found!');
            process.exit(1);
        }
        
        // Get all products from seeded account
        const seededProducts = await Product.find({ farmerId: seededFarmer._id });
        console.log(`Found ${seededProducts.length} products in seeded account\n`);
        
        // Copy products to actual farmer account
        let addedCount = 0;
        let skippedCount = 0;
        
        for (const product of seededProducts) {
            // Check if product already exists
            const exists = await Product.findOne({
                name: product.name,
                farmerId: actualFarmer._id
            });
            
            if (exists) {
                console.log(`⏭️  Skipped: ${product.name} (already exists)`);
                skippedCount++;
                continue;
            }
            
            // Create new product for actual farmer
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
                farmerId: actualFarmer._id,
                farmerName: actualFarmer.name,
                status: product.status
            });
            
            await newProduct.save();
            console.log(`✅ Added: ${product.name}`);
            addedCount++;
        }
        
        console.log('\n📊 Summary:');
        console.log(`✅ Products added: ${addedCount}`);
        console.log(`⏭️  Products skipped: ${skippedCount}`);
        console.log(`\n🎉 All products are now assigned to ${actualFarmer.email}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixProducts();
