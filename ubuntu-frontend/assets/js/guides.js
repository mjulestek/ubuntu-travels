// guides.js — Homepage guide section
"use strict";

const PLACEHOLDER_IMG = './assets/images/author-avatar.png';

async function loadVerifiedGuides() {
    const grid = document.getElementById('guidesGrid');
    const loading = document.getElementById('guidesLoading');
    const error = document.getElementById('guidesError');
    const empty = document.getElementById('guidesEmpty');
    
    if (!grid) return; // not on homepage, exit silently
    
    try {
        const res = await fetch(`${API_BASE}/api/guides?limit=8`);
        const json = await res.json();
        
        loading.style.display = 'none';
        
        if (!res.ok || !json.success) throw new Error(json.message);
        
        const guides = json.data;
        
        if (!guides.length) {
            empty.style.display = 'block';
            empty.innerHTML = `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                <p>No verified guides available yet. Check back soon.</p>
            `;
            return;
        }
        
        grid.style.display = 'grid';
        grid.innerHTML = guides.map(guide => `
            <a href="./guide-bio.html?slug=${guide.slug}" class="guide-card">
                ${guide.photo_url 
                    ? `<img class="card-image" src="${guide.photo_url}" alt="${guide.full_name}" loading="lazy">`
                    : `<div class="card-image-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                        </svg>
                    </div>`
                }
                <div class="card-body">
                    <div class="card-name">${guide.full_name}</div>
                    <div class="card-intro">${guide.short_intro || 'Local tour guide'}</div>
                    <span class="card-btn">Read my Bio</span>
                </div>
            </a>
        `).join('');
        
        // Show "View All" button if there are guides
        const viewAllBtn = document.getElementById('guidesViewAll');
        if (viewAllBtn) {
            viewAllBtn.style.display = 'block';
        }
        
    } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        console.error('Guides load error:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadVerifiedGuides);
