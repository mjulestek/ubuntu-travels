require("dotenv").config();
const mongoose = require("mongoose");
const Tour = require("./models/Tour");

const tours = [
    {
        slug: "kuala-lumpur-classic",
        title: "Kuala Lumpur Classic Highlights",
        subtitle: "Food markets, city landmarks and local culture in Malaysia’s capital.",
        location: "Kuala Lumpur, Malaysia",
        startCity: "Kuala Lumpur",
        endCity: "Kuala Lumpur",
        durationDays: 5,
        groupSizeMin: 1,
        groupSizeMax: 12,
        minimumAge: 15,
        style: "Original",
        theme: "Explorer",
        physicalRating: 2,
        price: 50,
        rating: 4.2,
        reviewsCount: 2,
        imageUrl: "./assets/images/popular-1.jpg",
        gallery: ["./assets/images/popular-1.jpg", "./assets/images/destination-3.jpg"],
        description:
            "Start in the heart of Kuala Lumpur and explore iconic sights, hidden food spots, and day-trip style experiences with plenty of free time.",
        whyYoullLove: [
            "Explore famous landmarks and local neighbourhoods with a small group.",
            "Taste street food and visit bustling markets with a local feel.",
            "Enjoy a balanced pace with guided highlights + free time.",
        ],
        highlights: ["City landmarks", "Street food", "Local markets"],
        itinerary: [
            { day: 1, title: "Arrival & City Welcome", description: "Meet your guide, explore nearby streets and sample local food.", accommodation: "Hotel", meals: [] },
            { day: 2, title: "Landmarks & Culture", description: "Visit key city sights and cultural stops with free time after lunch.", accommodation: "Hotel", meals: ["Breakfast"] },
            { day: 3, title: "Markets & Food Tour", description: "A guided market visit and street food tasting experience.", accommodation: "Hotel", meals: ["Breakfast"] },
            { day: 4, title: "Free Day / Optional Day Trip", description: "Choose museums, parks, or an optional day trip based on your interests.", accommodation: "Hotel", meals: ["Breakfast"] },
            { day: 5, title: "Departure", description: "Trip ends after breakfast. Extend your stay or continue exploring.", accommodation: "", meals: ["Breakfast"] },
        ],
    },

    {
        slug: "bali-beach-retreat",
        title: "Bali Beach Retreat",
        subtitle: "Slow mornings, beach time, temples and sunsets in Bali.",
        location: "Bali, Indonesia",
        startCity: "Bali",
        endCity: "Bali",
        durationDays: 7,
        groupSizeMin: 1,
        groupSizeMax: 12,
        minimumAge: 15,
        style: "Original",
        theme: "Explorer",
        physicalRating: 2,
        price: 120,
        rating: 4.7,
        reviewsCount: 19,
        imageUrl: "./assets/images/popular-2.jpg",
        gallery: ["./assets/images/popular-2.jpg", "./assets/images/destination-5.jpg"],
        description:
            "A relaxed Bali trip with cultural stops, beach time and viewpoints — designed for travellers who want a mix of guidance and freedom.",
        whyYoullLove: [
            "Enjoy a relaxed pace with plenty of beach and free time.",
            "Visit temples and scenic viewpoints with a local guide.",
            "Small-group vibe with flexible evenings for dining and exploring.",
        ],
        highlights: ["Beach time", "Temple visit", "Sunset viewpoint"],
        itinerary: [
            { day: 1, title: "Arrival", description: "Arrive, settle in, optional welcome dinner.", accommodation: "Hotel", meals: [] },
            { day: 2, title: "Temple & Culture", description: "Guided cultural stops and temple visit.", accommodation: "Hotel", meals: ["Breakfast"] },
            { day: 3, title: "Beach Day", description: "Free day to relax or explore.", accommodation: "Hotel", meals: ["Breakfast"] },
            { day: 4, title: "Viewpoints & Markets", description: "Scenic viewpoint + local market browse.", accommodation: "Hotel", meals: ["Breakfast"] },
            { day: 5, title: "Free Day", description: "Optional activities: surfing, spa, or cooking class.", accommodation: "Hotel", meals: ["Breakfast"] },
            { day: 6, title: "Sunset Evening", description: "Final guided sunset experience.", accommodation: "Hotel", meals: ["Breakfast"] },
            { day: 7, title: "Departure", description: "Trip ends after breakfast.", accommodation: "", meals: ["Breakfast"] },
        ],
    },

    {
        slug: "nepal-himalaya-hike",
        title: "Nepal Himalaya Hike",
        subtitle: "Mountain views, village life and unforgettable trails.",
        location: "Kathmandu, Nepal",
        startCity: "Kathmandu",
        endCity: "Kathmandu",
        durationDays: 10,
        groupSizeMin: 1,
        groupSizeMax: 12,
        minimumAge: 15,
        style: "Original",
        theme: "Explorer",
        physicalRating: 3,
        price: 200,
        rating: 4.8,
        reviewsCount: 31,
        imageUrl: "./assets/images/popular-3.jpg",
        gallery: ["./assets/images/popular-3.jpg", "./assets/images/destination-4.jpg"],
        description:
            "A guided hiking adventure designed for active travellers who want a comfortable pace and deep cultural moments along the trail.",
        whyYoullLove: [
            "Hike scenic trails with a local leader and small group.",
            "Experience village life and mountain landscapes.",
            "A balanced route with rest time and cultural stops.",
        ],
        highlights: ["Mountain trails", "Village visits", "Guided hiking"],
        itinerary: [
            { day: 1, title: "Arrival in Kathmandu", description: "Meet your guide, trip briefing, explore nearby streets.", accommodation: "Hotel", meals: [] },
            { day: 2, title: "Drive to Trail Region", description: "Scenic drive and preparation for hiking.", accommodation: "Lodge", meals: ["Breakfast"] },
            { day: 3, title: "Hike Day 1", description: "First trail day with steady pace and viewpoints.", accommodation: "Lodge", meals: ["Breakfast"] },
            { day: 4, title: "Hike Day 2", description: "Village visit and cultural stop.", accommodation: "Lodge", meals: ["Breakfast"] },
            { day: 5, title: "Hike Day 3", description: "Longer hiking day with mountain scenery.", accommodation: "Lodge", meals: ["Breakfast"] },
            { day: 6, title: "Rest / Explore", description: "Rest day or optional short hike.", accommodation: "Lodge", meals: ["Breakfast"] },
            { day: 7, title: "Hike Day 4", description: "Final hiking day, return toward base.", accommodation: "Lodge", meals: ["Breakfast"] },
            { day: 8, title: "Back to Kathmandu", description: "Drive back and free afternoon.", accommodation: "Hotel", meals: ["Breakfast"] },
            { day: 9, title: "Free Day", description: "Explore Kathmandu or optional cultural tour.", accommodation: "Hotel", meals: ["Breakfast"] },
            { day: 10, title: "Departure", description: "Trip ends after breakfast.", accommodation: "", meals: ["Breakfast"] },
        ],
    },
];

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Tour.deleteMany({});
        await Tour.insertMany(tours);
        console.log(`✅ Seeded ${tours.length} tours (with itinerary)`);
    } catch (err) {
        console.error("❌ Seed failed:", err.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
})();
