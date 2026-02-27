/**
 * Ubuntu Travels - Global Brand Configuration
 * Centralized branding system for consistent naming and metadata
 */

const BRAND_CONFIG = {
    // Core Brand Identity
    brandName: 'Ubuntu Travels',
    tagline: 'Explore East Africa',
    dashboardTagline: 'GUIDE DASHBOARD',
    
    // Brand Colors
    colors: {
        primary: '#E3702D',      // Ubuntu Orange
        secondary: '#FFF7EB',    // Warm Cream
        white: '#FFFFFF',
        dark: '#1a1a1a'
    },
    
    // Default Meta Information
    defaultDescription: 'Discover authentic East African adventures with verified local guides. Book tours in Rwanda, Uganda, Tanzania, and Kenya.',
    defaultImage: '/assets/images/hero-ubuntu.jpg',
    siteUrl: 'https://ubuntutravels.com',
    
    // Social Media
    social: {
        twitter: '@ubuntutravels',
        facebook: 'ubuntutravels'
    }
};

/**
 * Page Title Configuration
 * Maps routes to page titles following the convention: "Ubuntu Travels | <Page Name>"
 */
const PAGE_TITLES = {
    // Public Pages
    '/': 'Home',
    '/index.html': 'Home',
    '/tours.html': 'Tours',
    '/tour-details.html': 'Tour Details',
    '/all-guides.html': 'Our Vetted Guides',
    '/guide-bio.html': 'Guide Profile',
    '/plan-trip.html': 'Plan Your Trip',
    '/country.html': 'Destinations',
    
    // Authentication
    '/auth.html': 'Sign In',
    '/login.html': 'Login',
    '/auth-modern.html': 'Authentication',
    
    // Guide Pages
    '/guide-dashboard.html': 'Guide Dashboard',
    '/guide-profile.html': 'Edit Profile',
    
    // Admin Pages
    '/admin.html': 'Admin Dashboard',
    '/admin-login.html': 'Admin Login',
    '/admin-bookings.html': 'Manage Bookings',
    '/admin-approve-tours.html': 'Approve Tours',
    
    // Modern Pages
    '/index-modern.html': 'Home',
    '/tours-modern.html': 'Tours'
};

/**
 * Set page title following brand convention
 * @param {string} pageTitle - The specific page title (e.g., "Tours", "Login")
 * @param {string} subtitle - Optional subtitle for dynamic content (e.g., tour name)
 */
function setBrandPageTitle(pageTitle, subtitle = null) {
    let title = `${BRAND_CONFIG.brandName}`;
    
    if (pageTitle) {
        title += ` | ${pageTitle}`;
    }
    
    if (subtitle) {
        title += `: ${subtitle}`;
    }
    
    document.title = title;
}

/**
 * Get page title from current path
 * @returns {string} The page title for current route
 */
function getCurrentPageTitle() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || '/';
    return PAGE_TITLES[`/${filename}`] || PAGE_TITLES[path] || 'Guide Dashboard';
}

/**
 * Set SEO meta tags
 * @param {Object} options - Meta tag options
 */
function setBrandMetaTags(options = {}) {
    const {
        title = getCurrentPageTitle(),
        description = BRAND_CONFIG.defaultDescription,
        image = BRAND_CONFIG.defaultImage,
        type = 'website',
        url = window.location.href
    } = options;
    
    const fullTitle = `${BRAND_CONFIG.brandName} | ${title}`;
    
    // Set document title
    document.title = fullTitle;
    
    // Update or create meta tags
    setMetaTag('description', description);
    
    // Open Graph
    setMetaTag('og:site_name', BRAND_CONFIG.brandName, 'property');
    setMetaTag('og:title', fullTitle, 'property');
    setMetaTag('og:description', description, 'property');
    setMetaTag('og:type', type, 'property');
    setMetaTag('og:url', url, 'property');
    setMetaTag('og:image', image, 'property');
    
    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image', 'name');
    setMetaTag('twitter:site', BRAND_CONFIG.social.twitter, 'name');
    setMetaTag('twitter:title', fullTitle, 'name');
    setMetaTag('twitter:description', description, 'name');
    setMetaTag('twitter:image', image, 'name');
}

/**
 * Helper to set or update a meta tag
 */
function setMetaTag(key, value, attribute = 'name') {
    let element = document.querySelector(`meta[${attribute}="${key}"]`);
    
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }
    
    element.setAttribute('content', value);
}

/**
 * Initialize branding on page load
 */
function initBranding() {
    // Set page title automatically
    const pageTitle = getCurrentPageTitle();
    setBrandPageTitle(pageTitle);
    
    // Set default meta tags
    setBrandMetaTags({ title: pageTitle });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBranding);
} else {
    initBranding();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BRAND_CONFIG, setBrandPageTitle, setBrandMetaTags, getCurrentPageTitle };
}
