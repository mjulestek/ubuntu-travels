const express = require("express");
const Subscriber = require("../models/Subscriber");

const router = express.Router();

function isValidEmail(email) {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// POST /api/newsletter/subscribe
router.post("/subscribe", async (req, res) => {
    try {
        const { email, source } = req.body;

        if (!isValidEmail(email)) {
            return res.status(400).json({ ok: false, message: "Please enter a valid email." });
        }

        const saved = await Subscriber.findOneAndUpdate(
            { email: email.toLowerCase() },
            { $setOnInsert: { email: email.toLowerCase(), source: source || "website" } },
            { new: true, upsert: true }
        );

        return res.json({ ok: true, message: "✅ Subscribed successfully!", subscriber: saved });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

module.exports = router;
