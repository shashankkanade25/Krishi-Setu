require('dotenv').config();
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User');
const Order = require('./models/Order');
const Product = require('./models/Product');
const { isAuthenticated } = require('./middleware/auth');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // set to true if using https
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// View engine
app.set('view engine', 'ejs');

// Routes
// Landing page - first page for new visitors
app.get('/', (req, res) => {
    if (req.session.userId) {
        // Redirect based on role for authenticated users
        if (req.session.userRole === 'farmer') {
            return res.redirect('/farmer-home');
        } else {
            return res.redirect('/customer-home');
        }
    }
    // Show landing page for non-authenticated users
    res.render('landing');
});

// Customer reviews page
app.get('/reviews', (req, res) => {
    res.render('customer-reviews');
});

// Home route - redirect to appropriate dashboard
app.get('/home', isAuthenticated, (req, res) => {
    if (req.session.userRole === 'farmer') {
        return res.redirect('/farmer-home');
    }
    res.redirect('/customer-home');
});

// Customer Home page
app.get('/customer-home', isAuthenticated, (req, res) => {
    // Check if user is customer
    if (req.session.userRole === 'farmer') {
        return res.redirect('/farmer-home');
    }
    res.render('customer_home', { 
        user: {
            id: req.session.userId,
            name: req.session.userName,
            email: req.session.userEmail,
            role: req.session.userRole
        }
    });
});

// Products page
app.get('/products', isAuthenticated, (req, res) => {
    const category = req.query.category || 'all';
    const searchQuery = req.query.search || '';
    res.render('products', { 
        user: {
            id: req.session.userId,
            name: req.session.userName,
            email: req.session.userEmail,
            role: req.session.userRole
        },
        selectedCategory: category,
        searchQuery: searchQuery
    });
});

