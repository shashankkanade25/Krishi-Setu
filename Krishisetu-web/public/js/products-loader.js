// Load products dynamically from database
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

let allProducts = [];
let currentCategory = 'all';

async function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const urlParams = new URLSearchParams(window.location.search);
    currentCategory = urlParams.get('category') || 'all';
    
    // Get existing hardcoded products from DOM
    const existingProducts = Array.from(productsGrid.querySelectorAll('.product-item'));
    const existingHTML = productsGrid.innerHTML;
    
    // Show loading state temporarily
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-indicator';
    loadingDiv.style.cssText = 'grid-column: 1/-1; padding: 20px; text-align: center;';
    loadingDiv.innerHTML = '<div class="spinner"></div><p style="margin-top: 10px; color: #666; font-size: 14px;">Loading farmer products...</p>';
    productsGrid.appendChild(loadingDiv);
    
    try {
        const response = await fetch('/api/products/all');
        const data = await response.json();
        
        // Remove loading indicator
        loadingDiv.remove();
        
        if (data.success && data.products && data.products.length > 0) {
            // Append database products to existing hardcoded products
            const dbProductsHTML = data.products.map(product => {
                const discount = product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                return `
                <div class="product-item" data-category="${product.category}" data-price="${product.price}" data-discount="${discount}">
                    ${discount > 0 ? `<div class="discount-badge">${discount}% Off</div>` : ''}
                    <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='/Product_images/default.jpg'">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-weight" style="display: flex; justify-content: space-between; align-items: center; background-color: #fef3c7; padding: 8px 12px; border-radius: 6px; margin: 8px 0;">
                        <span>1 ${product.unit || 'kg'}</span>
                        ${product.farmerName ? `<span style="font-size: 11px; color: #10b981; display: flex; align-items: center; gap: 4px;"><span style="font-size: 14px;">🌾</span> By: ${product.farmerName}</span>` : ''}
                    </div>
                    <div class="product-pricing">
                        ${product.originalPrice && product.originalPrice > product.price ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
                        <span class="current-price">₹${product.price}</span>
                    </div>
                    <button class="add-btn" ${product.stock <= 0 ? 'disabled style="background: #9ca3af; cursor: not-allowed;"' : ''} 
                        data-product-id="${product._id}" 
                        data-product-name="${product.name}" 
                        data-price="${product.price}" 
                        data-weight="1 ${product.unit || 'kg'}" 
                        data-image="${product.image}" 
                        data-category="${product.category}">${product.stock > 0 ? 'Add' : 'Out of Stock'}</button>
                </div>
                `;
            }).join('');
            
            // Keep existing products and add new farmer products
            productsGrid.innerHTML = existingHTML + dbProductsHTML;
            
            setupFilters();
            setupAddButtons();
            
            // Apply current category filter
            if (currentCategory !== 'all') {
                filterProductsByCategory(currentCategory);
            }
            
            setupCategoryHandlers();
        } else {
            // No database products, just keep existing ones
            setupFilters();
            setupAddButtons();
            setupCategoryHandlers();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        loadingDiv.remove();
        // Keep existing products even if API fails
        setupFilters();
        setupAddButtons();
        setupCategoryHandlers();
    }
}

function setupCategoryHandlers() {
    document.querySelectorAll('.category-item').forEach(item => {
        if (item.getAttribute('data-category') === currentCategory) {
            item.classList.add('active');
        }
    });
}

// Remove renderProducts function as we're keeping hardcoded products

function setupAddButtons() {
    document.querySelectorAll('.add-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', function() {
            const productItem = this.closest('.product-item');
            if (typeof addProductToCart !== 'undefined') {
                addProductToCart(productItem);
            }
        });
    });
}

function setupFilters() {
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            document.querySelectorAll('.category-item').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            const categoryNames = {
                'all': 'All Products', 'fruits': 'Fruits', 'vegetables': 'Vegetables',
                'dairy': 'Dairy Products', 'pulses': 'Pulses', 'pickles': 'Pickles',
                'masala': 'Masala Blends', 'grains': 'Grains & Cereals'
            };
            document.querySelector('.products-title').textContent = categoryNames[category] || 'All Products';
            
            currentCategory = category;
            filterProductsByCategory(category);
        });
    });
    
    const sortSelect = document.getElementById('sortProducts');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }
}

function filterProductsByCategory(category) {
    document.querySelectorAll('.product-item').forEach(item => {
        const productCategory = item.getAttribute('data-category');
        item.classList.toggle('hidden', category !== 'all' && productCategory !== category);
    });
}

function sortProducts(sortType) {
    const productsGrid = document.getElementById('productsGrid');
    const items = Array.from(document.querySelectorAll('.product-item'));
    
    items.sort((a, b) => {
        const priceA = parseFloat(a.getAttribute('data-price'));
        const priceB = parseFloat(a.getAttribute('data-price'));
        const discountA = parseFloat(a.getAttribute('data-discount'));
        const discountB = parseFloat(b.getAttribute('data-discount'));
        
        if (sortType === 'price-low') return priceA - priceB;
        if (sortType === 'price-high') return priceB - priceA;
        if (sortType === 'discount') return discountB - discountA;
        return 0;
    });
    
    productsGrid.innerHTML = '';
    items.forEach(item => productsGrid.appendChild(item));
    setupAddButtons();
}

// Add spinner styles
const style = document.createElement('style');
style.textContent = `
    .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #10b981;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin: 0 auto;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
