const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/requireAuth");

const router = express.Router();

// GET /api/admin/guides
router.get("/guides", requireAuth, requireRole("admin"), async (req, res) => {
    try {
        const guides = await User.find({ role: "guide" }).sort({ createdAt: -1 });
        res.json({ ok: true, guides });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// PATCH /api/admin/guides/:id  { isApproved, isBanned, verified }
router.patch("/guides/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
        const { isApproved, isBanned, verified } = req.body;

        const updates = {};
        if (typeof isApproved === "boolean") updates.isApproved = isApproved;
        if (typeof isBanned === "boolean") updates.isBanned = isBanned;
        if (typeof verified === "boolean") updates.verified = verified;

        const guide = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!guide) return res.status(404).json({ ok: false, message: "Guide not found" });

        res.json({ ok: true, guide });
    } catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// DELETE /api/admin/guides/:id  -> remove guide and their tours
router.delete("/guides/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
        const guide = await User.findById(req.params.id);
        if (!guide || guide.role !== "guide") return res.status(404).json({ ok: false, message: "Guide not found" });

        // remove tours owned by guide
        const Tour = require("../models/Tour");
        await Tour.deleteMany({ guideId: guide._id });

        // remove guide user
        await guide.deleteOne();

        res.json({ ok: true, message: "Guide and their tours deleted" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// GET /api/admin/guides/:id/tours  -> list tours for a specific guide
router.get("/guides/:id/tours", requireAuth, requireRole("admin"), async (req, res) => {
    try {
        const Tour = require("../models/Tour");
        const tours = await Tour.find({ guideId: req.params.id }).sort({ createdAt: -1 });
        res.json({ ok: true, tours });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

module.exports = router;

// POST /api/admin/create-admin  -> create a new admin account (admin only)
router.post("/create-admin", requireAuth, requireRole("admin"), async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, country } = req.body || {};

        // Validation
        if (!firstName || !lastName || !email || !password || !phone || !country) {
            return res.status(400).json({ 
                ok: false, 
                message: "First name, last name, email, password, phone, and country are required" 
            });
        }

        // Check if email already exists
        const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
        if (exists) {
            return res.status(409).json({ ok: false, message: "Email already in use" });
        }

        // Password validation
        if (String(password).length < 8) {
            return res.status(400).json({ 
                ok: false, 
                message: "Password must be at least 8 characters long" 
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(String(password), 10);

        // Create admin user
        const adminUser = await User.create({
            role: "admin",
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            email: String(email).toLowerCase().trim(),
            passwordHash,
            phone: String(phone).trim(),
            country: String(country).trim(),
            isApproved: true, // Admins are always approved
            termsAccepted: true,
            newsletter: false,
        });

        res.status(201).json({
            ok: true,
            message: "Admin account created successfully",
            admin: {
                id: adminUser._id,
                fullName: adminUser.fullName,
                email: adminUser.email,
                role: adminUser.role,
            },
        });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});
