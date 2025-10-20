// Smooth scrolling for anchor links and page transitions
document.addEventListener('DOMContentLoaded', function() {
    
    // Auto-scroll to top on page load to prevent initial downward scrolling
    window.scrollTo({
        top: 0,
        behavior: 'instant'
    });
    
    // Prevent any automatic scrolling for the first 30ms and actively scroll up
    let allowScrolling = false;
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    
    // Disable smooth scrolling temporarily
    document.documentElement.style.scrollBehavior = 'auto';
    
    // Actively auto-scroll up during the 30ms period
    const autoScrollInterval = setInterval(() => {
        if (!allowScrolling) {
            window.scrollTo({
                top: 0,
                behavior: 'instant'
            });
        }
    }, 5); // Check and scroll to top every 5ms
    
    // Re-enable scrolling after 30ms and stop auto-scrolling
    setTimeout(() => {
        allowScrolling = true;
        clearInterval(autoScrollInterval);
        document.documentElement.style.scrollBehavior = originalScrollBehavior;
    }, 30);
    
    // Override scroll events during the initial 30ms
    function preventEarlyScroll(e) {
        if (!allowScrolling) {
            e.preventDefault();
            e.stopPropagation();
            window.scrollTo({
                top: 0,
                behavior: 'instant'
            });
        }
    }
    
    // Add scroll prevention listeners
    window.addEventListener('scroll', preventEarlyScroll, { passive: false });
    window.addEventListener('wheel', preventEarlyScroll, { passive: false });
    window.addEventListener('touchmove', preventEarlyScroll, { passive: false });
    
    // Remove listeners after 30ms
    setTimeout(() => {
        window.removeEventListener('scroll', preventEarlyScroll);
        window.removeEventListener('wheel', preventEarlyScroll);
        window.removeEventListener('touchmove', preventEarlyScroll);
    }, 30);
    
    // Handle smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href*="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Check if it's a same-page anchor link (starts with # or contains index.html#)
            if (href.startsWith('#') || href.includes('index.html#')) {
                
                // Extract the target ID
                let targetId = href.includes('#') ? href.split('#')[1] : '';
                
                // If it's a cross-page link to index.html#, handle differently
                if (href.includes('index.html#') && !window.location.pathname.includes('index.html')) {
                    // Let the browser handle navigation to index.html, smooth scroll will happen there
                    return;
                }
                
                // Handle same-page smooth scrolling
                if (targetId && document.getElementById(targetId)) {
                    e.preventDefault();
                    
                    const targetElement = document.getElementById(targetId);
                    
                    // Add click animation to the button
                    const button = this.querySelector('button');
                    if (button) {
                        button.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            button.style.transform = '';
                        }, 150);
                    }
                    
                    // Smooth scroll to target
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                }
            }
        });
    });
    
    // Handle page transitions for cross-page links
    const pageLinks = document.querySelectorAll('a[href$=".html"], a[href*=".html#"]');
    
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's the current page
            if (href === window.location.pathname || href === './' + window.location.pathname.split('/').pop()) {
                return;
            }
            
            // Add page exit animation
            document.body.classList.add('page-exit');
            
            // Add button click effect
            const button = this.querySelector('button');
            if (button) {
                button.style.transform = 'scale(0.95)';
            }
            
            // Delay navigation to show exit animation
            setTimeout(() => {
                window.location.href = href;
            }, 300);
            
            e.preventDefault();
        });
    });
    
    // Handle smooth scrolling when arriving at a page with hash
    if (window.location.hash) {
        setTimeout(() => {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }
        }, 500); // Wait for page load animation to complete
    } else {
        // Stay at the top - no auto-scroll to header
        // The 30ms protection will keep it at the very top
    }
    
    // Preload all pages for faster navigation
    const pagesToPreload = [
        'index.html',
        'projects.html',
        'roadmap.html',
        'status.html'
    ];
    
    // Function to preload a page
    function preloadPage(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
        
        // Also create a hidden iframe for more aggressive preloading
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.display = 'none';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.onload = () => {
            // Remove iframe after loading to save memory
            setTimeout(() => {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            }, 1000);
        };
        document.body.appendChild(iframe);
    }
    
    // Preload pages after initial page load (delay to not interfere with current page)
    setTimeout(() => {
        pagesToPreload.forEach(page => {
            // Don't preload the current page
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            if (page !== currentPage) {
                preloadPage(page);
            }
        });
    }, 2000); // Wait 2 seconds after page load to start preloading
    
    // Add hover preloading for immediate links
    document.addEventListener('mouseover', function(e) {
        const link = e.target.closest('a[href$=".html"], a[href*=".html#"]');
        if (link && !link.dataset.preloaded) {
            const href = link.getAttribute('href').split('#')[0]; // Remove hash fragment
            link.dataset.preloaded = 'true';
            
            // Create prefetch link
            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = href;
            document.head.appendChild(prefetchLink);
        }
    });
});

// Enhanced button press feedback
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        const button = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
        
        // Create ripple effect
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});