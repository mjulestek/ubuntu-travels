"use strict";

// ─── Utilities ───────────────────────────────────────────────────────────────
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(amount);
};

const escapeHtml = (s) => {
    return String(s).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
};

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const getSlug = () => {
    const url = new URL(location.href);
    return (url.searchParams.get("slug") || "").trim().toLowerCase();
};

// ─── State ───────────────────────────────────────────────────────────────────
let tour = null;
let activeTab = "Overview";
let bookingForm = {
    fullName: "",
    email: "",
    phone: "",
    travelDate: "",
    guests: 1,
    notes: ""
};

// ─── Render Functions ────────────────────────────────────────────────────────
const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let html = '<span style="display: inline-flex; gap: 2px;">';
    
    for (let i = 0; i < 5; i++) {
        const fill = i < full ? "#E3702D" : (i === full && half ? "url(#half)" : "#e5e7eb");
        html += `<svg width="14" height="14" viewBox="0 0 24 24" fill="${fill}">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>`;
    }
    
    html += '</span>';
    return html;
};

const renderTourHeader = (tour) => {
    const countries = tour.countries && tour.countries.length > 0 
        ? tour.countries.join(", ") 
        : tour.location || "Unknown";
    
    return `
        <div class="hero-image">
            <img src="${escapeHtml(tour.imageUrl || '')}" alt="${escapeHtml(tour.title)}">
        </div>
        
        <div style="margin-top: 24px;">
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
                ${tour.status ? `<span class="chip">${escapeHtml(tour.status)}</span>` : ''}
                <span class="chip">${tour.durationDays} Days</span>
            </div>
            
            <h1 class="title">${escapeHtml(tour.title)}</h1>
            
            <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-bottom: 12px;">
                <span style="display: flex; align-items: center; gap: 6px; color: #6b7280; font-size: 14px;">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                    </svg>
                    <strong style="color: #111827;">${tour.durationDays} days</strong>
                </span>
                <span style="display: flex; align-items: center; gap: 6px; color: #6b7280; font-size: 14px;">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <strong style="color: #111827;">${escapeHtml(countries)}</strong>
                </span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px;">
                ${renderStars(tour.rating || 4.5)}
                <span style="font-weight: 700; color: #111827; font-size: 14px;">${tour.rating || 4.5}</span>
                <span style="color: #6b7280; font-size: 14px;">(${tour.reviewsCount || 0} reviews)</span>
            </div>
        </div>
    `;
};

const renderTabs = () => {
    const tabs = ["Overview", "Itinerary"];
    return `
        <div class="tabs">
            ${tabs.map(tab => `
                <button class="tab ${activeTab === tab ? 'active' : ''}" onclick="switchTab('${tab}')">
                    ${tab}
                </button>
            `).join('')}
        </div>
    `;
};

const renderOverview = (tour) => {
    return `
        <div id="overview-section" style="padding-top: 32px;">
            <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 16px; font-family: 'Playfair Display', Georgia, serif;">
                Overview
            </h2>
            <p style="color: #374151; line-height: 1.7; font-size: 15px; margin-bottom: 14px; white-space: pre-wrap;">
                ${escapeHtml(tour.description || 'No description available.')}
            </p>
        </div>
    `;
};

