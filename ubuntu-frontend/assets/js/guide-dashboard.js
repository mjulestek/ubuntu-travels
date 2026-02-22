"use strict";

const msg = document.getElementById("msg");
const grid = document.getElementById("grid");
const reloadBtn = document.getElementById("reloadBtn");
const resetBtn = document.getElementById("resetBtn");
const form = document.getElementById("tourForm");
const formTitle = document.getElementById("formTitle");
const addDayBtn = document.getElementById("addDayBtn");
const itineraryContainer = document.getElementById("itineraryContainer");
const approvalWarning = document.getElementById("approvalWarning");

let editingId = null;
let dayCounter = 0;
let userApprovalStatus = null;

function getToken() {
    return localStorage.getItem("AUTH_TOKEN") || "";
}

function headers() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };
}

function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

function badge(status) {
    const map = { 
        approved: "✅ APPROVED", 
        pending_approval: "🟡 PENDING", 
        pending: "🟡 PENDING",
        rejected: "❌ REJECTED", 
        draft: "📝 DRAFT" 
    };
    return map[status] || String(status || "pending").toUpperCase();
}

function getCountriesFromForm() {
    return [...form.querySelectorAll('input[name="countries"]:checked')].map(x => x.value);
}

function setCountriesToForm(countries) {
    const set = new Set((countries || []).map(String));
    [...form.querySelectorAll('input[name="countries"]')].forEach(cb => cb.checked = set.has(cb.value));
}