// Search API endpoint
app.get('/api/search', isAuthenticated, (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : '';
    
    if (!query) {
        return res.json({ results: [] });
    }

    // Product database (in real app, this would be from MongoDB)
    const products = [
        // Fruits (per kg)
        { name: 'Banana', category: 'fruits', originalPrice: '40', price: '32', discount: '20', image: '/Product_images/banana.jpg' },
        { name: 'Strawberry', category: 'fruits', originalPrice: '150', price: '120', discount: '20', image: '/Product_images/straberry.jpg' },
        { name: 'Guava', category: 'fruits', originalPrice: '50', price: '40', discount: '20', image: '/Product_images/guava.jpg' },
        { name: 'Orange', category: 'fruits', originalPrice: '70', price: '56', discount: '20', image: '/Product_images/orange.jpg' },
        { name: 'Dates', category: 'fruits', originalPrice: '300', price: '240', discount: '20', image: '/Product_images/dates.png' },
        { name: 'Apple', category: 'fruits', originalPrice: '120', price: '96', discount: '20', image: '/Product_images/apple.jpg' },
        { name: 'Pomegranate', category: 'fruits', originalPrice: '100', price: '80', discount: '20', image: '/Product_images/pomegranate.png' },
        { name: 'Papaya', category: 'fruits', originalPrice: '25', price: '20', discount: '20', image: '/Product_images/papaya.jpg' },
        { name: 'Grapes', category: 'fruits', originalPrice: '70', price: '56', discount: '20', image: '/Product_images/grapes.jpg' },
        // Vegetables (per kg)
        { name: 'Bhendi (Okra)', category: 'vegetables', originalPrice: '35', price: '28', discount: '20', image: '/Product_images/brinjal.jpg' },
        { name: 'Tomato', category: 'vegetables', originalPrice: '30', price: '24', discount: '20', image: '/Product_images/tomato.jpg' },
        { name: 'Onion', category: 'vegetables', originalPrice: '20', price: '16', discount: '20', image: '/Product_images/onion.jpg' },
        { name: 'Potato', category: 'vegetables', originalPrice: '20', price: '16', discount: '20', image: '/Product_images/potato.jpg' },
        { name: 'Capsicum (Green)', category: 'vegetables', originalPrice: '50', price: '40', discount: '20', image: '/Product_images/capcicum.png' },
        { name: 'Cauliflower', category: 'vegetables', originalPrice: '35', price: '28', discount: '20', image: '/Product_images/cauliflower.jpg' },
        { name: 'Carrot (Orange)', category: 'vegetables', originalPrice: '35', price: '28', discount: '20', image: '/Product_images/carrot(orange).jpg' },
        { name: 'Spinach (Palak)', category: 'vegetables', originalPrice: '25', price: '20', discount: '20', image: '/Product_images/Spinach-Palak.jpg' },
        { name: 'Brinjal (Eggplant)', category: 'vegetables', originalPrice: '30', price: '24', discount: '20', image: '/Product_images/brinjal.jpg' },
        { name: 'Cabbage', category: 'vegetables', originalPrice: '25', price: '20', discount: '20', image: '/Product_images/cabbage.png' },
        // Dairy (per liter/kg)
        { name: 'Buffalo Milk', category: 'dairy', originalPrice: '60', price: '48', discount: '20', image: '/Product_images/milk.jpg' },
        { name: 'Amul Cheese', category: 'dairy', originalPrice: '380', price: '304', discount: '20', image: '/Product_images/panner.jpg' },
        { name: 'Amul Butter', category: 'dairy', originalPrice: '420', price: '336', discount: '20', image: '/Product_images/butter.jpg' },
        { name: 'Cow Milk', category: 'dairy', originalPrice: '50', price: '40', discount: '20', image: '/Product_images/milk.jpg' },
        { name: 'Paneer', category: 'dairy', originalPrice: '300', price: '240', discount: '20', image: '/Product_images/panner.jpg' },
        { name: 'Curd (Dahi)', category: 'dairy', originalPrice: '45', price: '36', discount: '20', image: '/Product_images/curd.jpg' },
        { name: 'Ghee', category: 'dairy', originalPrice: '550', price: '440', discount: '20', image: '/Product_images/ghee.jpg' },
        // Pulses (per kg)
        { name: 'Toor Dal', category: 'pulses', originalPrice: '120', price: '96', discount: '20', image: '/Product_images/masoor-dal-face-pack.jpg' },
        { name: 'Moong Dal', category: 'pulses', originalPrice: '100', price: '80', discount: '20', image: '/Product_images/moong dal.jpg' },
        { name: 'Chana Dal', category: 'pulses', originalPrice: '80', price: '64', discount: '20', image: '/Product_images/chana dal.avif' },
        { name: 'Urad Dal', category: 'pulses', originalPrice: '90', price: '72', discount: '20', image: '/Product_images/urad dal.jpg' },
        { name: 'Masoor Dal', category: 'pulses', originalPrice: '85', price: '68', discount: '20', image: '/Product_images/masoor-dal-face-pack.jpg' },
        { name: 'Rajma (Red Kidney Beans)', category: 'pulses', originalPrice: '110', price: '88', discount: '20', image: '/Product_images/benefits-of-rajma.jpg' },
        // Pickles (per kg)
        { name: 'Mango Pickle', category: 'pickles', originalPrice: '150', price: '120', discount: '20', image: '/Product_images/Amla-pickle.jpg' },
        { name: 'Lemon Pickle', category: 'pickles', originalPrice: '140', price: '112', discount: '20', image: '/Product_images/lemon pickle.png' },
        { name: 'Mixed Vegetable Pickle', category: 'pickles', originalPrice: '145', price: '116', discount: '20', image: '/Product_images/gajar pickle.jpg' },
        { name: 'Chilli Pickle', category: 'pickles', originalPrice: '135', price: '108', discount: '20', image: '/Product_images/green-chilli-pickle-1.jpg' },
        // Masala (per 100g)
        { name: 'Garam Masala', category: 'masala', originalPrice: '50', price: '40', discount: '20', image: '/Product_images/corri.jpg' },
        { name: 'Turmeric Powder', category: 'masala', originalPrice: '40', price: '32', discount: '20', image: '/Product_images/turmeric powder.png' },
        { name: 'Red Chilli Powder', category: 'masala', originalPrice: '45', price: '36', discount: '20', image: '/Product_images/red-chilli-powde.jpg' },
        { name: 'Coriander Powder', category: 'masala', originalPrice: '35', price: '28', discount: '20', image: '/Product_images/corri.jpg' },
        { name: 'Cumin Seeds', category: 'masala', originalPrice: '60', price: '48', discount: '20', image: '/Product_images/CuminPowder_1_1024x1024.jpg' },
        // Grains (per kg)
        { name: 'Basmati Rice', category: 'grains', originalPrice: '130', price: '104', discount: '20', image: '/Product_images/basmati-rice-png.png' },
        { name: 'Wheat Flour (Atta)', category: 'grains', originalPrice: '35', price: '28', discount: '20', image: '/Product_images/wheat-flour.jpg' },
        { name: 'Sooji (Semolina)', category: 'grains', originalPrice: '40', price: '32', discount: '20', image: '/Product_images/besan.jpg' },
        { name: 'Poha (Flattened Rice)', category: 'grains', originalPrice: '45', price: '36', discount: '20', image: '/Product_images/indrayani rice.jpg' }
    ];

    // Search in product names
    const results = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    ).slice(0, 8); // Limit to 8 results

    res.json({ results });
});

