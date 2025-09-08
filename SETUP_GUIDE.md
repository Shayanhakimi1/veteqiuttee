# 🚀 Pet Consultation Platform - Setup Guide

## Quick Start

### Option 1: Automatic Setup (Recommended)

1. Double-click `start-app.bat` to start both servers automatically
2. Wait for both servers to start (about 10-15 seconds)
3. Open your browser and go to: http://localhost:5173

### Option 2: Manual Setup

#### Start Backend Server

1. Open Command Prompt or PowerShell
2. Navigate to the project directory
3. Run: `cd backend`
4. Run: `npm run dev`
5. Backend will start on: http://localhost:3000

#### Start Frontend Server (in a new terminal)

1. Open another Command Prompt or PowerShell
2. Navigate to the project directory
3. Run: `cd pet-consultation`
4. Run: `npm run dev`
5. Frontend will start on: http://localhost:5173

## 🔐 Default Login Credentials

### Admin Login

- URL: http://localhost:5173/admin/login
- Mobile: `09302467932`
- Password: `12345678`

### User Registration

- Go to: http://localhost:5173
- Click "ثبت نام جدید" (New Registration)
- Fill in your details to create a new user account

## 📱 Application URLs

- **Frontend (User Interface)**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin/login
- **Backend API**: http://localhost:3000/api
- **API Health Check**: http://localhost:3000/api/health

## 🗄️ Database

The application uses SQLite database located at:

- `backend/prisma/dev.db`

## 📁 File Uploads

Uploaded files are stored in:

- `backend/uploads/`

## 🔧 Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

- Backend (port 3000): Change PORT in `backend/.env`
- Frontend (port 5173): Change port in `pet-consultation/vite.config.js`

### Database Issues

If you encounter database errors:

1. Delete `backend/prisma/dev.db`
2. Run: `cd backend && npm run db:push`
3. Run: `cd backend && npm run seed`

### Dependencies Issues

If you get module not found errors:

1. Delete `node_modules` folders
2. Run: `cd backend && npm install`
3. Run: `cd pet-consultation && npm install`

## 🎯 Testing the Application

1. **User Flow**:

   - Register a new user
   - Add pet information
   - Book a consultation
   - Upload medical documents

2. **Admin Flow**:
   - Login to admin panel
   - View user statistics
   - Manage consultations
   - Review payments

## 📞 Support

If you encounter any issues:

1. Check the console logs in both terminal windows
2. Verify all dependencies are installed
3. Ensure ports 3000 and 5173 are available
4. Check the database file exists

---

**Happy Consulting! 🐾**
