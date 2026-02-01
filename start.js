// Simple test to see if Node.js is working
console.log('='.repeat(50));
console.log('Starting KrishiSetu Application...');
console.log('='.repeat(50));

require('dotenv').config();
console.log('✓ Environment variables loaded');

const express = require('express');
console.log('✓ Express loaded');

const session = require('express-session');
console.log('✓ Express-session loaded');

const connectDB = require('./config/db');
console.log('✓ Database config loaded');

const User = require('./models/User');
console.log('✓ User model loaded');

const { isAuthenticated } = require('./middleware/auth');
console.log('✓ Auth middleware loaded');

console.log('\nAttempting to connect to MongoDB...');
connectDB().then(() => {
    console.log('✓ Database connected successfully!');
    console.log('\nStarting server...');
    require('./app.js');
}).catch(err => {
    console.error('✗ Database connection failed:', err.message);
    process.exit(1);
});
