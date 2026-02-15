const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

// All products from customer products page
const products = [
    // FRUITS
    { name: 'Banana', category: 'fruits', price: 32, originalPrice: 40, stock: 50, unit: 'kg', image: '/Product_images/banana.jpg', farmerName: 'Shashank Kanade', description: 'Fresh ripe bananas' },
    { name: 'Strawberry', category: 'fruits', price: 120, originalPrice: 150, stock: 30, unit: 'kg', image: '/Product_images/straberry.jpg', farmerName: 'bunty thalkar', description: 'Sweet strawberries' },
    { name: 'Guava', category: 'fruits', price: 40, originalPrice: 50, stock: 45, unit: 'kg', image: '/Product_images/guava.jpg', farmerName: 'Shashank Kanade', description: 'Fresh guavas' },
    { name: 'Orange', category: 'fruits', price: 56, originalPrice: 70, stock: 40, unit: 'kg', image: '/Product_images/orange.jpg', farmerName: 'bunty thalkar', description: 'Juicy oranges' },
    { name: 'Dates', category: 'fruits', price: 240, originalPrice: 300, stock: 25, unit: 'kg', image: '/Product_images/dates.png', farmerName: 'Shashank Kanade', description: 'Premium dates' },
    { name: 'Apple', category: 'fruits', price: 96, originalPrice: 120, stock: 35, unit: 'kg', image: '/Product_images/apple.jpg', farmerName: 'bunty thalkar', description: 'Fresh apples' },
    { name: 'Pomegranate', category: 'fruits', price: 80, originalPrice: 100, stock: 30, unit: 'kg', image: '/Product_images/pomegranate.png', farmerName: 'Shashank Kanade', description: 'Sweet pomegranates' },
    { name: 'Papaya', category: 'fruits', price: 20, originalPrice: 25, stock: 50, unit: 'kg', image: '/Product_images/papaya.jpg', farmerName: 'bunty thalkar', description: 'Ripe papayas' },
    { name: 'Grapes', category: 'fruits', price: 56, originalPrice: 70, stock: 35, unit: 'kg', image: '/Product_images/grapes.jpg', farmerName: 'Shashank Kanade', description: 'Fresh grapes' },
    
    // VEGETABLES
    { name: 'Bhendi', category: 'vegetables', price: 32, originalPrice: 40, stock: 40, unit: 'kg', image: '/images/bhendi.jpg', farmerName: 'bunty thalkar', description: 'Fresh okra' },
    { name: 'Tomato', category: 'vegetables', price: 24, originalPrice: 30, stock: 60, unit: 'kg', image: '/Product_images/tomato.jpg', farmerName: 'Shashank Kanade', description: 'Ripe tomatoes' },
    { name: 'Onion', category: 'vegetables', price: 16, originalPrice: 20, stock: 80, unit: 'kg', image: '/Product_images/onion.jpg', farmerName: 'bunty thalkar', description: 'Fresh onions' },
    { name: 'Potato', category: 'vegetables', price: 16, originalPrice: 20, stock: 100, unit: 'kg', image: '/Product_images/potato.jpg', farmerName: 'Shashank Kanade', description: 'Farm fresh potatoes' },
    { name: 'Capsicum (Green)', category: 'vegetables', price: 40, originalPrice: 50, stock: 35, unit: 'kg', image: '/Product_images/capcicum.png', farmerName: 'bunty thalkar', description: 'Green bell peppers' },
    { name: 'Cauliflower', category: 'vegetables', price: 28, originalPrice: 35, stock: 40, unit: 'kg', image: '/Product_images/cauliflower.jpg', farmerName: 'Shashank Kanade', description: 'Fresh cauliflower' },
    { name: 'Carrot (Orange)', category: 'vegetables', price: 28, originalPrice: 35, stock: 50, unit: 'kg', image: '/Product_images/carrot(orange).jpg', farmerName: 'bunty thalkar', description: 'Fresh carrots' },
    { name: 'Spinach (Palak)', category: 'vegetables', price: 20, originalPrice: 25, stock: 45, unit: 'kg', image: '/Product_images/Spinach-Palak.jpg', farmerName: 'Shashank Kanade', description: 'Fresh spinach leaves' },
    { name: 'Brinjal (Eggplant)', category: 'vegetables', price: 24, originalPrice: 30, stock: 40, unit: 'kg', image: '/Product_images/brinjal.jpg', farmerName: 'bunty thalkar', description: 'Fresh eggplant' },
    { name: 'Cabbage', category: 'vegetables', price: 20, originalPrice: 25, stock: 45, unit: 'kg', image: '/Product_images/cabbage.png', farmerName: 'Shashank Kanade', description: 'Fresh cabbage' },
    
    // DAIRY
    { name: 'Buffalo Milk', category: 'dairy', price: 65, originalPrice: 65, stock: 100, unit: 'liter', image: '/Product_images/milk.jpg', farmerName: 'Shashank Kanade', description: 'Pure buffalo milk' },
    { name: 'Amul Cheese', category: 'dairy', price: 69, originalPrice: 77, stock: 40, unit: 'piece', image: '/Product_images/panner.jpg', farmerName: 'bunty thalkar', description: 'Fresh cheese' },
    { name: 'Cow Milk', category: 'dairy', price: 52, originalPrice: 52, stock: 120, unit: 'liter', image: '/Product_images/milk.jpg', farmerName: 'Shashank Kanade', description: 'Pure cow milk' },
    { name: 'Amul Butter', category: 'dairy', price: 35, originalPrice: 40, stock: 50, unit: 'piece', image: '/Product_images/butter.jpg', farmerName: 'bunty thalkar', description: 'Fresh butter' },
    { name: 'Paneer', category: 'dairy', price: 450, originalPrice: 500, stock: 30, unit: 'kg', image: '/Product_images/panner.jpg', farmerName: 'Shashank Kanade', description: 'Fresh cottage cheese' },
    { name: 'Dahi (Curd)', category: 'dairy', price: 120, originalPrice: 130, stock: 60, unit: 'kg', image: '/Product_images/curd.jpg', farmerName: 'bunty thalkar', description: 'Fresh curd' },
    { name: 'Curd (Dahi)', category: 'dairy', price: 45, originalPrice: 50, stock: 65, unit: 'piece', image: '/Product_images/curd.jpg', farmerName: 'Shashank Kanade', description: 'Homemade curd' },
    { name: 'Lassi', category: 'dairy', price: 25, originalPrice: 25, stock: 80, unit: 'liter', image: '/Product_images/curd.jpg', farmerName: 'bunty thalkar', description: 'Fresh lassi' },
    
    // PULSES
    { name: 'Toor Dal', category: 'pulses', price: 249, originalPrice: 249, stock: 50, unit: 'kg', image: '/Product_images/masoor-dal-face-pack.jpg', farmerName: 'Shashank Kanade', description: 'Premium toor dal' },
    { name: 'Moong Dal', category: 'pulses', price: 80, originalPrice: 100, stock: 45, unit: 'kg', image: '/Product_images/moong dal.jpg', farmerName: 'bunty thalkar', description: 'Yellow moong dal' },
    { name: 'Chana Dal', category: 'pulses', price: 64, originalPrice: 80, stock: 50, unit: 'kg', image: '/Product_images/chana dal.avif', farmerName: 'Shashank Kanade', description: 'Split chickpeas' },
    { name: 'Urad Dal', category: 'pulses', price: 72, originalPrice: 90, stock: 45, unit: 'kg', image: '/Product_images/urad dal.jpg', farmerName: 'bunty thalkar', description: 'Black gram dal' },
    { name: 'Masoor Dal', category: 'pulses', price: 68, originalPrice: 85, stock: 50, unit: 'kg', image: '/Product_images/masoor-dal-face-pack.jpg', farmerName: 'Shashank Kanade', description: 'Red lentils' },
    { name: 'Rajma (Red Kidney Beans)', category: 'pulses', price: 88, originalPrice: 110, stock: 40, unit: 'kg', image: '/Product_images/benefits-of-rajma.jpg', farmerName: 'bunty thalkar', description: 'Red kidney beans' },
    { name: 'Kabuli Chana', category: 'pulses', price: 85, originalPrice: 100, stock: 42, unit: 'kg', image: '/Product_images/kabuli chana.jpg', farmerName: 'bunty thalkar', description: 'White chickpeas' },
    { name: 'Kala Chana', category: 'pulses', price: 75, originalPrice: 89, stock: 48, unit: 'kg', image: '/Product_images/kala chana.jpg', farmerName: 'Shashank Kanade', description: 'Black chickpeas' },
    
    // PICKLES
    { name: 'Mango Pickle', category: 'pickles', price: 319, originalPrice: 319, stock: 25, unit: 'kg', image: '/images/pickel-1kg.jpg', farmerName: 'bunty thalkar', description: 'Traditional mango pickle' },
    { name: 'Lemon Pickle', category: 'pickles', price: 280, originalPrice: 318, stock: 30, unit: 'kg', image: '/Product_images/lemon pickle.png', farmerName: 'Shashank Kanade', description: 'Tangy lemon pickle' },
    { name: 'Garlic Pickle (Lehsun)', category: 'pickles', price: 265, originalPrice: 294, stock: 28, unit: 'kg', image: '/Product_images/garlic.jpg', farmerName: 'bunty thalkar', description: 'Spicy garlic pickle' },
    { name: 'Green Chilli Pickle', category: 'pickles', price: 240, originalPrice: 282, stock: 32, unit: 'kg', image: '/Product_images/green-chilli-pickle-1.jpg', farmerName: 'Shashank Kanade', description: 'Hot green chilli pickle' },
    { name: 'Amla Pickle', category: 'pickles', price: 275, originalPrice: 309, stock: 30, unit: 'kg', image: '/Product_images/Amla-pickle.jpg', farmerName: 'bunty thalkar', description: 'Healthy amla pickle' },
    { name: 'Carrot Pickle (Gajar)', category: 'pickles', price: 290, originalPrice: 319, stock: 26, unit: 'kg', image: '/Product_images/gajar pickle.jpg', farmerName: 'Shashank Kanade', description: 'Sweet carrot pickle' },
    
    // MASALA
    { name: 'Garam Masala', category: 'masala', price: 59, originalPrice: 59, stock: 60, unit: '100g', image: '/images/Garam-Masala-Powder.jpg', farmerName: 'bunty thalkar', description: 'Aromatic spice blend' },
    { name: 'Haldi (Turmeric Powder)', category: 'masala', price: 45, originalPrice: 50, stock: 70, unit: '100g', image: '/Product_images/turmeric powder.png', farmerName: 'Shashank Kanade', description: 'Pure turmeric powder' },
    { name: 'Red Chilli Powder', category: 'masala', price: 65, originalPrice: 71, stock: 65, unit: '100g', image: '/Product_images/red-chilli-powde.jpg', farmerName: 'bunty thalkar', description: 'Hot red chilli powder' },
    { name: 'Dhania (Coriander Powder)', category: 'masala', price: 55, originalPrice: 62, stock: 60, unit: '100g', image: '/Product_images/corri.jpg', farmerName: 'Shashank Kanade', description: 'Fresh coriander powder' },
    { name: 'Jeera (Cumin Powder)', category: 'masala', price: 48, originalPrice: 54, stock: 65, unit: '100g', image: '/Product_images/CuminPowder_1_1024x1024.jpg', farmerName: 'bunty thalkar', description: 'Aromatic cumin powder' },
    
    // GRAINS
    { name: 'Basmati Rice', category: 'grains', price: 55, originalPrice: 60, stock: 80, unit: 'kg', image: '/Product_images/basmati-rice-png.png', farmerName: 'Shashank Kanade', description: 'Premium basmati rice' },
    { name: 'Atta (Wheat Flour)', category: 'grains', price: 42, originalPrice: 45, stock: 100, unit: 'kg', image: '/Product_images/wheat-flour.jpg', farmerName: 'bunty thalkar', description: 'Fresh wheat flour' },
    { name: 'Indrayani Rice', category: 'grains', price: 38, originalPrice: 40, stock: 90, unit: 'kg', image: '/Product_images/indrayani rice.jpg', farmerName: 'Shashank Kanade', description: 'Fragrant indrayani rice' },
    { name: 'Jowar (Jwari)', category: 'grains', price: 65, originalPrice: 72, stock: 60, unit: 'kg', image: '/Product_images/jwari.jpg', farmerName: 'bunty thalkar', description: 'Nutritious jowar' },
    { name: 'Bajra (Pearl Millet)', category: 'grains', price: 58, originalPrice: 66, stock: 55, unit: 'kg', image: '/Product_images/bajra.jpg', farmerName: 'Shashank Kanade', description: 'Healthy pearl millet' },
    { name: 'Ragi (Finger Millet)', category: 'grains', price: 48, originalPrice: 53, stock: 50, unit: 'kg', image: '/Product_images/ragi.jpg', farmerName: 'bunty thalkar', description: 'Calcium-rich ragi' },
    { name: 'Sooji (Semolina)', category: 'grains', price: 52, originalPrice: 58, stock: 65, unit: 'kg', image: '/Product_images/besan.jpg', farmerName: 'Shashank Kanade', description: 'Fine semolina' },
    { name: 'Poha (Flattened Rice)', category: 'grains', price: 68, originalPrice: 74, stock: 55, unit: 'kg', image: '/Product_images/indrayani rice.jpg', farmerName: 'bunty thalkar', description: 'Thick poha' }
];

