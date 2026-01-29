# Country Fair Days Website

A full-stack web application for managing event registrations for Country Fair Days, featuring multiple event types including tournaments, races, dinners, and more.

## 🏗️ Project Structure

```
country-fair-days/
├── backend/          # Express/Node.js API server
│   ├── models/       # MongoDB models
│   ├── routers/      # API route handlers
│   ├── middleware/   # Custom middleware
│   └── images/       # Uploaded event images
├── frontend/         # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── utils/
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v10.9.0 or higher)
- **MongoDB Atlas account** (database is cloud-hosted)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Fix any security vulnerabilities
npm audit fix

# If needed, force fix remaining vulnerabilities
npm audit fix --force
```

**Create environment files** - You need TWO files in the `backend` folder:

**`backend/.env.development`:**

```env
# Backend environment variables

# Server configuration
PORT=3000
NODE_ENV=development

# MongoDB connection string
MONGODB_URI=mongodb+srv://chancewiese:Spikeball2020@swcfd-cluster.9huiw.mongodb.net/swcfd

# Client URL for CORS (frontend URL)
CLIENT_URL=http://localhost:5173

# File uploads
MAX_FILE_SIZE=5242880 # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Secrets
SESSION_SECRET=firstweekinAugust
JWT_SECRET=firstweekinAugust
JWT_COOKIE_EXPIRE=7
JWT_EXPIRE=30d

# Email configuration (for password reset emails)
# EMAIL_SERVICE=gmail  # or another service
# EMAIL_USERNAME=your-email@gmail.com
# EMAIL_PASSWORD=your-email-password
# EMAIL_FROM=Country Fair Days <your-email@gmail.com>
```

**`backend/.env.production`:**

```env
# Production environment variables
# Server configuration
PORT=3000
NODE_ENV=production

# MongoDB connection string
MONGODB_URI=mongodb+srv://chancewiese:Spikeball2020@swcfd-cluster.9huiw.mongodb.net/swcfd

# Client URL for CORS (production frontend URL)
# CLIENT_URL=https://your-production-domain.com

# File uploads
MAX_FILE_SIZE=5242880 # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Secrets
SESSION_SECRET=firstweekinAugust
JWT_SECRET=firstweekinAugust
JWT_COOKIE_EXPIRE=7
JWT_EXPIRE=30d

# Email configuration (for password reset emails)
# EMAIL_SERVICE=gmail  # or another service
# EMAIL_USERNAME=your-email@gmail.com
# EMAIL_PASSWORD=your-email-password
# EMAIL_FROM=Country Fair Days <your-email@gmail.com>
```

**Start the backend:**

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Fix any security vulnerabilities
npm audit fix
```

**Create environment files** - You need TWO files in the `frontend` folder:

**`frontend/.env.development`:**

```env
# Development environment variables
VITE_API_URL=http://localhost:3000/api
VITE_BACKEND_URL=http://localhost:3000
```

**`frontend/.env.production`:**

```env
# Production environment variables
# Replace with your actual production domain
VITE_API_URL=https://your-production-domain.com/api
VITE_BACKEND_URL=https://your-production-domain.com
```

**Start the frontend:**

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The frontend will be available at `http://localhost:5173`

## 📋 Features

### Event Types

1. **Pickleball Tournament** - Team registration with divisions
2. **Golf Tournament** - 4-person scramble format
3. **Dinner in the Park** - Family-based registration with tiered pricing
4. **Little Buckaroo Rodeo** - Individual event registration
5. **Races** (10k, 5k, 2-mile walk) - Age-categorized individual registration
6. **3-on-3 Basketball Tournament** - Team registration

### Core Features

- **User Management** - Registration, authentication, profile management
- **Family Groups** - Manage family members for family-based events
- **Event Calendar** - View all upcoming events
- **Custom Registration Forms** - Tailored for each event type
- **Payment Processing** - Stripe integration (ready for implementation)
- **Admin Dashboard** - Event management and oversight
- **Image Gallery** - Event photos and media
- **Responsive Design** - Mobile-friendly interface

## 🔧 Technology Stack

### Backend

- **Express.js** - Web framework
- **MongoDB** - Database (MongoDB Atlas)
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads

### Frontend

- **React** - UI library
- **Vite** - Build tool
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **date-fns** - Date utilities

## 📝 Important Notes

### Environment Variables

Both backend and frontend use **separate environment files** for development and production:

**Backend:**

- `.env.development` - Used when running `npm run dev`
- `.env.production` - Used when running `npm start`

**Frontend:**

- `.env.development` - Used automatically in dev mode
- `.env.production` - Used when building for production

