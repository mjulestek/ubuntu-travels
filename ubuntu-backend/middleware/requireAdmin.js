"use strict";

const { requireAuth } = require("./requireAuth");

function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ ok: false, message: "Forbidden (admin only)" });
        }
        next();
    });
}

module.exports = { requireAdmin };