// Cart page
app.get('/cart', isAuthenticated, (req, res) => {
    const cart = req.session.cart || [];
    res.render('cart', { 
        user: {
            id: req.session.userId,
            name: req.session.userName,
            email: req.session.userEmail,
            role: req.session.userRole
        },
        cart: cart
    });
});

// Add to cart
app.post('/cart/add', isAuthenticated, (req, res) => {
    const { productId, productName, price, weight, image, category } = req.body;
    
    if (!req.session.cart) {
        req.session.cart = [];
    }

    // Prevent accidental duplicate adds from rapid repeated requests
    try {
        const now = Date.now();
        if (!req.session._lastCartAdd) req.session._lastCartAdd = {};
        const last = req.session._lastCartAdd;
        if (last.productName === productName && (now - (last.time || 0) < 1000)) {
            // Treat as idempotent: return current cart count without adding again
            return res.json({ success: true, cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0) });
        }
        // record this add
        req.session._lastCartAdd.productName = productName;
        req.session._lastCartAdd.time = now;
    } catch (e) {
        console.error('Error handling duplicate-add guard', e);
    }
    
    // Check if product already exists in cart
    const existingItem = req.session.cart.find(item => item.productName === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        req.session.cart.push({
            productId: productId || null,
            productName,
            price: parseFloat(price),
            weight,
            image,
            category,
            quantity: 1
        });
    }
    
    res.json({ success: true, cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0) });
});

// Update cart quantity
app.post('/cart/update', isAuthenticated, (req, res) => {
    const { productName, quantity } = req.body;
    
    if (!req.session.cart) {
        return res.json({ success: false });
    }
    
    const item = req.session.cart.find(item => item.productName === productName);
    
    if (item) {
        if (quantity <= 0) {
            req.session.cart = req.session.cart.filter(item => item.productName !== productName);
        } else {
            item.quantity = parseInt(quantity);
        }
    }
    
    res.json({ success: true, cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0) });
});

// Remove from cart
app.post('/cart/remove', isAuthenticated, (req, res) => {
    const { productName } = req.body;
    
    if (!req.session.cart) {
        return res.json({ success: false });
    }
    
    req.session.cart = req.session.cart.filter(item => item.productName !== productName);
    
    res.json({ success: true, cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0) });
});

// Get cart count
app.get('/cart/count', isAuthenticated, (req, res) => {
    const cartCount = req.session.cart ? req.session.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
    res.json({ count: cartCount });
});

// Farmer Home page (dashboard)
app.get('/farmer-home', isAuthenticated, (req, res) => {
    // Check if user is farmer
    if (req.session.userRole !== 'farmer') {
        return res.redirect('/customer-home');
    }
    res.render('farmer-dashboard', { 
        user: {
            id: req.session.userId,
            name: req.session.userName,
            email: req.session.userEmail,
            role: req.session.userRole
        }
    });
});

// Login page
app.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('login');
});

// Login POST
app.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        console.log('Login attempt for:', email, 'as', role);

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ 
                error: 'invalid_credentials',
                message: 'Invalid email or password. Please register first.' 
            });
        }

        // Normalize old "user" role to "customer" for backward compatibility
        const normalizedUserRole = user.role === 'user' ? 'customer' : user.role;
        
        // Check if user role matches
        if (normalizedUserRole !== role) {
            console.log('Role mismatch:', email, 'registered as', normalizedUserRole, 'trying to login as', role);
            const displayRole = normalizedUserRole === 'farmer' ? 'farmer' : 'customer';
            return res.status(401).json({ 
                error: 'role_mismatch', 
                message: `This account is registered as a ${displayRole}. Please select the correct role.`,
                correctRole: displayRole
            });
        }

        console.log('User found, checking password...');
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch for:', email);
            return res.status(401).json({ 
                error: 'invalid_credentials',
                message: 'Invalid email or password' 
            });
        }

        console.log('Login successful for:', email);
        // Create session (normalize old "user" role to "customer")
        const normalizedRole = user.role === 'user' ? 'customer' : user.role;
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        req.session.userRole = normalizedRole;

        // Redirect based on role
        if (normalizedRole === 'farmer') {
            res.redirect('/farmer-home');
        } else {
            res.redirect('/customer-home');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'server_error',
            message: 'Server error. Please try again later.' 
        });
    }
});

