const mongoose = require("mongoose");
const { ALLOWED_COUNTRIES } = require("../constants/countries");

const ItinerarySchema = new mongoose.Schema(
    {
        day: { type: Number, required: true, min: 1 },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const TourSchema = new mongoose.Schema(
    {
        // Ownership
        guideId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        // Visibility + moderation
        status: {
            type: String,
            enum: ["draft", "pending_approval", "approved", "rejected"],
            default: "draft",
        },

        // Core listing fields
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, trim: true },
        location: { type: String, required: true, trim: true },

        // Countries (your requirement)
        countries: {
            type: [String],
            validate: {
                validator: (arr) =>
                    Array.isArray(arr) &&
                    arr.length >= 1 &&
                    arr.every((c) => ALLOWED_COUNTRIES.includes(c)),
                message: "Invalid countries. Allowed: Rwanda, Uganda, Tanzania, Kenya",
            },
            required: true,
        },

        durationDays: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },

        imageUrl: { type: String, required: true, trim: true },
        gallery: { type: [String], default: [] },

        description: { type: String, trim: true },
        itinerary: { type: [ItinerarySchema], default: [] },

        rating: { type: Number, default: 4.5 },
        reviewsCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Tour", TourSchema);
