FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies using npm install
RUN npm install --production

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S botuser -u 1001 -G nodejs && \
    chown -R botuser:nodejs /app

USER botuser

EXPOSE 3000

CMD ["node", "index.js"]