// Register page
app.get('/register', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('register');
});

// Register POST
app.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        console.log('Registration attempt:', { name, email, role });

        // Validate role
        const userRole = role === 'farmer' ? 'farmer' : 'customer';

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).send('User already exists. Please login instead.');
        }

        console.log('Creating new user as:', userRole);
        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            role: userRole
        });

        console.log('User created successfully:', user._id);
        // Create session
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        req.session.userRole = user.role;

        // Redirect based on role
        if (user.role === 'farmer') {
            res.redirect('/farmer-home');
        } else {
            res.redirect('/customer-home');
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('Server error: ' + error.message);
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

// Protected route example
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('home', { 
        user: {
            id: req.session.userId,
            name: req.session.userName,
            email: req.session.userEmail
        }
    });
});

// Farmer Dashboard (alias for farmer-home)
app.get('/farmer-dashboard', isAuthenticated, (req, res) => {
    if (req.session.userRole !== 'farmer') {
        return res.redirect('/customer-home');
    }
    res.render('farmer-dashboard', { 
        user: {
            id: req.session.userId,
            name: req.session.userName,
            email: req.session.userEmail,
            role: req.session.userRole
        }
    });
});

// Profile page
app.get('/profile', isAuthenticated, (req, res) => {
    res.render('my-profile', {
        user: {
            id: req.session.userId,
            name: req.session.userName,
            email: req.session.userEmail,
            role: req.session.userRole
        }
    });
});

// Orders page
app.get('/orders', isAuthenticated, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.session.userId })
            .sort({ orderDate: -1 });
        
        res.render('my-orders', {
            user: {
                id: req.session.userId,
                name: req.session.userName,
                email: req.session.userEmail,
                role: req.session.userRole
            },
            orders: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Error loading orders');
    }
});

// Get single order details (API endpoint)
app.get('/orders/:orderId', isAuthenticated, async (req, res) => {
    try {
        const order = await Order.findOne({ 
            _id: req.params.orderId,
            userId: req.session.userId 
        });
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Error loading order details' });
    }
});

// Checkout - Create order from cart
app.post('/checkout', isAuthenticated, async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;
        
        if (!req.session.cart || req.session.cart.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }
        
        // Calculate total
        const totalAmount = req.session.cart.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
        
        // Create order
        const order = await Order.create({
            userId: req.session.userId,
            items: req.session.cart,
            totalAmount: totalAmount,
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod || 'cod',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid'
        });
        
        // Clear cart
        req.session.cart = [];
        
        res.json({ 
            success: true, 
            orderId: order._id,
            orderNumber: order.orderNumber,
            message: 'Order placed successfully!' 
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Error processing checkout' });
    }
});

// Settings page
app.get('/settings', isAuthenticated, (req, res) => {
    res.render('settings', {
        user: {
            id: req.session.userId,
            name: req.session.userName,
            email: req.session.userEmail,
            role: req.session.userRole
        }
    });
});

