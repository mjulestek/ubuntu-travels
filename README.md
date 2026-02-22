# Ubuntu Travels - East Africa Tour Platform

![Project Status](https://img.shields.io/badge/Status-MVP-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node.js-v18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-v6+-brightgreen)

A modern, full-stack tour booking platform connecting travelers with verified local guides across East Africa. Built with vanilla JavaScript, Node.js, Express, and MongoDB.

## 🌍 Project Overview

Ubuntu Travels is a comprehensive tour management system designed to facilitate authentic travel experiences in East Africa (Rwanda, Uganda, Tanzania, Kenya). The platform enables travelers to discover vetted tour guides, book experiences, and connect with local experts while providing guides with tools to manage their profiles and tours.

## ✨ Key Features

### For Travelers
- **Dynamic Tour Discovery**: Browse curated tours with real-time availability
- **Verified Guide Profiles**: View detailed bios, specializations, and languages of vetted guides
- **Advanced Filtering**: Search by country, specialization, language, and experience level
- **Secure Booking System**: Book tours with instant confirmation
- **Newsletter Subscription**: Stay updated with travel tips and new destinations

### For Tour Guides
- **Profile Management Dashboard**: Complete profile editor with image upload
- **Automatic Image Optimization**: Upload any image size - system auto-resizes to 800x800px
- **Tour Creation & Management**: Create, edit, and manage tour listings
- **Dynamic Bio Pages**: SEO-friendly slug-based profile URLs
- **Real-time Updates**: Changes reflect immediately across the platform

### For Administrators
- **Comprehensive Admin Panel**: Manage guides, tours, and bookings
- **Two-tier Approval System**: 
  - Approve guides for platform access
  - Verify guides for homepage visibility
- **Tour Moderation**: Review and approve tour listings
- **Booking Management**: Track and manage all bookings
- **User Management**: Ban/unban users, delete accounts

## 🏗️ Architecture & Technology Stack

### Frontend
- **Vanilla JavaScript** - No frameworks, pure ES6+ for optimal performance
- **Responsive CSS** - Mobile-first design with custom CSS Grid/Flexbox
- **Dynamic Rendering** - Client-side rendering with fetch API
- **Image Optimization** - Canvas API for client-side image resizing
- **Modern UI/UX** - Clean, professional design with signature orange (#E3702D) branding

### Backend
- **Node.js & Express** - RESTful API architecture
- **JWT Authentication** - Secure token-based auth with role-based access control (RBAC)
- **Middleware Stack**:
  - `requireAuth` - JWT verification
  - `requireRole` - Role-based authorization (admin, guide, traveler)
  - `requireGuide` - Guide-specific route protection
- **File Upload System** - S3-compatible with local fallback
- **Password Security** - bcrypt hashing with salt rounds

### Database
- **MongoDB** - NoSQL document database
- **Mongoose ODM** - Schema validation and middleware
- **MongoDB Compass** - GUI for database management
- **Pre-save Hooks** - Auto-generate slugs, fullName fields
- **Indexing** - Optimized queries on email, slug, role fields

### APIs & Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - User registration with role selection
- `POST /login` - JWT token generation
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile with image upload

#### Tours (`/api/tours`)
- `GET /` - List all approved tours (public)
- `GET /:id` - Get single tour details
- `POST /` - Create tour (guide only)
- `PUT /:id` - Update tour (guide only)
- `DELETE /:id` - Delete tour (guide only)

#### Guides (`/api/guides`)
- `GET /` - List verified guides with filters
- `GET /:slug` - Get guide profile by slug

#### Admin (`/api/admin`)
- `GET /guides` - List all guides
- `PATCH /guides/:id` - Update guide status (approve, verify, ban)
- `DELETE /guides/:id` - Delete guide and their tours
- `GET /guides/:id/tours` - List tours by guide

#### Media (`/api/media`)
- `POST /presign` - Get presigned upload URL
- `PUT /upload` - Upload file (local mode)
- `DELETE /` - Delete uploaded file

#### Bookings (`/api/bookings`)
- `POST /` - Create booking
- `GET /my-bookings` - User's bookings
- `GET /admin/all` - All bookings (admin)

## 🎨 Design & Development Tools

### Design
- **Relume** - Component library and design system
- **Figma** - UI/UX design and prototyping
- **Custom Color Palette**: 
  - Primary: `#E3702D` (Ubuntu Orange)
  - Background: `#FFF7EB` (Warm Cream)

### Development
- **Kiro AI IDE** - AI-powered development environment
- **Claude** - AI pair programming for rapid development
- **Git** - Version control
- **MongoDB Compass** - Database visualization and management

## 🚀 Smart Features & Logic

### Dynamic Guide System
- Guides must be both **approved** AND **verified** to appear on homepage
- Automatic slug generation from first/last name for SEO-friendly URLs
- Real-time profile updates across all pages
- Cascading delete: removing a guide deletes all their tours

### Image Upload Pipeline
1. Client selects image (any format: JPEG, PNG, WebP, GIF)
2. Canvas API resizes to max 800x800px (maintains aspect ratio)
3. Converts to JPEG with 90% quality for optimal file size
4. Uploads to S3 or local storage
5. Returns public URL for immediate display

### Authentication Flow
1. User registers with role selection (traveler/guide)
2. Password hashed with bcrypt (10 salt rounds)
3. JWT token generated on login (24h expiry)
4. Token stored in localStorage
5. Middleware validates token on protected routes
6. Role-based access control enforces permissions

### Tour Approval Workflow
1. Guide creates tour (status: pending)
2. Admin reviews in approval panel
3. Admin approves/rejects tour
4. Approved tours appear on public listings
5. Guides can edit their own tours anytime

## 📁 Project Structure

```
ubuntu-travels/
├── ubuntu-backend/
│   ├── models/           # Mongoose schemas
│   │   ├── User.js       # User model with roles
│   │   ├── Tour.js       # Tour listings
│   │   ├── Booking.js    # Booking records
│   │   └── Admin.js      # Admin accounts
│   ├── routes/           # API endpoints
│   │   ├── auth.js       # Authentication
│   │   ├── tours.js      # Tour management
│   │   ├── guides.js     # Guide profiles
│   │   ├── admin.js      # Admin operations
│   │   ├── bookings.js   # Booking system
│   │   └── media.js      # File uploads
│   ├── middleware/       # Auth & authorization
│   ├── utils/            # S3 helpers
│   ├── constants/        # Country data
│   └── server.js         # Express app
├── ubuntu-frontend/
│   ├── assets/
│   │   ├── css/          # Stylesheets
│   │   ├── js/           # Client-side logic
│   │   └── images/       # Static assets
│   ├── index.html        # Homepage
│   ├── auth.html         # Login/Register
│   ├── tours.html        # Tour listings
│   ├── tour-details.html # Single tour view
│   ├── all-guides.html   # Guide directory
│   ├── guide-profile.html # Profile editor
│   ├── guide-dashboard.html # Guide dashboard
│   ├── admin.html        # Admin panel
│   └── admin-bookings.html # Booking management
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB v6+
- Docker (optional, for MongoDB container)

### Backend Setup

```bash
# Navigate to backend
cd ubuntu-backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017/ubuntu-travels
JWT_SECRET=your-secret-key-here
PORT=5000
EOF

# Start MongoDB (Docker)
docker run -d --name mongo-dev -p 27017:27017 mongo:latest

# Seed database
npm run seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend
cd ubuntu-frontend

# Start development server
python3 -m http.server 8000
```

### Access the Application
- Frontend: `http://localhost:8000`
- Backend API: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`

### Default Admin Credentials
```
Email: admin@ubuntu.com
Password: Admin123!
```

## 📊 Database Schema

### User Model
```javascript
{
  role: String,              // 'admin' | 'guide' | 'traveler'
  firstName: String,
  lastName: String,
  fullName: String,          // Auto-generated
  email: String,             // Unique, indexed
  passwordHash: String,
  phone: String,
  country: String,
  city: String,
  slug: String,              // Auto-generated, unique
  profileImage: String,
  shortIntro: String,
  bio: String,
  languages: [String],
  specializations: [String],
  yearsOfExperience: Number,
  isApproved: Boolean,
  verified: Boolean,
  isBanned: Boolean,
  termsAccepted: Boolean,
  newsletter: Boolean
}
```

### Tour Model
```javascript
{
  title: String,
  description: String,
  country: String,
  city: String,
  duration: Number,
  price: Number,
  maxGroupSize: Number,
  difficulty: String,
  images: [String],
  guideId: ObjectId,         // Reference to User
  isApproved: Boolean,
  featured: Boolean
}
```

## 🔐 Security Features

- JWT token authentication with 24h expiry
- Password hashing with bcrypt (10 rounds)
- Role-based access control (RBAC)
- Protected API routes with middleware
- Input validation and sanitization
- CORS configuration
- Secure file upload with type validation
- XSS protection through content sanitization

## 🎯 Next Phase: Cloud Deployment

### Planned AWS Architecture
- **EC2** - Application hosting with Auto Scaling
- **S3** - Static asset storage and image hosting
- **CloudFront** - CDN for global content delivery
- **RDS/DocumentDB** - Managed MongoDB service
- **Route 53** - DNS management
- **Certificate Manager** - SSL/TLS certificates
- **CloudWatch** - Monitoring and logging
- **IAM** - Access management

### DevOps Pipeline
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Containerization**: Docker for consistent environments
- **Orchestration**: ECS/EKS for container management
- **Infrastructure as Code**: Terraform/CloudFormation
- **Monitoring**: CloudWatch, Datadog, or New Relic
- **Backup Strategy**: Automated MongoDB backups to S3

## 📈 Performance Optimizations

- Client-side image resizing reduces upload bandwidth
- Lazy loading for images and dynamic content
- MongoDB indexing on frequently queried fields
- JWT token caching in localStorage
- Efficient query patterns with Mongoose
- Static asset caching
- Minified CSS/JS (production ready)

## 🧪 Testing Strategy (Planned)

- Unit tests for API endpoints (Jest)
- Integration tests for auth flow
- E2E tests for critical user journeys (Cypress)
- Load testing for scalability (k6)
- Security audits (npm audit, Snyk)

## 📝 API Documentation

Full API documentation available at `/api/docs` (Swagger/OpenAPI - coming soon)

## 🤝 Contributing

This is a capstone project. Contributions, issues, and feature requests are welcome!

## 📄 License

MIT License - feel free to use this project for learning purposes.

## 👨‍💻 Developer

**Jules M.**
- GitHub: [@mjulestek](https://github.com/mjulestek)
- Project: Ubuntu Travels MVP

---

**Built with ❤️ using modern web technologies and AI-assisted development**

*This project demonstrates full-stack development skills, RESTful API design, database modeling, authentication/authorization, file upload handling, and modern DevOps practices.*
