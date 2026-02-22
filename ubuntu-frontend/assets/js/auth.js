"use strict";

const msg = document.getElementById("msg");
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const roleSelect = document.getElementById("roleSelect");
const rememberMeCheckbox = document.getElementById("rememberMe");

// Get selected login type from the page
function getSelectedLoginType() {
    const activeOption = document.querySelector('.login-option.active');
    return activeOption ? activeOption.getAttribute('data-type') : 'tourist';
}

function showLogin() {
    loginForm.style.display = "grid";
    registerForm.style.display = "none";
    tabLogin.classList.add("btn-primary");
    tabLogin.classList.remove("btn-outline");
    tabRegister.classList.add("btn-outline");
    tabRegister.classList.remove("btn-primary");
    msg.textContent = "";
    
    // Update action text
    const actionText = document.getElementById("actionText");
    if (actionText) actionText.textContent = "Signing in";
}

function showRegister() {
    loginForm.style.display = "none";
    registerForm.style.display = "grid";
    tabRegister.classList.add("btn-primary");
    tabRegister.classList.remove("btn-outline");
    tabLogin.classList.add("btn-outline");
    tabLogin.classList.remove("btn-primary");
    msg.textContent = "";
    
    // Update action text
    const actionText = document.getElementById("actionText");
    if (actionText) actionText.textContent = "Signing up";
}

function redirectByRole(user) {
    const role = user?.role;

    if (role === "admin") {
        location.href = "./admin.html";
    } else if (role === "guide") {
        location.href = "./guide-dashboard.html";
    } else {
        location.href = "./index.html";
    }
}

// Check for saved credentials (Remember Me)
function loadSavedCredentials() {
    const savedEmail = localStorage.getItem("SAVED_EMAIL");
    const savedRemember = localStorage.getItem("REMEMBER_ME") === "true";
    
    if (savedEmail && savedRemember) {
        loginForm.email.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }
}

// Save credentials if Remember Me is checked
function saveCredentials(email, remember) {
    if (remember) {
        localStorage.setItem("SAVED_EMAIL", email);
        localStorage.setItem("REMEMBER_ME", "true");
    } else {
        localStorage.removeItem("SAVED_EMAIL");
        localStorage.removeItem("REMEMBER_ME");
    }
}

// Helper function to get checked values from checkboxes
function getCheckedValues(name) {
    return [...registerForm.querySelectorAll(`input[name="${name}"]:checked`)].map(cb => cb.value);
}

tabLogin.addEventListener("click", showLogin);
tabRegister.addEventListener("click", showRegister);

// LOGIN
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const email = loginForm.email.value.trim().toLowerCase();
    const password = loginForm.password.value;
    const remember = rememberMeCheckbox.checked;
    const selectedType = getSelectedLoginType();

    // Email validation
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email)) {
        msg.textContent = "❌ Please enter a valid email address";
        msg.style.color = "#ff4444";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!data.ok) throw new Error(data.message || "Login failed");

        // Check if user role matches selected type
        if (data.user?.role && data.user.role !== selectedType && data.user.role !== 'admin') {
            msg.textContent = `⚠️ This account is registered as a ${data.user.role}. Please select the correct login type.`;
            msg.style.color = "#ff9800";
            return;
        }

        // Save credentials if remember me is checked
        saveCredentials(email, remember);

        // Store token
        localStorage.setItem("AUTH_TOKEN", data.token);
        
        msg.textContent = "✅ Logged in successfully!";
        msg.style.color = "#00c853";
        
        setTimeout(() => redirectByRole(data.user), 500);
    } catch (err) {
        msg.textContent = `❌ ${err.message}`;
        msg.style.color = "#ff4444";
    }
});

// REGISTER
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const loginType = getSelectedLoginType();
    const firstName = registerForm.firstName.value.trim();
    const lastName = registerForm.lastName.value.trim();
    const email = registerForm.email.value.trim().toLowerCase();
    const password = registerForm.password.value;
    const phone = registerForm.phone.value.trim();
    const country = registerForm.country.value;
    const city = registerForm.city?.value.trim();
    const address = registerForm.address?.value.trim();
    const termsAccepted = registerForm.termsAccepted.checked;
    const newsletter = registerForm.newsletter?.checked || false;
    
    // Role is determined by login type selection
    const role = loginType; // 'tourist' or 'guide'

    // Email validation
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email)) {
        msg.textContent = "❌ Please enter a valid email address (e.g., user@example.com)";
        msg.style.color = "#ff4444";
        return;
    }

    // Password validation
    if (password.length < 8) {
        msg.textContent = "❌ Password must be at least 8 characters long";
        msg.style.color = "#ff4444";
        return;
    }
    
    // Terms validation
    if (!termsAccepted) {
        msg.textContent = "❌ You must accept the terms and conditions";
        msg.style.color = "#ff4444";
        return;
    }

    const payload = {
        role,
        firstName,
        lastName,
        email,
        password,
        phone,
        country,
        termsAccepted,
        newsletter,
    };
    
    // Optional fields
    if (city) payload.city = city;
    if (address) payload.address = address;
    
    // Guide-specific fields
    if (role === 'guide') {
        const companyName = registerForm.companyName?.value.trim();
        const businessType = registerForm.businessType?.value;
        const yearsOfExperience = registerForm.yearsOfExperience?.value;
        const bio = registerForm.bio?.value.trim();
        const languages = getCheckedValues('languages');
        const specializations = getCheckedValues('specializations');
        
        if (companyName) payload.companyName = companyName;
        if (businessType) payload.businessType = businessType;
        if (yearsOfExperience) payload.yearsOfExperience = parseInt(yearsOfExperience);
        if (bio) payload.bio = bio;
        if (languages.length > 0) payload.languages = languages;
        if (specializations.length > 0) payload.specializations = specializations;
    }

    try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!data.ok) throw new Error(data.message || "Registration failed");

        localStorage.setItem("AUTH_TOKEN", data.token);

        if (data.user?.role === "guide" && data.user?.isApproved === false) {
            msg.textContent = "✅ Account created! Your guide account needs admin approval before you can create tours.";
            msg.style.color = "#ff9800";
            setTimeout(() => redirectByRole(data.user), 2000);
            return;
        }

        msg.textContent = "✅ Account created successfully!";
        msg.style.color = "#00c853";
        setTimeout(() => redirectByRole(data.user), 500);
    } catch (err) {
        msg.textContent = `❌ ${err.message}`;
        msg.style.color = "#ff4444";
    }
});

// Initialize
showLogin();
loadSavedCredentials();
