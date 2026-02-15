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
        required: true,
        unique: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    statusHistory: [{
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        updatedBy: String,
        note: String
    }],
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
    estimatedDeliveryDate: {
        type: Date
    },
    deliveryDate: Date,
    trackingNumber: String,
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    farmerName: String,
    notifications: {
        orderPlaced: { type: Boolean, default: false },
        confirmed: { type: Boolean, default: false },
        shipped: { type: Boolean, default: false },
        delivered: { type: Boolean, default: false }
    },
    rating: {
        score: { type: Number, min: 1, max: 5 },
        review: String,
        ratedAt: Date
    }
}, {
    timestamps: true
});

// Generate order number
orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD${Date.now()}${String(count + 1).padStart(4, '0')}`;
        
        // Set estimated delivery date (5-7 days from order)
        const estimatedDays = 7;
        this.estimatedDeliveryDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000);
        
        // Initialize status history
        this.statusHistory = [{
            status: 'pending',
            timestamp: new Date(),
            updatedBy: 'system',
            note: 'Order placed successfully'
        }];
    }
    
    // Track status changes
    if (this.isModified('status') && !this.isNew) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
            updatedBy: 'system',
            note: `Order status updated to ${this.status}`
        });
        
        // Set delivery date when status is delivered
        if (this.status === 'delivered' && !this.deliveryDate) {
            this.deliveryDate = new Date();
        }
    }
    
    next();
});

module.exports = mongoose.model('Order', orderSchema);
