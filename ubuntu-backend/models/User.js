const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["admin", "guide", "tourist"],
            required: true,
        },
        
        // Personal Information
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        fullName: { type: String, trim: true }, // Auto-generated from firstName + lastName
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        
        // Contact Information
        phone: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        city: { type: String, trim: true },
        address: { type: String, trim: true },
        
        // Business Information (for guides)
        companyName: { type: String, trim: true },
        businessType: { type: String, trim: true }, // e.g., "Tour Operator", "Individual Guide"
        yearsOfExperience: { type: Number, min: 0 },
        languages: { type: [String], default: [] },
        specializations: { type: [String], default: [] }, // e.g., "Wildlife", "Cultural", "Adventure"
        
        // Profile
        bio: { type: String, trim: true, maxlength: 1000 },
        profileImage: { type: String, trim: true },
        slug: { type: String, trim: true, lowercase: true }, // URL-friendly identifier
        shortIntro: { type: String, trim: true, maxlength: 200 }, // Short description for cards
        verified: { type: Boolean, default: false }, // Verified guide badge
        
        // Account Status
        isApproved: { type: Boolean, default: false },
        isBanned: { type: Boolean, default: false },
        emailVerified: { type: Boolean, default: false },
        
        // Preferences
        newsletter: { type: Boolean, default: false },
        termsAccepted: { type: Boolean, required: true, default: false },
    },
    { timestamps: true }
);

// Pre-save hook to generate fullName and slug
UserSchema.pre('save', function() {
    if (this.firstName && this.lastName) {
        this.fullName = `${this.firstName} ${this.lastName}`;
        
        // Auto-generate slug if not set (for guides)
        if (this.role === 'guide' && !this.slug) {
            this.slug = `${this.firstName}-${this.lastName}`
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }
    }
});

module.exports = mongoose.model("User", UserSchema);
