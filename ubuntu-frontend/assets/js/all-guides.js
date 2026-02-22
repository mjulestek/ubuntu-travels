"use strict";

let allGuides = [];
let filteredGuides = [];

const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState');
const guidesCount = document.getElementById('guidesCount');
const filtersSection = document.getElementById('filtersSection');
const allGuidesGrid = document.getElementById('allGuidesGrid');
const countNumber = document.getElementById('countNumber');

const filterCountry = document.getElementById('filterCountry');
const filterSpecialization = document.getElementById('filterSpecialization');
const filterLanguage = document.getElementById('filterLanguage');

// Fetch all guides (no limit)
async function loadAllGuides() {
    try {
        const res = await fetch(`${API_BASE}/api/guides`);
        const json = await res.json();
        
        loadingState.style.display = 'none';
        
        if (!res.ok || !json.success) {
            throw new Error(json.message || 'Failed to load guides');
        }
        
        allGuides = json.data;
        filteredGuides = [...allGuides];
        
        if (allGuides.length === 0) {
            emptyState.style.display = 'block';
            emptyState.querySelector('p').textContent = 'No verified guides available yet. Check back soon!';
            return;
        }
        
        // Show count and filters
        guidesCount.style.display = 'block';
        filtersSection.style.display = 'block';
        countNumber.textContent = allGuides.length;
        
        // Render guides
        renderGuides();
        
    } catch (err) {
        console.error('Error loading guides:', err);
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
    }
}

// Render guides grid
function renderGuides() {
    if (filteredGuides.length === 0) {
        allGuidesGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    allGuidesGrid.style.display = 'grid';
    
    allGuidesGrid.innerHTML = filteredGuides.map(guide => `
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
}

// Apply filters
function applyFilters() {
    const country = filterCountry.value.toLowerCase();
    const specialization = filterSpecialization.value;
    const language = filterLanguage.value;
    
    filteredGuides = allGuides.filter(guide => {
        // Country filter
        if (country && guide.country && !guide.country.toLowerCase().includes(country)) {
            return false;
        }
        
        // Specialization filter
        if (specialization && guide.specializations) {
            if (!guide.specializations.includes(specialization)) {
                return false;
            }
        }
        
        // Language filter
        if (language && guide.languages) {
            if (!guide.languages.includes(language)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Update count
    countNumber.textContent = filteredGuides.length;
    
    renderGuides();
}

// Reset filters
function resetFilters() {
    filterCountry.value = '';
    filterSpecialization.value = '';
    filterLanguage.value = '';
    filteredGuides = [...allGuides];
    renderGuides();
}

// Event listeners
filterCountry.addEventListener('change', applyFilters);
filterSpecialization.addEventListener('change', applyFilters);
filterLanguage.addEventListener('change', applyFilters);

// Make resetFilters available globally
window.resetFilters = resetFilters;

// Initialize
document.addEventListener('DOMContentLoaded', loadAllGuides);
