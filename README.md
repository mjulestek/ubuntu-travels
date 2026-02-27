# Ubuntu Travels

A full-stack travel booking platform deployed on AWS with high availability architecture.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript → S3 + CloudFront
- **Backend**: Node.js + Express → EC2 with Auto Scaling
- **Database**: MongoDB → Dedicated EC2 instance
- **Infrastructure**: AWS Multi-AZ deployment

## AWS Architecture

```
Users → CloudFront → S3 (Frontend)
              ↓
            ALB
              ↓
        Auto Scaling Group (2-4 EC2)
              ↓
          Backend API
              ↓
          MongoDB
```

## AWS Services Used

- VPC (Multi-AZ with public/private subnets)
- EC2 (Auto Scaling Group)
- Application Load Balancer
- S3 (Static website hosting)
- CloudFront (CDN)
- ECR (Docker registry)

## Local Development

```bash
docker-compose -f docker-compose-local.yml up -d
```

Access:
- Frontend: http://localhost
- Backend: http://localhost:5000
- Database UI: http://localhost:8081

## Features

- User registration and authentication
- Tour browsing and booking
- Admin dashboard
- Guide portal
- Email notifications (AWS SES)
- File uploads (AWS S3)

## Project Structure

```
ubuntu-travels/
├── ubuntu-backend/     # Node.js API
├── ubuntu-frontend/    # Static website
└── docker-compose.yml  # Local development
```

## Author

**Jules Munyaneza**  
Junior Cloud Engineer  
[LinkedIn](https://linkedin.com/in/jules-munyaneza-40418a364) | [GitHub](https://github.com/mjulestek) | mjules.tek@gmail.com

---

**Capstone Project** - Cloud & DevOps Bootcamp 2026
