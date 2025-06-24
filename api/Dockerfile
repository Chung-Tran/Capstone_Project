# api/Dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3030
CMD ["npm", "run", "start"]  # hoặc "node index.js" nếu bạn không có script start
