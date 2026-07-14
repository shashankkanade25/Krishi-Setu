require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const User = require('./models/User');
const Order = require('./models/Order');
const Product = require('./models/Product');
const { isAuthenticated } = require('./middleware/auth');

const app = express();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@krishisetu.com').trim().toLowerCase();
const SITE_URL = (process.env.SITE_URL || 'https://krishisetu1.vercel.app').replace(/\/+$/, '');
const SITE_NAME = 'कृषी-सेतू';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/krishi-setu-logo.png`;
const GOOGLE_SITE_VERIFICATION = (process.env.GOOGLE_SITE_VERIFICATION || '').trim();
const BING_SITE_VERIFICATION = (process.env.BING_SITE_VERIFICATION || '').trim();
const YANDEX_SITE_VERIFICATION = (process.env.YANDEX_SITE_VERIFICATION || '').trim();
const INDEXABLE_PATHS = new Set(['/', '/reviews', '/blog', '/blog/earn-from-crop-waste', '/blog/best-biomass-marketplace', '/blog/stubble-burning-alternatives', '/blog/sustainable-agri-supply-chains', '/blog/ai-helps-farmers-sell-waste', '/privacy', '/terms', '/contact']);
const SITEMAP_ROUTES = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/reviews', changefreq: 'weekly', priority: '0.8' },
    { path: '/blog', changefreq: 'weekly', priority: '0.9' },
    { path: '/blog/earn-from-crop-waste', changefreq: 'monthly', priority: '0.8' },
    { path: '/blog/best-biomass-marketplace', changefreq: 'monthly', priority: '0.8' },
    { path: '/blog/stubble-burning-alternatives', changefreq: 'monthly', priority: '0.8' },
    { path: '/blog/sustainable-agri-supply-chains', changefreq: 'monthly', priority: '0.8' },
    { path: '/blog/ai-helps-farmers-sell-waste', changefreq: 'monthly', priority: '0.8' },
    { path: '/privacy', changefreq: 'yearly', priority: '0.5' },
    { path: '/terms', changefreq: 'yearly', priority: '0.5' },
    { path: '/contact', changefreq: 'monthly', priority: '0.7' }
];
const PAGE_SEO_OVERRIDES = {
    '/': {
        title: `${SITE_NAME} | Agriculture & Agri Waste Marketplace India`,
        description: 'KrishiSetu connects customers with farmers for fresh produce and serves as a farmer-to-industry platform for agri waste management and sustainable agriculture.',
        keywords: 'agriculture, farming marketplace, agri waste management, farmer-to-industry platform, sustainable agriculture India, crop waste management, stubble burning solution, biomass marketplace, agricultural supply chain, KrishiSetu, कृषी-सेतू',
        type: 'website'
    },
    '/reviews': {
        title: `Customer Reviews | ${SITE_NAME} Sustainable Farming Marketplace`,
        description: 'Read customer reviews and ratings for KrishiSetu to see how farmers, buyers, and industries benefit from our direct farm-to-industry delivery and waste management solutions.',
        keywords: 'KrishiSetu reviews, customer testimonials, farm delivery reviews, farmer marketplace ratings, sustainable farming feedback',
        type: 'article'
    },
    '/blog': {
        title: `Blog | ${SITE_NAME} - Agriculture & Biomass Insights`,
        description: 'Read our latest insights on agriculture, stubble burning solutions, farmer-to-industry platforms, and sustainable farming in India.',
        keywords: 'agriculture blog, biomass marketplace, crop waste management, sustainable farming India',
        type: 'blog'
    },
    '/privacy': {
        title: `Privacy Policy | ${SITE_NAME}`,
        description: 'KrishiSetu Privacy Policy. Learn how we handle your data on our agricultural marketplace.',
        keywords: 'privacy policy, KrishiSetu privacy',
        type: 'website'
    },
    '/terms': {
        title: `Terms of Service | ${SITE_NAME}`,
        description: 'KrishiSetu Terms of Service. Understand the rules for using our farmer-to-industry platform.',
        keywords: 'terms of service, KrishiSetu terms',
        type: 'website'
    },
    '/contact': {
        title: `Contact Us | ${SITE_NAME}`,
        description: 'Contact KrishiSetu support for inquiries about fresh produce, biomass marketplace, and more.',
        keywords: 'contact KrishiSetu, customer support, farmer support',
        type: 'website'
    },
    '/login': {
        title: `Login | ${SITE_NAME}`,
        description: 'Login to your KrishiSetu account to order farm fresh products and manage your profile.',
        noindex: true
    },
    '/register': {
        title: `Register | ${SITE_NAME}`,
        description: 'Create your KrishiSetu account to buy directly from farmers or sell as a farmer.',
        noindex: true
    }
};
const DEFAULT_TITLE = `${SITE_NAME} | Farming Marketplace & Agri Waste Platform`;
const DEFAULT_DESCRIPTION = 'KrishiSetu is an agriculture marketplace and farmer-to-industry platform focusing on sustainable farming, fresh produce, and crop waste management solutions in India.';
const DEFAULT_KEYWORDS = 'KrishiSetu, कृषी-सेतू, agriculture marketplace, agri waste management, farmer to industry, sustainable farming India';

function escapeRegex(value = '') {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtmlAttribute(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escapeXml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function normalizePathname(urlPath = '/') {
    const [pathWithoutQuery] = String(urlPath || '/').split('?');
    const [pathWithoutHash] = pathWithoutQuery.split('#');
    let normalizedPath = pathWithoutHash || '/';

    if (!normalizedPath.startsWith('/')) {
        normalizedPath = `/${normalizedPath}`;
    }

    normalizedPath = normalizedPath.replace(/\/{2,}/g, '/');
    if (normalizedPath.length > 1) {
        normalizedPath = normalizedPath.replace(/\/+$/, '');
    }

    return normalizedPath || '/';
}

function buildSeoConfig(requestPath) {
    const normalizedPath = normalizePathname(requestPath);
    const pageOverride = PAGE_SEO_OVERRIDES[normalizedPath] || {};
    const isIndexable = INDEXABLE_PATHS.has(normalizedPath) && !pageOverride.noindex;
    const canonicalPath = normalizedPath === '/' ? '' : normalizedPath;

    return {
        path: normalizedPath,
        title: pageOverride.title || DEFAULT_TITLE,
        description: pageOverride.description || DEFAULT_DESCRIPTION,
        keywords: pageOverride.keywords || DEFAULT_KEYWORDS,
        type: pageOverride.type || 'website',
        image: pageOverride.image || DEFAULT_OG_IMAGE,
        canonicalUrl: `${SITE_URL}${canonicalPath}`,
        robots: pageOverride.robots || (isIndexable
            ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
            : 'noindex, nofollow')
    };
}

function buildSeoJsonLd(seoConfig) {
    const jsonLd = [
        {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
            logo: DEFAULT_OG_IMAGE,
            contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+91-9876543210',
                contactType: 'customer service',
                areaServed: 'IN',
                availableLanguage: ['English', 'Hindi', 'Marathi']
            }
        },
        {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
            potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/products?search={search_term_string}`,
                'query-input': 'required name=search_term_string'
            }
        },
        {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: seoConfig.title,
            description: seoConfig.description,
            url: seoConfig.canonicalUrl,
            inLanguage: 'en-IN'
        }
    ];

    // Add Breadcrumb Schema
    const pathParts = seoConfig.path.split('/').filter(Boolean);
    if (pathParts.length > 0) {
        const itemListElement = [{
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE_URL
        }];
        
        let currentUrl = SITE_URL;
        pathParts.forEach((part, index) => {
            currentUrl += `/${part}`;
            itemListElement.push({
                '@type': 'ListItem',
                position: index + 2,
                name: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
                item: currentUrl
            });
        });
        
        jsonLd.push({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement
        });
    }

    return jsonLd;
}

