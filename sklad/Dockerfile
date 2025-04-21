FROM node:23-alpine3.20

WORKDIR /app

COPY package.json  ./

RUN npm install

COPY . .

RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

RUN npm run build

CMD ["npm", "run", "start"]
