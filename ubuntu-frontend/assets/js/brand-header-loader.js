/**
 * Ubuntu Travels - Brand Header Loader
 * Automatically loads the brand header on every page
 */

(function() {
    'use strict';
    
    /**
     * Load brand header HTML
     */
    async function loadBrandHeader() {
        try {
            const response = await fetch('./partials/brand-header.html');
            if (!response.ok) throw new Error('Failed to load brand header');
            
            const html = await response.text();
            
            // Insert at the beginning of body
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Insert before the first child of body
            if (document.body.firstChild) {
                document.body.insertBefore(tempDiv.firstChild, document.body.firstChild);
            } else {
                document.body.appendChild(tempDiv.firstChild);
            }
            
            // Update tagline based on page type
            updateBrandTagline();
            
        } catch (error) {
            console.error('Error loading brand header:', error);
        }
    }
    
    /**
     * Update brand tagline based on current page
     */
    function updateBrandTagline() {
        const taglineElement = document.querySelector('[data-brand-tagline]');
        if (!taglineElement) return;
        
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        // Set tagline based on page type
        if (filename.includes('guide-dashboard') || 
            filename.includes('guide-profile') ||
            filename.includes('admin')) {
            taglineElement.textContent = 'GUIDE DASHBOARD';
        } else {
            taglineElement.textContent = 'Explore East Africa';
        }
    }
    
    /**
     * Check if brand header should be loaded on this page
     */
    function shouldLoadBrandHeader() {
        // Don't load on pages that already have custom headers
        const hasCustomHeader = document.querySelector('[data-no-brand-header]');
        return !hasCustomHeader;
    }
    
    /**
     * Initialize brand header
     */
    function init() {
        if (shouldLoadBrandHeader()) {
            loadBrandHeader();
        }
    }
    
    // Load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
