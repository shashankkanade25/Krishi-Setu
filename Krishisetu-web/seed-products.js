const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');

// Database connection
mongoose.connect('mongodb://localhost:27017/krishisetu')
.then(() => console.log('✅ Database connected'))
.catch(err => console.error('❌ Database connection error:', err));

// Products data extracted from products.ejs
const productsData = [
    // Fruits - Shashank Kanade
    { name: 'Banana', category: 'fruits', price: 50, originalPrice: 60, discount: 17, stock: 200, unit: 'kg', image: '/Product_images/banana.jpg', farmerName: 'Shashank Kanade' },
    { name: 'Guava', category: 'fruits', price: 70, originalPrice: 85, discount: 18, stock: 150, unit: 'kg', image: '/Product_images/guava.jpg', farmerName: 'Shashank Kanade' },
    { name: 'Dates', category: 'fruits', price: 300, originalPrice: 350, discount: 14, stock: 80, unit: 'kg', image: '/Product_images/dates.jpg', farmerName: 'Shashank Kanade' },
    { name: 'Pomegranate', category: 'fruits', price: 150, originalPrice: 180, discount: 17, stock: 100, unit: 'kg', image: '/Product_images/pomegranate.jpg', farmerName: 'Shashank Kanade' },
    { name: 'Grapes', category: 'fruits', price: 80, originalPrice: 100, discount: 20, stock: 120, unit: 'kg', image: '/Product_images/grapes.jpg', farmerName: 'Shashank Kanade' },
    
    // Fruits - bunty thalkar
    { name: 'Strawberry', category: 'fruits', price: 200, originalPrice: 250, discount: 20, stock: 100, unit: 'kg', image: '/Product_images/strawberry.jpg', farmerName: 'bunty thalkar' },
    { name: 'Orange', category: 'fruits', price: 60, originalPrice: 75, discount: 20, stock: 180, unit: 'kg', image: '/Product_images/orange.jpg', farmerName: 'bunty thalkar' },
    { name: 'Apple', category: 'fruits', price: 120, originalPrice: 150, discount: 20, stock: 150, unit: 'kg', image: '/Product_images/apple.jpg', farmerName: 'bunty thalkar' },
    { name: 'Papaya', category: 'fruits', price: 40, originalPrice: 50, discount: 20, stock: 130, unit: 'kg', image: '/Product_images/papaya.jpg', farmerName: 'bunty thalkar' },
    
    // Vegetables - Shashank Kanade
    { name: 'Tomato', category: 'vegetables', price: 30, originalPrice: 40, discount: 25, stock: 250, unit: 'kg', image: '/Product_images/tomato.jpg', farmerName: 'Shashank Kanade' },
    { name: 'Potato', category: 'vegetables', price: 25, originalPrice: 30, discount: 17, stock: 300, unit: 'kg', image: '/Product_images/potato.jpg', farmerName: 'Shashank Kanade' },
    { name: 'Cauliflower', category: 'vegetables', price: 40, originalPrice: 50, discount: 20, stock: 150, unit: 'kg', image: '/Product_images/cauliflower.jpg', farmerName: 'Shashank Kanade' },
    { name: 'Spinach', category: 'vegetables', price: 30, originalPrice: 40, discount: 25, stock: 180, unit: 'kg', image: '/Product_images/spinach.jpg', farmerName: 'Shashank Kanade' },
    { name: 'Cabbage', category: 'vegetables', price: 25, originalPrice: 35, discount: 29, stock: 200, unit: 'kg', image: '/Product_images/cabbage.jpg', farmerName: 'Shashank Kanade' },
    
    // Vegetables - bunty thalkar
    { name: 'Bhendi', category: 'vegetables', price: 40, originalPrice: 50, discount: 20, stock: 200, unit: 'kg', image: '/Product_images/bhendi.jpg', farmerName: 'bunty thalkar' },
    { name: 'Onion', category: 'vegetables', price: 35, originalPrice: 45, discount: 22, stock: 280, unit: 'kg', image: '/Product_images/onion.jpg', farmerName: 'bunty thalkar' },
    { name: 'Capsicum', category: 'vegetables', price: 60, originalPrice: 75, discount: 20, stock: 140, unit: 'kg', image: '/Product_images/capsicum.jpg', farmerName: 'bunty thalkar' },
    { name: 'Carrot', category: 'vegetables', price: 45, originalPrice: 55, discount: 18, stock: 170, unit: 'kg', image: '/Product_images/carrot.jpg', farmerName: 'bunty thalkar' },
    { name: 'Brinjal', category: 'vegetables', price: 35, originalPrice: 45, discount: 22, stock: 160, unit: 'kg', image: '/Product_images/brinjal.jpg', farmerName: 'bunty thalkar' },
    
    // Dairy - bunty thalkar (even pattern continues)
    { name: 'Milk', category: 'dairy', price: 60, originalPrice: 70, discount: 14, stock: 500, unit: 'liter', image: '/Product_images/milk.jpg', farmerName: 'bunty thalkar' },
    { name: 'Paneer', category: 'dairy', price: 350, originalPrice: 400, discount: 13, stock: 80, unit: 'kg', image: '/Product_images/paneer.jpg', farmerName: 'bunty thalkar' },
    { name: 'Curd', category: 'dairy', price: 50, originalPrice: 60, discount: 17, stock: 300, unit: 'liter', image: '/Product_images/curd.jpg', farmerName: 'bunty thalkar' },
    { name: 'Butter', category: 'dairy', price: 450, originalPrice: 500, discount: 10, stock: 60, unit: 'kg', image: '/Product_images/butter.jpg', farmerName: 'bunty thalkar' },
    { name: 'Ghee', category: 'dairy', price: 500, originalPrice: 600, discount: 17, stock: 100, unit: 'liter', image: '/Product_images/ghee.jpg', farmerName: 'bunty thalkar' },
    
    // Pulses - Shashank Kanade
    { name: 'Toor Dal', category: 'pulses', price: 120, originalPrice: 140, discount: 14, stock: 200, unit: 'kg', image: '/Product_images/toor dal.avif', farmerName: 'Shashank Kanade' },
    { name: 'Moong Dal', category: 'pulses', price: 110, originalPrice: 130, discount: 15, stock: 180, unit: 'kg', image: '/Product_images/moong dal.avif', farmerName: 'Shashank Kanade' },
    { name: 'Masoor Dal', category: 'pulses', price: 100, originalPrice: 120, discount: 17, stock: 160, unit: 'kg', image: '/Product_images/masoor dal.avif', farmerName: 'Shashank Kanade' },
    { name: 'Urad Dal', category: 'pulses', price: 130, originalPrice: 150, discount: 13, stock: 150, unit: 'kg', image: '/Product_images/urad dal.avif', farmerName: 'Shashank Kanade' },
    { name: 'Rajma', category: 'pulses', price: 140, originalPrice: 160, discount: 13, stock: 140, unit: 'kg', image: '/Product_images/rajma.avif', farmerName: 'Shashank Kanade' },
    
    // Pulses - bunty thalkar
    { name: 'Chana Dal', category: 'pulses', price: 90, originalPrice: 110, discount: 18, stock: 170, unit: 'kg', image: '/Product_images/chana dal.avif', farmerName: 'bunty thalkar' },
    { name: 'Kabuli Chana', category: 'pulses', price: 120, originalPrice: 140, discount: 14, stock: 130, unit: 'kg', image: '/Product_images/kabuli chana.avif', farmerName: 'bunty thalkar' },
    
    // Pickles - Shashank Kanade
    { name: 'Mango Pickle', category: 'pickles', price: 150, originalPrice: 180, discount: 17, stock: 100, unit: 'kg', image: '/Product_images/mango pickle.avif', farmerName: 'Shashank Kanade' },
    { name: 'Lemon Pickle', category: 'pickles', price: 120, originalPrice: 150, discount: 20, stock: 90, unit: 'kg', image: '/Product_images/lemon pickle.avif', farmerName: 'Shashank Kanade' },
    { name: 'Garlic Pickle', category: 'pickles', price: 180, originalPrice: 220, discount: 18, stock: 70, unit: 'kg', image: '/Product_images/garlic pickle.avif', farmerName: 'Shashank Kanade' },
    
    // Pickles - bunty thalkar
    { name: 'Mixed Pickle', category: 'pickles', price: 140, originalPrice: 170, discount: 18, stock: 85, unit: 'kg', image: '/Product_images/mixed pickle.avif', farmerName: 'bunty thalkar' },
    { name: 'Chilli Pickle', category: 'pickles', price: 130, originalPrice: 160, discount: 19, stock: 80, unit: 'kg', image: '/Product_images/chilli pickle.avif', farmerName: 'bunty thalkar' },
    
    // Masala - Shashank Kanade
    { name: 'Turmeric Powder', category: 'masala', price: 250, originalPrice: 300, discount: 17, stock: 150, unit: 'kg', image: '/Product_images/turmeric.avif', farmerName: 'Shashank Kanade' },
    { name: 'Red Chilli Powder', category: 'masala', price: 200, originalPrice: 240, discount: 17, stock: 140, unit: 'kg', image: '/Product_images/chilli powder.avif', farmerName: 'Shashank Kanade' },
    { name: 'Garam Masala', category: 'masala', price: 300, originalPrice: 350, discount: 14, stock: 100, unit: 'kg', image: '/Product_images/garam masala.avif', farmerName: 'Shashank Kanade' },
    
    // Masala - bunty thalkar
    { name: 'Coriander Powder', category: 'masala', price: 180, originalPrice: 220, discount: 18, stock: 130, unit: 'kg', image: '/Product_images/coriander powder.avif', farmerName: 'bunty thalkar' },
    { name: 'Cumin Powder', category: 'masala', price: 220, originalPrice: 260, discount: 15, stock: 120, unit: 'kg', image: '/Product_images/cumin powder.avif', farmerName: 'bunty thalkar' },
    
    // Grains - Shashank Kanade
    { name: 'Basmati Rice', category: 'grains', price: 120, originalPrice: 150, discount: 20, stock: 500, unit: 'kg', image: '/Product_images/basmati rice.avif', farmerName: 'Shashank Kanade' },
    { name: 'Brown Rice', category: 'grains', price: 100, originalPrice: 130, discount: 23, stock: 400, unit: 'kg', image: '/Product_images/brown rice.avif', farmerName: 'Shashank Kanade' },
    
    // Grains - bunty thalkar
    { name: 'Wheat Flour', category: 'grains', price: 40, originalPrice: 50, discount: 20, stock: 600, unit: 'kg', image: '/Product_images/wheat flour.avif', farmerName: 'bunty thalkar' },
    { name: 'Jowar', category: 'grains', price: 60, originalPrice: 75, discount: 20, stock: 300, unit: 'kg', image: '/Product_images/jowar.avif', farmerName: 'bunty thalkar' },
    { name: 'Bajra', category: 'grains', price: 55, originalPrice: 70, discount: 21, stock: 280, unit: 'kg', image: '/Product_images/bajra.avif', farmerName: 'bunty thalkar' }
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Create or find farmers
        const farmers = [];
        for (const farmerName of ['Shashank Kanade', 'bunty thalkar']) {
            let farmer = await User.findOne({ name: farmerName, role: 'farmer' });
            
            if (!farmer) {
                console.log(`Creating farmer: ${farmerName}`);
                const email = farmerName.toLowerCase().replace(/\s+/g, '.') + '@krishisetu.com';
                farmer = await User.create({
                    name: farmerName,
                    email: email,
                    password: 'password123',
                    role: 'farmer'
                });
                console.log(`✅ Created farmer: ${farmerName} (${email})\n`);
            } else {
                console.log(`✅ Found existing farmer: ${farmerName}\n`);
            }
            
            farmers.push({ name: farmerName, id: farmer._id });
        }

        // Clear existing products (optional - comment out if you want to keep existing)
        // await Product.deleteMany({});
        // console.log('🗑️  Cleared existing products\n');

        // Add products
        let addedCount = 0;
        let skippedCount = 0;

        for (const productData of productsData) {
            const farmer = farmers.find(f => f.name === productData.farmerName);
            
            // Check if product already exists
            const existingProduct = await Product.findOne({
                name: productData.name,
                farmerId: farmer.id
            });

            if (existingProduct) {
                console.log(`⏭️  Skipped: ${productData.name} (already exists for ${productData.farmerName})`);
                skippedCount++;
                continue;
            }

            const product = await Product.create({
                ...productData,
                farmerId: farmer.id,
                description: `Fresh ${productData.name} from ${productData.farmerName}'s farm`
            });

            console.log(`✅ Added: ${product.name} (${product.category}) - ${productData.farmerName}`);
            addedCount++;
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Total products added: ${addedCount}`);
        console.log(`⏭️  Products skipped: ${skippedCount}`);
        console.log(`📦 Total products: ${productsData.length}`);
        
        // Display farmer credentials
        console.log('\n👥 Farmer Login Credentials:');
        console.log('═'.repeat(60));
        for (const farmer of farmers) {
            const email = farmer.name.toLowerCase().replace(/\s+/g, '.') + '@krishisetu.com';
            console.log(`Name: ${farmer.name}`);
            console.log(`Email: ${email}`);
            console.log(`Password: password123`);
            console.log('─'.repeat(60));
        }

        console.log('\n🎉 Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeder
seedDatabase();
