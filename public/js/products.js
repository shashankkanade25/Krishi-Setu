// Products Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const categoryItems = document.querySelectorAll('.category-item');
    const productItems = document.querySelectorAll('.product-item');
    const productsTitle = document.querySelector('.products-title');
    const sortSelect = document.getElementById('sortProducts');

    // Get initial category from URL or active category
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category') || 'all';
    
    // Set title and filter based on initial category
    updateTitleByCategory(initialCategory);
    filterProducts(initialCategory);

    // Category Filtering
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active state
            categoryItems.forEach(cat => cat.classList.remove('active'));
            this.classList.add('active');
            
            // Update title
            updateTitleByCategory(category);
            
            // Update URL
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('category', category);
            window.history.pushState({}, '', newUrl);
            
            // Filter products
            filterProducts(category);
        });
    });

    function updateTitleByCategory(category) {
        const categoryNames = {
            'all': 'All Products',
            'fruits': 'Fruits',
            'vegetables': 'Vegetables',
            'dairy': 'Dairy Products',
            'pulses': 'Pulses',
            'pickles': 'Pickles',
            'masala': 'Masala Blends',
            'grains': 'Grains & Cereals',
            'oil': 'Cold Pressed Oils'
        };
        productsTitle.textContent = categoryNames[category] || 'All Products';
    }

    function filterProducts(category) {
        productItems.forEach(product => {
            const productCategory = product.getAttribute('data-category');
            
            if (category === 'all' || productCategory === category) {
                product.classList.remove('hidden');
            } else {
                product.classList.add('hidden');
            }
        });
        
        // Reset sort when changing category
        sortSelect.value = 'default';
    }

    // Product Sorting
    sortSelect.addEventListener('change', function() {
        const sortType = this.value;
        sortProducts(sortType);
    });

    function sortProducts(sortType) {
        const productsGrid = document.getElementById('productsGrid');
        const visibleProducts = Array.from(productItems).filter(item => !item.classList.contains('hidden'));
        
        let sortedProducts;
        
        switch(sortType) {
            case 'price-low':
                sortedProducts = visibleProducts.sort((a, b) => {
                    return parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price'));
                });
                break;
            case 'price-high':
                sortedProducts = visibleProducts.sort((a, b) => {
                    return parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price'));
                });
                break;
            case 'discount':
                sortedProducts = visibleProducts.sort((a, b) => {
                    return parseFloat(b.getAttribute('data-discount')) - parseFloat(a.getAttribute('data-discount'));
                });
                break;
            default:
                return;
        }
        
        // Reorder the DOM elements
        sortedProducts.forEach(product => {
            productsGrid.appendChild(product);
        });
    }

    // Add to Cart Functionality - single delegated handler to avoid duplicate bindings
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.addEventListener('click', function(e) {
            const btn = e.target.closest('.add-btn');
            if (!btn) return;
            if (btn.disabled) return;
            const productItem = btn.closest('.product-item');
            if (productItem) addProductToCart(productItem);
        });
    }

    // Load cart quantities on page load
    loadCartQuantities();
});

function addProductToCart(productItem) {
    const productName = productItem.querySelector('.product-name').textContent;
    const productPrice = productItem.getAttribute('data-price');
    const productWeight = productItem.querySelector('.product-weight').textContent;
    const productImageSrc = productItem.querySelector('.product-img').src;
    const productCategory = productItem.getAttribute('data-category');
    const addBtn = productItem.querySelector('.add-btn');
    
    // Prevent duplicate clicks while request is in flight
    if (addBtn && addBtn.dataset.loading === 'true') return;
    if (addBtn) {
        addBtn.dataset.loading = 'true';
        addBtn.disabled = true;
        addBtn.classList.add('loading');
    }
    
    // Convert full URL to relative path
    let productImage = productImageSrc;
    try {
        const url = new URL(productImageSrc);
        productImage = url.pathname;
    } catch (e) {
        // If it's already a relative path, use as is
        productImage = productImageSrc;
    }
    
    fetch('/cart/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            productName: productName,
            price: productPrice,
            weight: productWeight,
            image: productImage,
            category: productCategory
        })
    })
    .then(response => response.json())
    .then(data => {
        if (addBtn) {
            addBtn.dataset.loading = 'false';
            addBtn.disabled = false;
            addBtn.classList.remove('loading');
        }
        if (data.success) {
            updateCartCount();
            showQuantityControls(productItem, 1);
        } else {
            showModal('Failed to add item to cart. Please try again.');
        }
    })
    .catch(error => {
        if (addBtn) {
            addBtn.dataset.loading = 'false';
            addBtn.disabled = false;
            addBtn.classList.remove('loading');
        }
        console.error('Error:', error);
        showModal('Failed to add item to cart. Please try again.');
    });
}

