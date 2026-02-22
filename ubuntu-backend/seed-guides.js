require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function seedGuides() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected");
        
        // Create verified guides
        const guides = [
            {
                role: "guide",
                firstName: "Jean",
                lastName: "Mugabo",
                email: "jean.mugabo@guides.com",
                passwordHash: await bcrypt.hash("Guide123!", 10),
                phone: "+250788111111",
                country: "Rwanda",
                city: "Kigali",
                slug: "jean-mugabo",
                shortIntro: "Expert in gorilla trekking and wildlife safaris across Rwanda",
                bio: "With over 10 years of experience guiding tourists through Rwanda's stunning landscapes, I specialize in gorilla trekking expeditions in Volcanoes National Park. My passion is sharing the beauty of Rwanda's wildlife and culture with visitors from around the world.",
                yearsOfExperience: 10,
                languages: ["English", "French", "Kinyarwanda"],
                specializations: ["Wildlife", "Gorilla Trekking", "Cultural Tours"],
                verified: true,
                isApproved: true,
                termsAccepted: true,
                profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
            },
            {
                role: "guide",
                firstName: "Sarah",
                lastName: "Nakato",
                email: "sarah.nakato@guides.com",
                passwordHash: await bcrypt.hash("Guide123!", 10),
                phone: "+256788222222",
                country: "Uganda",
                city: "Kampala",
                slug: "sarah-nakato",
                shortIntro: "Cultural heritage specialist and mountain hiking expert",
                bio: "Born and raised in Uganda, I've dedicated my career to showcasing the rich cultural heritage and natural beauty of the Pearl of Africa. From the Rwenzori Mountains to the source of the Nile, I create unforgettable experiences.",
                yearsOfExperience: 8,
                languages: ["English", "Luganda", "Swahili"],
                specializations: ["Cultural", "Hiking", "Adventure"],
                verified: true,
                isApproved: true,
                termsAccepted: true,
                profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"
            },
            {
                role: "guide",
                firstName: "David",
                lastName: "Kimani",
                email: "david.kimani@guides.com",
                passwordHash: await bcrypt.hash("Guide123!", 10),
                phone: "+254788333333",
                country: "Kenya",
                city: "Nairobi",
                slug: "david-kimani",
                shortIntro: "Safari expert with deep knowledge of Maasai Mara ecosystem",
                bio: "Growing up near the Maasai Mara, I developed a profound connection with Kenya's wildlife. For the past 12 years, I've been leading safaris and sharing my knowledge of the Great Migration and the Big Five with travelers worldwide.",
                yearsOfExperience: 12,
                languages: ["English", "Swahili", "Maasai"],
                specializations: ["Safari", "Wildlife Photography", "Big Five"],
                verified: true,
                isApproved: true,
                termsAccepted: true,
                profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80"
            },
            {
                role: "guide",
                firstName: "Amina",
                lastName: "Hassan",
                email: "amina.hassan@guides.com",
                passwordHash: await bcrypt.hash("Guide123!", 10),
                phone: "+255788444444",
                country: "Tanzania",
                city: "Arusha",
                slug: "amina-hassan",
                shortIntro: "Kilimanjaro climbing specialist and Serengeti safari guide",
                bio: "As a certified mountain guide and wildlife expert, I've successfully led hundreds of climbers to the summit of Kilimanjaro. I also organize incredible safari experiences in the Serengeti and Ngorongoro Crater.",
                yearsOfExperience: 9,
                languages: ["English", "Swahili", "German"],
                specializations: ["Mountain Climbing", "Safari", "Adventure"],
                verified: true,
                isApproved: true,
                termsAccepted: true,
                profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80"
            }
        ];
        
        // Delete existing test guides
        await User.deleteMany({ 
            email: { $in: guides.map(g => g.email) } 
        });
        
        // Insert guides one by one to trigger pre-save hooks
        for (const guideData of guides) {
            await User.create(guideData);
        }
        
        console.log(`✅ Created ${guides.length} verified guides`);
        console.log("\nGuide credentials:");
        guides.forEach(g => {
            console.log(`   ${g.email} / Guide123!`);
        });
        
        await mongoose.disconnect();
        console.log("✅ Done");
        
    } catch (err) {
        console.error("❌ Seed failed:", err);
        process.exit(1);
    }
}

seedGuides();