const renderItinerary = (tour) => {
    const itinerary = tour.itinerary || [];
    
    if (itinerary.length === 0) {
        return `
            <div id="itinerary-section" style="padding-top: 32px;">
                <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif;">
                    Day by Day Itinerary
                </h2>
                <p style="color: #6b7280;">No itinerary available yet.</p>
            </div>
        `;
    }
    
    const sorted = [...itinerary].sort((a, b) => (a.day || 0) - (b.day || 0));
    
    return `
        <div id="itinerary-section" style="padding-top: 32px; padding-bottom: 48px;">
            <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif;">
                Day by Day Itinerary
            </h2>
            <div style="display: grid; gap: 8px;">
                ${sorted.map(day => `
                    <div class="accordion-item" id="day-${day.day}">
                        <button class="accordion-header" onclick="toggleAccordion(${day.day})">
                            <div class="day-badge">D${day.day}</div>
                            <div style="flex: 1;">
                                <div style="font-weight: 700; font-size: 14px; color: #111827;">
                                    ${escapeHtml(day.title || `Day ${day.day}`)}
                                </div>
                                <div style="font-size: 13px; color: #6b7280; margin-top: 2px;">
                                    ${escapeHtml(day.description || '').substring(0, 80)}${day.description && day.description.length > 80 ? '...' : ''}
                                </div>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" style="flex-shrink: 0; transition: transform 0.25s;">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </button>
                        <div class="accordion-content">
                            <p style="font-size: 14px; color: #374151; line-height: 1.6; margin-top: 16px;">
                                ${escapeHtml(day.description || 'No details available.')}
                            </p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

const renderBookingSidebar = (tour) => {
    return `
        <div style="background: white; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
            <!-- Tour Summary -->
            <div style="background: #FFF7EB; padding: 16px; border-bottom: 1px solid #e5e7eb;">
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                    <img src="${escapeHtml(tour.imageUrl || '')}" alt="" style="width: 64px; height: 48px; border-radius: 8px; object-fit: cover; flex-shrink: 0;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 13px; font-weight: 700; color: #111827; line-height: 1.3;">
                            ${escapeHtml(tour.title)}
                        </div>
                        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                            ${tour.durationDays} days · ${escapeHtml(tour.countries ? tour.countries.join(", ") : tour.location || '')}
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 12px;">
                    <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em;">From</div>
                    <div style="font-size: 22px; font-weight: 800; color: #E3702D;">
                        ${formatCurrency(tour.price || 0)}
                    </div>
                </div>
            </div>
            
            <!-- Booking Form -->
            <div style="padding: 20px;">
                <div style="font-size: 13px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6;">
                    Book This Tour
                </div>
                
                <form id="bookingForm" onsubmit="handleBookingSubmit(event)">
                    <div class="form-group">
                        <label class="form-label">Full Name <span style="color: #E3702D;">*</span></label>
                        <input type="text" class="form-input" name="fullName" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Email <span style="color: #E3702D;">*</span></label>
                        <input type="email" class="form-input" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Phone <span style="color: #E3702D;">*</span></label>
                        <input type="tel" class="form-input" name="phone" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Travel Date <span style="color: #E3702D;">*</span></label>
                        <input type="date" class="form-input" name="travelDate" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Number of Guests <span style="color: #E3702D;">*</span></label>
                        <input type="number" class="form-input" name="guests" min="1" max="50" value="1" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Special Requests</label>
                        <textarea class="form-textarea" name="notes" placeholder="Dietary needs, accessibility requirements, etc."></textarea>
                    </div>
                    
                    <button type="submit" class="btn-primary" id="submitBtn">
                        Submit Booking Request
                    </button>
                    
                    <p id="bookingMsg" style="margin-top: 12px; font-size: 13px; text-align: center;"></p>
                    
                    <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 10px; line-height: 1.5;">
                        No payment required now. We'll contact you to confirm availability.
                    </p>
                </form>
            </div>
        </div>
    `;
};

const renderLoading = () => {
    document.getElementById('mainContent').innerHTML = `
        <div class="skeleton" style="height: 340px; margin-bottom: 24px;"></div>
        <div class="skeleton" style="height: 40px; width: 80%; margin-bottom: 12px;"></div>
        <div class="skeleton" style="height: 20px; width: 50%; margin-bottom: 32px;"></div>
    `;
    
    document.getElementById('sidebar').innerHTML = `
        <div style="background: white; border-radius: 16px; border: 1px solid #e5e7eb; padding: 20px;">
            <div class="skeleton" style="height: 100px; margin-bottom: 16px;"></div>
            <div class="skeleton" style="height: 44px; margin-bottom: 10px;"></div>
            <div class="skeleton" style="height: 44px; margin-bottom: 10px;"></div>
            <div class="skeleton" style="height: 52px;"></div>
        </div>
    `;
};

const renderError = (message) => {
    document.getElementById('mainContent').innerHTML = `
        <div style="padding: 48px; text-align: center; background: white; border-radius: 16px; border: 1px solid #e5e7eb;">
            <div style="font-size: 40px; margin-bottom: 16px;">⚠️</div>
            <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Failed to load tour</h3>
            <p style="color: #6b7280; margin-bottom: 20px;">${escapeHtml(message)}</p>
            <button onclick="loadTour()" style="padding: 12px 24px; border-radius: 10px; background: #E3702D; color: white; border: none; cursor: pointer; font-weight: 600;">
                Try Again
            </button>
        </div>
    `;
};

// ─── Event Handlers ──────────────────────────────────────────────────────────
window.switchTab = (tab) => {
    activeTab = tab;
    renderTour();
    
    // Scroll to section
    const section = document.getElementById(`${tab.toLowerCase()}-section`);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

window.toggleAccordion = (day) => {
    const item = document.getElementById(`day-${day}`);
    if (item) {
        item.classList.toggle('open');
    }
};

window.handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');
    const msg = document.getElementById('bookingMsg');
    
    msg.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    const payload = {
        tourId: tour._id,
        fullName: form.fullName.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        travelDate: form.travelDate.value,
        guests: Number(form.guests.value),
        notes: form.notes.value.trim()
    };
    
    try {
        const res = await fetch(`${API_BASE}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        if (!data.ok) {
            throw new Error(data.message || 'Booking failed');
        }
        
        msg.style.color = '#10b981';
        msg.textContent = `✅ Booking request submitted! We'll contact you soon.`;
        form.reset();
        form.guests.value = 1;
        
    } catch (err) {
        msg.style.color = '#ef4444';
        msg.textContent = `❌ ${err.message}`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Booking Request';
    }
};

// ─── Main Render ─────────────────────────────────────────────────────────────
const renderTour = () => {
    if (!tour) return;
    
    document.getElementById('breadcrumbCountry').textContent = 
        tour.countries && tour.countries.length > 0 ? tour.countries[0] : 'Tour';
    
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        ${renderTourHeader(tour)}
        ${renderTabs()}
        ${renderOverview(tour)}
        ${renderItinerary(tour)}
    `;
    
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = renderBookingSidebar(tour);
};

// ─── Load Tour ───────────────────────────────────────────────────────────────
const loadTour = async () => {
    const slug = getSlug();
    
    if (!slug) {
        renderError('Missing tour slug. Please select a tour from the tours page.');
        return;
    }
    
    renderLoading();
    
    try {
        const res = await fetch(`${API_BASE}/api/tours/slug/${encodeURIComponent(slug)}`);
        const data = await res.json();
        
        if (!data.ok) {
            throw new Error(data.message || 'Tour not found');
        }
        
        tour = data.tour;
        renderTour();
        
    } catch (err) {
        renderError(err.message || 'Failed to load tour');
    }
};

// ─── Initialize ──────────────────────────────────────────────────────────────
loadTour();
