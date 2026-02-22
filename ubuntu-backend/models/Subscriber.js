const mongoose = require("mongoose");

const SubscriberSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        source: { type: String, default: "website", trim: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Subscriber", SubscriberSchema);
