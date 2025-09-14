# Veteqiutte2 - Pet Consultation System

A comprehensive veterinary consultation and appointment booking system built with React, Node.js, and SQLite.

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

## Deployment

### Using Docker

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

### Manual Deployment

1. **Build frontend**
   ```bash
   cd pet-consultation
   npm run build
   ```

2. **Build backend**
   ```bash
   cd ../backend
   npm run build
   ```

3. **Deploy to your hosting provider**

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=3003
```

## Testing

### Run Tests
```bash
# Frontend tests
cd pet-consultation
npm test

# Backend tests (if available)
cd ../backend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please open an issue on GitHub.

---

**Built with ❤️ for veterinary care**
