FROM node:##

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE ####
CMD ["node", "server.js"]
