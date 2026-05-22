# Production Setup Checklist

## 1. Environment Files Created ✅

### Files Created:
- `backend/.env.production`
- `frontend/.env.production`
- `admin/.env.production`

## 2. GitHub Secrets Required

Go to: GitHub Repo → Settings → Secrets and Variables → Actions

Add these secrets:

### AWS Credentials
```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### EC2 Server
```
EC2_HOST=your-ec2-public-ip-or-domain
EC2_USER=ubuntu
EC2_SSH_KEY=-----BEGIN RSA PRIVATE KEY-----
...(your private key)...
-----END RSA PRIVATE KEY-----
REMOTE_DIR=/var/www/finance-app
```

### Application Secrets
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance_leads
JWT_SECRET=your_super_long_random_string_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
REACT_APP_API_URL=https://api.yourdomain.com/api
```

### S3 Buckets
```
S3_FRONTEND_BUCKET=your-frontend-bucket-name
S3_ADMIN_BUCKET=your-admin-bucket-name
```

## 3. AWS Setup Steps

### A. Create S3 Buckets
```bash
# Frontend bucket
aws s3 mb s3://your-finance-frontend --region ap-south-1
aws s3 website s3://your-finance-frontend --index-document index.html --error-document index.html

# Admin bucket
aws s3 mb s3://your-finance-admin --region ap-south-1
aws s3 website s3://your-finance-admin --index-document index.html --error-document index.html
```

### B. Create CloudFront Distributions
1. Go to AWS Console → CloudFront
2. Create distribution → Origin: S3 bucket
3. Viewer protocol policy: Redirect HTTP to HTTPS
4. Default root object: index.html
5. SSL Certificate: Request from ACM

### C. Launch EC2 Instance
1. AWS Console → EC2 → Launch Instance
2. Name: finance-backend
3. OS: Ubuntu 22.04 LTS
4. Instance type: t3.micro (or t3.small)
5. Key pair: Create new (download .pem file)
6. Security Group:
   - SSH (22) - Your IP only
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
   - Custom TCP (5000) - Anywhere (or remove if using Nginx)

### D. Setup EC2 Server
SSH into your EC2 and run:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
cd /var/www
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git finance-app
cd finance-app/backend
npm install
sudo npm install -g pm2
```

### E. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/finance-app
```

Add:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

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

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/finance-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### F. Setup SSL (HTTPS)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

## 4. MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com
2. Create cluster in **AWS / Mumbai (ap-south-1)**
3. Database Access → Create user
4. Network Access → Add IP: `0.0.0.0/0` (or your EC2 IP)
5. Get connection string, add to GitHub secrets

## 5. Domain Setup (Route 53)

1. AWS Console → Route 53
2. Register domain or use existing
3. Create A records:
   - `yourdomain.com` → CloudFront distribution
   - `api.yourdomain.com` → EC2 public IP
   - `admin.yourdomain.com` → CloudFront (admin bucket)

## 6. First Deployment

### Option A: GitHub Actions (Automatic)
Just push to main branch:
```bash
git add .
git commit -m "Production ready"
git push origin main
```

### Option B: Manual Deploy
```bash
# Backend
./deploy.sh backend

# Frontend
./deploy.sh frontend

# Or both
./deploy.sh all
```

## 7. Verification Checklist

- [ ] Frontend loads at `https://yourdomain.com`
- [ ] API responds at `https://api.yourdomain.com/api/health`
- [ ] PIN code API works
- [ ] Form submits successfully
- [ ] Admin panel loads
- [ ] Login works with admin credentials

## 8. Post-Deployment Monitoring

### Check Logs
```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# PM2 logs
pm2 logs finance-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Monitor Costs
- AWS Billing Dashboard
- Set up billing alerts at ₹1000, ₹2000

## Troubleshooting

### Build Fails
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### MongoDB Connection Error
- Check IP whitelist in Atlas
- Verify connection string format
- Test locally: `mongo "<connection-string>"`

### CORS Errors
- Update CORS_ORIGIN in backend .env
- Include all variations: https://domain.com, https://www.domain.com

### PM2 Not Running
```bash
pm2 list
pm2 logs
pm2 restart finance-backend
```

## Cost Estimate (Monthly)
| Service | Config | Cost |
|---------|--------|------|
| EC2 t3.micro | 1 instance | ~₹500 |
| S3 | 1GB storage | ~₹20 |
| CloudFront | 100GB transfer | ~₹250 |
| Route 53 | 1 hosted zone | ~₹100 |
| MongoDB Atlas | M0 (Free) | ₹0 |
| **Total** | | **~₹870/month** |

## Support

For issues:
1. Check logs first
2. Verify environment variables
3. Test API endpoints with curl/Postman
4. Check AWS service health dashboard
