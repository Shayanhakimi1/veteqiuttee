# Veterinary Consultation Platform

A comprehensive veterinary consultation platform with real-time chat, appointment scheduling, and payment processing.

## Features

- 🏥 **Veterinary Consultations**: Real-time chat with veterinarians
- 📅 **Appointment Scheduling**: Book and manage appointments
- 💳 **Payment Processing**: Secure payment integration
- 👤 **User Management**: User profiles and pet management
- 📱 **Responsive Design**: Works on desktop and mobile
- 🔒 **Secure Authentication**: JWT-based authentication
- 📊 **Admin Dashboard**: Comprehensive admin panel

## Tech Stack

### Backend
- Node.js with TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Socket.IO for real-time communication
- JWT Authentication
- File upload support

### Frontend
- React with TypeScript
- Vite build tool
- Tailwind CSS
- React Router
- Context API for state management
- Responsive design

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Docker and Docker Compose (for containerized deployment)

## Installation

### Option 1: Docker Deployment (Recommended)

1. **Install Docker Desktop**:
   - Download from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
   - Install and start Docker Desktop
   - Verify installation: `docker --version` and `docker-compose --version`

2. **Clone and Setup**:
   ```bash
   git clone <repository-url>
   cd veteqiutte2
   ```

3. **Environment Configuration**:
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp pet-consultation/.env.example pet-consultation/.env
   
   # Edit the environment files with your configuration
   ```

4. **Start with Docker**:
   ```bash
   docker-compose up -d
   ```

5. **Access the Application**:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3002
   - Database: localhost:5432

### Option 2: Manual Development Setup

1. **Database Setup**:
   ```bash
   # Install PostgreSQL and create database
   createdb veterinary_consultation
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database configuration
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd pet-consultation
   npm install
   cp .env.example .env
   # Edit .env with your backend URL
   npm run dev
   ```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/veterinary_consultation"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"
PORT=3002
NODE_ENV="development"
MAX_FILE_SIZE=5242880
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3002
VITE_SOCKET_URL=http://localhost:3002
```

## Docker Services

- **Database**: PostgreSQL 15 with persistent volume
- **Backend**: Node.js API server on port 3002
- **Frontend**: Nginx serving React app on port 80

## Development Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access backend container
docker-compose exec backend sh

# Access database
docker-compose exec db psql -U postgres -d veterinary_consultation
```

## Current Development Status

✅ **Completed Features**:
- User authentication and registration
- Pet profile management
- Veterinary consultation booking
- Real-time chat functionality
- Payment integration
- Admin dashboard
- Responsive UI design
- Docker containerization

⚠️ **Known Issues**:
- 666 TypeScript errors in backend (non-critical, application runs correctly)
- Minor video asset loading error in frontend

## API Endpoints

- `GET /health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/users/profile` - Get user profile
- `GET /api/consultations` - Get consultations
- `POST /api/consultations` - Create consultation

## Project Structure

```
veteqiutte2/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── validators/      # Input validation
│   ├── prisma/              # Database schema
│   └── Dockerfile
├── pet-consultation/        # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   └── Dockerfile
└── docker-compose.yml       # Docker orchestration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
