"use strict";

const express = require("express");
const Tour = require("../models/Tour");
const { requireAdmin } = require("../middleware/requireAdmin");

const router = express.Router();

// ADMIN: GET /api/admin/tours?status=pending|approved|rejected|draft
router.get("/tours", requireAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const tours = await Tour.find(filter).sort({ createdAt: -1 });
        return res.json({ ok: true, tours });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

// ADMIN: PATCH /api/admin/tours/:id/status
router.patch("/tours/:id/status", requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        const allowed = ["approved", "pending", "rejected", "draft"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ ok: false, message: "Invalid status" });
        }

        const updated = await Tour.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updated) return res.status(404).json({ ok: false, message: "Tour not found" });
        return res.json({ ok: true, tour: updated });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

// ADMIN: DELETE /api/admin/tours/:id
router.delete("/tours/:id", requireAdmin, async (req, res) => {
    try {
        const deleted = await Tour.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ ok: false, message: "Tour not found" });
        return res.json({ ok: true, message: "Deleted" });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

module.exports = router;
