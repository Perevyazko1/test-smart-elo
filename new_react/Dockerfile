FROM node:23-alpine3.20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Выводим содержимое папки build для отладки
RUN ls -la /app/build