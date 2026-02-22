"use strict";

const BASE = window.API_BASE || "http://localhost:5000";

const form = document.getElementById("customTripForm");
const message = document.getElementById("message");
const toursSelection = document.getElementById("toursSelection");
const startDateInput = document.getElementById("startDate");

let selectedTours = [];

// Set minimum date to today
if (startDateInput) {
  const today = new Date().toISOString().split('T')[0];
  startDateInput.setAttribute('min', today);
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function showMessage(text, isSuccess) {
  if (!message) return;
  
  message.textContent = text;
  message.style.display = "block";
  message.style.background = isSuccess ? "#e8f5e9" : "#ffebee";
  message.style.color = isSuccess ? "#2e7d32" : "#c62828";
  
  // Scroll to message
  message.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleTourSelection(tourId, checkbox) {
  if (checkbox.checked) {
    if (!selectedTours.includes(tourId)) {
      selectedTours.push(tourId);
    }
  } else {
    selectedTours = selectedTours.filter(id => id !== tourId);
  }
  
  console.log('Selected tours:', selectedTours);
}

async function loadAvailableTours() {
  if (!toursSelection) return;

  try {
    const res = await fetch(`${BASE}/api/tours`);
    const data = await res.json();

    if (!data.ok || !data.tours || data.tours.length === 0) {
      toursSelection.innerHTML = `
        <p style="text-align: center; color: var(--battleship-gray); padding: 20px;">
          No tours available at the moment. Please check back later.
        </p>
      `;
      return;
    }

    // Filter only approved tours
    const approvedTours = data.tours.filter(t => t.status === 'approved');

    if (approvedTours.length === 0) {
      toursSelection.innerHTML = `
        <p style="text-align: center; color: var(--battleship-gray); padding: 20px;">
          No approved tours available yet.
        </p>
      `;
      return;
    }

    // Group tours by country
    const toursByCountry = {};
    approvedTours.forEach(tour => {
      const countries = Array.isArray(tour.countries) && tour.countries.length > 0 
        ? tour.countries 
        : [tour.location || 'Other'];
      
      countries.forEach(country => {
        if (!toursByCountry[country]) {
          toursByCountry[country] = [];
        }
        toursByCountry[country].push(tour);
      });
    });

    // Render tours grouped by country
    let html = '';
    Object.keys(toursByCountry).sort().forEach(country => {
      html += `
        <div style="margin-bottom: 25px;">
          <h4 style="font-size: 1.6rem; font-weight: 700; color: var(--viridian-green); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <ion-icon name="location-outline" style="font-size: 2rem;"></ion-icon>
            ${escapeHtml(country)}
          </h4>
          <div style="display: grid; gap: 12px;">
      `;

      toursByCountry[country].forEach(tour => {
        const tourId = tour._id;
        const price = Number(tour.price || 0).toFixed(2);
        const days = tour.durationDays || 1;

        html += `
          <label style="display: flex; align-items: start; gap: 15px; padding: 15px; background: var(--white-2); border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease;" 
                 onmouseover="this.style.borderColor='var(--viridian-green)'" 
                 onmouseout="if(!this.querySelector('input').checked) this.style.borderColor='transparent'">
            <input type="checkbox" 
                   value="${escapeHtml(tourId)}" 
                   onchange="toggleTourSelection('${escapeHtml(tourId)}', this); this.parentElement.style.borderColor = this.checked ? 'var(--viridian-green)' : 'transparent'; this.parentElement.style.background = this.checked ? '#e8f5e9' : 'var(--white-2)';"
                   style="width: 20px; height: 20px; margin-top: 3px; cursor: pointer; accent-color: var(--viridian-green);">
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <h5 style="font-size: 1.5rem; font-weight: 600; color: var(--oxford-blue);">
                  ${escapeHtml(tour.title)}
                </h5>
                <span style="font-size: 1.6rem; font-weight: 700; color: var(--viridian-green); white-space: nowrap; margin-left: 15px;">
                  $${price}
                </span>
              </div>
              <p style="font-size: 1.3rem; color: var(--battleship-gray); line-height: 1.6; margin-bottom: 8px;">
                ${escapeHtml((tour.description || '').substring(0, 120))}${tour.description && tour.description.length > 120 ? '...' : ''}
              </p>
              <div style="display: flex; gap: 15px; font-size: 1.2rem; color: var(--black-coral);">
                <span style="display: flex; align-items: center; gap: 4px;">
                  <ion-icon name="time-outline"></ion-icon>
                  ${days} Days
                </span>
                <span style="display: flex; align-items: center; gap: 4px;">
                  <ion-icon name="location-outline"></ion-icon>
                  ${escapeHtml(tour.location || country)}
                </span>
              </div>
            </div>
          </label>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    toursSelection.innerHTML = html;
    console.log(`Loaded ${approvedTours.length} approved tours`);

  } catch (err) {
    console.error('Error loading tours:', err);
    toursSelection.innerHTML = `
      <p style="text-align: center; color: #c62828; padding: 20px;">
        <ion-icon name="alert-circle-outline" style="font-size: 3rem;"></ion-icon>
        <br>Failed to load tours. Please try again later.
      </p>
    `;
  }
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if (message) {
      message.style.display = "none";
    }

    // Validate at least one tour is selected
    if (selectedTours.length === 0) {
      showMessage("❌ Please select at least one tour to include in your custom trip.", false);
      return;
    }

    const formData = {
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      startDate: form.startDate.value,
      duration: Number(form.duration.value),
      travelers: Number(form.travelers.value),
      budget: form.budget.value,
      selectedTours: selectedTours,
      specialRequests: form.specialRequests.value.trim(),
      type: 'custom-trip'
    };

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<ion-icon name="hourglass-outline" style="font-size: 2.4rem;"></ion-icon> Submitting...';

    try {
      const res = await fetch(`${BASE}/api/bookings/custom-trip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!data.ok) {
        throw new Error(data.message || "Failed to submit custom trip request");
      }

      showMessage(
        `✅ Custom trip request submitted successfully! We've received your request for ${selectedTours.length} tour(s). Our team will contact you within 24-48 hours with a personalized itinerary and pricing.`,
        true
      );

      // Reset form
      form.reset();
      selectedTours = [];
      
      // Uncheck all checkboxes and reset styles
      document.querySelectorAll('#toursSelection input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
        const label = checkbox.parentElement;
        label.style.borderColor = 'transparent';
        label.style.background = 'var(--white-2)';
      });

      // Reset date input min
      if (startDateInput) {
        const today = new Date().toISOString().split('T')[0];
        startDateInput.setAttribute('min', today);
      }

    } catch (err) {
      console.error('Error submitting custom trip:', err);
      showMessage(`❌ ${err.message}`, false);
    } finally {
      // Restore button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

// Load tours when page loads
loadAvailableTours();
