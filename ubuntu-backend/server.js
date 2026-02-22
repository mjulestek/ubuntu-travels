require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// public routes
const bookingsRoute = require("./routes/bookings");
const toursRoute = require("./routes/tours");
const newsletterRoute = require("./routes/newsletter");
const mediaRoute = require("./routes/media");
const authRoute = require("./routes/auth");
const guideToursRoute = require("./routes/guideTours");
const guidesRoute = require("./routes/guides");
// admin routes
const adminToursRoute = require("./routes/adminTours");
const adminRoute = require("./routes/admin");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// serve uploaded files when using local storage fallback
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// health
app.get("/api/health", (req, res) => {
    res.json({ ok: true, message: "Tourest API is running" });
});

// root: redirect to frontend or show simple message
app.get("/", (req, res) => {
    const origin = process.env.APP_ORIGIN || "http://localhost:8000";
    return res.redirect(origin);
});

// public routes
app.use("/api/bookings", bookingsRoute);
app.use("/api/tours", toursRoute);
app.use("/api/newsletter", newsletterRoute);
app.use("/api/media", mediaRoute);
app.use("/api/auth", authRoute);
app.use("/api/guide", guideToursRoute);
app.use("/api/guides", guidesRoute);

// admin routes
app.use("/api/admin", adminToursRoute);
app.use("/api/admin", adminRoute);

// mongodb
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