function showQuantityControls(productItem, quantity) {
    const addBtn = productItem.querySelector('.add-btn');
    let quantityControls = productItem.querySelector('.product-quantity-controls');
    
    if (!quantityControls) {
        quantityControls = document.createElement('div');
        quantityControls.className = 'product-quantity-controls';
        quantityControls.innerHTML = `
            <button class="product-qty-btn minus">−</button>
            <div class="product-qty-display">1</div>
            <button class="product-qty-btn plus">+</button>
        `;
        addBtn.parentNode.insertBefore(quantityControls, addBtn.nextSibling);
        
        // Add event listeners
        const minusBtn = quantityControls.querySelector('.minus');
        const plusBtn = quantityControls.querySelector('.plus');
        
        minusBtn.addEventListener('click', () => {
            updateProductQuantity(productItem, -1);
        });
        
        plusBtn.addEventListener('click', () => {
            updateProductQuantity(productItem, 1);
        });
    }
    
    const qtyDisplay = quantityControls.querySelector('.product-qty-display');
    qtyDisplay.textContent = quantity;
    
    addBtn.classList.add('hidden');
    quantityControls.classList.add('active');
}

function hideQuantityControls(productItem) {
    const addBtn = productItem.querySelector('.add-btn');
    const quantityControls = productItem.querySelector('.product-quantity-controls');
    
    if (quantityControls) {
        quantityControls.classList.remove('active');
    }
    addBtn.classList.remove('hidden');
}

function updateProductQuantity(productItem, change) {
    const productName = productItem.querySelector('.product-name').textContent;
    const quantityControls = productItem.querySelector('.product-quantity-controls');
    const qtyDisplay = quantityControls.querySelector('.product-qty-display');
    let currentQty = parseInt(qtyDisplay.textContent);
    let newQty = currentQty + change;
    
    if (newQty < 1) {
        // Remove from cart
        fetch('/cart/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productName: productName
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                hideQuantityControls(productItem);
                updateCartCount();
            }
        })
        .catch(error => console.error('Error:', error));
    } else {
        // Update quantity
        fetch('/cart/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productName: productName,
                quantity: newQty
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                qtyDisplay.textContent = newQty;
                updateCartCount();
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function loadCartQuantities() {
    fetch('/cart/items')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.items) {
                data.items.forEach(item => {
                    const productItems = document.querySelectorAll('.product-item');
                    productItems.forEach(productItem => {
                        const productName = productItem.querySelector('.product-name').textContent;
                        if (productName === item.productName) {
                            showQuantityControls(productItem, item.quantity);
                        }
                    });
                });
            }
        })
        .catch(error => console.error('Error loading cart quantities:', error));
}

// Update cart count in navbar
function updateCartCount() {
    fetch('/cart/count')
        .then(response => response.json())
        .then(data => {
            const cartBadge = document.querySelector('.cart-count');
            if (cartBadge) {
                cartBadge.textContent = data.count;
                if (data.count > 0) {
                    cartBadge.style.display = 'flex';
                } else {
                    cartBadge.style.display = 'none';
                }
            }
        })
        .catch(error => console.error('Error updating cart count:', error));
}

// Update cart count on page load
updateCartCount();

