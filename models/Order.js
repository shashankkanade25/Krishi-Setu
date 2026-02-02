const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    weight: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    image: String,
    category: String
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        unique: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        fullName: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String
    },
    deliveryAddress: {
        fullName: String,
        phone: String,
        address: String,
        landmark: String,
        city: String,
        state: String,
        pincode: String,
        type: {
            type: String,
            enum: ['home', 'work', 'other'],
            default: 'home'
        }
    },
    userName: String,
    userEmail: String,
    subtotal: Number,
    deliveryCharges: {
        type: Number,
        default: 0
    },
    specialInstructions: String,
    paymentMethod: {
        type: String,
        enum: ['cod', 'upi', 'card', 'online'],
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    deliveryDate: Date
}, {
    timestamps: true
});

// Generate order number
orderSchema.pre('save', async function() {
    if (this.isNew && !this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD${Date.now()}${String(count + 1).padStart(4, '0')}`;
    }
});

module.exports = mongoose.model('Order', orderSchema);
