const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/krishisetu')
.then(() => console.log('✅ Connected'))
.catch(err => console.error('❌ Error:', err));

async function setupFarmer() {
    try {
        console.log('🔍 Searching for farmer accounts...\n');
        
        // Check if farmer exists
        let farmer = await User.findOne({ email: 'shashankkanade07@gmail.com' });
        
        if (!farmer) {
            console.log('Farmer not found. Creating account...');
            farmer = await User.create({
                name: 'Shashank Kanade',
                email: 'shashankkanade07@gmail.com',
                password: '1234567890',
                role: 'farmer'
            });
            console.log(`✅ Created farmer: ${farmer.name} (${farmer.email})\n`);
        } else {
            console.log(`✅ Found farmer: ${farmer.name} (${farmer.email})\n`);
        }
        
        // Products data for Shashank Kanade
        const productsData = [
            // Fruits
            { name: 'Banana', category: 'fruits', price: 50, originalPrice: 60, discount: 17, stock: 200, unit: 'kg', image: '/Product_images/banana.jpg' },
            { name: 'Guava', category: 'fruits', price: 70, originalPrice: 85, discount: 18, stock: 150, unit: 'kg', image: '/Product_images/guava.jpg' },
            { name: 'Dates', category: 'fruits', price: 300, originalPrice: 350, discount: 14, stock: 80, unit: 'kg', image: '/Product_images/dates.jpg' },
            { name: 'Pomegranate', category: 'fruits', price: 150, originalPrice: 180, discount: 17, stock: 100, unit: 'kg', image: '/Product_images/pomegranate.jpg' },
            { name: 'Grapes', category: 'fruits', price: 80, originalPrice: 100, discount: 20, stock: 120, unit: 'kg', image: '/Product_images/grapes.jpg' },
            
            // Vegetables
            { name: 'Tomato', category: 'vegetables', price: 30, originalPrice: 40, discount: 25, stock: 250, unit: 'kg', image: '/Product_images/tomato.jpg' },
            { name: 'Potato', category: 'vegetables', price: 25, originalPrice: 30, discount: 17, stock: 300, unit: 'kg', image: '/Product_images/potato.jpg' },
            { name: 'Cauliflower', category: 'vegetables', price: 40, originalPrice: 50, discount: 20, stock: 150, unit: 'kg', image: '/Product_images/cauliflower.jpg' },
            { name: 'Spinach', category: 'vegetables', price: 30, originalPrice: 40, discount: 25, stock: 180, unit: 'kg', image: '/Product_images/spinach.jpg' },
            { name: 'Cabbage', category: 'vegetables', price: 25, originalPrice: 35, discount: 29, stock: 200, unit: 'kg', image: '/Product_images/cabbage.jpg' },
            
            // Pulses
            { name: 'Toor Dal', category: 'pulses', price: 120, originalPrice: 140, discount: 14, stock: 200, unit: 'kg', image: '/Product_images/toor dal.avif' },
            { name: 'Moong Dal', category: 'pulses', price: 110, originalPrice: 130, discount: 15, stock: 180, unit: 'kg', image: '/Product_images/moong dal.avif' },
            { name: 'Masoor Dal', category: 'pulses', price: 100, originalPrice: 120, discount: 17, stock: 160, unit: 'kg', image: '/Product_images/masoor dal.avif' },
            { name: 'Urad Dal', category: 'pulses', price: 130, originalPrice: 150, discount: 13, stock: 150, unit: 'kg', image: '/Product_images/urad dal.avif' },
            { name: 'Rajma', category: 'pulses', price: 140, originalPrice: 160, discount: 13, stock: 140, unit: 'kg', image: '/Product_images/rajma.avif' },
            
            // Pickles
            { name: 'Mango Pickle', category: 'pickles', price: 150, originalPrice: 180, discount: 17, stock: 100, unit: 'kg', image: '/Product_images/mango pickle.avif' },
            { name: 'Lemon Pickle', category: 'pickles', price: 120, originalPrice: 150, discount: 20, stock: 90, unit: 'kg', image: '/Product_images/lemon pickle.avif' },
            { name: 'Garlic Pickle', category: 'pickles', price: 180, originalPrice: 220, discount: 18, stock: 70, unit: 'kg', image: '/Product_images/garlic pickle.avif' },
            
            // Masala
            { name: 'Turmeric Powder', category: 'masala', price: 250, originalPrice: 300, discount: 17, stock: 150, unit: 'kg', image: '/Product_images/turmeric.avif' },
            { name: 'Red Chilli Powder', category: 'masala', price: 200, originalPrice: 240, discount: 17, stock: 140, unit: 'kg', image: '/Product_images/chilli powder.avif' },
            { name: 'Garam Masala', category: 'masala', price: 300, originalPrice: 350, discount: 14, stock: 100, unit: 'kg', image: '/Product_images/garam masala.avif' },
            
            // Grains
            { name: 'Basmati Rice', category: 'grains', price: 120, originalPrice: 150, discount: 20, stock: 500, unit: 'kg', image: '/Product_images/basmati rice.avif' },
            { name: 'Brown Rice', category: 'grains', price: 100, originalPrice: 130, discount: 23, stock: 400, unit: 'kg', image: '/Product_images/brown rice.avif' }
        ];
        
        let addedCount = 0;
        let skippedCount = 0;
        
        for (const productData of productsData) {
            // Check if product already exists
            const exists = await Product.findOne({
                name: productData.name,
                farmerId: farmer._id
            });
            
            if (exists) {
                console.log(`⏭️  Skipped: ${productData.name} (already exists)`);
                skippedCount++;
                continue;
            }
            
            const product = await Product.create({
                ...productData,
                farmerId: farmer._id,
                farmerName: farmer.name,
                description: `Fresh ${productData.name} from ${farmer.name}'s farm`
            });
            
            console.log(`✅ Added: ${product.name} (${product.category})`);
            addedCount++;
        }
        
        console.log('\n📊 Summary:');
        console.log(`✅ Products added: ${addedCount}`);
        console.log(`⏭️  Products skipped: ${skippedCount}`);
        console.log(`📦 Total products: ${productsData.length}`);
        
        console.log('\n🎉 Setup complete! You can now login with:');
        console.log(`   Email: shashankkanade07@gmail.com`);
        console.log(`   Password: 1234567890`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

setupFarmer();
