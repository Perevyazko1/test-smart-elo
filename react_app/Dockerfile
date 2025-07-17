# --- Этап сборки (Build Stage) ---
FROM node:23-alpine3.20 as builder
WORKDIR /app
ARG VITE_API_URL="http://localhost:8000"
ENV VITE_API_URL=${VITE_API_URL}
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Этап выполнения (Production Stage) ---
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
