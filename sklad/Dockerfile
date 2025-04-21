FROM node:23-slim

WORKDIR /app

COPY package.json  ./

RUN npm install --legacy-peer-deps

COPY . .

RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

CMD ["/app/entrypoint.sh"]
