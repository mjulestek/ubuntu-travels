"use strict";

const API_URL = window.API_BASE || "http://localhost:5000";

// Load and display tours
async function loadToursWireframe() {
  const grid = document.getElementById("toursGrid");
  if (!grid) return;

  // Show loading state
  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
      <p style="font-size: 1.6rem; color: #666;">Loading tours...</p>
    </div>
  `;

  try {
    const response = await fetch(`${API_URL}/api/tours`);
    const data = await response.json();

    if (!data.ok || !data.tours || data.tours.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <p style="font-size: 1.6rem; color: #666;">No tours available yet.</p>
        </div>
      `;
      return;
    }

    // Filter approved tours and limit to 9 (3x3 grid)
    const approvedTours = data.tours
      .filter(tour => tour.status === 'approved')
      .slice(0, 9);

    if (approvedTours.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <p style="font-size: 1.6rem; color: #666;">No approved tours available yet.</p>
        </div>
      `;
      return;
    }

    // Render tour cards
    grid.innerHTML = approvedTours.map(tour => createTourCardWireframe(tour)).join('');

  } catch (error) {
    console.error('Error loading tours:', error);
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <p style="font-size: 1.6rem; color: #c62828;">Failed to load tours. Please try again later.</p>
      </div>
    `;
  }
}

// Create a tour card HTML matching wireframe
function createTourCardWireframe(tour) {
  const price = Number(tour.price || 0).toFixed(0);
  const title = escapeHtml(tour.title || 'Tour');
  const description = escapeHtml(tour.description || 'Explore this amazing destination');
  const imageUrl = escapeHtml(tour.imageUrl || './assets/images/destination-1.jpg');
  const slug = tour.slug || '';

  return `
    <a href="./tour.html?slug=${encodeURIComponent(slug)}" class="tour-card-wireframe">
      <div class="tour-card-image-wireframe">
        <img src="${imageUrl}" alt="${title}">
      </div>
      <div class="tour-card-content-wireframe">
        <h3 class="tour-card-title-wireframe">${title}</h3>
        <p class="tour-card-desc-wireframe">${description}</p>
        <div class="tour-card-footer-wireframe">
          <div class="tour-card-price-wireframe">
            <span class="price-from">From</span>$${price}
          </div>
          <span class="tour-card-btn-wireframe">View Tour</span>
        </div>
      </div>
    </a>
  `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load tours when page loads
document.addEventListener('DOMContentLoaded', loadToursWireframe);
