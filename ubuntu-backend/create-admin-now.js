require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const User = mongoose.model("User", new mongoose.Schema({
            role: String,
            firstName: String,
            lastName: String,
            fullName: String,
            email: String,
            passwordHash: String,
            phone: String,
            country: String,
            isApproved: Boolean,
            termsAccepted: Boolean,
        }, { timestamps: true }));

        const email = "admin@tourest.com";
        const exists = await User.findOne({ email });
        
        if (exists) {
            console.log("⚠️  Admin already exists!");
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash("Admin123!", 10);

        await User.create({
            role: "admin",
            firstName: "Platform",
            lastName: "Admin",
            fullName: "Platform Admin",
            email: email,
            passwordHash: passwordHash,
            phone: "+250123456789",
            country: "Rwanda",
            isApproved: true,
            termsAccepted: true,
        });

        console.log("✅ Admin user created successfully!");
        console.log("📧 Email: admin@tourest.com");
        console.log("🔑 Password: Admin123!");
        console.log("🗄️  Database: ubuntu_travels");
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
})();
