FROM node:23-slim

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Ensure the entrypoint script is executable
RUN chmod +x /app/entrypoint.sh

# Create .next directory to ensure proper permissions
# RUN mkdir -p .next && chown -R node:node .next

# Switch to non-root user
# USER node

EXPOSE 3000

CMD ["/app/entrypoint.sh"]
