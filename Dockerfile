# Multi-stage Dockerfile for MCP qBittorrent Server
# Optimized for production use with minimal image size

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for testing)
RUN npm ci

# Copy source code
COPY . .

# Run tests to ensure code quality
RUN npm test

# Production stage
FROM node:18-alpine AS production

# Build argument for version (defaults to 1.0.0)
ARG VERSION=1.0.0

# Add labels for metadata
LABEL maintainer="Jacques Murray <jacquesmmurray@gmail.com>"
LABEL description="MCP Server for qBittorrent in Node.js"
LABEL version="${VERSION}"

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy application code from builder
COPY --from=builder /app/server.js ./
COPY --from=builder /app/app.js ./
COPY --from=builder /app/config.js ./
COPY --from=builder /app/lib ./lib/

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "const http = require('http'); http.get('http://localhost:8000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Set production environment
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]

# Build instructions:
# docker build -t mcp-qbit-server:latest .
#
# To build with version from package.json:
# docker build --build-arg VERSION=$(node -p "require('./package.json').version") -t mcp-qbit-server:latest .
#
# Run instructions:
# docker run -d \
#   --name mcp-qbit-server \
#   -p 8000:8000 \
#   -e QBIT_BASE_URL=http://qbittorrent:8080 \
#   -e QBIT_USERNAME=admin \
#   -e QBIT_PASSWORD=secret \
#   mcp-qbit-server:latest
