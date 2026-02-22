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

        setToken(data.token);
        location.href = "./admin.html";
    } catch (err) {
        msg.textContent = `❌ ${err.message}`;
    }
});
