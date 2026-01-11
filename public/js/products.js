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

    // Add to Cart Functionality
    const addButtons = document.querySelectorAll('.add-btn');
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productItem = this.closest('.product-item');
            const productName = productItem.querySelector('.product-name').textContent;
            const productPrice = productItem.getAttribute('data-price');
            const productWeight = productItem.querySelector('.product-weight').textContent;
            const productImage = productItem.querySelector('.product-img').src;
            const productCategory = productItem.getAttribute('data-category');
            
            // Send to server
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
                if (data.success) {
                    // Update button
                    this.textContent = 'Added!';
                    this.style.backgroundColor = '#4caf50';
                    
                    // Update cart count in navbar
                    updateCartCount();
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        this.textContent = 'Add';
                        this.style.backgroundColor = '';
                    }, 2000);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to add item to cart');
            });
        });
    });
});

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

