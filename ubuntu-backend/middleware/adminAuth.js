function requireAdmin(req, res, next) {
    const auth = req.headers.authorization || "";

    // expected format: "Bearer TOKEN"
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token || token !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ ok: false, message: "Unauthorized (admin only)" });
    }

    next();
}

module.exports = { requireAdmin };
