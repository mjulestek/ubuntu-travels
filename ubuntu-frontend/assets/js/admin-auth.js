"use strict";

const API_BASE = "http://localhost:5000";

function getToken() {
    return localStorage.getItem("ADMIN_JWT") || "";
}

function setToken(t) {
    localStorage.setItem("ADMIN_JWT", t);
}

function clearToken() {
    localStorage.removeItem("ADMIN_JWT");
}

function authHeaders() {
    return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
}

async function requireLoginOrRedirect() {
    const token = getToken();
    if (!token) {
        location.href = "../../admin-login.html";
        return false;
    }

    // verify token
    try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders() });
        const data = await res.json();
        if (!data.ok) throw new Error("bad token");
        return true;
    } catch {
        clearToken();
        location.href = "../../admin-login.html";
        return false;
    }
}

function logout() {
    clearToken();
    location.href = "../../admin-login.html";
}
