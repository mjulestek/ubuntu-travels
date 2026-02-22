"use strict";

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const email = form.email.value.trim();
    const password = form.password.value;

    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!data.ok) throw new Error(data.message || "Login failed");

        localStorage.setItem("AUTH_TOKEN", data.token);

        const role = data.user?.role;

        msg.textContent = "✅ Logged in. Redirecting...";

        setTimeout(() => {
            if (role === "admin") window.location.href = "./admin-approve-tours.html";
            else if (role === "guide") window.location.href = "./guide-dashboard.html";
            else window.location.href = "./index.html";
        }, 400);
    } catch (err) {
        msg.textContent = `❌ ${err.message}`;
    }
});
