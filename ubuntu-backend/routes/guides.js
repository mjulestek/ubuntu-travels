const express = require("express");
const User = require("../models/User");

const router = express.Router();

// GET /api/guides - Get all verified guides (homepage section)
router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        
        let query = User.find({ 
            role: "guide", 
            verified: true,
            isApproved: true,
            isBanned: false
        })
        .select('fullName slug profileImage shortIntro country city specializations languages')
        .sort({ createdAt: -1 });
        
        // Apply limit only if specified (for homepage)
        if (limit) {
            query = query.limit(limit);
        }
        
        const guides = await query;
        
        res.json({ 
            success: true, 
            data: guides.map(g => ({
                full_name: g.fullName,
                slug: g.slug,
                photo_url: g.profileImage || '',
                short_intro: g.shortIntro || 'Local tour guide',
                country: g.country || '',
                city: g.city || '',
                specializations: g.specializations || [],
                languages: g.languages || []
            }))
        });
    } catch (err) {
        console.error('Error fetching guides:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// GET /api/guides/:slug - Get single guide by slug (bio page)
router.get("/:slug", async (req, res) => {
    try {
        const guide = await User.findOne({
            slug: req.params.slug,
            role: "guide",
            verified: true,
            isApproved: true,
            isBanned: false
        }).select('-passwordHash -__v');
        
        if (!guide) {
            return res.status(404).json({
                success: false,
                message: 'Guide not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                full_name: guide.fullName,
                slug: guide.slug,
                photo_url: guide.profileImage || '',
                short_intro: guide.shortIntro || 'Local tour guide',
                bio: guide.bio || '',
                experience_years: guide.yearsOfExperience || 0,
                languages: guide.languages || [],
                location: guide.city && guide.country ? `${guide.city}, ${guide.country}` : guide.country,
                specializations: guide.specializations || [],
                verified: guide.verified
            }
        });
    } catch (err) {
        console.error('Error fetching guide:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
