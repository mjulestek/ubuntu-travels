const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
    {
        // Who booked (tourist)
        touristId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

        // What they booked
        tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
        guideId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        // Customer info (keep even if touristId exists)
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, required: true, trim: true },

        travelDate: { type: Date, required: true },
        guests: { type: Number, required: true, min: 1, max: 50 },

        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
        },

        notes: { type: String, trim: true, maxlength: 2000 },
        adminNotes: { type: String, trim: true, maxlength: 1000 }, // for later ops

        // Custom trip fields
        customTrip: { type: Boolean, default: false },
        customTripData: {
            duration: { type: Number },
            budget: { type: String },
            selectedTours: [{ 
                id: { type: mongoose.Schema.Types.ObjectId, ref: "Tour" },
                title: String,
                price: Number
            }],
            specialRequests: { type: String, maxlength: 1000 }
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
