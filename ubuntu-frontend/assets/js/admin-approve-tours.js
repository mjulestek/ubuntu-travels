"use strict";

const statusEl = document.getElementById("status");
const loadBtn = document.getElementById("loadBtn");
const msg = document.getElementById("msg");
const grid = document.getElementById("grid");

function getToken() {
    return localStorage.getItem("AUTH_TOKEN") || "";
}

function headers() {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

function badge(status) {
    const s = String(status || "pending");
    const map = { approved: "✅ APPROVED", pending: "🟡 PENDING", rejected: "❌ REJECTED", draft: "📝 DRAFT" };
    return map[s] || s.toUpperCase();
}

function tourCard(t) {
    const countries = Array.isArray(t.countries) ? t.countries.join(", ") : "";
    const days = Number(t.durationDays || 1);
    const price = Number(t.price || 0).toFixed(2);

    return `
    <div class="popular-card" style="padding:14px;">
      <div style="display:flex; gap:14px; flex-wrap:wrap; align-items:flex-start;">
        <div style="width:280px; max-width:100%; border-radius:12px; overflow:hidden;">
          <img src="${esc(t.imageUrl || "")}" alt="${esc(t.title)}"
               style="width:100%; height:170px; object-fit:cover; background:#ddd;">
        </div>

        <div style="flex:1; min-width:260px;">
          <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
            <div style="font-weight:900;">${esc(t.title || "Tour")}</div>
            <div style="font-weight:900;">${badge(t.status)}</div>
          </div>

          <div style="color: var(--black-coral); margin-top:6px;">
            ${esc(t.location || "")} • ${days} days • $${price}
          </div>

          ${countries ? `<div style="color: var(--battleship-gray); margin-top:6px;">Countries: ${esc(countries)}</div>` : ""}

          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
            <a class="btn btn-outline" href="./tour.html?slug=${encodeURIComponent(t.slug)}" target="_blank">Preview</a>
            <button class="btn btn-primary" data-action="approve" data-id="${t._id}">Approve</button>
            <button class="btn btn-outline" data-action="reject" data-id="${t._id}">Reject</button>
            <button class="btn btn-outline" data-action="draft" data-id="${t._id}">Move to Draft</button>
            <button class="btn btn-outline" data-action="delete" data-id="${t._id}">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadTours() {
    msg.textContent = "";
    grid.innerHTML = "";

    if (!getToken()) {
        msg.innerHTML = `❌ Not logged in. Open <a href="./login.html">login.html</a> first.`;
        return;
    }

    msg.textContent = "Loading tours...";

    const qs = new URLSearchParams();
    if (statusEl.value) qs.set("status", statusEl.value);

    const res = await fetch(`${API_BASE}/api/admin/tours?${qs.toString()}`, { headers: headers() });
    const data = await res.json();

    if (!data.ok) {
        msg.textContent = `❌ ${data.message || "Failed to load tours"}`;
        return;
    }

    msg.textContent = `Loaded ${data.tours.length} tours`;
    grid.innerHTML = data.tours.map(tourCard).join("");
}

async function setStatus(id, status) {
    const res = await fetch(`${API_BASE}/api/admin/tours/${id}/status`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || "Status update failed");
}

async function deleteTour(id) {
    const res = await fetch(`${API_BASE}/api/admin/tours/${id}`, {
        method: "DELETE",
        headers: headers(),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || "Delete failed");
}

grid.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");
    if (!action || !id) return;

    try {
        if (action === "approve") await setStatus(id, "approved");
        if (action === "reject") await setStatus(id, "rejected");
        if (action === "draft") await setStatus(id, "draft");

        if (action === "delete") {
            const ok = confirm("Delete this tour permanently?");
            if (!ok) return;
            await deleteTour(id);
        }

        await loadTours();
    } catch (err) {
        alert(`❌ ${err.message}`);
    }
});

loadBtn.addEventListener("click", loadTours);
loadTours();
