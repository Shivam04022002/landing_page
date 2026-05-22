# AWS Deployment Guide

## Architecture Overview
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CloudFront    │────▶│   S3 (Static)   │     │   EC2/ECS       │
│   (CDN/SSL)     │     │   Frontend      │     │   Backend       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                                 ┌─────────────────┐
                                                 │  MongoDB Atlas  │
                                                 └─────────────────┘
```

## Step 1: Prepare Environment Files

### Backend `.env.production`
```bash
cd backend
cp .env.production .env
# Edit .env with your actual values
```

Required values:
- `MONGODB_URI` - Get from MongoDB Atlas (use AWS Mumbai region)
- `JWT_SECRET` - Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `ADMIN_PASSWORD` - Your secure admin password
- `CORS_ORIGIN` - Your frontend domain

### Frontend `.env.production`
```bash
cd frontend
cp .env.production .env
# Set REACT_APP_API_URL to your backend URL
```

## Step 2: MongoDB Atlas Setup

1. Go to https://www.mongodb.com/atlas
2. Create cluster in **AWS Mumbai (ap-south-1)**
3. Database Access → Add user
4. Network Access → Allow from anywhere (0.0.0.0/0) or your AWS IP
5. Get connection string and add to `.env`

## Step 3: Build & Deploy Frontend (S3 + CloudFront)

### Build Frontend
```bash
cd frontend
npm install
npm run build
```

### Create S3 Bucket
```bash
aws s3 mb s3://your-finance-frontend --region ap-south-1
aws s3 website s3://your-finance-frontend --index-document index.html --error-document index.html
```

### Upload to S3
```bash
aws s3 sync build/ s3://your-finance-frontend --delete
```

### CloudFront Distribution
```bash
# Create CloudFront distribution pointing to S3
# Enable SSL certificate (ACM)
# Set default root object: index.html
```

## Step 4: Deploy Backend (EC2)

### Launch EC2 Instance
- **AMI**: Ubuntu 22.04 LTS
- **Instance**: t3.micro (free tier) or t3.small
- **Region**: ap-south-1 (Mumbai)
- **Security Group**: 
  - Port 22 (SSH) - Your IP only
  - Port 80 (HTTP) - Anywhere
  - Port 443 (HTTPS) - Anywhere
  - Port 5000 (API) - Anywhere (or ALB only)

### Setup Script
```bash
#!/bin/bash
# run on EC2

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Clone your code
cd /var/www
git clone <your-repo-url> finance-app
cd finance-app/backend

# Install dependencies
npm install

# Setup environment
cp .env.production .env
# Edit .env with nano/vim

# Start with PM2
pm2 start src/server.js --name finance-backend
pm2 startup
pm2 save
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Setup SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.your-domain.com
```

## Step 5: Deploy Admin Panel

Same as frontend:
```bash
cd admin
npm install
npm run build
aws s3 sync build/ s3://your-finance-admin --delete
```

## Step 6: CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Deploy Backend
        run: |
          # SSH to EC2 and pull/update
          ssh ${{ secrets.EC2_USER }}@${{ secrets.EC2_HOST }} '
            cd /var/www/finance-app &&
            git pull &&
            cd backend &&
            npm install &&
            pm2 restart finance-backend
          '
      
      - name: Deploy Frontend
        run: |
          cd frontend
          npm install
          npm run build
          aws s3 sync build/ s3://${{ secrets.S3_BUCKET }} --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## AWS Services Cost Estimate (Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| EC2 t3.micro | 1 instance | ~₹500 |
| S3 | < 1GB | ~₹10 |
| CloudFront | < 10GB | ~₹200 |
| MongoDB Atlas | M0 (Free) | ₹0 |
| Route 53 | 1 hosted zone | ~₹100 |
| **Total** | | **~₹800/month** |

## Quick Deploy Script

Save as `deploy.sh`:
```bash
#!/bin/bash
echo "Deploying to AWS..."

# Backend
ssh ubuntu@your-ec2-ip '
  cd /var/www/finance-app &&
  git pull origin main &&
  cd backend &&
  npm install &&
  pm2 restart finance-backend
'

# Frontend
cd frontend
npm install
npm run build
aws s3 sync build/ s3://your-bucket --delete

echo "Deployment complete!"
```

## Environment Variables Checklist

### Backend (.env)
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] ADMIN_USERNAME
- [ ] ADMIN_PASSWORD
- [ ] CORS_ORIGIN (frontend URL)
- [ ] NODE_ENV=production

### Frontend (.env)
- [ ] REACT_APP_API_URL (backend URL)

## Troubleshooting

### MongoDB Connection Issues
- Check Network Access in Atlas
- Verify IP whitelist
- Test: `mongo "<connection-string>"`

### CORS Errors
- Update CORS_ORIGIN with exact domain
- Include https:// and www variants

### PM2 Not Starting
```bash
pm2 logs finance-backend
pm2 delete finance-backend
pm2 start src/server.js --name finance-backend
pm2 save
```

## Security Checklist
- [ ] Enable Cloudflare (optional)
- [ ] Set up AWS WAF
- [ ] Enable MongoDB IP whitelist
- [ ] Use strong JWT_SECRET
- [ ] Enable EC2 security group restrictions
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
