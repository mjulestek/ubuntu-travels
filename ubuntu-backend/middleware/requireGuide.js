"use strict";

const { requireAuth } = require("./requireAuth");
const User = require("../models/User");

async function requireGuide(req, res, next) {
    requireAuth(req, res, async () => {
        if (!req.user) return res.status(401).json({ ok: false, message: "Unauthorized" });

        if (req.user.role !== "guide") {
            return res.status(403).json({ ok: false, message: "Forbidden (guide only)" });
        }

        // Fetch fresh approval status from database
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(401).json({ ok: false, message: "User not found" });
            }

            // Check if guide is approved
            if (user.isApproved !== true) {
                return res.status(403).json({ ok: false, message: "Guide not approved yet" });
            }

            // Check if guide is banned
            if (user.isBanned === true) {
                return res.status(403).json({ ok: false, message: "Account has been banned" });
            }

            next();
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    });
}

module.exports = { requireGuide };
