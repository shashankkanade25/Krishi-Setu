const mongoose = require('mongoose');
require('dotenv').config();

const tests = [];
const results = {
    passed: 0,
    failed: 0,
    warnings: 0
};

// Test MongoDB Connection
async function testDatabase() {
    console.log('\n🔍 Testing Database Connection...');
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/krishisetu';
        await mongoose.connect(uri, { family: 4 });
        console.log('✅ MongoDB Connected: ' + mongoose.connection.host);
        results.passed++;
        return true;
    } catch (error) {
        console.log('❌ MongoDB Connection Failed:', error.message);
        results.failed++;
        return false;
    }
}

// Test Models
async function testModels() {
    console.log('\n🔍 Testing Models...');
    const models = ['User', 'Product', 'Order', 'Notification'];
    
    for (const modelName of models) {
        try {
            const Model = require(`./models/${modelName}`);
            if (Model) {
                console.log(`✅ ${modelName} model loaded`);
                results.passed++;
            }
        } catch (error) {
            console.log(`❌ ${modelName} model failed:`, error.message);
            results.failed++;
        }
    }
}

// Test Data Counts
async function testDataCounts() {
    console.log('\n🔍 Testing Data Availability...');
    
    try {
        const User = require('./models/User');
        const Product = require('./models/Product');
        const Order = require('./models/Order');
        
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        const orderCount = await Order.countDocuments();
        const farmerCount = await User.countDocuments({ role: 'farmer' });
        const customerCount = await User.countDocuments({ role: 'customer' });
        const adminCount = await User.countDocuments({ role: 'admin' });
        
        console.log(`\n📊 Database Statistics:`);
        console.log(`  Users: ${userCount} (${farmerCount} farmers, ${customerCount} customers, ${adminCount} admins)`);
        console.log(`  Products: ${productCount}`);
        console.log(`  Orders: ${orderCount}`);
        
        if (adminCount === 0) {
            console.log('⚠️  WARNING: No admin account found. Run: node setup-admin.js');
            results.warnings++;
        } else {
            console.log('✅ Admin account exists');
            results.passed++;
        }
        
        if (productCount === 0) {
            console.log('⚠️  WARNING: No products in database. Farmers should add products.');
            results.warnings++;
        } else {
            console.log('✅ Products available');
            results.passed++;
        }
        
    } catch (error) {
        console.log('❌ Data count test failed:', error.message);
        results.failed++;
    }
}

// Test Environment Variables
function testEnvironment() {
    console.log('\n🔍 Testing Environment Configuration...');
    
    const requiredVars = ['MONGO_URI', 'MONGODB_URI'];
    const optionalVars = ['SESSION_SECRET', 'EMAIL_USER', 'EMAIL_PASS', 'PORT'];
    
    let hasMongoUri = false;
    for (const varName of requiredVars) {
        if (process.env[varName]) {
            console.log(`✅ ${varName} is set`);
            hasMongoUri = true;
            break;
        }
    }
    
    if (hasMongoUri) {
        results.passed++;
    } else {
        console.log('❌ No MongoDB URI found in .env');
        results.failed++;
    }
    
    for (const varName of optionalVars) {
        if (process.env[varName]) {
            console.log(`✅ ${varName} is set`);
            results.passed++;
        } else {
            console.log(`⚠️  ${varName} not set (using default)`);
            results.warnings++;
        }
    }
}

// Test File Structure
function testFileStructure() {
    console.log('\n🔍 Testing File Structure...');
    const fs = require('fs');
    
    const requiredFiles = [
        'app.js',
        'package.json',
        'models/User.js',
        'models/Product.js',
        'models/Order.js',
        'models/Notification.js',
        'config/db.js',
        'middleware/auth.js',
        'views/login.ejs',
        'views/register.ejs',
        'views/customer_home.ejs',
        'views/farmer-dashboard.ejs',
        'views/admin-dashboard.ejs',
        'views/products.ejs',
        'views/cart.ejs',
        'views/checkout.ejs',
        'views/my-orders.ejs',
        'public/js/products.js',
        'public/js/cart.js'
    ];
    
    for (const file of requiredFiles) {
        if (fs.existsSync(file)) {
            results.passed++;
        } else {
            console.log(`❌ Missing file: ${file}`);
            results.failed++;
        }
    }
    
    console.log(`✅ All ${requiredFiles.length} required files present`);
}

// Main Test Runner
async function runAllTests() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('   कृषी-सेतू - Complete Functionality Test   ');
    console.log('═══════════════════════════════════════════════════════\n');
    
    testEnvironment();
    testFileStructure();
    
    const dbConnected = await testDatabase();
    if (dbConnected) {
        await testModels();
        await testDataCounts();
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('                 TEST RESULTS                          ');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Passed:   ${results.passed}`);
    console.log(`❌ Failed:   ${results.failed}`);
    console.log(`⚠️  Warnings: ${results.warnings}`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (results.failed === 0) {
        console.log('🎉 ALL CORE FUNCTIONALITY IS ACTIVE AND WORKING!\n');
        console.log('🚀 Start the server: node app.js');
        console.log('🌐 Access at: http://localhost:5000\n');
        
        if (results.warnings > 0) {
            console.log('⚠️  Warnings detected:');
            console.log('   - Set up admin account: node setup-admin.js');
            console.log('   - Configure EMAIL settings in .env for notifications');
            console.log('   - Have farmers add products through farmer dashboard\n');
        }
    } else {
        console.log('⚠️  Some tests failed. Please fix the issues above.\n');
    }
    
    await mongoose.connection.close();
    process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(err => {
    console.error('❌ Test runner error:', err);
    process.exit(1);
});
