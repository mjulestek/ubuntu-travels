"use strict";

// Admin dashboard utilities: list guides, approve/ban/delete, view their tours, manage tours, view bookings
// Requires ADMIN_JWT set (admin-auth.js stores it in localStorage)

const API_BASE = window.API_BASE || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("ADMIN_JWT") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function fetchGuides() {
  const res = await fetch(`${API_BASE}/api/admin/guides`, { headers: authHeaders() });
  return res.json();
}

async function fetchGuideTours(guideId) {
  const res = await fetch(`${API_BASE}/api/admin/guides/${guideId}/tours`, { headers: authHeaders() });
  return res.json();
}

async function updateGuide(guideId, payload) {
  const res = await fetch(`${API_BASE}/api/admin/guides/${guideId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function deleteGuide(guideId) {
  const res = await fetch(`${API_BASE}/api/admin/guides/${guideId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

async function fetchAllTours() {
  const res = await fetch(`${API_BASE}/api/tours/admin/all`, { headers: authHeaders() });
  return res.json();
}

async function adminDeleteTour(tourId) {
  const res = await fetch(`${API_BASE}/api/tours/admin/${tourId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

async function updateTourStatus(tourId, status) {
  const res = await fetch(`${API_BASE}/api/tours/admin/${tourId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
}

async function fetchAllBookings() {
  const res = await fetch(`${API_BASE}/api/bookings/admin`, { headers: authHeaders() });
  return res.json();
}

// Small DOM helpers
function el(tag, cls, inner) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (inner !== undefined) e.innerHTML = inner;
  return e;
}

// Render guides area
async function renderGuides() {
  const container = document.getElementById("adminGuides");
  if (!container) return;
  container.innerHTML = "Loading guides...";
  try {
    const data = await fetchGuides();
    if (!data.ok) throw new Error(data.message || "Failed to load guides");

    container.innerHTML = "";
    data.guides.forEach((g) => {
      const card = el("div", "popular-card", `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${g.fullName || "(no name)"}</strong><br/>
            <small>${g.email}</small><br/>
            <small>Approved: ${g.isApproved ? "yes" : "no"} &nbsp; Banned: ${g.isBanned ? "yes" : "no"}</small>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline" data-action="approve" data-id="${g._id}">Approve</button>
            <button class="btn btn-outline" data-action="ban" data-id="${g._id}">Ban</button>
            <button class="btn btn-primary" data-action="viewTours" data-id="${g._id}">View Tours</button>
            <button class="btn btn-danger" data-action="delete" data-id="${g._id}">Delete Guide</button>
          </div>
        </div>
      `);

      // attach listeners
      card.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", async (ev) => {
          const act = btn.getAttribute("data-action");
          const id = btn.getAttribute("data-id");
          if (act === "approve") {
            await updateGuide(id, { isApproved: true });
            await renderGuides();
          } else if (act === "ban") {
            await updateGuide(id, { isBanned: true });
            await renderGuides();
          } else if (act === "delete") {
            if (!confirm("Delete guide and all their tours?")) return;
            await deleteGuide(id);
            await renderGuides();
          } else if (act === "viewTours") {
            const toursArea = document.getElementById("guideTours");
            toursArea.innerHTML = "Loading...";
            const toursRes = await fetchGuideTours(id);
            if (!toursRes.ok) { toursArea.textContent = "Failed to load tours"; return; }
            toursArea.innerHTML = "";
            toursRes.tours.forEach((t) => {
              const tdiv = el("div", "popular-card", `
                <div style=\"display:flex; justify-content:space-between; align-items:center;\"> 
                  <div> <strong>${t.title}</strong><br/><small>${t.slug} • ${t.location}</small> </div>
                  <div style=\"display:flex; gap:8px;\"> 
                    <button class=\"btn btn-outline\" data-act=\"status\" data-id=\"${t._id}\">Status: ${t.status}</button>
                    <button class=\"btn btn-primary\" data-act=\"approve\" data-id=\"${t._id}\">Approve</button>
                    <button class=\"btn btn-danger\" data-act=\"delete\" data-id=\"${t._id}\">Delete</button>
                  </div>
                </div>
              `);

              tdiv.querySelectorAll("button").forEach((b) => {
                b.addEventListener("click", async () => {
                  const a = b.getAttribute("data-act");
                  const idt = b.getAttribute("data-id");
                  if (a === "approve") {
                    await updateTourStatus(idt, "approved");
                    b.textContent = "Approved";
                    await renderGuides();
                  } else if (a === "delete") {
                    if (!confirm("Delete this tour?")) return;
                    await adminDeleteTour(idt);
                    await renderGuides();
                    tdiv.remove();
                  }
                });
              });

              toursArea.appendChild(tdiv);
            });
          }
        });
      });

      container.appendChild(card);
    });
  } catch (err) {
    container.textContent = "Error loading guides";
    console.error(err);
  }
}

