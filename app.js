require('dotenv').config();
const express = require('express');
const session = require('express-session');
const connectDB = require('./config/db');
const User = require('./models/User');
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
app.get('/', (req, res) => {
    if (req.session.userId) {
        // Redirect based on role
        if (req.session.userRole === 'farmer') {
            return res.redirect('/farmer-home');
        } else {
            return res.redirect('/customer-home');
        }
    }
    res.redirect('/login');
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
    res.render('products', { 
        user: {
            id: req.session.userId,
            name: req.session.userName,
            email: req.session.userEmail,
            role: req.session.userRole
        },
        selectedCategory: category
    });
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
    const { productName, price, weight, image, category } = req.body;
    
    if (!req.session.cart) {
        req.session.cart = [];
    }
    
    // Check if product already exists in cart
    const existingItem = req.session.cart.find(item => item.productName === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        req.session.cart.push({
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

// Legacy home route - redirect based on role
app.get('/home', isAuthenticated, (req, res) => {
    if (req.session.userRole === 'farmer') {
        return res.redirect('/farmer-home');
    }
    res.redirect('/customer-home');
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
            return res.status(401).send('Invalid email or password. Please register first.');
        }

        // Check if user role matches
        if (user.role !== role) {
            console.log('Role mismatch:', email, 'registered as', user.role, 'trying to login as', role);
            return res.status(401).send(`This account is registered as a ${user.role}. Please select the correct role.`);
        }

        console.log('User found, checking password...');
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch for:', email);
            return res.status(401).send('Invalid email or password');
        }

        console.log('Login successful for:', email);
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
        console.error('Login error:', error);
        res.status(500).send('Server error: ' + error.message);
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
        res.redirect('/login');
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

// Cart page
app.get('/cart', isAuthenticated, (req, res) => {
    res.send('Cart page - Coming soon!');
});

// Profile page
app.get('/profile', isAuthenticated, (req, res) => {
    res.send('Profile page - Coming soon!');
});

// Orders page
app.get('/orders', isAuthenticated, (req, res) => {
    res.send('Orders page - Coming soon!');
});

// Settings page
app.get('/settings', isAuthenticated, (req, res) => {
    res.send('Settings page - Coming soon!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})