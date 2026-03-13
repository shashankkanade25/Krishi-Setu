(function () {
    const PRIORITY_HINTS = ['logo', 'hero', 'banner', 'auth-image', 'brand-logo', 'avatar', 'profile'];

    function isCriticalImage(img, index) {
        if (img.hasAttribute('data-priority') || img.getAttribute('fetchpriority') === 'high') {
            return true;
        }

        const idAndClass = `${img.id || ''} ${img.className || ''}`.toLowerCase();
        if (PRIORITY_HINTS.some((hint) => idAndClass.includes(hint))) {
            return true;
        }

        if (img.closest('nav, header, .hero, .auth-image, .brand-logo')) {
            return true;
        }

        return index < 2;
    }

    function optimizeImage(img, index = Number.MAX_SAFE_INTEGER) {
        if (!(img instanceof HTMLImageElement)) return;

        if (!img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
        }

        const critical = isCriticalImage(img, index);

        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', critical ? 'eager' : 'lazy');
        }

        if (!img.hasAttribute('fetchpriority')) {
            img.setAttribute('fetchpriority', critical ? 'high' : 'low');
        }
    }

    function optimizeExistingImages() {
        const images = Array.from(document.querySelectorAll('img'));
        images.forEach((image, index) => optimizeImage(image, index));
    }

    function handleAddedNode(node) {
        if (node instanceof HTMLImageElement) {
            optimizeImage(node);
            return;
        }

        if (node instanceof Element) {
            node.querySelectorAll('img').forEach((image) => optimizeImage(image));
        }
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => handleAddedNode(node));
        });
    });

    function start() {
        optimizeExistingImages();
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }

    window.addEventListener('beforeunload', () => observer.disconnect(), { once: true });
})();
