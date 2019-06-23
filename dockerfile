FROM node:carbon

WORKDIR /usr/src/app.js

COPY package*.json ./   

RUN npm install

COPY . .

EXPOSE 80 

CMD ["nodemon", "app.js"]