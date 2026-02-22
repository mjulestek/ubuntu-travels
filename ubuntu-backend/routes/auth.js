const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

function signToken(user) {
    return jwt.sign(
        { id: user._id.toString(), role: user.role, email: user.email, fullName: user.fullName },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

// POST /api/auth/register  (guide or tourist)
router.post("/register", async (req, res) => {
    try {
        const { 
            role, 
            firstName, 
            lastName, 
            email, 
            password,
            phone,
            country,
            city,
            address,
            companyName,
            businessType,
            yearsOfExperience,
            languages,
            specializations,
            bio,
            newsletter,
            termsAccepted
        } = req.body || {};

        if (!["guide", "tourist"].includes(role)) {
            return res.status(400).json({ ok: false, message: "Role must be guide or tourist" });
        }
        
        if (!firstName || !lastName || !email || !password || !phone || !country) {
            return res.status(400).json({ 
                ok: false, 
                message: "First name, last name, email, password, phone, and country are required" 
            });
        }
        
        if (!termsAccepted) {
            return res.status(400).json({ 
                ok: false, 
                message: "You must accept the terms and conditions" 
            });
        }

        const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
        if (exists) return res.status(409).json({ ok: false, message: "Email already used" });

        const passwordHash = await bcrypt.hash(String(password), 10);

        const userData = {
            role,
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            email: String(email).toLowerCase().trim(),
            passwordHash,
            phone: String(phone).trim(),
            country: String(country).trim(),
            isApproved: role === "guide" ? false : true,
            termsAccepted: Boolean(termsAccepted),
            newsletter: Boolean(newsletter),
        };
        
        // Optional fields
        if (city) userData.city = String(city).trim();
        if (address) userData.address = String(address).trim();
        if (bio) userData.bio = String(bio).trim();
        
        // Guide-specific fields
        if (role === "guide") {
            if (companyName) userData.companyName = String(companyName).trim();
            if (businessType) userData.businessType = String(businessType).trim();
            if (yearsOfExperience) userData.yearsOfExperience = Number(yearsOfExperience);
            if (languages && Array.isArray(languages)) userData.languages = languages;
            if (specializations && Array.isArray(specializations)) userData.specializations = specializations;
        }

        const user = await User.create(userData);

        const token = signToken(user);

        return res.status(201).json({
            ok: true,
            token,
            user: { 
                role: user.role, 
                fullName: user.fullName, 
                email: user.email, 
                isApproved: user.isApproved 
            },
        });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

// POST /api/auth/login  (admin/guide/tourist)
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ ok: false, message: "Email and password required" });
        }

        const user = await User.findOne({ email: String(email).toLowerCase().trim() });
        if (!user) return res.status(401).json({ ok: false, message: "Invalid credentials" });

        if (user.isBanned) {
            return res.status(403).json({ ok: false, message: "Account banned" });
        }

        const ok = await bcrypt.compare(String(password), user.passwordHash);
        if (!ok) return res.status(401).json({ ok: false, message: "Invalid credentials" });

        const token = signToken(user);
        return res.json({
            ok: true,
            token,
            user: { role: user.role, fullName: user.fullName, email: user.email, isApproved: user.isApproved },
        });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
    try {
        // Fetch fresh user data from database
        const user = await User.findById(req.user.id).select('-passwordHash');
        
        if (!user) {
            return res.status(404).json({ ok: false, message: "User not found" });
        }
        
        return res.json({ 
            ok: true, 
            user: {
                id: user._id,
                role: user.role,
                fullName: user.fullName,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isApproved: user.isApproved,
                isBanned: user.isBanned,
                verified: user.verified,
                phone: user.phone,
                country: user.country,
                city: user.city,
                companyName: user.companyName,
                bio: user.bio,
                shortIntro: user.shortIntro,
                profileImage: user.profileImage,
                slug: user.slug,
                yearsOfExperience: user.yearsOfExperience,
                languages: user.languages,
                specializations: user.specializations
            }
        });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

// PUT /api/auth/profile - Update user profile
router.put("/profile", requireAuth, async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            phone,
            country,
            city,
            address,
            companyName,
            businessType,
            yearsOfExperience,
            languages,
            specializations,
            bio,
            shortIntro,
            profileImage
        } = req.body || {};

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ ok: false, message: "User not found" });
        }

        // Update basic fields
        if (firstName) user.firstName = String(firstName).trim();
        if (lastName) user.lastName = String(lastName).trim();
        if (phone) user.phone = String(phone).trim();
        if (country) user.country = String(country).trim();
        if (city !== undefined) user.city = city ? String(city).trim() : '';
        if (address !== undefined) user.address = address ? String(address).trim() : '';
        if (bio !== undefined) user.bio = bio ? String(bio).trim() : '';
        if (shortIntro !== undefined) user.shortIntro = shortIntro ? String(shortIntro).trim() : '';
        if (profileImage !== undefined) user.profileImage = profileImage ? String(profileImage).trim() : '';

        // Guide-specific fields
        if (user.role === 'guide') {
            if (companyName !== undefined) user.companyName = companyName ? String(companyName).trim() : '';
            if (businessType !== undefined) user.businessType = businessType ? String(businessType).trim() : '';
            if (yearsOfExperience !== undefined) user.yearsOfExperience = Number(yearsOfExperience) || 0;
            if (languages && Array.isArray(languages)) user.languages = languages;
            if (specializations && Array.isArray(specializations)) user.specializations = specializations;
        }

        await user.save();

        return res.json({
            ok: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                role: user.role,
                fullName: user.fullName,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isApproved: user.isApproved,
                verified: user.verified,
                phone: user.phone,
                country: user.country,
                city: user.city,
                companyName: user.companyName,
                bio: user.bio,
                shortIntro: user.shortIntro,
                profileImage: user.profileImage,
                slug: user.slug,
                yearsOfExperience: user.yearsOfExperience,
                languages: user.languages,
                specializations: user.specializations
            }
        });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

module.exports = router;
