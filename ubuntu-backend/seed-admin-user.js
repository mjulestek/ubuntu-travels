require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = "admin@tourest.com";
        const password = "Admin123!";

        const exists = await User.findOne({ email });
        if (exists) {
            console.log("⚠️ Admin user already exists:", email);
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await User.create({
            role: "admin",
            firstName: "Platform",
            lastName: "Admin",
            email,
            passwordHash,
            phone: "+250123456789",
            country: "Rwanda",
            isApproved: true,
            termsAccepted: true,
        });

        console.log("✅ Admin user created successfully!");
        console.log("📧 Email:", email);
        console.log("🔑 Password:", password);
        console.log("🌍 Database: ubuntu_travels");
        process.exit(0);
    } catch (err) {
        console.error("❌ seed admin error:", err.message);
        process.exit(1);
    }
})();
