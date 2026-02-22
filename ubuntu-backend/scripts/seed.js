"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Tour = require("../models/Tour");
const { ALLOWED_COUNTRIES } = require("../constants/countries");

function slugify(str) {
    return String(str || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

async function main() {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error("❌ Missing MONGO_URI in .env");
        process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Mongo connected");

    // wipe existing demo data (safe for local development)
    await Promise.all([
        User.deleteMany({ email: { $in: ["admin@ubuntu.com", "guide@ubuntu.com", "tourist@ubuntu.com"] } }),
        // remove previously seeded demo tours so we can re-seed a fresh set
        Tour.deleteMany({}),
    ]);

    // create admin
    const adminPass = await bcrypt.hash("Admin123!", 10);
    const admin = await User.create({
        role: "admin",
        firstName: "Ubuntu",
        lastName: "Admin",
        email: "admin@ubuntu.com",
        passwordHash: adminPass,
        phone: "+250788000001",
        country: "Rwanda",
        isApproved: true,
        termsAccepted: true,
    });

    // create guide
    const guidePass = await bcrypt.hash("Guide123!", 10);
    const guide = await User.create({
        role: "guide",
        firstName: "Demo",
        lastName: "Guide",
        email: "guide@ubuntu.com",
        passwordHash: guidePass,
        phone: "+250788000002",
        country: "Rwanda",
        isApproved: true,
        termsAccepted: true,
    });

    // create tourist
    const touristPass = await bcrypt.hash("Tourist123!", 10);
    const tourist = await User.create({
        role: "tourist",
        firstName: "Demo",
        lastName: "Tourist",
        email: "tourist@ubuntu.com",
        passwordHash: touristPass,
        phone: "+250788000003",
        country: "Rwanda",
        isApproved: true,
        termsAccepted: true,
    });

    console.log("✅ Users created:");
    console.log("   admin@ubuntu.com / Admin123!");
    console.log("   guide@ubuntu.com / Guide123!");
    console.log("   tourist@ubuntu.com / Tourist123!");

    // create sample tours: at least 3 per allowed country
    const tours = [];
    const sampleImages = [
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&q=80",
    ];

    ALLOWED_COUNTRIES.forEach((country, ci) => {
        for (let j = 1; j <= 3; j++) {
            const days = 1 + j + (ci % 2); // simple variation
            const title = `${country} ${j === 1 ? "Explorer" : j === 2 ? "Wildlife & Culture" : "Adventure"} — ${days} Days`;
            const subtitle = `${country} highlights and local experiences`;
            const price = 199 + ci * 100 + j * 150;
            const img = sampleImages[(ci + j) % sampleImages.length];

            const t = {
                guideId: guide._id,
                status: "approved",
                title,
                subtitle,
                location: `${country} - Main region`,
                countries: [country],
                durationDays: days,
                price,
                imageUrl: img,
                gallery: [],
                description: `Enjoy a curated ${days}-day journey through ${country}. This sample tour highlights key attractions, local culture and comfortable travel arrangements.`,
                itinerary: Array.from({ length: days }, (_, d) => ({ day: d + 1, title: `Day ${d + 1}`, description: `Activity for day ${d + 1} in ${country}.` })),
                rating: 4.5 + (j - 1) * 0.1,
                reviewsCount: 3 + j * 2,
            };

            t.slug = slugify(`${country}-${title}`).slice(0, 60);
            // ensure lowercase and unique-ish
            tours.push(t);
        }
    });

    await Tour.insertMany(tours);
    console.log(`✅ Tours created: ${tours.length} sample tours (${ALLOWED_COUNTRIES.length} countries × 3 each)`);

    await mongoose.disconnect();
    console.log("✅ Done");
}

main().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
