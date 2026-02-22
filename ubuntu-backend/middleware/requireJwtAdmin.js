const jwt = require("jsonwebtoken");

function requireJwtAdmin(req, res, next) {
    try {
        const auth = req.headers.authorization || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

        if (!token) return res.status(401).json({ ok: false, message: "Missing token" });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = payload; // { id, email, name }
        next();
    } catch (err) {
        return res.status(401).json({ ok: false, message: "Invalid/expired token" });
    }
}

module.exports = { requireJwtAdmin };