// Profile update endpoints
app.post('/profile/update', isAuthenticated, async (req, res) => {
    try {
        const { name, phone, dob } = req.body;
        
        await User.findByIdAndUpdate(req.session.userId, {
            name: name,
            phone: phone,
            dob: dob
        });
        
        req.session.userName = name;
        
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/profile/address', isAuthenticated, async (req, res) => {
    try {
        const { address, city, state, pincode, country } = req.body;
        
        await User.findByIdAndUpdate(req.session.userId, {
            address: {
                street: address,
                city: city,
                state: state,
                pincode: pincode,
                country: country
            }
        });
        
        res.json({ success: true, message: 'Address updated successfully' });
    } catch (error) {
        console.error('Address update error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/profile/password', isAuthenticated, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.session.userId);
        const isMatch = await user.comparePassword(currentPassword);
        
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        
        user.password = newPassword;
        await user.save();
        
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/profile/stats', isAuthenticated, async (req, res) => {
    try {
        const orderCount = await Order.countDocuments({ userId: req.session.userId });
        
        res.json({ 
            success: true, 
            totalOrders: orderCount,
            wishlistCount: 0
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Checkout Routes
app.get('/checkout', isAuthenticated, (req, res) => {
    if (!req.session.cart || req.session.cart.length === 0) {
        return res.redirect('/cart');
    }
    
    const cart = req.session.cart;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.render('checkout', {
        user: req.session.userName,
        email: req.session.userEmail,
        cart: cart,
        subtotal: subtotal
    });
});

app.post('/checkout/place-order', isAuthenticated, async (req, res) => {
    try {
        const { address, paymentMethod, instructions } = req.body;
        
        if (!req.session.cart || req.session.cart.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }
        
        // Calculate totals
        const items = req.session.cart.map(item => ({
            productId: item.productId,
            productName: item.productName,
            weight: item.weight,
            quantity: item.quantity,
            price: item.price,
            image: item.image
        }));
        
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryCharges = 0; // Free delivery
        const totalAmount = subtotal + deliveryCharges;
        
        // Create order
        const order = new Order({
            userId: req.session.userId,
            userName: req.session.userName,
            userEmail: req.session.userEmail,
            items: items,
            deliveryAddress: address,
            paymentMethod: paymentMethod,
            specialInstructions: instructions || '',
            subtotal: subtotal,
            deliveryCharges: deliveryCharges,
            totalAmount: totalAmount,
            status: 'Pending',
            orderDate: new Date()
        });
        
        await order.save();
        
        // Clear cart after successful order
        req.session.cart = [];
        
        res.json({ 
            success: true, 
            message: 'Order placed successfully',
            orderId: order._id 
        });
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ success: false, message: 'Failed to place order' });
    }
});

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/Product_images/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp|avif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(null, false);
    }
});

// Product Routes
app.post('/api/products/add', isAuthenticated, upload.single('productImage'), async (req, res) => {
    try {
        console.log('Product add request received');
        console.log('Session:', { userId: req.session.userId, userRole: req.session.userRole, userName: req.session.userName });
        console.log('Body:', req.body);
        console.log('File:', req.file);

        if (req.session.userRole !== 'farmer') {
            return res.status(403).json({ success: false, message: 'Only farmers can add products' });
        }

        const { productName, category, price, originalPrice, stock, unit, description } = req.body;

        if (!productName || !category || !price || !originalPrice || !stock) {
            return res.status(400).json({ success: false, message: 'All required fields must be filled' });
        }

        const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
        const imagePath = req.file ? `/Product_images/${req.file.filename}` : '/Product_images/default.jpg';

        const product = new Product({
            name: productName,
            category: category.toLowerCase(),
            price: parseFloat(price),
            originalPrice: parseFloat(originalPrice),
            discount: discount,
            stock: parseInt(stock),
            unit: unit || 'kg',
            image: imagePath,
            description: description || '',
            farmerId: req.session.userId,
            farmerName: req.session.userName,
            status: parseInt(stock) > 0 ? 'active' : 'out_of_stock'
        });

        await product.save();
        console.log('Product saved successfully:', product._id);
        res.json({ success: true, message: 'Product added successfully', product: product });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to add product' });
    }
});

app.get('/api/products/all', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { status: 'active' };

        if (category && category !== 'all') {
            query.category = category.toLowerCase();
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(query).sort({ createdAt: -1 }).lean();
        res.json({ success: true, products: products });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

app.get('/api/products/farmer', isAuthenticated, async (req, res) => {
    try {
        if (req.session.userRole !== 'farmer') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const products = await Product.find({ farmerId: req.session.userId }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, products: products });
    } catch (error) {
        console.error('Get farmer products error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

app.delete('/api/products/delete/:id', isAuthenticated, async (req, res) => {
    try {
        if (req.session.userRole !== 'farmer') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const product = await Product.findOneAndDelete({ _id: req.params.id, farmerId: req.session.userId });
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
});

app.put('/api/products/update/:id', isAuthenticated, upload.single('productImage'), async (req, res) => {
    try {
        if (req.session.userRole !== 'farmer') {
            return res.status(403).json({ success: false, message: 'Only farmers can update products' });
        }

        const { productName, category, price, originalPrice, stock, unit, description } = req.body;

        const updateData = {
            name: productName,
            category: category.toLowerCase(),
            price: parseFloat(price),
            originalPrice: parseFloat(originalPrice),
            discount: Math.round(((originalPrice - price) / originalPrice) * 100),
            stock: parseInt(stock),
            unit: unit || 'kg',
            description: description || '',
            status: parseInt(stock) > 0 ? 'active' : 'out_of_stock'
        };

        if (req.file) {
            updateData.image = `/Product_images/${req.file.filename}`;
        }

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, farmerId: req.session.userId },
            updateData,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, message: 'Product updated successfully', product: product });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to update product' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})