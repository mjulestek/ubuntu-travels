"use strict";

/**
 * IMPORTANT:
 * - We DO NOT declare `const API_BASE = "...";` here anymore,
 *   because other files (newsletter.js etc.) may declare it too.
 * - Instead we reuse a shared global: window.API_BASE
 */
const BASE = window.API_BASE || "http://localhost:5000";

const countries = [
    { name: "Rwanda", img: "./assets/images/destination-4.jpg", sub: "Volcanoes, gorillas, lakes" },
    { name: "Uganda", img: "./assets/images/destination-3.jpg", sub: "Nature, chimp trekking" },
    { name: "Tanzania", img: "./assets/images/destination-5.jpg", sub: "Safari & Zanzibar beaches" },
    { name: "Kenya", img: "./assets/images/destination-2.jpg", sub: "Masai Mara & culture" },
];

function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[c]));
}

function money(n) {
    return `$${Number(n || 0).toFixed(2)}`;
}

function tourCard(t) {
    const days = Number(t.durationDays || 1);
    const reviews = Number(t.reviewsCount || 0);

    return `
    <li>
      <a href="./tour.html?slug=${encodeURIComponent(t.slug)}" style="text-decoration: none; display: block; height: 100%;">
        <div class="popular-card" style="cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; height: 100%;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='';">
          <figure class="card-banner">
            <img src="${esc(t.imageUrl || "")}" width="740" height="518" loading="lazy"
              alt="${esc(t.title)}" class="img-cover">
            <span class="card-badge">
              <ion-icon name="time-outline"></ion-icon>
              <time datetime="P${days}D">${days} Days</time>
            </span>
          </figure>

          <div class="card-content">
            <h3 class="card-title" style="color: inherit;">
              ${esc(t.title)}
            </h3>

            <p class="card-text" style="color: var(--battleship-gray); font-size: 1.4rem; line-height: 1.6; margin-top: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
              ${esc(t.description || 'Explore this amazing destination with our expert guides.')}
            </p>

            <address class="card-location">${esc(t.location || "")}</address>

            <div style="margin-top: 12px; text-align: right; font-weight: 700; color: #E3702D; line-height: 1;">
              <span style="font-size: 1.4rem;">From</span> <span style="font-size: 2rem;">$${money(t.price)}</span>
            </div>

            <span class="btn btn-primary" style="width: 100%; margin-top: 8px; text-align: center; padding: 4px; font-size: 1.3rem; display: block;">
              View Tour
            </span>
          </div>
        </div>
      </a>
    </li>
  `;
}

async function loadHomeTours() {
    const list = document.getElementById("homeTours");
    if (!list) return;

    list.innerHTML = `<li style="color: var(--black-coral); padding: 40px; text-align: center;">
        <ion-icon name="hourglass-outline" style="font-size: 4rem; color: var(--viridian-green);"></ion-icon>
        <p style="margin-top: 10px; font-size: 1.6rem;">Loading tours...</p>
    </li>`;

    try {
        const res = await fetch(`${BASE}/api/tours`);
        const data = await res.json();

        if (!data || !data.ok) {
            throw new Error(data.message || "Failed to load tours");
        }

        let tours = Array.isArray(data.tours) ? data.tours : [];

        // Keep only approved tours
        tours = tours.filter((t) => t && t.status === "approved");

        if (tours.length === 0) {
            list.innerHTML = `
                <li style="grid-column: 1/-1; padding: 60px 20px; text-align: center;">
                    <ion-icon name="map-outline" style="font-size: 6rem; color: var(--viridian-green); opacity: 0.5;"></ion-icon>
                    <h3 style="margin-top: 20px; font-size: 2.4rem; color: var(--black-coral);">No Tours Available Yet</h3>
                    <p style="margin-top: 10px; font-size: 1.6rem; color: var(--battleship-gray);">
                        Tour guides are creating amazing experiences. Check back soon!
                    </p>
                    <a href="./auth.html?role=guide" class="btn btn-primary" style="margin-top: 20px; display: inline-block;">
                        Become a Tour Guide
                    </a>
                </li>
            `;
            return;
        }

        // Show up to 6 tours
        const displayTours = tours.slice(0, 6);
        list.innerHTML = displayTours.map(tourCard).join("");
        
        console.log(`✅ Loaded ${displayTours.length} approved tours from database`);
    } catch (err) {
        console.error("Error loading tours:", err);
        list.innerHTML = `
            <li style="grid-column: 1/-1; padding: 60px 20px; text-align: center;">
                <ion-icon name="alert-circle-outline" style="font-size: 6rem; color: #ff4444; opacity: 0.5;"></ion-icon>
                <h3 style="margin-top: 20px; font-size: 2.4rem; color: var(--black-coral);">Unable to Load Tours</h3>
                <p style="margin-top: 10px; font-size: 1.6rem; color: var(--battleship-gray);">
                    ${err.message || "Please check your connection and try again."}
                </p>
                <button onclick="loadHomeTours()" class="btn btn-primary" style="margin-top: 20px;">
                    Try Again
                </button>
            </li>
        `;
    }
}

function setupProfileDropdown() {
    const profile = document.querySelector(".profile");
    const btn = document.querySelector(".profile-btn");
    const menu = document.querySelector(".profile-menu");
    if (!profile || !btn || !menu) return;

    // Toggle on click
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        profile.classList.toggle("open");
        btn.setAttribute("aria-expanded", profile.classList.contains("open") ? "true" : "false");
    });

    // Close if clicked outside
    document.addEventListener("click", () => {
        profile.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
    });

    // Prevent inside clicks from closing
    menu.addEventListener("click", (e) => e.stopPropagation());

    // Close on ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            profile.classList.remove("open");
            btn.setAttribute("aria-expanded", "false");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupProfileDropdown();
    loadHomeTours();
});

