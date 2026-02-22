const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
    try {
        const auth = req.headers.authorization || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
        if (!token) return res.status(401).json({ ok: false, message: "Missing token" });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // { id, role, email, fullName }
        next();
    } catch {
        return res.status(401).json({ ok: false, message: "Invalid/expired token" });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ ok: false, message: "Not authenticated" });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ ok: false, message: "Forbidden" });
        }
        next();
    };
}

module.exports = { requireAuth, requireRole };
