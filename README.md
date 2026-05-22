# Finance Leads Landing Page

A complete, high-converting Google Ads landing page for business loans with admin dashboard, lead management, and Excel export functionality.

## Features

### Landing Page (Frontend)
- **Modern Dark Finance Theme**: Inspired by premium fintech designs
- **Animated Multi-Step Form**: 3-step loan application with Framer Motion slide animations
- **Responsive Design**: Mobile-first, optimized for all devices
- **Google Ads Ready**: Conversion tracking, UTM parameter handling
- **Trust Elements**: Trust badges, testimonials, statistics
- **SEO Optimized**: Meta tags, OpenGraph, proper heading structure
- **Performance**: Lazy loading, compressed assets, Lighthouse optimized
- **Floating CTAs**: WhatsApp, click-to-call, sticky mobile CTA

### Backend API
- **RESTful API**: Express.js with MongoDB
- **Security**: Rate limiting, Helmet, CORS, input sanitization
- **Validation**: Joi schema validation
- **Lead Management**: CRUD operations with filtering, search, pagination
- **Excel Export**: xlsx library for lead data export
- **Analytics**: Source tracking, UTM parameters, device/browser detection

### Admin Panel
- **JWT Authentication**: Secure login system
- **Dashboard**: Statistics, charts, lead overview
- **Lead Management**: View, search, filter, delete leads
- **Excel Export**: Download filtered leads as Excel
- **Responsive**: Mobile-friendly admin interface

## Project Structure

```
.
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation, error handling
│   │   └── server.js       # Entry point
│   └── package.json
├── frontend/               # React Landing Page
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   └── utils/          # API utilities
│   └── package.json
└── admin/                  # React Admin Panel
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── context/        # Auth context
    └── package.json
```

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Framer Motion (animations)
- React Hook Form (form handling)
- Axios (HTTP requests)
- Lucide React (icons)
- React Hot Toast (notifications)

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Joi (validation)
- Helmet (security)
- xlsx (Excel export)

## Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd finance-leads
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
MONGODB_URI=mongodb://localhost:27017/finance_leads
JWT_SECRET=your_super_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your_hashed_password

# Start server
npm run dev
```

To create an admin password hash:
```bash
node -e "console.log(require('bcryptjs').hashSync('yourpassword', 12))"
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm start
```

Frontend runs on `http://localhost:3000`

### 4. Admin Panel Setup

```bash
cd admin

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm start
```

Admin panel runs on `http://localhost:3001`

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance_leads
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$YourHashedPasswordHere
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id_here
REACT_APP_FACEBOOK_PIXEL_ID=your_pixel_id_here
REACT_APP_WHATSAPP_NUMBER=+911234567890
REACT_APP_CALL_NUMBER=+911234567890
```

### Admin (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user

### Leads
- `POST /api/leads` - Create new lead (public)
- `GET /api/leads` - Get all leads (auth required)
- `GET /api/leads/:id` - Get single lead (auth required)
- `DELETE /api/leads/:id` - Delete lead (auth required)
- `GET /api/leads/export` - Export to Excel (auth required)
- `GET /api/leads/stats/dashboard` - Get dashboard stats (auth required)

## Form Fields

### Step 1: Loan Details
- Desired Loan Amount (number, min ₹10,000)
- Use of Funds (dropdown)

### Step 2: Financial Health
- Average Monthly Sale (number)
- Business Vintage (dropdown)
- Credit Score (dropdown)

### Step 3: Business Details
- Business Name (text)
- Owner Name (text)
- Phone Number (10-digit Indian mobile)
- PIN Code (6-digit)

## Google Ads Conversion Tracking

The landing page includes Google Ads conversion tracking. Configure your GA ID in the environment variables.

```javascript
// Conversion is tracked on form submission
gtag('event', 'conversion', {
  send_to: 'YOUR_GA_ID/lead_form_submit',
  value: loanAmount,
  currency: 'INR'
});
```

## Deployment

### Backend (Heroku/Railway/Render)
1. Set environment variables
2. Deploy with `git push`
3. MongoDB Atlas recommended for production

### Frontend (Netlify/Vercel)
1. Build: `npm run build`
2. Deploy build folder
3. Set environment variables in dashboard

### Admin (Netlify/Vercel)
1. Build: `npm run build`
2. Deploy build folder
3. Configure API URL environment variable

## Security Features

- Rate limiting (100 requests/15min, 5 leads/hour)
- Helmet.js security headers
- CORS configuration
- MongoDB sanitization (express-mongo-sanitize)
- Parameter pollution prevention (hpp)
- JWT authentication
- Input validation with Joi

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization

- Code splitting
- Lazy loading
- Compressed assets
- Optimized images
- Lighthouse score target: 90+

## License

MIT License - feel free to use for your projects.

## Support

For issues or questions, please create an issue in the repository.
