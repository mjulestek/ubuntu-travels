"use strict";

(async () => {
    const ok = await requireLoginOrRedirect();
    if (!ok) return;

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", logout);

    const refreshBtn = document.getElementById("refreshBtn");
    const tourSelect = document.getElementById("tourSelect");
    const loadMsg = document.getElementById("loadMsg");

    const tourForm = document.getElementById("tourForm");
    const itineraryEditor = document.getElementById("itineraryEditor");
    const addDayBtn = document.getElementById("addDayBtn");
    const deleteTourBtn = document.getElementById("deleteTourBtn");
    const saveMsg = document.getElementById("saveMsg");

    let tours = [];
    let currentTour = null;

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));
    }

    async function fetchTours() {
        loadMsg.textContent = "Loading tours...";
        const res = await fetch(`${API_BASE}/api/tours`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.message || "Failed to load tours");
        tours = data.tours;
        loadMsg.textContent = `Loaded ${tours.length} tours`;
        renderSelect();
    }

    function renderSelect() {
        tourSelect.innerHTML = "";

        const optNew = document.createElement("option");
        optNew.value = "__new__";
        optNew.textContent = "➕ Create New Tour";
        tourSelect.appendChild(optNew);

        tours.forEach((t) => {
            const opt = document.createElement("option");
            opt.value = t._id;
            opt.textContent = `${t.title} (${t.slug})`;
            tourSelect.appendChild(opt);
        });

        tourSelect.value = "__new__";
        loadTourIntoForm(null);
    }

    function renderItinerary(days) {
        itineraryEditor.innerHTML = "";
        const sorted = [...(days || [])].sort((a, b) => (a.day || 0) - (b.day || 0));

        sorted.forEach((d, idx) => {
            const wrap = document.createElement("div");
            wrap.className = "popular-card";
            wrap.style.padding = "12px";

            wrap.innerHTML = `
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:center; flex-wrap:wrap;">
          <strong>Day</strong>
          <button type="button" class="btn btn-outline" data-remove="${idx}">Remove</button>
        </div>

        <div style="display:grid; gap:8px; margin-top:10px;">
          <input class="newsletter-input" data-field="day" type="number" min="1" value="${d.day ?? (idx + 1)}" />
          <input class="newsletter-input" data-field="title" placeholder="Day title" value="${escapeHtml(d.title || "")}" />
          <textarea class="newsletter-input" data-field="description" placeholder="Day description" style="min-height:90px;">${escapeHtml(d.description || "")}</textarea>
        </div>
      `;
            itineraryEditor.appendChild(wrap);
        });
    }

    function readItineraryFromUI() {
        const cards = Array.from(itineraryEditor.querySelectorAll(".popular-card"));
        return cards.map((card) => {
            const day = Number(card.querySelector('[data-field="day"]').value);
            const title = card.querySelector('[data-field="title"]').value.trim();
            const description = card.querySelector('[data-field="description"]').value.trim();
            return { day, title, description };
        }).sort((a, b) => a.day - b.day);
    }

    function loadTourIntoForm(t) {
        currentTour = t;

        tourForm.title.value = t?.title || "";
        tourForm.subtitle.value = t?.subtitle || "";
        tourForm.slug.value = t?.slug || "";
        tourForm.location.value = t?.location || "";
        tourForm.durationDays.value = t?.durationDays ?? 1;
        tourForm.price.value = t?.price ?? 0;
        tourForm.imageUrl.value = t?.imageUrl || "";
        tourForm.description.value = t?.description || "";

        renderItinerary(t?.itinerary || []);
        saveMsg.textContent = "";
    }

    tourSelect.addEventListener("change", () => {
        const id = tourSelect.value;
        if (id === "__new__") return loadTourIntoForm(null);
        loadTourIntoForm(tours.find(x => x._id === id) || null);
    });

    refreshBtn.addEventListener("click", async () => {
        try { await fetchTours(); } catch (e) { loadMsg.textContent = `❌ ${e.message}`; }
    });

    addDayBtn.addEventListener("click", () => {
        const existing = readItineraryFromUI();
        const nextDay = existing.length ? Math.max(...existing.map(d => d.day)) + 1 : 1;
        existing.push({ day: nextDay, title: "", description: "" });
        renderItinerary(existing);
    });

    itineraryEditor.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-remove]");
        if (!btn) return;
        const idx = Number(btn.getAttribute("data-remove"));
        const existing = readItineraryFromUI();
        existing.splice(idx, 1);
        renderItinerary(existing);
    });

    tourForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        saveMsg.textContent = "";

        const payload = {
            title: tourForm.title.value.trim(),
            subtitle: tourForm.subtitle.value.trim(),
            slug: tourForm.slug.value.trim().toLowerCase(),
            location: tourForm.location.value.trim(),
            durationDays: Number(tourForm.durationDays.value),
            price: Number(tourForm.price.value),
            imageUrl: tourForm.imageUrl.value.trim(),
            description: tourForm.description.value.trim(),
            itinerary: readItineraryFromUI(),
        };

        for (const d of payload.itinerary) {
            if (!d.day || !d.title || !d.description) {
                saveMsg.textContent = "❌ Each itinerary day needs: day, title, description.";
                return;
            }
        }

        try {
            let res, data;

            if (currentTour?._id) {
                res = await fetch(`${API_BASE}/api/tours/${currentTour._id}`, {
                    method: "PUT",
                    headers: authHeaders(),
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch(`${API_BASE}/api/tours`, {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify(payload),
                });
            }

            data = await res.json();
            if (!data.ok) throw new Error(data.message || "Save failed");

            saveMsg.textContent = currentTour?._id ? "✅ Updated" : "✅ Created";
            await fetchTours();

            // Select the saved tour
            const id = data.tour?._id;
            if (id) {
                tourSelect.value = id;
                loadTourIntoForm(tours.find(t => t._id === id));
            }
        } catch (err) {
            saveMsg.textContent = `❌ ${err.message}`;
        }
    });

    deleteTourBtn.addEventListener("click", async () => {
        if (!currentTour?._id) {
            saveMsg.textContent = "⚠️ Select a tour first.";
            return;
        }
        const ok = confirm("Delete this tour?");
        if (!ok) return;

        try {
            const res = await fetch(`${API_BASE}/api/tours/${currentTour._id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.message || "Delete failed");
            saveMsg.textContent = "✅ Deleted";
            await fetchTours();
        } catch (err) {
            saveMsg.textContent = `❌ ${err.message}`;
        }
    });

    await fetchTours();
})();
