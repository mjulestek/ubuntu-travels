# Ubuntu Travels - East Africa Tour Platform

![Project Status](https://img.shields.io/badge/Status-MVP-success)
![Node](https://img.shields.io/badge/Node.js-v18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-v6+-brightgreen)

Full-stack tour booking platform connecting travelers with verified local guides across East Africa (Rwanda, Uganda, Tanzania, Kenya).

## 🚀 Tech Stack

**Frontend:** Vanilla JavaScript, HTML5, CSS3  
**Backend:** Node.js, Express.js, JWT Authentication  
**Database:** MongoDB with Mongoose ODM  
**Tools:** Kiro AI IDE, Claude AI, Figma, Relume, MongoDB Compass

## ✨ Core Features

- **Dynamic Guide System** - Two-tier approval (approved + verified) for homepage visibility
- **Smart Image Upload** - Auto-resize to 800x800px, accepts any format (JPEG/PNG/WebP/GIF)
- **Role-Based Access** - Admin, Guide, and Traveler roles with JWT authentication
- **Tour Management** - Create, edit, approve, and book tours
- **Real-time Updates** - Profile changes reflect instantly across platform
- **SEO-Friendly URLs** - Auto-generated slugs for guide profiles

## 🛠️ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB v6+
- Docker (optional)

### Setup

```bash
# Backend
cd ubuntu-backend
npm install
echo "MONGO_URI=mongodb://localhost:27017/ubuntu-travels\nJWT_SECRET=your-secret\nPORT=5000" > .env
docker run -d --name mongo-dev -p 27017:27017 mongo:latest
npm run seed
npm run dev

# Frontend (new terminal)
cd ubuntu-frontend
python3 -m http.server 8000
```

**Access:** Frontend at `http://localhost:8000` | Backend at `http://localhost:5000`

**Default Admin:** `admin@ubuntu.com` / `Admin123!`

## 📁 Project Structure

```
ubuntu-travels/
├── ubuntu-backend/
│   ├── models/          # User, Tour, Booking schemas
│   ├── routes/          # API endpoints (auth, tours, guides, admin)
│   ├── middleware/      # JWT auth & RBAC
│   └── server.js
└── ubuntu-frontend/
    ├── assets/          # CSS, JS, images
    ├── index.html       # Homepage
    ├── admin.html       # Admin panel
    └── guide-*.html     # Guide dashboard & profile
```

## 🔐 Key APIs

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - JWT login
- `GET /api/guides` - List verified guides
- `POST /api/tours` - Create tour (guide only)
- `PATCH /api/admin/guides/:id` - Approve/verify guides (admin)

## 🎯 Smart Features

**Image Pipeline:** Client-side Canvas API resizing → S3/local upload → Instant preview  
**Auth Flow:** bcrypt hashing → JWT (24h) → Role-based middleware  
**Guide Visibility:** Must be `isApproved: true` AND `verified: true` for homepage

## 🌐 Next Phase: AWS Deployment

**Infrastructure:** EC2 Auto Scaling, S3 + CloudFront, DocumentDB, Route 53  
**DevOps:** GitHub Actions CI/CD, Docker containers, Terraform IaC, CloudWatch monitoring

## 👨‍💻 Developer

**Jules M.** - [@mjulestek](https://github.com/mjulestek)

---

*Built with Kiro AI IDE & Claude for rapid full-stack development*