// Itinerary functions
function addItineraryDay(day = null) {
    dayCounter++;
    const dayNum = day?.day || dayCounter;
    const dayDiv = document.createElement('div');
    dayDiv.className = 'itinerary-day';
    dayDiv.setAttribute('data-day-id', dayCounter);
    
    dayDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="margin: 0;">Day ${dayNum}</h4>
            <button type="button" class="btn btn-outline" onclick="removeDay(${dayCounter})" style="padding: 5px 15px; font-size: 1.2rem;">
                <ion-icon name="trash-outline" style="vertical-align: middle;"></ion-icon> Remove
            </button>
        </div>
        <div style="display: grid; gap: 10px;">
            <div>
                <label style="font-weight: 600; font-size: 1.3rem; color: var(--black-coral); display: block; margin-bottom: 5px;">
                    Day Title <span style="color: #ff4444;">*</span>
                </label>
                <input class="newsletter-input" name="day_${dayCounter}_title" 
                       placeholder="e.g., Arrival & City Tour" 
                       value="${day?.title || ''}" 
                       minlength="5" maxlength="100" required>
                <div style="font-size: 1.1rem; color: var(--battleship-gray); margin-top: 3px;">
                    Brief title for this day's activities (5-100 characters)
                </div>
            </div>
            <div>
                <label style="font-weight: 600; font-size: 1.3rem; color: var(--black-coral); display: block; margin-bottom: 5px;">
                    Day Description <span style="color: #ff4444;">*</span>
                </label>
                <textarea class="newsletter-input" name="day_${dayCounter}_description" 
                          placeholder="Describe the activities, locations, and experiences for this day..." 
                          style="min-height: 100px;" 
                          minlength="20" maxlength="500" required>${day?.description || ''}</textarea>
                <div style="font-size: 1.1rem; color: var(--battleship-gray); margin-top: 3px;">
                    Detailed description of activities (20-500 characters)
                </div>
            </div>
        </div>
        <input type="hidden" name="day_${dayCounter}_number" value="${dayNum}">
    `;
    
    itineraryContainer.appendChild(dayDiv);
}

window.removeDay = function(dayId) {
    const dayDiv = document.querySelector(`[data-day-id="${dayId}"]`);
    if (dayDiv) dayDiv.remove();
};

function getItineraryFromForm() {
    const itinerary = [];
    const days = itineraryContainer.querySelectorAll('.itinerary-day');
    
    days.forEach((dayDiv, index) => {
        const dayId = dayDiv.getAttribute('data-day-id');
        const title = form.querySelector(`[name="day_${dayId}_title"]`)?.value.trim();
        const description = form.querySelector(`[name="day_${dayId}_description"]`)?.value.trim();
        const dayNumber = form.querySelector(`[name="day_${dayId}_number"]`)?.value || (index + 1);
        
        if (title && description) {
            itinerary.push({
                day: parseInt(dayNumber),
                title,
                description
            });
        }
    });
    
    return itinerary;
}

function loadItineraryToForm(itinerary) {
    itineraryContainer.innerHTML = '';
    dayCounter = 0;
    
    if (itinerary && itinerary.length > 0) {
        itinerary.forEach(day => addItineraryDay(day));
    }
}

function resetForm() {
    editingId = null;
    dayCounter = 0;
    formTitle.textContent = "Create New Tour";
    form.reset();
    setCountriesToForm([]);
    itineraryContainer.innerHTML = '';
    msg.textContent = "";
    
    // Reset image upload
    imagePreview.style.display = 'none';
    imageUploadArea.style.display = 'block';
    imageUrlInput.value = '';
    imageFileInput.value = '';
    currentImageKey = null;
    
    // Reset character counters
    document.getElementById('titleCounter').textContent = '0 / 100';
    document.getElementById('subtitleCounter').textContent = '0 / 150';
    document.getElementById('descriptionCounter').textContent = '0 / 2000';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Check user approval status
async function checkApprovalStatus() {
    try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: headers() });
        const data = await res.json();
        
        if (data.ok && data.user) {
            userApprovalStatus = data.user.isApproved;
            
            // Show or hide approval warning based on current status
            if (data.user.isApproved) {
                approvalWarning.style.display = 'none';
            } else {
                approvalWarning.style.display = 'block';
            }
        }
    } catch (err) {
        console.error('Failed to check approval status:', err);
    }
}

// Update stats
function updateStats(tours) {
    const total = tours.length;
    const approved = tours.filter(t => t.status === 'approved').length;
    const pending = tours.filter(t => t.status === 'pending_approval' || t.status === 'pending').length;
    const draft = tours.filter(t => t.status === 'draft').length;
    
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statApproved').textContent = approved;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statDraft').textContent = draft;
}

async function loadMine() {
    grid.innerHTML = "";
    msg.textContent = "";

    if (!getToken()) {
        grid.innerHTML = `<p style="font-weight:600; color: #ff4444;">❌ Not logged in. Please <a href="./auth.html?role=guide">login</a> first.</p>`;
        return;
    }

    const res = await fetch(`${API_BASE}/api/guide/tours`, { headers: headers() });
    const data = await res.json();

    if (!data.ok) {
        grid.innerHTML = `<p style="font-weight:600; color: #ff4444;">❌ ${esc(data.message || "Failed to load")}</p>`;
        return;
    }

    updateStats(data.tours);

    if (data.tours.length === 0) {
        grid.innerHTML = `<p style="color: var(--black-coral);">No tours yet. Create your first tour above! 🚀</p>`;
        return;
    }

    grid.innerHTML = data.tours.map(t => `
    <div class="popular-card" style="padding:20px;">
      <div style="display:flex; gap:15px; flex-wrap:wrap;">
        <div style="width:200px; max-width:100%; border-radius:6px; overflow:hidden;">
          <img src="${esc(t.imageUrl || "")}" alt="${esc(t.title)}"
               style="width:100%; height:150px; object-fit:cover; background:#ddd;">
        </div>

        <div style="flex:1; min-width:250px;">
          <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom: 10px;">
            <h3 style="font-size: 1.8rem; font-weight: 600; margin: 0;">${esc(t.title)}</h3>
            <span style="font-weight:600; font-size: 1.4rem;">${badge(t.status)}</span>
          </div>

          <p style="color: var(--black-coral); margin-bottom: 8px;">
            📍 ${esc(t.location || "")} • ⏱ ${Number(t.durationDays || 1)} days • 💰 $${Number(t.price || 0).toFixed(2)}
          </p>

          <p style="color: var(--battleship-gray); font-size: 1.3rem; margin-bottom: 12px;">
            🌍 ${(t.countries || []).join(", ")}
          </p>

          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-primary" data-action="edit" data-id="${t._id}">Edit</button>
            <a class="btn btn-outline" href="./tour.html?slug=${encodeURIComponent(t.slug)}" target="_blank">Preview</a>
            <button class="btn btn-outline" data-action="delete" data-id="${t._id}">Delete</button>
          </div>

          <pre style="display:none;" data-json="${t._id}">${esc(JSON.stringify(t))}</pre>
        </div>
      </div>
    </div>
  `).join("");
}

grid.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");
    if (!action || !id) return;

    if (action === "edit") {
        const node = grid.querySelector(`pre[data-json="${id}"]`);
        if (!node) return;

        const t = JSON.parse(node.textContent);

        editingId = t._id;
        formTitle.textContent = `Edit Tour: ${t.title}`;

        form.title.value = t.title || "";
        form.slug.value = t.slug || "";
        form.subtitle.value = t.subtitle || "";
        form.location.value = t.location || "";
        form.imageUrl.value = t.imageUrl || "";
        form.durationDays.value = t.durationDays || 1;
        form.price.value = t.price || 0;
        form.description.value = t.description || "";

        // Update character counters
        document.getElementById('titleCounter').textContent = `${(t.title || '').length} / 100`;
        document.getElementById('subtitleCounter').textContent = `${(t.subtitle || '').length} / 150`;
        document.getElementById('descriptionCounter').textContent = `${(t.description || '').length} / 2000`;

        // Show image preview if exists
        if (t.imageUrl) {
            previewImg.src = t.imageUrl;
            imagePreview.style.display = 'block';
            imageUploadArea.style.display = 'none';
            imageUrlInput.value = t.imageUrl;
        }

        setCountriesToForm(t.countries || []);
        loadItineraryToForm(t.itinerary || []);
        
        msg.textContent = t.status === 'approved' 
            ? "✏️ Editing approved tour. Changes will be live immediately." 
            : "✏️ Editing tour.";
        msg.style.color = t.status === 'approved' ? "#00c853" : "#ff9800";
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }

    if (action === "delete") {
        const node = grid.querySelector(`pre[data-json="${id}"]`);
        if (!node) return;
        const t = JSON.parse(node.textContent);
        
        const confirmMsg = t.status === 'approved' 
            ? `Delete "${t.title}"? This tour is LIVE and approved. Deleting it will remove it from the website immediately. This cannot be undone.`
            : `Delete "${t.title}"? This cannot be undone.`;
        
        const ok = confirm(confirmMsg);
        if (!ok) return;

        const res = await fetch(`${API_BASE}/api/guide/tours/${id}`, {
            method: "DELETE",
            headers: headers(),
        });
        const data = await res.json();
        if (!data.ok) {
            alert(data.message || "Delete failed");
        } else {
            msg.textContent = "✅ Tour deleted successfully";
            msg.style.color = "#00c853";
        }
        loadMine();
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const payload = {
        title: form.title.value.trim(),
        slug: form.slug.value.trim().toLowerCase(),
        subtitle: form.subtitle.value.trim(),
        location: form.location.value.trim(),
        imageUrl: form.imageUrl.value.trim(),
        durationDays: Number(form.durationDays.value || 1),
        price: Number(form.price.value || 0),
        description: form.description.value.trim(),
        countries: getCountriesFromForm(),
        itinerary: getItineraryFromForm(),
    };

    if (!payload.title || !payload.slug) {
        msg.textContent = "❌ Title and slug are required.";
        msg.style.color = "#ff4444";
        return;
    }
    if (!payload.countries.length) {
        msg.textContent = "❌ Select at least one country.";
        msg.style.color = "#ff4444";
        return;
    }

    try {
        let res;
        if (editingId) {
            res = await fetch(`${API_BASE}/api/guide/tours/${editingId}`, {
                method: "PATCH",
                headers: headers(),
                body: JSON.stringify(payload),
            });
        } else {
            res = await fetch(`${API_BASE}/api/guide/tours`, {
                method: "POST",
                headers: headers(),
                body: JSON.stringify(payload),
            });
        }

        const data = await res.json();
        if (!data.ok) throw new Error(data.message || "Save failed");

        msg.textContent = editingId 
            ? "✅ Tour updated successfully!" 
            : "✅ Tour created! Waiting for admin approval.";
        msg.style.color = "#00c853";
        
        resetForm();
        loadMine();
    } catch (err) {
        msg.textContent = `❌ ${err.message}`;
        msg.style.color = "#ff4444";
    }
});

addDayBtn.addEventListener("click", () => addItineraryDay());
reloadBtn.addEventListener("click", loadMine);
resetBtn.addEventListener("click", resetForm);

// Character counters
const charCounters = [
    { input: 'tourTitle', counter: 'titleCounter', max: 100 },
    { input: 'tourSubtitle', counter: 'subtitleCounter', max: 150 },
    { input: 'tourDescription', counter: 'descriptionCounter', max: 2000 }
];

charCounters.forEach(({ input, counter, max }) => {
    const inputEl = document.getElementById(input);
    const counterEl = document.getElementById(counter);
    
    if (inputEl && counterEl) {
        inputEl.addEventListener('input', () => {
            const length = inputEl.value.length;
            counterEl.textContent = `${length} / ${max}`;
            
            // Color coding
            if (length > max) {
                counterEl.className = 'char-counter error';
            } else if (length > max * 0.9) {
                counterEl.className = 'char-counter warning';
            } else {
                counterEl.className = 'char-counter';
            }
        });
    }
});

// Auto-generate slug from title
const titleInput = document.getElementById('tourTitle');
const slugInput = document.getElementById('tourSlug');

if (titleInput && slugInput) {
    titleInput.addEventListener('input', () => {
        if (!editingId && slugInput.value === '') {
            const slug = titleInput.value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .substring(0, 80);
            slugInput.value = slug;
        }
    });
}

// Image Upload Functionality
const imageUploadArea = document.getElementById('imageUploadArea');
const imageFileInput = document.getElementById('imageFileInput');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImageBtn = document.getElementById('removeImageBtn');
const imageUrlInput = document.getElementById('imageUrl');
const uploadProgress = document.getElementById('uploadProgress');
const uploadProgressBar = document.getElementById('uploadProgressBar');

let currentImageKey = null;

// Click to upload
imageUploadArea.addEventListener('click', () => {
    imageFileInput.click();
});

// Drag and drop
imageUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageUploadArea.classList.add('dragover');
});

imageUploadArea.addEventListener('dragleave', () => {
    imageUploadArea.classList.remove('dragover');
});

imageUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    imageUploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleImageFile(files[0]);
    }
});

// File input change
imageFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleImageFile(e.target.files[0]);
    }
});

// Remove image
removeImageBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    
    // Delete from server if exists
    if (currentImageKey) {
        try {
            await fetch(`${API_BASE}/api/media`, {
                method: 'DELETE',
                headers: headers(),
                body: JSON.stringify({ key: currentImageKey })
            });
        } catch (err) {
            console.error('Failed to delete image:', err);
        }
    }
    
    // Reset UI
    imagePreview.style.display = 'none';
    imageUploadArea.style.display = 'block';
    imageUrlInput.value = '';
    imageFileInput.value = '';
    currentImageKey = null;
});

async function handleImageFile(file) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert('Invalid file type. Please upload JPG, PNG, or WebP images only.');
        return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert('File too large. Maximum size is 5MB. Please compress your image and try again.');
        return;
    }
    
    try {
        // Show progress
        uploadProgress.style.display = 'block';
        uploadProgressBar.style.width = '0%';
        
        // Get presigned URL
        const ext = file.name.split('.').pop();
        const filename = `tour-${Date.now()}.${ext}`;
        
        uploadProgressBar.style.width = '20%';
        
        const presignRes = await fetch(`${API_BASE}/api/media/presign`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({
                filename: filename,
                contentType: file.type,
                folder: 'tours'
            })
        });
        
        const presignData = await presignRes.json();
        if (!presignData.ok) throw new Error(presignData.message || 'Failed to get upload URL');
        
        uploadProgressBar.style.width = '40%';
        
        // Upload file
        const uploadUrl = presignData.uploadUrl.startsWith('http') 
            ? presignData.uploadUrl 
            : `${API_BASE}${presignData.uploadUrl}`;
        
        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
                'Authorization': `Bearer ${getToken()}`
            },
            body: file
        });
        
        if (!uploadRes.ok) throw new Error('Upload failed');
        
        uploadProgressBar.style.width = '100%';
        
        // Update UI
        currentImageKey = presignData.key;
        imageUrlInput.value = presignData.publicUrl;
        previewImg.src = presignData.publicUrl;
        imagePreview.style.display = 'block';
        imageUploadArea.style.display = 'none';
        
        // Hide progress after delay
        setTimeout(() => {
            uploadProgress.style.display = 'none';
            uploadProgressBar.style.width = '0%';
        }, 1000);
        
    } catch (err) {
        alert(`Upload failed: ${err.message}`);
        uploadProgress.style.display = 'none';
        uploadProgressBar.style.width = '0%';
    }
}

// Initialize
checkApprovalStatus();
loadMine();
