// Back to top functionality
document.addEventListener('DOMContentLoaded', function() {
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Search functionality
    const searchBar = document.querySelector('.search-bar');
    const searchIcon = document.querySelector('.search-icon');
    
    if (searchIcon && searchBar) {
        searchIcon.addEventListener('click', () => {
            if (searchBar.value.trim()) {
                console.log('Searching for:', searchBar.value);
                // Add your search functionality here
                // Example: window.location.href = '/search?q=' + encodeURIComponent(searchBar.value);
            }
        });

        searchBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchBar.value.trim()) {
                console.log('Searching for:', searchBar.value);
                // Add your search functionality here
                // Example: window.location.href = '/search?q=' + encodeURIComponent(searchBar.value);
            }
        });
    }

    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const productName = this.closest('.product-details').querySelector('h3').textContent;
            const badge = document.querySelector('.cart-badge');
            
            if (badge) {
                let currentCount = parseInt(badge.textContent);
                badge.textContent = currentCount + 1;
            }
            
            // Show feedback
            const originalText = this.textContent;
            this.textContent = 'Added!';
            this.style.backgroundColor = '#8bc34a';
            this.style.color = 'white';
            this.style.borderColor = '#8bc34a';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.backgroundColor = 'white';
                this.style.color = '#000';
                this.style.borderColor = '#000';
            }, 1000);
            
            console.log('Added to cart:', productName);
            
            // Here you would typically make an API call to add the item to the cart
            // Example:
            // fetch('/api/cart/add', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ product: productName })
            // });
        });
    });
});