// Render all tours admin area
async function renderAllTours() {
  const container = document.getElementById("adminTours");
  if (!container) return;
  container.innerHTML = "Loading tours...";
  try {
    const data = await fetchAllTours();
    if (!data.ok) throw new Error(data.message || "Failed to load tours");
    container.innerHTML = "";

    data.tours.forEach((t) => {
      const row = el("div", "popular-card", `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${t.title}</strong><br/>
            <small>${t.slug} • ${t.location}</small>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline" data-act="status" data-id="${t._id}">Status: ${t.status}</button>
            <button class="btn btn-primary" data-act="approve" data-id="${t._id}">Approve</button>
            <button class="btn btn-danger" data-act="delete" data-id="${t._id}">Delete</button>
          </div>
        </div>
      `);

      row.querySelectorAll("button").forEach((b) => {
        b.addEventListener("click", async () => {
          const a = b.getAttribute("data-act");
          const id = b.getAttribute("data-id");
          if (a === "approve") {
            await updateTourStatus(id, "approved");
            await renderAllTours();
          } else if (a === "delete") {
            if (!confirm("Delete this tour?")) return;
            await adminDeleteTour(id);
            await renderAllTours();
          }
        });
      });

      container.appendChild(row);
    });
  } catch (err) {
    container.textContent = "Error loading tours";
    console.error(err);
  }
}

// Render bookings
async function renderBookings() {
  const container = document.getElementById("adminBookings");
  if (!container) return;
  container.innerHTML = "Loading bookings...";
  try {
    const data = await fetchAllBookings();
    if (!data.ok) throw new Error(data.message || "Failed to load bookings");
    container.innerHTML = "";

    data.bookings.forEach((b) => {
      const row = el("div", "popular-card", `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${b.fullName}</strong> — <small>${b.email}</small><br/>
            <small>Tour: ${b.tourId || b.tourTitle || "(unknown)"} • Date: ${b.travelDate}</small>
          </div>
          <div>
            <small>Status: ${b.status}</small>
          </div>
        </div>
      `);
      container.appendChild(row);
    });
  } catch (err) {
    container.textContent = "Error loading bookings";
    console.error(err);
  }
}

// Init admin dashboard UI
document.addEventListener("DOMContentLoaded", () => {
  // Logout handler
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => { 
      localStorage.removeItem("ADMIN_JWT");
      localStorage.removeItem("AUTH_TOKEN"); // Also clear regular auth token
      location.href = "admin-login.html";
    });
  }

  renderGuides();
  renderAllTours();
  renderBookings();
});

// Create Admin Form Handler
const createAdminForm = document.getElementById("createAdminForm");
if (createAdminForm) {
  createAdminForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const msg = document.getElementById("createAdminMsg");
    msg.textContent = "";
    
    const formData = new FormData(createAdminForm);
    const payload = {
      firstName: formData.get("firstName").trim(),
      lastName: formData.get("lastName").trim(),
      email: formData.get("email").trim().toLowerCase(),
      password: formData.get("password"),
      phone: formData.get("phone").trim(),
      country: formData.get("country"),
      role: "admin"
    };
    
    // Email validation
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(payload.email)) {
      msg.textContent = "❌ Please enter a valid email address";
      msg.style.color = "#ff4444";
      return;
    }
    
    // Password validation
    if (payload.password.length < 8) {
      msg.textContent = "❌ Password must be at least 8 characters long";
      msg.style.color = "#ff4444";
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/create-admin`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!data.ok) throw new Error(data.message || "Failed to create admin");
      
      msg.textContent = "✅ Admin account created successfully!";
      msg.style.color = "#00c853";
      
      // Reset form
      createAdminForm.reset();
      
      // Reload stats
      if (typeof loadStats === 'function') {
        setTimeout(() => loadStats(), 500);
      }
    } catch (err) {
      msg.textContent = `❌ ${err.message}`;
      msg.style.color = "#ff4444";
    }
  });
}
