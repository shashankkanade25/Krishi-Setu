const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/krishisetu';
  await mongoose.connect(uri, { family: 4 });
  console.log('Connected to:', uri.substring(0, 50) + '...\n');

  const userCount = await User.countDocuments();
  const productCount = await Product.countDocuments();
  const orderCount = await Order.countDocuments();

  console.log('📊 Database Statistics:\n');
  console.log(`👥 Total Users: ${userCount}`);
  console.log(`   - Farmers: ${await User.countDocuments({ role: 'farmer' })}`);
  console.log(`   - Customers: ${await User.countDocuments({ role: 'customer' })}`);
  console.log(`   - Admins: ${await User.countDocuments({ role: 'admin' })}`);
  console.log(`\n📦 Total Products: ${productCount}`);
  
  if (productCount > 0) {
    console.log('\n   Recent Products:');
    const products = await Product.find().sort({ createdAt: -1 }).limit(5).lean();
    products.forEach(p => {
      console.log(`   - ${p.name} (${p.category}) - ₹${p.price} - Stock: ${p.stock} - Status: ${p.status}`);
    });
  }

  console.log(`\n🛒 Total Orders: ${orderCount}`);
  
  if (orderCount > 0) {
    console.log('\n   Recent Orders:');
    const orders = await Order.find().sort({ orderDate: -1 }).limit(5).lean();
    orders.forEach(o => {
      console.log(`   - ${o.orderNumber} - ₹${o.totalAmount} - ${o.status} - ${o.userName}`);
    });
  }

  console.log('\n✅ All data will be displayed on admin dashboard at http://localhost:5000/admin\n');
  process.exit(0);
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
