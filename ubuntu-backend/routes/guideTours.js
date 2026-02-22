"use strict";

const express = require("express");
const Tour = require("../models/Tour");
const { requireGuide } = require("../middleware/requireGuide");

const router = express.Router();

// GUIDE: GET /api/guide/tours  -> list my tours
router.get("/tours", requireGuide, async (req, res) => {
    try {
        const tours = await Tour.find({ guideId: req.user.id }).sort({ createdAt: -1 });
        return res.json({ ok: true, tours });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

// GUIDE: POST /api/guide/tours  -> create new tour (starts as pending)
router.post("/tours", requireGuide, async (req, res) => {
    try {
        const payload = req.body || {};

        if (!payload.title || !payload.slug) {
            return res.status(400).json({ ok: false, message: "title and slug are required" });
        }

        const exists = await Tour.findOne({ slug: String(payload.slug).toLowerCase().trim() });
        if (exists) return res.status(409).json({ ok: false, message: "Slug already exists" });

        const tour = await Tour.create({
            ...payload,
            slug: String(payload.slug).toLowerCase().trim(),
            guideId: req.user.id,
            status: "pending_approval",
        });

        return res.status(201).json({ ok: true, tour });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

// GUIDE: PATCH /api/guide/tours/:id -> update my tour
router.patch("/tours/:id", requireGuide, async (req, res) => {
    try {
        const tour = await Tour.findOne({ _id: req.params.id, guideId: req.user.id });
        if (!tour) return res.status(404).json({ ok: false, message: "Tour not found" });

        // Guides can now edit their tours anytime, even if approved
        Object.assign(tour, req.body || {});
        
        // Keep the current status (don't change it back to pending)
        // If tour was approved, it stays approved after edit
        
        await tour.save();

        return res.json({ ok: true, tour });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

// GUIDE: DELETE /api/guide/tours/:id -> delete my tour
router.delete("/tours/:id", requireGuide, async (req, res) => {
    try {
        const tour = await Tour.findOne({ _id: req.params.id, guideId: req.user.id });
        if (!tour) return res.status(404).json({ ok: false, message: "Tour not found" });

        // Guides can now delete their tours anytime, even if approved
        
        // Delete image from S3/local storage if exists
        if (tour.imageUrl) {
            try {
                const { deleteKey } = require("../utils/s3");
                const urlParts = tour.imageUrl.split('/');
                const key = urlParts.slice(-2).join('/');
                await deleteKey(key);
            } catch (err) {
                console.error('Failed to delete image:', err);
            }
        }

        await tour.deleteOne();
        return res.json({ ok: true, message: "Tour deleted successfully" });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

module.exports = router;
