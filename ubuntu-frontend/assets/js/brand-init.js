/**
 * Ubuntu Travels - Master Branding Initialization
 * This script must be included on EVERY page to ensure consistent branding
 * 
 * Usage: <script src="./assets/js/brand-init.js"></script>
 */

(function() {
    'use strict';
    
    // Brand Configuration
    const BRAND = {
        name: 'Ubuntu Travels',
        taglinePublic: 'Explore East Africa',
        taglineDashboard: 'GUIDE DASHBOARD',
        color: '#E3702D',
        description: 'Discover authentic East African adventures with verified local guides.',
        siteUrl: 'https://ubuntutravels.com'
    };
    
    // Page Title Mapping
    const PAGE_TITLES = {
        'index.html': 'Home',
        'tours.html': 'Tours',
        'tour-details.html': 'Tour Details',
        'all-guides.html': 'Our Vetted Guides',
        'guide-bio.html': 'Guide Profile',
        'plan-trip.html': 'Plan Your Trip',
        'country.html': 'Destinations',
        'auth.html': 'Sign In',
        'login.html': 'Login',
        'guide-dashboard.html': 'Guide Dashboard',
        'guide-profile.html': 'Edit Profile',
        'admin.html': 'Admin Dashboard',
        'admin-login.html': 'Admin Login',
        'admin-bookings.html': 'Manage Bookings',
        'admin-approve-tours.html': 'Approve Tours'
    };
    
    /**
     * Get current page filename
     */
    function getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename === '' ? 'index.html' : filename;
    }
    
    /**
     * Get page title for current page
     */
    function getPageTitle() {
        const filename = getCurrentPage();
        return PAGE_TITLES[filename] || 'Guide Dashboard';
    }
    
    /**
     * Set page title following brand convention
     */
    function setBrandTitle(customTitle = null, subtitle = null) {
        const pageTitle = customTitle || getPageTitle();
        let title = `${BRAND.name} | ${pageTitle}`;
        
        if (subtitle) {
            title += `: ${subtitle}`;
        }
        
        document.title = title;
        return title;
    }
    
    /**
     * Set all SEO meta tags
     */
    function setMetaTags(options = {}) {
        const pageTitle = options.title || getPageTitle();
        const fullTitle = `${BRAND.name} | ${pageTitle}`;
        const description = options.description || BRAND.description;
        const image = options.image || `${BRAND.siteUrl}/assets/images/hero-ubuntu.jpg`;
        const url = options.url || window.location.href;
        
        // Set document title
        document.title = fullTitle;
        
        // Description
        setMeta('description', description);
        
        // Open Graph
        setMeta('og:site_name', BRAND.name, 'property');
        setMeta('og:title', fullTitle, 'property');
        setMeta('og:description', description, 'property');
        setMeta('og:type', 'website', 'property');
        setMeta('og:url', url, 'property');
        setMeta('og:image', image, 'property');
        
        // Twitter
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', fullTitle);
        setMeta('twitter:description', description);
        setMeta('twitter:image', image);
    }
    
    /**
     * Helper to set/update meta tag
     */
    function setMeta(key, value, attr = 'name') {
        let meta = document.querySelector(`meta[${attr}="${key}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attr, key);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', value);
    }
    
    /**
     * Inject brand header HTML
     */
    function injectBrandHeader() {
        // Check if page already has brand header
        if (document.querySelector('[data-brand-header]')) return;
        
        // Determine tagline based on page type
        const filename = getCurrentPage();
        const isDashboard = filename.includes('guide-') || filename.includes('admin');
        const tagline = isDashboard ? BRAND.taglineDashboard : BRAND.taglinePublic;
        
        const headerHTML = `
            <div class="ubuntu-brand-header" data-brand-header>
                <div class="ubuntu-brand-container">
                    <a href="./index.html" class="ubuntu-brand-logo" aria-label="Ubuntu Travels Home">
                        <ion-icon name="paw-outline" class="ubuntu-brand-icon"></ion-icon>
                        <div class="ubuntu-brand-text">
                            <span class="ubuntu-brand-name">Ubuntu Travels</span>
                            <span class="ubuntu-brand-tagline">${tagline}</span>
                        </div>
                    </a>
                </div>
            </div>
        `;
        
        // Insert at beginning of body
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
        
        // Inject styles if not already present
        if (!document.querySelector('#ubuntu-brand-styles')) {
            injectBrandStyles();
        }
    }
    
    /**
     * Inject brand header styles
     */
    function injectBrandStyles() {
        const styles = `
            <style id="ubuntu-brand-styles">
                .ubuntu-brand-header {
                    background: ${BRAND.color};
                    padding: 20px 0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    position: sticky;
                    top: 0;
                    z-index: 9999;
                }
                
                .ubuntu-brand-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                
                .ubuntu-brand-logo {
                    display: inline-flex;
                    align-items: center;
                    gap: 15px;
                    text-decoration: none;
                    transition: opacity 0.3s ease;
                }
                
                .ubuntu-brand-logo:hover {
                    opacity: 0.9;
                }
                
                .ubuntu-brand-icon {
                    font-size: 48px;
                    color: #FFD700;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
                }
                
                .ubuntu-brand-text {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                
                .ubuntu-brand-name {
                    font-size: 32px;
                    font-weight: 700;
                    color: white;
                    font-family: 'Poppins', 'Heebo', sans-serif;
                    letter-spacing: -0.5px;
                    line-height: 1;
                }
                
                .ubuntu-brand-tagline {
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.95);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    line-height: 1;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .ubuntu-brand-header {
                        padding: 15px 0;
                    }
                    
                    .ubuntu-brand-icon {
                        font-size: 40px;
                    }
                    
                    .ubuntu-brand-name {
                        font-size: 26px;
                    }
                    
                    .ubuntu-brand-tagline {
                        font-size: 11px;
                        letter-spacing: 1.5px;
                    }
                }
                
                @media (max-width: 480px) {
                    .ubuntu-brand-logo {
                        gap: 12px;
                    }
                    
                    .ubuntu-brand-icon {
                        font-size: 36px;
                    }
                    
                    .ubuntu-brand-name {
                        font-size: 22px;
                    }
                    
                    .ubuntu-brand-tagline {
                        font-size: 10px;
                        letter-spacing: 1px;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    /**
     * Initialize branding system
     */
    function init() {
        // Set page title and meta tags
        setMetaTags();
        
        // Inject brand header
        injectBrandHeader();
    }
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export functions for manual use
    window.UbuntuBrand = {
        setTitle: setBrandTitle,
        setMeta: setMetaTags,
        config: BRAND
    };
    
})();
