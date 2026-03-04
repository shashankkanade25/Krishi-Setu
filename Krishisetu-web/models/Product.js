const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['fruits', 'vegetables', 'dairy', 'pulses', 'pickles', 'masala', 'grains'],
        lowercase: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    originalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    unit: {
        type: String,
        default: 'kg',
        enum: ['kg', 'liter', 'piece', 'gram', '100g']
    },
    image: {
        type: String,
        default: '/Product_images/default.jpg'
    },
    description: {
        type: String,
        trim: true
    },
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farmerName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'out_of_stock'],
        default: 'active'
    }
}, {
    timestamps: true
});

productSchema.pre('save', function() {
    if (this.stock === 0) {
        this.status = 'out_of_stock';
    } else if (this.status === 'out_of_stock' && this.stock > 0) {
        this.status = 'active';
    }
});

module.exports = mongoose.model('Product', productSchema);
