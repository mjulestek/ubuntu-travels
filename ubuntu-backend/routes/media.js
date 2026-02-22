const express = require("express");
const { requireAdmin } = require("../middleware/requireAdmin");
const { requireAuth } = require("../middleware/requireAuth");
const { getUploadUrl, deleteKey } = require("../utils/s3");

const router = express.Router();

// upload handler used in local fallback mode
router.put(
    "/upload",
    requireAuth, // Changed from requireAdmin to allow guides
    express.raw({ type: "*/*", limit: "50mb" }),
    async (req, res) => {
        try {
            const key = req.query.key;
            if (!key) return res.status(400).json({ ok: false, message: "key query param required" });

            const path = require("path");
            const fs = require("fs");
            const uploadsDir = path.join(__dirname, "..", "uploads");
            const filePath = path.join(uploadsDir, key);

            // ensure directory exists
            fs.mkdirSync(path.dirname(filePath), { recursive: true });

            // write raw body to file
            fs.writeFileSync(filePath, req.body);

            const host = process.env.APP_ORIGIN || `http://localhost:${process.env.PORT || 5000}`;
            const publicUrl = `${host}/uploads/${key}`;

            res.json({ ok: true, key, publicUrl });
        } catch (err) {
            res.status(500).json({ ok: false, message: err.message });
        }
    }
);

/**
 * POST /api/media/presign
 * body: { filename, contentType, folder? }
 * returns: { uploadUrl, publicUrl, key }
 */
router.post("/presign", requireAuth, async (req, res) => { // Changed from requireAdmin
    try {
        const { filename, contentType, folder } = req.body;

        if (!filename) {
            return res.status(400).json({ ok: false, message: "filename required" });
        }

        // safe-ish filename (basic)
        const clean = String(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
        const prefix = folder ? String(folder).replace(/[^a-zA-Z0-9/_-]/g, "") : "tours";
        const key = `${prefix}/${Date.now()}-${clean}`;

        const signed = await getUploadUrl({ key, contentType });
        res.json({ ok: true, ...signed });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * DELETE /api/media
 * body: { key }
 */
router.delete("/", requireAuth, async (req, res) => { // Changed from requireAdmin
    try {
        const { key } = req.body;
        if (!key) return res.status(400).json({ ok: false, message: "key required" });

        await deleteKey(key);
        res.json({ ok: true, message: "Deleted" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

module.exports = router;
