"use strict";

const titleEl = document.getElementById("tourTitle");
const subtitleEl = document.getElementById("tourSubtitle");
const metaEl = document.getElementById("tourMeta");
const imgEl = document.getElementById("tourImg");
const descEl = document.getElementById("tourDesc");
const itineraryEl = document.getElementById("itinerary");
const priceEl = document.getElementById("tourPrice");

const form = document.getElementById("bookingForm");
const msg = document.getElementById("msg");

let tourId = null;
let tourTitle = "";

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
}

function getSlug() {
    const url = new URL(location.href);
    return (url.searchParams.get("slug") || "").trim().toLowerCase();
}

function renderItinerary(items) {
    itineraryEl.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {
        itineraryEl.innerHTML = `<p style="color: var(--black-coral);">No itinerary added yet.</p>`;
        return;
    }

    const sorted = [...items].sort((a, b) => (a.day || 0) - (b.day || 0));

    itineraryEl.innerHTML = sorted.map((d) => `
    <div class="popular-card" style="padding:12px;">
      <div style="font-weight:800;">Day ${d.day || ""}: ${escapeHtml(d.title || "")}</div>
      <div style="color: var(--battleship-gray); margin-top:6px; line-height:1.7;">
        ${escapeHtml(d.description || "")}
      </div>
    </div>
  `).join("");
}

async function loadTour() {
    const slug = getSlug();

    if (!slug) {
        titleEl.textContent = "Missing tour slug";
        subtitleEl.textContent = "Open this page from a tour card.";
        return;
    }

    titleEl.textContent = "Loading...";
    msg.textContent = "";

    const res = await fetch(`${API_BASE}/api/tours/slug/${encodeURIComponent(slug)}`);
    const data = await res.json();

    if (!data.ok) {
        titleEl.textContent = "Tour not found";
        subtitleEl.textContent = "This tour may not be approved yet.";
        return;
    }

    const t = data.tour;

    tourId = t._id;
    tourTitle = t.title || "";

    subtitleEl.textContent = t.subtitle || "Tour details";
    titleEl.textContent = t.title || "Tour";

    metaEl.textContent = `${t.location || ""} • ${t.durationDays || 1} days`;

    imgEl.src = t.imageUrl || "";
    imgEl.alt = t.title || "Tour image";

    descEl.textContent = t.description || "No description yet.";
    priceEl.textContent = `$${Number(t.price || 0).toFixed(2)}`;

    renderItinerary(t.itinerary || []);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    if (!tourId) {
        msg.textContent = "❌ Tour not loaded yet.";
        return;
    }

    const payload = {
        tourId,
        fullName: form.fullName.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        travelDate: form.travelDate.value,
        guests: Number(form.guests.value),
        notes: form.notes.value.trim(),
    };

    try {
        const res = await fetch(`${API_BASE}/api/bookings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!data.ok) throw new Error(data.message || "Booking failed");

        msg.textContent = `✅ Booking request sent for "${tourTitle}". Status: ${data.booking.status}`;
        form.reset();
        form.guests.value = 1;
    } catch (err) {
        msg.textContent = `❌ ${err.message}`;
    }
});

loadTour();
