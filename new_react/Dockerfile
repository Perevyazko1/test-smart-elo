# Этап сборки
FROM node:23-alpine3.20 as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# Финальный контейнер — просто для копирования результата в volume
FROM alpine:3.20

WORKDIR /output

# Копируем build из предыдущего этапа
COPY --from=builder /app/build ./
