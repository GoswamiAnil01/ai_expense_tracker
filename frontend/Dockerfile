# Multi-stage build for production
FROM oven/bun:1-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-alpine as runner

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Expose port
EXPOSE 5173

# Run the application
CMD ["bun", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
