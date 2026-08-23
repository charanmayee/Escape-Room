# Base image with Node.js LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Build application (Vite frontend + Express server bundle)
RUN npm run build

# Expose main application port
EXPOSE 3000

# Healthcheck
HEALTHCHECK CMD curl --fail http://localhost:3000/api/health || exit 1

# Launch production server
CMD ["npm", "start"]
