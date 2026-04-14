FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

# Build the Vite application for production
RUN npm run build

# Use Nginx to serve the static files
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
