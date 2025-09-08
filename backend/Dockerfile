# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3002

# Create uploads directory
RUN mkdir -p uploads/images uploads/documents uploads/audio uploads/video uploads/thumbnails

# Start the application
CMD ["npm", "start"]