async function seedProducts() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/krishisetu';
        await mongoose.connect(uri, { family: 4 });
        console.log('✅ Connected to MongoDB\n');
        
        // Get farmer users to assign as product owners
        const farmers = await User.find({ role: 'farmer' }).lean();
        
        if (farmers.length === 0) {
            console.log('⚠️  No farmers found. Creating default farmers...');
            
            // Create the two farmers mentioned in products
            const farmer1 = await User.create({
                name: 'Shashank Kanade',
                email: 'shashank.farmer@krishisetu.com',
                password: 'farmer123',
                role: 'farmer',
                isVerified: true
            });
            
            const farmer2 = await User.create({
                name: 'bunty thalkar',
                email: 'bunty.farmer@krishisetu.com',
                password: 'farmer123',
                role: 'farmer',
                isVerified: true
            });
            
            farmers.push(farmer1, farmer2);
            console.log('✅ Created 2 default farmers\n');
        }
        
        // Create a map of farmer names to farmer IDs
        const farmerMap = {};
        farmers.forEach(farmer => {
            farmerMap[farmer.name] = farmer._id;
        });
        
        console.log('🌱 Seeding products...\n');
        
        let added = 0;
        let skipped = 0;
        
        for (const productData of products) {
            // Check if product already exists
            const existing = await Product.findOne({ name: productData.name, category: productData.category });
            
            if (existing) {
                console.log(`⏭️  Skipped: ${productData.name} (already exists)`);
                skipped++;
                continue;
            }
            
            // Find farmer ID for this product
            let farmerId = farmerMap[productData.farmerName];
            
            // If farmer not found, use first available farmer
            if (!farmerId && farmers.length > 0) {
                farmerId = farmers[0]._id;
            }
            
            // Calculate discount
            const discount = productData.originalPrice > productData.price 
                ? Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)
                : 0;
            
            // Create product
            await Product.create({
                name: productData.name,
                category: productData.category,
                price: productData.price,
                originalPrice: productData.originalPrice,
                discount: discount,
                stock: productData.stock,
                unit: productData.unit,
                image: productData.image,
                description: productData.description || `Fresh ${productData.name}`,
                farmerId: farmerId,
                farmerName: productData.farmerName,
                status: 'active'
            });
            
            console.log(`✅ Added: ${productData.name} (${productData.category}) - ₹${productData.price}`);
            added++;
        }
        
        console.log('\n═══════════════════════════════════════');
        console.log(`📊 Summary:`);
        console.log(`   ✅ Added: ${added} products`);
        console.log(`   ⏭️  Skipped: ${skipped} products (already exist)`);
        console.log(`   📦 Total in database: ${await Product.countDocuments()}`);
        console.log('═══════════════════════════════════════\n');
        
        console.log('🎉 All products from customer page are now available in admin dashboard!\n');
        console.log('🌐 View them at: http://localhost:5000/admin (Products section)\n');
        
        await mongoose.connection.close();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedProducts();
