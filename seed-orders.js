const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/krishisetu').then(() => {
    console.log('MongoDB Connected for seeding orders');
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

async function seedOrders() {
    try {
        // Find a customer user (role is 'user' not 'customer')
        const customer = await User.findOne({ role: 'user' });
        if (!customer) {
            console.log('No user found. Please create a user account first.');
            process.exit(1);
        }

        // Find some products
        const products = await Product.find({ status: 'active' }).limit(10);
        if (products.length === 0) {
            console.log('No products found. Please add products first.');
            process.exit(1);
        }

        console.log(`Found customer: ${customer.name}`);
        console.log(`Found ${products.length} products`);

        // Create sample orders
        const sampleOrders = [
            {
                userId: customer._id,
                items: [
                    {
                        productName: products[0]?.name || 'Tomato',
                        price: products[0]?.price || 40,
                        weight: `1 ${products[0]?.unit || 'kg'}`,
                        quantity: 2,
                        image: products[0]?.image || '/Product_images/default.jpg',
                        category: products[0]?.category || 'vegetables'
                    },
                    {
                        productName: products[1]?.name || 'Onion',
                        price: products[1]?.price || 35,
                        weight: `1 ${products[1]?.unit || 'kg'}`,
                        quantity: 3,
                        image: products[1]?.image || '/Product_images/default.jpg',
                        category: products[1]?.category || 'vegetables'
                    }
                ],
                totalAmount: 185,
                subtotal: 185,
                deliveryCharges: 0,
                status: 'pending',
                userName: customer.name,
                userEmail: customer.email,
                deliveryAddress: {
                    fullName: customer.name,
                    phone: '9876543210',
                    address: '123 Green Valley Road, Apartment 4B',
                    landmark: 'Near Central Park',
                    city: 'Pune',
                    state: 'Maharashtra',
                    pincode: '411001',
                    type: 'home'
                },
                paymentMethod: 'cod',
                paymentStatus: 'pending',
                specialInstructions: 'Please deliver in the morning before 10 AM',
                orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
                userId: customer._id,
                items: [
                    {
                        productName: products[2]?.name || 'Potato',
                        price: products[2]?.price || 30,
                        weight: `1 ${products[2]?.unit || 'kg'}`,
                        quantity: 5,
                        image: products[2]?.image || '/Product_images/default.jpg',
                        category: products[2]?.category || 'vegetables'
                    },
                    {
                        productName: products[3]?.name || 'Carrot',
                        price: products[3]?.price || 50,
                        weight: `1 ${products[3]?.unit || 'kg'}`,
                        quantity: 2,
                        image: products[3]?.image || '/Product_images/default.jpg',
                        category: products[3]?.category || 'vegetables'
                    },
                    {
                        productName: products[4]?.name || 'Cabbage',
                        price: products[4]?.price || 25,
                        weight: `1 ${products[4]?.unit || 'piece'}`,
                        quantity: 1,
                        image: products[4]?.image || '/Product_images/default.jpg',
                        category: products[4]?.category || 'vegetables'
                    }
                ],
                totalAmount: 275,
                subtotal: 275,
                deliveryCharges: 0,
                status: 'processing',
                userName: customer.name,
                userEmail: customer.email,
                deliveryAddress: {
                    fullName: customer.name,
                    phone: '9876543210',
                    address: '456 Sunshine Avenue, House No. 21',
                    landmark: 'Opposite Green Grocery Store',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400001',
                    type: 'home'
                },
                paymentMethod: 'upi',
                paymentStatus: 'paid',
                orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
            },
            {
                userId: customer._id,
                items: [
                    {
                        productName: products[5]?.name || 'Apple',
                        price: products[5]?.price || 120,
                        weight: `1 ${products[5]?.unit || 'kg'}`,
                        quantity: 2,
                        image: products[5]?.image || '/Product_images/default.jpg',
                        category: products[5]?.category || 'fruits'
                    },
                    {
                        productName: products[6]?.name || 'Banana',
                        price: products[6]?.price || 50,
                        weight: `1 ${products[6]?.unit || 'kg'}`,
                        quantity: 3,
                        image: products[6]?.image || '/Product_images/default.jpg',
                        category: products[6]?.category || 'fruits'
                    }
                ],
                totalAmount: 390,
                subtotal: 390,
                deliveryCharges: 0,
                status: 'shipped',
                userName: customer.name,
                userEmail: customer.email,
                deliveryAddress: {
                    fullName: customer.name,
                    phone: '9876543210',
                    address: '789 Farmers Market Lane, Building C, Floor 2',
                    landmark: 'Behind City Mall',
                    city: 'Nagpur',
                    state: 'Maharashtra',
                    pincode: '440001',
                    type: 'work'
                },
                paymentMethod: 'cod',
                paymentStatus: 'pending',
                specialInstructions: 'Call before delivery',
                orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
            }
        ];

        // Insert orders
        for (const orderData of sampleOrders) {
            const order = new Order(orderData);
            await order.save();
            console.log(`✓ Created order: ${order.orderNumber} - Status: ${order.status} - ₹${order.totalAmount}`);
        }

        console.log('\n✅ Successfully seeded 3 sample orders!');
        console.log('\nOrder Summary:');
        console.log('1. Pending order with 2 items (₹185)');
        console.log('2. Processing order with 3 items (₹275)');
        console.log('3. Shipped order with 2 items (₹390)');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding orders:', error);
        process.exit(1);
    }
}

seedOrders();