function upsertTagByPattern(html, pattern, replacementMarkup) {
    if (pattern.test(html)) {
        return html.replace(pattern, replacementMarkup);
    }

    if (!/<\/head>/i.test(html)) {
        return html;
    }

    return html.replace(/<\/head>/i, `    ${replacementMarkup}\n</head>`);
}

function applySeoToHtml(html, seoConfig) {
    if (typeof html !== 'string' || !/<\/head>/i.test(html)) {
        return html;
    }

    let updatedHtml = html;

    updatedHtml = upsertTagByPattern(
        updatedHtml,
        /<title>[\s\S]*?<\/title>/i,
        `<title>${escapeHtmlAttribute(seoConfig.title)}</title>`
    );

    const upsertMetaByName = (name, content) => {
        const pattern = new RegExp(`<meta\\s+[^>]*name=["']${escapeRegex(name)}["'][^>]*>`, 'i');
        updatedHtml = upsertTagByPattern(
            updatedHtml,
            pattern,
            `<meta name="${name}" content="${escapeHtmlAttribute(content)}">`
        );
    };

    const upsertMetaByProperty = (property, content) => {
        const pattern = new RegExp(`<meta\\s+[^>]*property=["']${escapeRegex(property)}["'][^>]*>`, 'i');
        updatedHtml = upsertTagByPattern(
            updatedHtml,
            pattern,
            `<meta property="${property}" content="${escapeHtmlAttribute(content)}">`
        );
    };

    upsertMetaByName('description', seoConfig.description);
    upsertMetaByName('keywords', seoConfig.keywords);
    upsertMetaByName('robots', seoConfig.robots);
    upsertMetaByName('googlebot', seoConfig.robots);
    upsertMetaByName('author', SITE_NAME);
    upsertMetaByName('theme-color', '#2e7d32');
    upsertMetaByName('application-name', SITE_NAME);
    upsertMetaByName('apple-mobile-web-app-title', SITE_NAME);
    upsertMetaByName('referrer', 'strict-origin-when-cross-origin');
    upsertMetaByName('twitter:card', 'summary_large_image');
    upsertMetaByName('twitter:title', seoConfig.title);
    upsertMetaByName('twitter:description', seoConfig.description);
    upsertMetaByName('twitter:image', seoConfig.image);

    upsertMetaByProperty('og:type', seoConfig.type);
    upsertMetaByProperty('og:site_name', SITE_NAME);
    upsertMetaByProperty('og:title', seoConfig.title);
    upsertMetaByProperty('og:description', seoConfig.description);
    upsertMetaByProperty('og:url', seoConfig.canonicalUrl);
    upsertMetaByProperty('og:image', seoConfig.image);
    upsertMetaByProperty('og:image:alt', `${SITE_NAME} - Farm Fresh Produce`);
    upsertMetaByProperty('og:locale', 'en_IN');

    if (GOOGLE_SITE_VERIFICATION) {
        upsertMetaByName('google-site-verification', GOOGLE_SITE_VERIFICATION);
    }

    if (BING_SITE_VERIFICATION) {
        upsertMetaByName('msvalidate.01', BING_SITE_VERIFICATION);
    }

    if (YANDEX_SITE_VERIFICATION) {
        upsertMetaByName('yandex-verification', YANDEX_SITE_VERIFICATION);
    }

    updatedHtml = upsertTagByPattern(
        updatedHtml,
        /<link\s+[^>]*rel=["']canonical["'][^>]*>/i,
        `<link rel="canonical" href="${escapeHtmlAttribute(seoConfig.canonicalUrl)}">`
    );

    updatedHtml = upsertTagByPattern(
        updatedHtml,
        /<link\s+[^>]*rel=["']alternate["'][^>]*hreflang=["']en-IN["'][^>]*>/i,
        `<link rel="alternate" hreflang="en-IN" href="${escapeHtmlAttribute(seoConfig.canonicalUrl)}">`
    );

    const jsonLdContent = JSON.stringify(buildSeoJsonLd(seoConfig)).replace(/</g, '\\u003c');
    updatedHtml = upsertTagByPattern(
        updatedHtml,
        /<script\s+type=["']application\/ld\+json["'][^>]*data-seo=["']krishisetu["'][^>]*>[\s\S]*?<\/script>/i,
        `<script type="application/ld+json" data-seo="krishisetu">${jsonLdContent}</script>`
    );

    return updatedHtml;
}

function normalizeRoleValue(role) {
    return role === 'user' ? 'customer' : role;
}

function isAdminIdentity({ role, email }) {
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    return normalizeRoleValue(role) === 'admin' || normalizedEmail === ADMIN_EMAIL;
}

// Trust Vercel/reverse-proxy headers so secure cookies work correctly
app.set('trust proxy', 1);

// Connect to MongoDB and get client promise for session store
const mongoUrl = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/krishisetu';

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS for mobile app
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

const IMAGE_EXTENSIONS = new Set(['.avif', '.bmp', '.gif', '.ico', '.jpeg', '.jpg', '.png', '.svg', '.webp']);
const FONT_EXTENSIONS = new Set(['.eot', '.otf', '.ttf', '.woff', '.woff2']);

function getStaticCacheControl(filepath) {
    const extension = path.extname(filepath).toLowerCase();

    if (IMAGE_EXTENSIONS.has(extension) || FONT_EXTENSIONS.has(extension)) {
        return 'public, max-age=2592000, stale-while-revalidate=86400';
    }

    if (extension === '.css' || extension === '.js') {
        return 'public, max-age=86400, stale-while-revalidate=3600';
    }

    return 'public, max-age=3600';
}

// Static files with caching headers
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res, filepath) => {
        res.setHeader('Cache-Control', getStaticCacheControl(filepath));
        res.setHeader('Vary', 'Accept-Encoding');

        if (filepath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filepath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Session configuration with MongoDB store for Vercel
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoUrl,
        collectionName: 'sessions',
        ttl: 7 * 24 * 60 * 60, // 7 days (in seconds)
        autoRemove: 'native',
        touchAfter: 24 * 3600
    }),
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // true only for production/HTTPS
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (in milliseconds)
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
    },
    name: 'krishisetu.sid' // Custom session name
}));

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Inject image optimizer script into all rendered HTML pages
app.use((req, res, next) => {
    const originalRender = res.render.bind(res);

    res.render = (view, options, callback) => {
        const hasOptionsFunction = typeof options === 'function';
        const renderOptions = hasOptionsFunction ? {} : (options || {});
        const renderCallback = hasOptionsFunction ? options : callback;

        if (typeof renderCallback === 'function') {
            return originalRender(view, renderOptions, renderCallback);
        }

        return originalRender(view, renderOptions, (error, html) => {
            if (error) {
                return res.status(500).send('Failed to render page');
            }

            if (typeof html !== 'string') {
                return res.send(html);
            }

            const seoConfig = buildSeoConfig(req.originalUrl || req.url || '/');
            res.setHeader('X-Robots-Tag', seoConfig.robots);

            let transformedHtml = applySeoToHtml(html, seoConfig);
            const optimizerScript = '<script src="/js/image-optimizer.js" defer></script>';
            if (transformedHtml.includes('/js/image-optimizer.js')) {
                return res.send(transformedHtml);
            }

            if (transformedHtml.includes('</body>')) {
                transformedHtml = transformedHtml.replace('</body>', `    ${optimizerScript}\n</body>`);
                return res.send(transformedHtml);
            }

            return res.send(`${transformedHtml}\n${optimizerScript}`);
        });
    };

    next();
});

