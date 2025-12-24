# --------------------------------------------------
# Production Dockerfile for Node.js (Express)
# --------------------------------------------------

# 1. Use official lightweight Node image
FROM node:20-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files first (better layer caching)
COPY package*.json ./

# 4. Install only production dependencies
RUN npm install --only=production

# 5. Copy application source
COPY . .

# 6. Expose application port
EXPOSE 5000

# 7. Set environment
ENV NODE_ENV=production

# 8. Start application
CMD ["node", "server.js"]
