# 🐾 Veteqiutte2 - Pet Consultation System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

A comprehensive veterinary consultation and appointment booking system built with React, Node.js, TypeScript, and Prisma ORM.

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/veteqiutte2.git
   cd veteqiutte2
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../pet-consultation
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Copy example environment file
   cp backend/.env.example backend/.env
   
   # Edit the .env file with your configuration
   ```

4. **Initialize database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

5. **Start development servers**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from pet-consultation directory)
   npm run dev
   ```

## 📋 Available Scripts

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push database schema

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

### User Features
- **Pet Registration**: Register pets with detailed information
- **Consultation Booking**: Book veterinary consultations
- **Payment System**: Secure payment processing with receipt upload
- **User Dashboard**: Track consultations and payment history
- **Responsive Design**: Mobile-friendly interface

### Admin Features
- **Admin Dashboard**: Comprehensive management interface
- **User Management**: View and manage all registered users
- **Payment Tracking**: Monitor and verify payments
- **Consultation Management**: Track consultation status
- **Statistics**: Real-time dashboard statistics
- **Search & Filter**: Advanced filtering capabilities

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hot Toast** for notifications
- **Lazy Loading** for performance optimization

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** with SQLite database
- **JWT Authentication**
- **bcryptjs** for password hashing
- **CORS** enabled

### Database
- **SQLite** with Prisma ORM
- **Automated migrations**
- **Relational data structure**

## Project Structure

```
veteqiutte2/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Authentication middleware
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema and migrations
│   └── scripts/            # Database scripts
├── pet-consultation/        # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
└── docker-compose.yml       # Docker configuration
```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shayanhakimi1/veteqiuttee.git
   cd veteqiutte2/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Create admin user**
   ```bash
   node scripts/create-admin.js
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Backend will run on `http://localhost:3003`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../pet-consultation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

## Admin Access

**Default Admin Credentials:**
- **Mobile**: `09123456789`
- **Password**: `admin123`

Access admin dashboard at: `http://localhost:5173/admin/dashboard`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/admin/login` - Admin login

### User Management
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID

### Payment Management
- `POST /api/payments` - Create payment
- `GET /api/admin/payments` - Get all payments
- `PUT /api/admin/payments/:id/status` - Update payment status

### Consultation Management
- `GET /api/admin/consultations` - Get all consultations
- `PUT /api/admin/consultations/:id/status` - Update consultation status

### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

## Database Schema

### Main Models
- **User**: User accounts with roles
- **Pet**: Pet information linked to users
- **Consultation**: Consultation requests
- **Payment**: Payment records with status tracking
- **Doctor**: Doctor information (future feature)

## 🚀 Deployment

This project includes comprehensive deployment guides for various hosting platforms:

### Tegrahost Deployment
- 📖 [Tegrahost Deployment Guide](./TEGRAHOST_DEPLOYMENT_GUIDE.md)
- 📖 [Post Upload Configuration Guide](./POST_UPLOAD_CONFIGURATION_GUIDE.md)
- 📖 [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

### GitHub Deployment
- 📖 [GitHub Deployment Guide](./GITHUB_DEPLOYMENT_GUIDE.md)
- 📖 [GitHub Secrets Setup](./GITHUB_SECRETS_SETUP.md)
- 🔧 [Automated Deployment Script](./deploy_from_github.sh)
- ⚙️ [GitHub Actions Workflow](./.github/workflows/deploy.yml)

### Quick Deployment Commands

```bash
# Build for production
npm run build:all

# Test deployment locally
bash test_deployment.sh

# Deploy from GitHub (automated)
bash deploy_from_github.sh
```

## 🔧 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DATABASE_URL="your-database-connection-string"

# JWT Secret (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET="your-super-secret-jwt-key"

# Environment
NODE_ENV="production"

# Server Port
PORT=3003
```

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd pet-consultation
npm test

# Test deployment
bash test_deployment.sh
```

## 📁 Project Structure

```
veteqiutte2/
├── 📁 .github/workflows/     # GitHub Actions
├── 📁 backend/               # Node.js Backend
│   ├── 📁 src/
│   │   ├── 📁 controllers/   # API Controllers
│   │   ├── 📁 middleware/    # Express Middleware
│   │   ├── 📁 routes/        # API Routes
│   │   └── 📁 utils/         # Utility Functions
│   ├── 📁 prisma/           # Database Schema
│   └── 📄 package.json
├── 📁 pet-consultation/      # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/    # React Components
│   │   ├── 📁 pages/         # Page Components
│   │   ├── 📁 utils/         # Utility Functions
│   │   └── 📁 assets/        # Static Assets
│   └── 📄 package.json
├── 📄 deploy_from_github.sh  # Deployment Script
├── 📄 test_deployment.sh     # Testing Script
└── 📄 README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [deployment guides](./TEGRAHOST_DEPLOYMENT_GUIDE.md)
2. Review the [troubleshooting section](./POST_UPLOAD_CONFIGURATION_GUIDE.md#troubleshooting)
3. Open an issue on GitHub

## 🙏 Acknowledgments

- Built with ❤️ using React, Node.js, and TypeScript
- Database powered by Prisma ORM
- Styled with Tailwind CSS
- Deployed with comprehensive automation scripts

---

**Made with 🐾 for veterinary professionals**
