const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['customer', 'farmer', 'admin'],
        default: 'customer'
    },
    phone: String,
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        location: {
            type: { type: String, default: 'Point' },
            coordinates: [Number] // [longitude, latitude]
        }
    },
    notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        inApp: { type: Boolean, default: true }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationDocuments: [{
        type: String,
        url: String,
        verifiedAt: Date
    }],
    lastLogin: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create index for role lookups (email already has unique: true which creates index)
userSchema.index({ role: 1 });

// Hash password before saving (10 rounds is faster and still secure)
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
