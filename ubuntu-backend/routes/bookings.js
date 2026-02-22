const express = require("express");
const Booking = require("../models/Booking");
const Tour = require("../models/Tour");
const { requireAuth, requireRole } = require("../middleware/requireAuth");

const router = express.Router();

/**
 * PUBLIC: Create booking
 * POST /api/bookings
 * body: { tourId, fullName, email, phone, travelDate, guests, notes }
 */
router.post("/", async (req, res) => {
    try {
        const { tourId, fullName, email, phone, travelDate, guests, notes } = req.body;

        if (!tourId || !fullName || !email || !phone || !travelDate || !guests) {
            return res.status(400).json({ ok: false, message: "Missing required fields." });
        }

        const tour = await Tour.findById(tourId);
        if (!tour || tour.status !== "approved") {
            return res.status(400).json({ ok: false, message: "Tour not available." });
        }

        const booking = await Booking.create({
            tourId,
            guideId: tour.guideId,
            fullName,
            email,
            phone,
            travelDate,
            guests,
            notes,
        });

        return res.status(201).json({ ok: true, booking });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * PUBLIC: Create custom trip request
 * POST /api/bookings/custom-trip
 * body: { fullName, email, phone, startDate, duration, travelers, budget, selectedTours, specialRequests }
 */
router.post("/custom-trip", async (req, res) => {
    try {
        const { 
            fullName, 
            email, 
            phone, 
            startDate, 
            duration, 
            travelers, 
            budget, 
            selectedTours, 
            specialRequests 
        } = req.body;

        if (!fullName || !email || !phone || !startDate || !duration || !travelers || !budget || !selectedTours || selectedTours.length === 0) {
            return res.status(400).json({ ok: false, message: "Missing required fields." });
        }

        // Verify all selected tours exist and are approved
        const tours = await Tour.find({ _id: { $in: selectedTours }, status: 'approved' });
        if (tours.length !== selectedTours.length) {
            return res.status(400).json({ ok: false, message: "Some selected tours are not available." });
        }

        // Create a custom trip booking with special format
        const customTripNotes = `
CUSTOM TRIP REQUEST
-------------------
Duration: ${duration} days
Travelers: ${travelers}
Budget: ${budget}
Selected Tours: ${tours.map(t => t.title).join(', ')}

Special Requests:
${specialRequests || 'None'}
        `.trim();

        // Create booking for the first tour (as reference) with custom notes
        const booking = await Booking.create({
            tourId: tours[0]._id,
            guideId: tours[0].guideId,
            fullName,
            email,
            phone,
            travelDate: startDate,
            guests: travelers,
            notes: customTripNotes,
            customTrip: true,
            customTripData: {
                duration,
                budget,
                selectedTours: tours.map(t => ({ id: t._id, title: t.title, price: t.price })),
                specialRequests
            }
        });

        return res.status(201).json({ ok: true, booking, message: "Custom trip request submitted successfully!" });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * GUIDE: See bookings for my tours
 * GET /api/bookings/mine
 */
router.get("/mine", requireAuth, requireRole("guide"), async (req, res) => {
    try {
        const bookings = await Booking.find({ guideId: req.user.id }).sort({ createdAt: -1 });
        return res.json({ ok: true, bookings });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * ADMIN: list all bookings
 * GET /api/bookings/admin
 */
router.get("/admin", requireAuth, requireRole("admin"), async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        return res.json({ ok: true, bookings });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * GUIDE or ADMIN: update status
 * PATCH /api/bookings/:id/status
 */
router.patch("/:id/status", requireAuth, async (req, res) => {
    try {
        const { status } = req.body;
        if (!["pending", "confirmed", "cancelled"].includes(status)) {
            return res.status(400).json({ ok: false, message: "Invalid status" });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ ok: false, message: "Booking not found" });

        // Guide can only update their own bookings
        if (req.user.role === "guide" && booking.guideId.toString() !== req.user.id) {
            return res.status(403).json({ ok: false, message: "Not your booking" });
        }

        // Tourists cannot update status
        if (req.user.role === "tourist") {
            return res.status(403).json({ ok: false, message: "Forbidden" });
        }

        booking.status = status;
        await booking.save();

        return res.json({ ok: true, booking });
    } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
    }
});

module.exports = router;