// Routes
app.get('/robots.txt', (req, res) => {
    const robotsLines = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        'Disallow: /mobile/',
        'Disallow: /admin',
        'Disallow: /dashboard',
        'Disallow: /farmer-home',
        'Disallow: /farmer-dashboard',
        'Disallow: /customer-home',
        'Disallow: /cart',
        'Disallow: /checkout',
        'Disallow: /orders',
        'Disallow: /profile',
        'Disallow: /settings',
        'Disallow: /login',
        'Disallow: /register',
        `Sitemap: ${SITE_URL}/sitemap.xml`
    ];

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(robotsLines.join('\n'));
});

app.get('/sitemap.xml', (req, res) => {
    const lastModified = new Date().toISOString();
    const urls = SITEMAP_ROUTES.map((route) => {
        const sitemapPath = route.path === '/' ? '' : route.path;
        const absoluteUrl = `${SITE_URL}${sitemapPath}`;
        return [
            '  <url>',
            `    <loc>${escapeXml(absoluteUrl)}</loc>`,
            `    <lastmod>${lastModified}</lastmod>`,
            `    <changefreq>${route.changefreq}</changefreq>`,
            `    <priority>${route.priority}</priority>`,
            '  </url>'
        ].join('\n');
    }).join('\n');

    const sitemapXml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        urls,
        '</urlset>'
    ].join('\n');

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(sitemapXml);
});

