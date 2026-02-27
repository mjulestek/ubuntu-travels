# Ubuntu Travels

A full-stack travel booking platform built with Node.js, MongoDB, and deployed on AWS with high availability architecture.

## 🚀 Features

- **User Management**: Registration, login, and profile management
- **Tour Booking**: Browse tours, make bookings, and manage reservations
- **Admin Dashboard**: Manage tours, bookings, and users
- **Guide Portal**: Tour guides can manage their assigned tours
- **Email Notifications**: Automated booking confirmations via AWS SES
- **File Uploads**: Profile photos and tour images stored on AWS S3

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive design
- Hosted on AWS S3 + CloudFront

### Backend
- Node.js + Express.js
- MongoDB (Database)
- JWT Authentication
- Docker containerized

### AWS Services
- **EC2**: Backend API servers with Auto Scaling
- **ALB**: Application Load Balancer for traffic distribution
- **S3**: Static website hosting and file storage
- **CloudFront**: Global CDN for fast content delivery
- **ECR**: Docker container registry
- **SES**: Email notifications
- **VPC**: Secure network with public/private subnets

## 📁 Project Structure

```
ubuntu-travels/
├── ubuntu-backend/          # Backend API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth & validation
│   ├── utils/              # Helper functions
│   ├── Dockerfile          # Backend container
│   └── server.js           # Entry point
│
├── ubuntu-frontend/         # Frontend
│   ├── assets/
│   │   ├── css/           # Stylesheets
│   │   ├── js/            # JavaScript files
│   │   └── images/        # Static images
│   ├── index.html         # Homepage
│   ├── admin.html         # Admin dashboard
│   └── Dockerfile         # Frontend container (for local dev)
│
└── docker-compose.yml      # Local development setup
```

## 🏗️ Architecture

### Production (AWS Multi-AZ)
```
Users → CloudFront → S3 (Frontend)
                ↓
              ALB
                ↓
        ┌───────┴───────┐
    EC2 (AZ-a)      EC2 (AZ-b)
    Backend         Backend
        └───────┬───────┘
                ↓
          MongoDB EC2
                ↓
            S3 (Uploads)
```

### Local Development
```
Docker Compose:
├── Frontend (Nginx) :80
├── Backend (Node.js) :5000
├── MongoDB :27017
└── Mongo Express :8081
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB (or use Docker)
- AWS Account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/mjulestek/ubuntu-travels.git
   cd ubuntu-travels
   ```

2. **Set up environment variables**
   ```bash
   cd ubuntu-backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - Mongo Express: http://localhost:8081

### Manual Setup (Without Docker)

1. **Install dependencies**
   ```bash
   cd ubuntu-backend
   npm install
   ```

2. **Start MongoDB**
   ```bash
   # Install MongoDB locally or use Docker
   docker run -d -p 27017:27017 mongo:7.0
   ```

3. **Start backend**
   ```bash
   npm start
   ```

4. **Serve frontend**
   ```bash
   cd ../ubuntu-frontend
   python3 -m http.server 8000
   ```

## 🔐 Environment Variables

Create `ubuntu-backend/.env`:

```env
# Database
MONGO_URI=mongodb://localhost:27017/ubuntu-travels

# Authentication
JWT_SECRET=your-jwt-secret-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-here

# AWS (for production)
AWS_REGION=us-west-2
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Email (AWS SES)
SMTP_HOST=email-smtp.us-west-2.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-username
SMTP_PASSWORD=your-ses-password
FROM_EMAIL=noreply@yourdomain.com

# CORS
CORS_ORIGIN=http://localhost
```

## 📦 Deployment

### AWS Multi-AZ Deployment

1. **Build and push backend to ECR**
   ```bash
   cd ubuntu-backend
   docker build --platform linux/amd64 -t ubuntu-backend .
   
   # Login to ECR
   aws ecr get-login-password --region us-west-2 | \
     docker login --username AWS --password-stdin \
     <account-id>.dkr.ecr.us-west-2.amazonaws.com
   
   # Tag and push
   docker tag ubuntu-backend:latest \
     <account-id>.dkr.ecr.us-west-2.amazonaws.com/ubuntu-backend:latest
   docker push <account-id>.dkr.ecr.us-west-2.amazonaws.com/ubuntu-backend:latest
   ```

2. **Deploy frontend to S3**
   ```bash
   cd ubuntu-frontend
   aws s3 sync . s3://your-bucket-name/ --delete
   ```

3. **Infrastructure setup**
   - VPC with public/private subnets
   - Application Load Balancer
   - Auto Scaling Group (2-4 instances)
   - MongoDB on dedicated EC2
   - CloudFront distribution

## 🧪 Testing

### API Endpoints

**Public:**
- `GET /api/tours` - List all tours
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

**Protected:**
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - User's bookings
- `PUT /api/users/profile` - Update profile

**Admin:**
- `GET /api/admin/bookings` - All bookings
- `POST /api/admin/tours` - Create tour
- `PUT /api/admin/tours/:id` - Update tour

## 👥 User Roles

- **User**: Browse tours, make bookings, manage profile
- **Guide**: View assigned tours, manage tour details
- **Admin**: Full access to all features

## 📊 Database Schema

- **Users**: Authentication and profile data
- **Tours**: Tour information and availability
- **Bookings**: Reservation records
- **Admins**: Admin user accounts
- **Subscribers**: Newsletter subscriptions

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation and sanitization
- AWS Security Groups for network isolation

## 📈 Performance

- CloudFront CDN for global content delivery
- Auto Scaling for handling traffic spikes
- Multi-AZ deployment for high availability
- Docker containerization for consistency
- MongoDB indexing for fast queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Jules Munyaneza**
- GitHub: [@mjulestek](https://github.com/mjulestek)
- LinkedIn: [jules-munyaneza](https://linkedin.com/in/jules-munyaneza-40418a364)
- Email: mjules.tek@gmail.com

## 🙏 Acknowledgments

- Neuefische Bootcamp for Cloud & DevOps training
- AWS for cloud infrastructure
- MongoDB for database solution
- Docker for containerization

---

**Live Demo:** [Coming Soon]

**Architecture Diagram:** [View Diagram](docs/architecture.png)
