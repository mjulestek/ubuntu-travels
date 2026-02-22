"use strict";

(async () => {
    const ok = await requireLoginOrRedirect();
    if (!ok) return;

    document.getElementById("logoutBtn").addEventListener("click", logout);

    const q = document.getElementById("q");
    const statusEl = document.getElementById("status");
    const loadBtn = document.getElementById("loadBtn");
    const msg = document.getElementById("msg");
    const rows = document.getElementById("rows");

    function fmtDate(d) {
        try { return new Date(d).toISOString().slice(0, 10); } catch { return ""; }
    }

    function mailto(email, name, tour) {
        const subject = encodeURIComponent(`Your booking: ${tour}`);
        const body = encodeURIComponent(`Hi ${name},\n\nThanks for booking ${tour}.\n\nBest regards,\nTourest Team`);
        return `mailto:${email}?subject=${subject}&body=${body}`;
    }

    async function loadBookings() {
        msg.textContent = "";
        rows.innerHTML = "";

        const qs = new URLSearchParams();
        if (q.value.trim()) qs.set("q", q.value.trim());
        if (statusEl.value) qs.set("status", statusEl.value);

        const res = await fetch(`${API_BASE}/api/bookings?${qs.toString()}`, {
            headers: authHeaders(),
        });
        const data = await res.json();

        if (!data.ok) {
            msg.textContent = `❌ ${data.message || "Failed to load bookings"}`;
            return;
        }

        msg.textContent = `Loaded ${data.bookings.length} bookings`;

        rows.innerHTML = data.bookings.map(b => `
      <tr style="border-bottom:1px solid hsla(0,0%,0%,0.08);">
        <td style="padding:10px;">
          <div style="font-weight:700;">${b.fullName}</div>
          <div style="color:#666;">${b.email}</div>
          <div style="color:#666;">${b.phone}</div>
        </td>
        <td style="padding:10px;">${b.tourName}</td>
        <td style="padding:10px;">${fmtDate(b.travelDate)}</td>
        <td style="padding:10px;">${b.guests}</td>
        <td style="padding:10px; font-weight:700;">${b.status}</td>
        <td style="padding:10px; display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-outline" data-status="confirmed" data-id="${b._id}">Confirm</button>
          <button class="btn btn-outline" data-status="cancelled" data-id="${b._id}">Cancel</button>
          <a class="btn btn-outline" href="${mailto(b.email, b.fullName, b.tourName)}">Email</a>
          <button class="btn btn-outline" data-del="1" data-id="${b._id}">Delete</button>
        </td>
      </tr>
    `).join("");
    }

    rows.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        const id = btn.getAttribute("data-id");

        const newStatus = btn.getAttribute("data-status");
        if (newStatus) {
            const res = await fetch(`${API_BASE}/api/bookings/${id}/status`, {
                method: "PATCH",
                headers: authHeaders(),
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (!data.ok) return alert(data.message || "Failed to update status");
            return loadBookings();
        }

        if (btn.getAttribute("data-del")) {
            const ok = confirm("Delete this booking?");
            if (!ok) return;

            const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });
            const data = await res.json();
            if (!data.ok) return alert(data.message || "Delete failed");
            return loadBookings();
        }
    });

    loadBtn.addEventListener("click", loadBookings);
    loadBookings();
})();
