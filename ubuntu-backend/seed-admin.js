require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = "admin@ubuntu-travels.com";
        const password = "Admin123!";

        const exists = await Admin.findOne({ email });
        if (exists) {
            console.log("⚠️ Admin already exists:", email);
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await Admin.create({ email, passwordHash, name: "Main Admin" });

        console.log("✅ Admin created");
        console.log("Email:", email);
        console.log("Password:", password);
        process.exit(0);
    } catch (err) {
        console.error("❌ seed-admin error:", err.message);
        process.exit(1);
    }
})();
