FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run start

RUN npm install -g serve

EXPOSE 3030

CMD ["serve", "-s", "start", "-l", "3030"]