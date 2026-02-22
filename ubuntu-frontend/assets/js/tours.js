"use strict";

const API_BASE = "http://localhost:5000";

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

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
            <span class="price-from">From</span> $${price}
          </div>
          <span class="tour-card-btn-wireframe">View Tour</span>
        </div>
      </div>
    </a>
  `;
}

async function loadTours() {
    const list = document.getElementById("toursList");
    const msg = document.getElementById("toursMsg");

    list.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <p style="font-size: 1.6rem; color: #666;">Loading tours...</p>
      </div>
    `;

    try {
        const res = await fetch(`${API_BASE}/api/tours`);
        const data = await res.json();

        if (!data.ok) throw new Error(data.message || "Failed to load tours");

        const approvedTours = data.tours.filter(t => t.status === 'approved');

        if (approvedTours.length === 0) {
          list.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
              <p style="font-size: 1.6rem; color: #666;">No approved tours available yet.</p>
            </div>
          `;
          return;
        }

        list.innerHTML = approvedTours.map(t => createTourCardWireframe(t)).join("");
        msg.textContent = "";
    } catch (err) {
        msg.textContent = `❌ ${err.message}`;
        msg.style.color = "#c62828";
    }
}

loadTours();
