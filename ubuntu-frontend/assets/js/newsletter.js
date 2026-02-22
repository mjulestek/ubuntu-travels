"use strict";

// use shared window.API_BASE (do not redeclare a global const)

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".newsletter-form");
    if (!form) return;

    const input = form.querySelector('input[name="email"]');
    const btn = form.querySelector("button[type='submit']");

    const msg = document.createElement("p");
    msg.style.marginTop = "10px";
    msg.style.fontWeight = "600";
    form.appendChild(msg);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        msg.textContent = "";
        btn.disabled = true;

        try {
            const email = input.value.trim();

            const base = window.API_BASE || "http://localhost:5000";
            const res = await fetch(`${base}/api/newsletter/subscribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, source: "footer_newsletter" }),
            });

            const data = await res.json();
            msg.textContent = data.ok ? data.message : `❌ ${data.message}`;

            if (data.ok) input.value = "";
        } catch (err) {
            msg.textContent = `❌ ${err.message}`;
        } finally {
            btn.disabled = false;
        }
    });
});
