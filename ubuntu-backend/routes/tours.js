const express = require("express");
const Tour = require("../models/Tour");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/requireAuth");
const { ALLOWED_COUNTRIES } = require("../constants/countries");

const router = express.Router();

/* ---------------- PUBLIC ---------------- */

// GET /api/tours?country=Rwanda
router.get("/", async (req, res) => {
    try {
        const { country } = req.query;

        const filter = { status: "approved" };
        if (country) {
            if (!ALLOWED_COUNTRIES.includes(country)) {
                return res.status(400).json({ ok: false, message: "Invalid country filter" });
            }
            filter.countries = country;
        }

        const tours = await Tour.find(filter).sort({ createdAt: -1 });
        res.json({ ok: true, tours });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// GET /api/tours/slug/:slug
router.get("/slug/:slug", async (req, res) => {
    try {
        const tour = await Tour.findOne({ slug: req.params.slug.toLowerCase(), status: "approved" });
        if (!tour) return res.status(404).json({ ok: false, message: "Tour not found" });
        res.json({ ok: true, tour });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/* ---------------- GUIDE ---------------- */

// GET /api/tours/mine  (guide’s own tours)
router.get("/mine", requireAuth, requireRole("guide"), async (req, res) => {
    try {
        const tours = await Tour.find({ guideId: req.user.id }).sort({ createdAt: -1 });
        res.json({ ok: true, tours });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// POST /api/tours (guide creates)
router.post("/", requireAuth, requireRole("guide"), async (req, res) => {
    try {
        const guide = await User.findById(req.user.id);
        if (!guide || guide.isBanned) return res.status(403).json({ ok: false, message: "Guide not allowed" });

        // guide can create draft even if not approved; publishing requires approval via status
        const payload = { ...req.body, guideId: req.user.id };

        // if guide is not approved, force pending_approval when they try to publish
        if (payload.status === "approved") payload.status = "pending_approval";
        if (!guide.isApproved && payload.status !== "draft") payload.status = "pending_approval";

        const created = await Tour.create(payload);
        res.status(201).json({ ok: true, tour: created });
    } catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// PUT /api/tours/:id (guide updates own)
router.put("/:id", requireAuth, requireRole("guide"), async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour) return res.status(404).json({ ok: false, message: "Tour not found" });
        if (tour.guideId.toString() !== req.user.id) {
            return res.status(403).json({ ok: false, message: "Not your tour" });
        }

        // guide cannot set approved directly
        const updates = { ...req.body };
        if (updates.status === "approved") updates.status = "pending_approval";

        const updated = await Tour.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        });

        res.json({ ok: true, tour: updated });
    } catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

// DELETE /api/tours/:id (guide deletes own)
router.delete("/:id", requireAuth, requireRole("guide"), async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour) return res.status(404).json({ ok: false, message: "Tour not found" });
        if (tour.guideId.toString() !== req.user.id) {
            return res.status(403).json({ ok: false, message: "Not your tour" });
        }

        await Tour.findByIdAndDelete(req.params.id);
        res.json({ ok: true, message: "Deleted" });
    } catch (err) {
        res.status(400).json({ ok: false, message: err.message });
    }
});

/* ---------------- ADMIN ---------------- */

// GET /api/tours/admin/all (see all tours)
router.get("/admin/all", requireAuth, requireRole("admin"), async (req, res) => {
    try {
        const tours = await Tour.find().sort({ createdAt: -1 });
        res.json({ ok: true, tours });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// PATCH /api/tours/admin/:id/status
router.patch("/admin/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
    try {
        const { status } = req.body;
        if (!["draft", "pending_approval", "approved", "rejected"].includes(status)) {
            return res.status(400).json({ ok: false, message: "Invalid status" });
        }

        const updated = await Tour.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updated) return res.status(404).json({ ok: false, message: "Tour not found" });

        res.json({ ok: true, tour: updated });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

// DELETE /api/tours/admin/:id  -> admin can delete any tour
router.delete("/admin/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour) return res.status(404).json({ ok: false, message: "Tour not found" });

        await Tour.findByIdAndDelete(req.params.id);
        return res.json({ ok: true, message: "Deleted" });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

module.exports = router;