⚠️ **The environment files are NOT included in the repository for security reasons. You must create them manually using the templates above.**

### Database

- The app uses **MongoDB Atlas** (cloud database)
- Connection string is already configured in the environment files
- No local MongoDB installation needed

To test your MongoDB connection:

```bash
cd backend
NODE_ENV=development node test-connection.js
```

### File Uploads

- Event images are stored in `backend/images/`
- Maximum file size: 5MB
- Supported formats: JPG, PNG, GIF, WEBP

### Security

⚠️ **BEFORE DEPLOYING TO PRODUCTION:**

1. Change `SESSION_SECRET` to a secure random string
2. Change `JWT_SECRET` to a different secure random string
3. Update MongoDB password if needed
4. Enable email configuration for password resets
5. Update `CLIENT_URL` in `.env.production` to your actual domain

**Generate secure secrets:**

```bash
# On Mac/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### CORS

The backend is configured to accept requests from `http://localhost:5173` (development) by default. For production, update the `CLIENT_URL` in your `.env.production` file.

## 🐛 Troubleshooting

### npm install warnings

When you run `npm install`, you might see these messages:

1. **ExperimentalWarning** - Safe to ignore, it's internal npm behavior
2. **Vulnerabilities found** - Run `npm audit fix` to resolve most issues
3. **npm version notice** - Optional update, run `npm install -g npm@11.8.0` to update

**To fix vulnerabilities:**

```bash
# Try automatic fix first
npm audit fix

# If some remain, force fix (may cause breaking changes)
npm audit fix --force

# View detailed vulnerability report
npm audit
```

### Backend won't start

**Common issues:**

1. **Missing environment file**

   ```bash
   # Make sure this file exists
   ls backend/.env.development
   ```

2. **MongoDB connection error**

   ```bash
   # Test the connection
   cd backend
   NODE_ENV=development node test-connection.js
   ```

3. **Port already in use**

   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

4. **Dependencies not installed**
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

### Frontend can't connect to API

1. **Verify backend is running**
   - Open `http://localhost:3000/test` in browser
   - Should see "API is running..."

2. **Check environment file**

   ```bash
   # Make sure this file exists
   cat frontend/.env.development
   ```

3. **Clear browser cache**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

4. **Check browser console**
   - Open DevTools (F12)
   - Look for CORS or network errors

### Database connection errors

1. **IP not whitelisted in MongoDB Atlas**
   - Go to MongoDB Atlas dashboard
   - Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

2. **Wrong credentials**
   - Verify username and password in connection string
   - Check for special characters that need URL encoding

3. **Network issues**
   ```bash
   # Test if you can reach MongoDB
   ping swcfd-cluster.9huiw.mongodb.net
   ```

### Image uploads not working

1. **Check directory exists**

   ```bash
   ls backend/images/
   # If it doesn't exist, create it
   mkdir backend/images
   ```

2. **File too large**
   - Max size is 5MB
   - Check file size before uploading

3. **Wrong file type**
   - Only JPG, PNG, GIF, WEBP allowed
   - Check file extension

### "Module not found" errors

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📚 API Documentation

The API is available at `http://localhost:3000/api` with the following routes:

- `/api/auth` - Authentication (login, register, password reset)
- `/api/users` - User management
- `/api/families` - Family group management
- `/api/events` - Event management and registration

**Test endpoints:**

- `http://localhost:3000/test` - Server health check
- `http://localhost:3000/api/events` - List all events

## 🤝 Development Workflow

### Starting the application:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Making changes:

1. **Backend changes** - Server auto-restarts with nodemon
2. **Frontend changes** - Hot reload with Vite
3. **Model changes** - May need to restart backend server

### Common commands:

```bash
# Install new package (backend)
cd backend
npm install package-name

# Install new package (frontend)
cd frontend
npm install package-name

# View logs
# Backend logs appear in terminal 1
# Frontend logs appear in browser console
```

## 🚀 Deployment

### Production Checklist:

- [ ] Update secrets in `.env.production`
- [ ] Update `CLIENT_URL` to production domain
- [ ] Update frontend `.env.production` URLs
- [ ] Run `npm audit fix` on both backend and frontend
- [ ] Test production build locally
- [ ] Set up SSL certificate (HTTPS)
- [ ] Configure MongoDB Atlas IP whitelist for production server
- [ ] Set up email service for password resets
- [ ] Create backup strategy for database

### Build for production:

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
# Serve the 'dist' folder with a static server
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review error messages in terminal and browser console
3. Verify all environment files are created correctly
4. Ensure MongoDB Atlas is accessible

## 📄 License

This project is private and proprietary.

---

**Last Updated:** January 2026