// Landing page - first page for new visitors
app.get('/', (req, res) => {
    if (req.session.userId) {
        // Redirect based on role for authenticated users
        if (req.session.userRole === 'farmer') {
            return res.redirect('/farmer-home');
        } else if (req.session.userRole === 'admin') {
            return res.redirect('/admin');
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
    } else if (req.session.userRole === 'admin') {
        return res.redirect('/admin');
    }
    res.redirect('/customer-home');
});

// Customer Home page
app.get('/customer-home', isAuthenticated, (req, res) => {
    // Check if user is customer
    if (req.session.userRole === 'farmer') {
        return res.redirect('/farmer-home');
    } else if (req.session.userRole === 'admin') {
        return res.redirect('/admin');
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

// Static Pages
app.get('/privacy', (req, res) => {
    res.render('privacy');
});

app.get('/terms', (req, res) => {
    res.render('terms');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

// Basic Blog Architecture for SEO
const SAMPLE_BLOG_POSTS = {
    'earn-from-crop-waste': {
        title: 'How Farmers Can Earn From Crop Waste Instead of Burning It',
        description: 'Discover how farmers in India are using farmer-to-industry platforms like KrishiSetu to turn crop waste and stubble into a profitable biomass business.',
        keywords: 'crop waste management, stubble burning alternatives, biomass marketplace, sustainable agriculture',
        content: '<p>Stubble burning is a major issue in Northern India...</p>'
    },
    'best-biomass-marketplace': {
        title: 'Best Biomass Marketplace in India for Sustainable Supply Chains',
        description: 'A deep dive into how KrishiSetu is revolutionizing the agricultural supply chain by connecting farmers with factories needing biomass.',
        keywords: 'biomass marketplace India, agricultural supply chain, farm waste to industry',
        content: '<p>The agricultural supply chain in India is evolving...</p>'
    },
    'stubble-burning-alternatives': {
        title: 'Top Alternatives to Stubble Burning for Indian Farmers',
        description: 'Explore sustainable alternatives to stubble burning that not only reduce pollution but also create additional income for farmers through waste management.',
        keywords: 'stubble burning alternatives, stubble burning solution, crop residue management, sustainable farming',
        content: '<p>Stubble burning has long been a challenge for air quality in India, but modern alternatives offer profitable solutions for farmers...</p>'
    },
    'sustainable-agri-supply-chains': {
        title: 'Building Sustainable Agricultural Supply Chains in India',
        description: 'How direct farmer-to-industry platforms are creating transparent, sustainable, and efficient agricultural supply chains.',
        keywords: 'sustainable agri supply chains, sustainable agriculture India, transparent farming platform',
        content: '<p>Sustainability in agriculture requires a transparent supply chain from the farm directly to the industry or consumer...</p>'
    },
    'ai-helps-farmers-sell-waste': {
        title: 'How AI Helps Farmers Sell Agricultural Waste',
        description: 'Learn how artificial intelligence and digital marketplaces are empowering farmers to connect with industries for efficient crop waste management.',
        keywords: 'AI in agriculture, sell agricultural waste, farmer-to-industry platform, digital farming India',
        content: '<p>Artificial intelligence is transforming how farmers manage their crop residue, connecting them instantly with industrial buyers...</p>'
    }
};

app.get('/blog', (req, res) => {
    res.render('blog-index', { posts: Object.keys(SAMPLE_BLOG_POSTS).map(slug => ({ slug, ...SAMPLE_BLOG_POSTS[slug] })) });
});

app.get('/blog/:slug', (req, res) => {
    const post = SAMPLE_BLOG_POSTS[req.params.slug];
    if (!post) return res.status(404).render('404');
    
    // Dynamically inject SEO for the blog post
    PAGE_SEO_OVERRIDES[`/blog/${req.params.slug}`] = {
        title: `${post.title} | ${SITE_NAME}`,
        description: post.description,
        keywords: post.keywords,
        type: 'article'
    };
    
    res.render('blog-post', { post });
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
        
        console.log('Login attempt:', { email, role, hasPassword: !!password });

        // Find user with password field included
        const user = await User.findOne({ email }).select('name email role _id password');
        
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ 
                error: 'invalid_credentials',
                message: 'Invalid email or password. Please register first.' 
            });
        }
        
        console.log('User found:', { email: user.email, role: user.role });

        // Normalize old "user" role to "customer" for backward compatibility
        const normalizedUserRole = normalizeRoleValue(user.role);
        const adminUser = isAdminIdentity({ role: normalizedUserRole, email: user.email });
        
        // Admin can login without role selection
        if (adminUser) {
            // Skip role check for admin
        } else {
            // Check if user role matches for non-admin users
            if (normalizedUserRole !== role) {
                console.log('Role mismatch:', { expected: normalizedUserRole, provided: role });
                const displayRole = normalizedUserRole === 'farmer' ? 'farmer' : 'customer';
                return res.status(401).json({ 
                    error: 'role_mismatch', 
                    message: `This account is registered as a ${displayRole}. Please select the correct role.`,
                    correctRole: displayRole
                });
            }
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);
        
        if (!isMatch) {
            return res.status(401).json({ 
                error: 'invalid_credentials',
                message: 'Invalid email or password' 
            });
        }

        // Create session (normalize old "user" role to "customer")
        const normalizedRole = adminUser ? 'admin' : normalizedUserRole;
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        req.session.userRole = normalizedRole;
        
        console.log('Session data set:', { 
            userId: req.session.userId, 
            userName: req.session.userName,
            userRole: req.session.userRole 
        });

        // Save session and return JSON with redirect URL
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'server_error', message: 'Login failed' });
            }
            
            console.log('Session saved successfully');
            
            // Determine redirect URL based on role
            let redirectUrl;
            if (normalizedRole === 'admin') {
                redirectUrl = '/admin';
            } else if (normalizedRole === 'farmer') {
                redirectUrl = '/farmer-home';
            } else {
                redirectUrl = '/customer-home';
            }
            
            console.log('Login successful, redirecting to:', redirectUrl);
            
            const responseData = { 
                success: true, 
                redirect: redirectUrl,
                message: 'Login successful' 
            };
            
            console.log('Sending response:', JSON.stringify(responseData));
            
            // Return JSON response with redirect URL
            res.status(200).json(responseData);
        });
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
            image: item.image,
            category: item.category
        }));
        
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryCharges = subtotal >= 500 ? 0 : 40; // Free delivery above ₹500
        const totalAmount = subtotal + deliveryCharges;
        
        // Get farmer IDs from products in cart
        const productIds = items.map(item => item.productId).filter(Boolean);
        let farmerId = null;
        let farmerName = null;
        
        if (productIds.length > 0) {
            const products = await Product.find({ _id: { $in: productIds } }).limit(1);
            if (products.length > 0) {
                farmerId = products[0].farmerId;
                farmerName = products[0].farmerName;
            }
        }
        
        // Create order
        const order = new Order({
            userId: req.session.userId,
            userName: req.session.userName,
            userEmail: req.session.userEmail,
            items: items,
            deliveryAddress: address,
            paymentMethod: paymentMethod || 'cod',
            specialInstructions: instructions || '',
            subtotal: subtotal,
            deliveryCharges: deliveryCharges,
            totalAmount: totalAmount,
            status: 'pending',
            farmerId: farmerId,
            farmerName: farmerName,
            orderDate: new Date()
        });
        
        await order.save();
        
        // Send notifications
        const notificationService = require('./utils/notificationService');
        const user = await User.findById(req.session.userId);
        
        // Notify customer
        if (user) {
            await notificationService.notifyOrderPlaced(order, user);
        }
        
        // Notify farmer
        if (farmerId) {
            const farmer = await User.findById(farmerId);
            if (farmer) {
                await notificationService.notifyFarmerNewOrder(order, farmer);
            }
        }
        
        // Check for low stock and notify farmers
        for (const item of items) {
            if (item.productId) {
                const product = await Product.findById(item.productId);
                if (product) {
                    // Update stock
                    product.stock = Math.max(0, product.stock - item.quantity);
                    await product.save();
                    
                    // Check if stock is low (less than 10 units)
                    if (product.stock < 10 && product.stock > 0) {
                        const productFarmer = await User.findById(product.farmerId);
                        if (productFarmer) {
                            await notificationService.notifyLowStock(product, productFarmer);
                        }
                    }
                }
            }
        }
        
        // Clear cart after successful order
        req.session.cart = [];
        
        res.json({ 
            success: true, 
            message: 'Order placed successfully! You will receive a confirmation email shortly.',
            orderId: order._id,
            orderNumber: order.orderNumber
        });
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ success: false, message: 'Failed to place order' });
    }
});

