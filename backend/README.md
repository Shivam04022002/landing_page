# Finance Leads Backend API

Production-grade Node.js + Express + MongoDB backend for loan application management.

## Quick Start

### 1. Environment Setup

Create `.env` file in the backend folder:

```bash
# Copy from example
cp .env.example .env

# Or create manually
cat > .env << 'EOF'
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/finance_leads
JWT_SECRET=your_jwt_secret_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@321
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
EOF
```

### 2. MongoDB Options

**Option A: Local MongoDB (Default)**
```bash
# Windows
net start MongoDB

# Or install MongoDB Community Server first
# Download: https://www.mongodb.com/try/download/community
```

**Option B: MongoDB Atlas (Cloud - RECOMMENDED)**
1. Go to https://cloud.mongodb.com
2. Create free M0 cluster in AWS Mumbai (ap-south-1)
3. Database Access → Create user
4. Network Access → Allow from anywhere (0.0.0.0/0)
5. Get connection string and update `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance_leads?retryWrites=true&w=majority
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Server

```bash
# Development (with auto-restart)
npm run dev

# OR with nodemon directly
npx nodemon src/server.js

# Production
NODE_ENV=production npm start
```

## API Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/health` | GET | Health check | Public |
| `/api/leads` | POST | Create lead | Public (rate limited) |
| `/api/leads` | GET | Get all leads | Admin |
| `/api/leads/:id` | GET | Get single lead | Admin |
| `/api/leads/:id` | DELETE | Delete lead | Admin |
| `/api/leads/export` | GET | Export to Excel | Admin |
| `/api/leads/stats/dashboard` | GET | Dashboard stats | Admin |
| `/api/auth/login` | POST | Admin login | Public |
| `/api/auth/me` | GET | Get current admin | Admin |
| `/api/auth/setup` | POST | Create initial admin | Public (dev only) |
| `/api/pincode/:pincode` | GET | PIN code lookup | Public |

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database connection with retry logic
├── src/
│   ├── middleware/
│   │   ├── auth.js        # JWT authentication
│   │   ├── errorHandler.js
│   │   └── validation.js  # Joi validation schemas
│   ├── models/
│   │   ├── Lead.js        # Lead schema (finance applications)
│   │   └── Admin.js       # Admin user schema
│   ├── routes/
│   │   ├── leads.js       # Lead CRUD + export
│   │   ├── auth.js        # Authentication
│   │   └── pincode.js     # PIN code API proxy
│   ├── server.js          # Main server with graceful shutdown
│   └── utils/
├── .env                   # Environment variables (not in git)
├── .env.example           # Example environment file
├── .env.production        # Production configuration
└── package.json
```

## Database Schema

**Lead Collection Fields:**
- `desiredLoanAmount` (Number, required) - Loan amount requested
- `useOfFunds` (String, required) - Purpose of loan
- `averageMonthlySale` (String, required) - Monthly revenue range
- `businessVintage` (String, required) - Years in business
- `creditScore` (String, required) - Credit score range
- `businessName` (String, required)
- `ownerName` (String, required)
- `phoneNumber` (String, required) - 10-digit Indian mobile
- `pinCode` (String, required) - 6-digit PIN
- `state`, `district`, `city`, `country` (String) - Auto-filled from PIN
- `source` (String) - Lead source (Organic/Google Ads)
- `device`, `browser`, `ipAddress` - Tracking info
- `utmSource`, `utmCampaign`, `utmMedium` - Marketing tracking
- `createdAt`, `updatedAt` (Timestamps)

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | JWT signing secret (min 32 chars) |
| `JWT_EXPIRE` | No | 30d | JWT expiration |
| `ADMIN_USERNAME` | Yes | - | Admin login username |
| `ADMIN_PASSWORD` | Yes | - | Admin login password |
| `CORS_ORIGIN` | No | localhost | Allowed origins (comma-separated) |

## Features

- ✅ MongoDB connection with automatic retry (5 attempts)
- ✅ Graceful shutdown handling (SIGTERM, SIGINT)
- ✅ Rate limiting (100 req/15min general, 5 leads/hour)
- ✅ Security: Helmet, CORS, Mongo sanitization, HPP
- ✅ Input validation with Joi
- ✅ JWT authentication for admin routes
- ✅ Excel export functionality
- ✅ PIN code auto-fetch via Indian Postal API
- ✅ Request logging in development
- ✅ Production-ready error handling

## AWS Deployment

### 1. Setup EC2 Instance
- Ubuntu 22.04 LTS
- t3.micro or t3.small
- Security Group: 22 (SSH), 80 (HTTP), 443 (HTTPS)

### 2. Deploy Commands
```bash
# On EC2 server
cd /var/www/finance-app/backend
git pull origin main
npm ci --production

# Setup environment
cp .env.production .env
# Edit .env with production values

# Start with PM2
npm install -g pm2
pm2 start src/server.js --name finance-backend
pm2 save
pm2 startup
```

### 3. Nginx Configuration
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
    }
}
```

## Troubleshooting

### MongoDB Connection Refused
```
Error: connect ECONNREFUSED ::1:27017
```
**Fix:** Start MongoDB service:
```bash
net start MongoDB  # Windows
sudo systemctl start mongod  # Linux
```

### Module Not Found (axios)
```bash
npm install
```

### CORS Errors
Update `CORS_ORIGIN` in `.env` with your frontend URL:
```env
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### JWT Secret Too Short
Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Database | Local or Atlas | Atlas (required) |
| Logging | Verbose | Error only |
| CORS | localhost:3000 | Your domain |
| Rate Limit | Relaxed | Strict |
| Error Messages | Detailed | Generic |

## Scripts

```bash
npm start        # Start production server
npm run dev      # Start with nodemon (development)
npm test         # Run tests
```

## License

Private - Surjit Finance
