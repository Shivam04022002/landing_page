#!/bin/bash
# AWS Deployment Script
# Usage: ./deploy.sh [frontend|backend|all]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration - UPDATE THESE
EC2_HOST="your-ec2-ip-or-dns"
EC2_USER="ubuntu"
S3_BUCKET="your-frontend-bucket"
S3_ADMIN_BUCKET="your-admin-bucket"
REMOTE_DIR="/var/www/finance-app"

echo -e "${YELLOW}🚀 AWS Deployment Script${NC}"
echo "========================"

# Function to deploy backend
deploy_backend() {
    echo -e "${YELLOW}📦 Deploying Backend...${NC}"
    
    ssh ${EC2_USER}@${EC2_HOST} << 'EOF'
        cd /var/www/finance-app
        git pull origin main
        cd backend
        npm install --production
        
        # Check if PM2 process exists
        if pm2 list | grep -q "finance-backend"; then
            pm2 restart finance-backend
        else
            pm2 start src/server.js --name finance-backend
            pm2 save
        fi
        
        echo "Backend deployed successfully!"
EOF
    
    echo -e "${GREEN}✅ Backend deployed${NC}"
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${YELLOW}🎨 Deploying Frontend...${NC}"
    
    cd frontend
    npm install
    npm run build
    
    # Sync to S3
    aws s3 sync build/ s3://${S3_BUCKET} --delete
    
    # Invalidate CloudFront cache (optional)
    # aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
    
    cd ..
    echo -e "${GREEN}✅ Frontend deployed to S3${NC}"
}

# Function to deploy admin
deploy_admin() {
    echo -e "${YELLOW}🎨 Deploying Admin Panel...${NC}"
    
    cd admin
    npm install
    npm run build
    
    aws s3 sync build/ s3://${S3_ADMIN_BUCKET} --delete
    
    cd ..
    echo -e "${GREEN}✅ Admin deployed to S3${NC}"
}

# Main deployment logic
case "${1:-all}" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    admin)
        deploy_admin
        ;;
    all)
        deploy_backend
        deploy_frontend
        deploy_admin
        ;;
    *)
        echo "Usage: $0 [frontend|backend|admin|all]"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Deployment complete!${NC}"