// Configure Multer for image uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp|avif|heic|heif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(null, false);
    }
});

const PRODUCT_CATEGORY_VALUES = new Set(['fruits', 'vegetables', 'dairy', 'pulses', 'pickles', 'masala', 'grains', 'other']);
const PRODUCT_UNIT_ALIASES = {
    kg: 'kg',
    kilogram: 'kg',
    kilograms: 'kg',
    g: 'gram',
    gram: 'gram',
    grams: 'gram',
    liter: 'liter',
    litre: 'liter',
    l: 'liter',
    ml: 'ml',
    piece: 'piece',
    pieces: 'piece',
    pc: 'piece',
    pcs: 'piece',
    '100g': '100g',
    dozen: 'dozen',
    bundle: 'bundle'
};

function normalizeProductCategory(value) {
    if (typeof value !== 'string') return null;
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;
    return PRODUCT_CATEGORY_VALUES.has(normalized) ? normalized : null;
}

function normalizeProductUnit(value) {
    if (value === undefined || value === null || value === '') {
        return 'kg';
    }
    const normalized = String(value).trim().toLowerCase();
    return PRODUCT_UNIT_ALIASES[normalized] || null;
}

function parseProductValues({ price, originalPrice, stock }) {
    const priceValue = Number(price);
    const originalPriceValue = Number(originalPrice ?? price);
    const stockValue = Number.parseInt(String(stock), 10);

    if (!Number.isFinite(priceValue) || priceValue < 0) return null;
    if (!Number.isFinite(originalPriceValue) || originalPriceValue < 0) return null;
    if (!Number.isInteger(stockValue) || stockValue < 0) return null;

    const discount = originalPriceValue > 0
        ? Math.round(((originalPriceValue - priceValue) / originalPriceValue) * 100)
        : 0;

    return {
        priceValue,
        originalPriceValue,
        stockValue,
        discountValue: Math.max(0, Math.min(100, discount)),
    };
}

