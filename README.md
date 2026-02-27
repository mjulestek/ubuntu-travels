# Ubuntu Travels

A travel booking web application where users can browse tours, make bookings, and manage their trips. Built with modern web technologies and deployed on AWS cloud infrastructure.

## What It Does

- Users can register, login, and browse available tours
- Book tours and manage reservations
- Admin dashboard to manage tours and bookings
- Tour guides can manage their assigned tours

## Architecture

**Frontend**: Static website (HTML/CSS/JS) hosted on S3 and delivered globally via CloudFront CDN

**Backend**: Node.js REST API running on EC2 instances with Auto Scaling (2-4 instances) behind an Application Load Balancer

**Database**: MongoDB running on a dedicated EC2 instance in a private subnet

**Network**: Multi-AZ VPC with public and private subnets for security and high availability

## AWS Services

VPC, EC2, Application Load Balancer, Auto Scaling Group, S3, CloudFront, ECR

## Run Locally

```bash
docker-compose -f docker-compose-local.yml up -d
```

Access at http://localhost

---

Cloud & DevOps Capstone Project 2026
