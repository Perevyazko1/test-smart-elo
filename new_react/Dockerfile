# Этап сборки
FROM node:23-alpine3.20 as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# Финальный контейнер — пустой, только для запуска команды
FROM node:23-alpine3.20

WORKDIR /runtime

# Копируем build как артефакт в другую папку, чтобы можно было достать его через builder
COPY --from=builder /app/build /runtime/build