function getUploadedImagePath(file) {
    if (!file || !file.buffer || !file.mimetype) {
        return '/Product_images/default.jpg';
    }
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

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

        if (!productName?.trim() || !category || price === undefined || price === null || price === '' || stock === undefined || stock === null || stock === '') {
            return res.status(400).json({ success: false, message: 'All required fields must be filled' });
        }

        const normalizedCategory = normalizeProductCategory(category);
        if (!normalizedCategory) {
            return res.status(400).json({ success: false, message: 'Invalid category selected' });
        }

        const normalizedUnit = normalizeProductUnit(unit);
        if (!normalizedUnit) {
            return res.status(400).json({ success: false, message: 'Invalid unit selected' });
        }

        const parsedValues = parseProductValues({ price, originalPrice, stock });
        if (!parsedValues) {
            return res.status(400).json({ success: false, message: 'Invalid price, original price, or stock value' });
        }

        const imagePath = getUploadedImagePath(req.file);

        const product = new Product({
            name: productName.trim(),
            category: normalizedCategory,
            price: parsedValues.priceValue,
            originalPrice: parsedValues.originalPriceValue,
            discount: parsedValues.discountValue,
            stock: parsedValues.stockValue,
            unit: normalizedUnit,
            image: imagePath,
            description: description || '',
            farmerId: req.session.userId,
            farmerName: req.session.userName,
            status: parsedValues.stockValue > 0 ? 'active' : 'out_of_stock'
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
        const { 
            category, 
            search, 
            minPrice, 
            maxPrice, 
            sortBy, 
            farmerName,
            location,
            inStock
        } = req.query;
        
        let query = { status: 'active' };

        // Category filter
        if (category && category !== 'all') {
            query.category = category.toLowerCase();
        }

        // Search by name or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Farmer name filter
        if (farmerName) {
            query.farmerName = { $regex: farmerName, $options: 'i' };
        }

        // Stock availability filter
        if (inStock === 'true') {
            query.stock = { $gt: 0 };
        }

        // Sorting
        let sortOptions = { createdAt: -1 }; // default: newest first
        if (sortBy === 'price_low') {
            sortOptions = { price: 1 };
        } else if (sortBy === 'price_high') {
            sortOptions = { price: -1 };
        } else if (sortBy === 'name') {
            sortOptions = { name: 1 };
        } else if (sortBy === 'discount') {
            sortOptions = { discount: -1 };
        }

        const products = await Product.find(query).sort(sortOptions).lean();
        res.json({ success: true, products: products, count: products.length });
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

app.get('/api/products/:id', isAuthenticated, async (req, res) => {
    try {
        console.log('GET /api/products/:id - User:', req.session.userId, 'Role:', req.session.userRole, 'Product ID:', req.params.id);
        
        if (req.session.userRole !== 'farmer') {
            console.log('Access denied - not a farmer');
            return res.status(403).json({ success: false, message: 'Access denied - Farmer role required' });
        }

        const product = await Product.findById(req.params.id);
        
        if (!product) {
            console.log('Product not found:', req.params.id);
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        // Check if product belongs to this farmer
        if (product.farmerId && product.farmerId.toString() !== req.session.userId.toString()) {
            console.log('Product belongs to different farmer');
            return res.status(403).json({ success: false, message: 'You can only edit your own products' });
        }

        console.log('Product found successfully:', product.name);
        res.json({ success: true, product: product });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch product: ' + error.message });
    }
});

app.put('/api/products/update/:id', isAuthenticated, upload.single('productImage'), async (req, res) => {
    try {
        console.log('PUT /api/products/update/:id - User:', req.session.userId, 'Product ID:', req.params.id);
        console.log('Request body:', req.body);
        
        if (req.session.userRole !== 'farmer') {
            return res.status(403).json({ success: false, message: 'Only farmers can update products' });
        }

        const { productName, category, price, originalPrice, stock, unit, description } = req.body;

        // Validate required fields
        if (!productName?.trim() || !category || price === undefined || price === null || price === '' || stock === undefined || stock === null || stock === '') {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const normalizedCategory = normalizeProductCategory(category);
        if (!normalizedCategory) {
            return res.status(400).json({ success: false, message: 'Invalid category selected' });
        }

        const normalizedUnit = normalizeProductUnit(unit);
        if (!normalizedUnit) {
            return res.status(400).json({ success: false, message: 'Invalid unit selected' });
        }

        const parsedValues = parseProductValues({ price, originalPrice: originalPrice || price, stock });
        if (!parsedValues) {
            return res.status(400).json({ success: false, message: 'Invalid price, original price, or stock value' });
        }

        const updateData = {
            name: productName.trim(),
            category: normalizedCategory,
            price: parsedValues.priceValue,
            originalPrice: parsedValues.originalPriceValue,
            discount: parsedValues.discountValue,
            stock: parsedValues.stockValue,
            unit: normalizedUnit,
            description: description || '',
            status: parsedValues.stockValue > 0 ? 'active' : 'out_of_stock'
        };

        if (req.file) {
            updateData.image = getUploadedImagePath(req.file);
        }

        console.log('Update data:', updateData);

        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        // Check ownership
        if (product.farmerId && product.farmerId.toString() !== req.session.userId.toString()) {
            return res.status(403).json({ success: false, message: 'You can only update your own products' });
        }

        // Update the product
        Object.assign(product, updateData);
        await product.save();

        console.log('Product updated successfully:', product.name);
        res.json({ success: true, message: 'Product updated successfully', product: product });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to update product' });
    }
});

// ==================== FARMER ORDER MANAGEMENT ROUTES ====================

// Get all orders for farmer's products
app.get('/api/orders/farmer', isAuthenticated, async (req, res) => {
    try {
        if (req.session.userRole !== 'farmer') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Get all products belonging to this farmer
        const farmerProducts = await Product.find({ farmerId: req.session.userId }).select('_id name');
        const farmerProductIds = farmerProducts.map(p => p._id.toString());
        const farmerProductNames = farmerProducts.map(p => p.name);

        // Find all orders that contain at least one of the farmer's products
        const orders = await Order.find({
            'items.productName': { $in: farmerProductNames }
        }).sort({ orderDate: -1 }).lean();

        // Filter orders to only include items from this farmer and calculate correct totals
        const filteredOrders = orders.map(order => {
            const farmerItems = order.items.filter(item => 
                farmerProductNames.includes(item.productName)
            );
            
            // Recalculate totals for farmer's items only
            const farmerSubtotal = farmerItems.reduce((sum, item) => 
                sum + (item.price * item.quantity), 0
            );
            
            return {
                ...order,
                items: farmerItems,
                subtotal: farmerSubtotal,
                totalAmount: farmerSubtotal + (order.deliveryCharges || 0)
            };
        }).filter(order => order.items.length > 0); // Remove orders with no farmer items

        res.json({ success: true, orders: filteredOrders });
    } catch (error) {
        console.error('Get farmer orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});

// Update order status
app.put('/api/orders/:orderId/status', isAuthenticated, async (req, res) => {
    try {
        const { status, trackingNumber, note } = req.body;
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check authorization
        if (req.session.userRole === 'farmer') {
            // Farmer can only update their own orders
            const farmerProducts = await Product.find({ farmerId: req.session.userId });
            const farmerProductNames = farmerProducts.map(p => p.name);
            const hasProduct = order.items.some(item => farmerProductNames.includes(item.productName));
            if (!hasProduct) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }
        } else if (req.session.userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Update order
        order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (status === 'delivered' && !order.deliveryDate) {
            order.deliveryDate = new Date();
        }
        
        await order.save();

        // Send notification to customer
        const notificationService = require('./utils/notificationService');
        const user = await User.findById(order.userId);
        if (user) {
            await notificationService.notifyOrderStatusUpdate(order, user, status);
        }

        res.json({ success: true, message: 'Order status updated successfully', order: order });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
});

// ===== NOTIFICATION ROUTES =====

// Get user notifications
app.get('/api/notifications', isAuthenticated, async (req, res) => {
    try {
        const Notification = require('./models/Notification');
        const notifications = await Notification.find({ userId: req.session.userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        
        const unreadCount = await Notification.countDocuments({ 
            userId: req.session.userId, 
            read: false 
        });

        res.json({ success: true, notifications, unreadCount });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
app.put('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
        const Notification = require('./models/Notification');
        await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.session.userId },
            { read: true, readAt: new Date() }
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
});

// Mark all notifications as read
app.put('/api/notifications/read-all', isAuthenticated, async (req, res) => {
    try {
        const Notification = require('./models/Notification');
        await Notification.updateMany(
            { userId: req.session.userId, read: false },
            { read: true, readAt: new Date() }
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
});

// ===== ADMIN ROUTES =====

// Admin middleware
const isAdmin = (req, res, next) => {
    if (!req.session.userId) {
        if (req.originalUrl === '/admin') {
            return res.redirect('/login');
        }
        return res.status(401).json({ success: false, message: 'Please login' });
    }
    const hasAdminAccess = req.session.userRole === 'admin' || (req.session.userEmail || '').trim().toLowerCase() === ADMIN_EMAIL;
    if (!hasAdminAccess) {
        if (req.originalUrl === '/admin') {
            return res.redirect('/login');
        }
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

// Admin dashboard page
app.get('/admin', isAdmin, (req, res) => {
    res.render('admin-dashboard', {
        user: {
            id: req.session.userId,
            name: req.session.userName,
            email: req.session.userEmail,
            role: req.session.userRole
        }
    });
});

// Get dashboard statistics
app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalFarmers = await User.countDocuments({ role: 'farmer' });
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ status: 'active' });
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
        
        // Revenue calculation
        const revenueData = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // Recent orders (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentOrders = await Order.countDocuments({ 
            orderDate: { $gte: sevenDaysAgo } 
        });

        res.json({
            success: true,
            stats: {
                users: { total: totalUsers, farmers: totalFarmers, customers: totalCustomers },
                products: { total: totalProducts, active: activeProducts },
                orders: { total: totalOrders, pending: pendingOrders, delivered: deliveredOrders, recent: recentOrders },
                revenue: { total: totalRevenue }
            }
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
});

// Get all users (with pagination)
app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        const query = {};
        
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await User.countDocuments(query);

        res.json({ success: true, users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// Get all orders (with filters)
app.get('/api/admin/orders', isAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const query = {};
        
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { userName: { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .sort({ orderDate: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await Order.countDocuments(query);

        res.json({ success: true, orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});

// Get all products (admin view)
app.get('/api/admin/products', isAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, category, search } = req.query;
        const query = {};
        
        if (status) query.status = status;
        if (category && category !== 'all') query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { farmerName: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await Product.countDocuments(query);

        res.json({ success: true, products, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

// Update user status/role
app.put('/api/admin/users/:userId', isAdmin, async (req, res) => {
    try {
        const { role, isVerified } = req.body;
        const updateData = {};
        
        if (role) updateData.role = role;
        if (isVerified !== undefined) updateData.isVerified = isVerified;

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            updateData,
            { new: true, select: '-password' }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'User updated successfully', user });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
});

// Delete user
app.delete('/api/admin/users/:userId', isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});

// Update product status (admin can change any product)
app.put('/api/admin/products/:productId', isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.productId,
            { status },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, message: 'Product updated successfully', product });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
});

// Delete product (admin can delete any product)
app.delete('/api/admin/products/:productId', isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.productId);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
});

// Revenue analytics
app.get('/api/admin/analytics/revenue', isAdmin, async (req, res) => {
    try {
        const { period = 'week' } = req.query;
        
        let dateLimit;
        if (period === 'week') {
            dateLimit = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === 'month') {
            dateLimit = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        } else if (period === 'year') {
            dateLimit = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        }

        const revenueData = await Order.aggregate([
            { $match: { orderDate: { $gte: dateLimit }, status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: { 
                        $dateToString: { format: '%Y-%m-%d', date: '$orderDate' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({ success: true, data: revenueData });
    } catch (error) {
        console.error('Get revenue analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
});

// ============================================================
//  MOBILE APP API ROUTES (JWT-based authentication)
//  These routes are used by the React Native mobile app.
//  They do NOT affect the existing session-based web app.
// ============================================================

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'krishisetu-jwt-secret';

// JWT auth middleware for mobile routes
function authenticateMobile(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.mobileUser = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}

app.get('/mobile/admin/auto-login', async (req, res) => {
    try {
        const tokenFromQuery = req.query.token;
        if (!tokenFromQuery || typeof tokenFromQuery !== 'string') {
            return res.redirect('/login');
        }

        const decoded = jwt.verify(tokenFromQuery, JWT_SECRET);
        if (!decoded?.userId) {
            return res.redirect('/login');
        }

        const user = await User.findById(decoded.userId).select('name email role');
        if (!user) {
            return res.redirect('/login');
        }

        const normalizedRole = normalizeRoleValue(user.role);
        const adminUser = isAdminIdentity({ role: normalizedRole, email: user.email });
        if (!adminUser) {
            return res.status(403).send('Admin access required');
        }

        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        req.session.userRole = 'admin';

        req.session.save((sessionError) => {
            if (sessionError) {
                console.error('Mobile admin auto-login session error:', sessionError);
                return res.redirect('/login');
            }
            return res.redirect('/admin');
        });
    } catch (error) {
        console.error('Mobile admin auto-login error:', error);
        return res.redirect('/login');
    }
});

// Mobile Login
app.post('/api/mobile/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        console.log('Mobile login attempt:', { email, role });
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password +name +email +role +phone +address');
        if (!user) {
            console.log('Mobile login - user not found:', email);
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        // Normalize old 'user' role to 'customer'
        const normalizedUserRole = normalizeRoleValue(user.role);
        const adminUser = isAdminIdentity({ role: normalizedUserRole, email: user.email });
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Mobile login - password mismatch for:', email);
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const selectedRole = role || 'any';
        if (!adminUser && selectedRole !== 'any' && normalizedUserRole !== selectedRole) {
                return res.status(401).json({
                    success: false,
                    error: 'role_mismatch',
                    message: `This account is registered as a ${normalizedUserRole}. Please select the correct role.`,
                    correctRole: normalizedUserRole
                });
        }
        if (adminUser && selectedRole !== 'any' && selectedRole !== 'admin') {
            console.log('Mobile login - allowing admin despite selected role mismatch:', {
                selectedRole,
                actualRole: 'admin',
                email: user.email
            });
        }
        const effectiveRole = adminUser ? 'admin' : normalizedUserRole;
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: effectiveRole, name: user.name },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        user.lastLogin = new Date();
        await user.save();
        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: effectiveRole,
                phone: user.phone,
                address: user.address,
            }
        });
    } catch (error) {
        console.error('Mobile login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Mobile Register
app.post('/api/mobile/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: role || 'customer',
        });
        await user.save();
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.error('Mobile register error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Mobile – Get user's orders
app.get('/api/mobile/orders', authenticateMobile, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.mobileUser.userId })
            .sort({ orderDate: -1 })
            .lean();
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Mobile get orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});

// Mobile – Get single order
app.get('/api/mobile/orders/:id', authenticateMobile, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.mobileUser.userId
        }).lean();
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, order });
    } catch (error) {
        console.error('Mobile get order error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order' });
    }
});

// Mobile – Place order
app.post('/api/mobile/place-order', authenticateMobile, async (req, res) => {
    try {
        const { items, address, paymentMethod, instructions, totalAmount, subtotal, deliveryCharges } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }
        if (!address || !address.fullName || !address.phone || !address.address || !address.city || !address.state || !address.pincode) {
            return res.status(400).json({ success: false, message: 'Complete delivery address is required' });
        }

        const user = await User.findById(req.mobileUser.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        // Create order
        const order = new Order({
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            items: items,
            totalAmount: totalAmount || items.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0),
            subtotal: subtotal || totalAmount,
            deliveryCharges: deliveryCharges || 0,
            deliveryAddress: address,
            shippingAddress: {
                fullName: address.fullName,
                phone: address.phone,
                address: address.address,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
            },
            paymentMethod: paymentMethod || 'cod',
            paymentStatus: 'pending',
            status: 'pending',
            specialInstructions: instructions || '',
        });

        await order.save();

        // Update product stock
        for (const item of items) {
            if (item.productId) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: -(item.quantity || 1) }
                });
            }
        }

        res.status(201).json({
            success: true,
            orderId: order._id,
            orderNumber: order.orderNumber,
            message: 'Order placed successfully'
        });
    } catch (error) {
        console.error('Mobile place order error:', error);
        res.status(500).json({ success: false, message: 'Failed to place order' });
    }
});

// Mobile – Get user profile
app.get('/api/mobile/profile', authenticateMobile, async (req, res) => {
    try {
        const user = await User.findById(req.mobileUser.userId).select('-password').lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
});

// Mobile – Update profile
app.put('/api/mobile/profile', authenticateMobile, async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const updates = {};
        if (name) updates.name = name.trim();
        if (phone) updates.phone = phone;
        if (address) updates.address = address;

        const user = await User.findByIdAndUpdate(
            req.mobileUser.userId,
            { $set: updates },
            { new: true }
        ).select('-password');

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

// Mobile – Get notifications
app.get('/api/mobile/notifications', authenticateMobile, async (req, res) => {
    try {
        const Notification = require('./models/Notification');
        const notifications = await Notification.find({ userId: req.mobileUser.userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        const unreadCount = await Notification.countDocuments({ userId: req.mobileUser.userId, read: false });
        res.json({ success: true, notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
});

// ============================================================
//  END OF MOBILE API ROUTES
// ============================================================

// ==================== MOBILE FARMER API ROUTES ====================

// Get farmer's own products (mobile)
app.get('/api/mobile/farmer/products', authenticateMobile, async (req, res) => {
    try {
        if (req.mobileUser.role !== 'farmer') {
            return res.status(403).json({ success: false, message: 'Access denied - Farmer role required' });
        }
        const products = await Product.find({ farmerId: req.mobileUser.userId }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, products });
    } catch (error) {
        console.error('Mobile get farmer products error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

// Add product (mobile)
app.post('/api/mobile/farmer/products', authenticateMobile, upload.single('productImage'), async (req, res) => {
    try {
        if (req.mobileUser.role !== 'farmer') {
            return res.status(403).json({ success: false, message: 'Only farmers can add products' });
        }
        const { productName, category, price, originalPrice, stock, unit, description } = req.body;
        if (!productName?.trim() || !category || price === undefined || price === null || price === '' || stock === undefined || stock === null || stock === '') {
            return res.status(400).json({ success: false, message: 'All required fields must be filled' });
        }

        const normalizedCategory = normalizeProductCategory(category);
        if (!normalizedCategory) {
            return res.status(400).json({ success: false, message: 'Invalid category selected' });
        }

        const normalizedUnit = normalizeProductUnit(unit);
        if (!normalizedUnit) {
            return res.status(400).json({ success: false, message: 'Invalid unit selected' });
        }

        const parsedValues = parseProductValues({ price, originalPrice, stock });
        if (!parsedValues) {
            return res.status(400).json({ success: false, message: 'Invalid price, original price, or stock value' });
        }

        const imagePath = getUploadedImagePath(req.file);
        const product = new Product({
            name: productName.trim(),
            category: normalizedCategory,
            price: parsedValues.priceValue,
            originalPrice: parsedValues.originalPriceValue,
            discount: parsedValues.discountValue,
            stock: parsedValues.stockValue,
            unit: normalizedUnit,
            image: imagePath,
            description: description || '',
            farmerId: req.mobileUser.userId,
            farmerName: req.mobileUser.name,
            status: parsedValues.stockValue > 0 ? 'active' : 'out_of_stock'
        });
        await product.save();
        res.json({ success: true, message: 'Product added successfully', product });
    } catch (error) {
        console.error('Mobile add product error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to add product' });
    }
});

// Delete product (mobile)
app.delete('/api/mobile/farmer/products/:id', authenticateMobile, async (req, res) => {
    try {
        if (req.mobileUser.role !== 'farmer') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const product = await Product.findOneAndDelete({ _id: req.params.id, farmerId: req.mobileUser.userId });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Mobile delete product error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
});

// Get farmer's orders (mobile)
app.get('/api/mobile/farmer/orders', authenticateMobile, async (req, res) => {
    try {
        if (req.mobileUser.role !== 'farmer') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const farmerProducts = await Product.find({ farmerId: req.mobileUser.userId }).select('_id name');
        const farmerProductNames = farmerProducts.map(p => p.name);
        const orders = await Order.find({
            'items.productName': { $in: farmerProductNames }
        }).sort({ orderDate: -1 }).lean();
        const filteredOrders = orders.map(order => {
            const farmerItems = order.items.filter(item => farmerProductNames.includes(item.productName));
            const farmerSubtotal = farmerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            return {
                ...order,
                items: farmerItems,
                subtotal: farmerSubtotal,
                totalAmount: farmerSubtotal + (order.deliveryCharges || 0)
            };
        }).filter(order => order.items.length > 0);
        res.json({ success: true, orders: filteredOrders });
    } catch (error) {
        console.error('Mobile get farmer orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});

// Update order status (mobile farmer)
app.put('/api/mobile/farmer/orders/:id/status', authenticateMobile, async (req, res) => {
    try {
        if (req.mobileUser.role !== 'farmer') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, message: 'Order status updated', order });
    } catch (error) {
        console.error('Mobile update order status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
});

const PORT = process.env.PORT || 5000;

// Only listen if not in serverless environment (Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export for serverless (Vercel)
module.exports = app;